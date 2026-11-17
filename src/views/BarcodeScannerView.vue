<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { barcodeScannerEngine } from '../services/barcode/BarcodeScannerEngine'
import { BarcodeLookupService } from '../services/barcode/BarcodeLookupService'
import { barcodeHistoryRepository } from '../services/barcode/BarcodeHistoryRepository'
import { JalaliDate } from '../services/JalaliDate'
import { PACKAGING_LOGOS, LOGO_CATEGORIES } from '../data/packagingLogos.js'
import AppIcon from '../components/AppIcon.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useConfirm } from '../composables/useConfirm'

var router = useRouter()
var store = useChecklistStore()
var { isPending, pendingLabel, requestConfirm, confirmAction, cancelAction } = useConfirm()

var activeTab = ref('scanner') // 'scanner' | 'history' | 'logos'
var videoRef = ref(null)
var fileInputRef = ref(null)

var isScanning = ref(false)
var cameraError = ref(null)
var hasTorch = ref(false)
var isTorchOn = ref(false)
var facingMode = ref('environment')
var currentStream = null
var scanAnimFrame = null

var currentResult = ref(null)
var isFetchingOnline = ref(false)
var copiedNotice = ref(false)

// History state
var historyQuery = ref('')
var historyFilter = ref('all') // 'all' | 'barcode' | 'qr' | 'iran'
var historyItems = ref([])

// Packaging Logos Guide state
var logoQuery = ref('')
var selectedLogoCategory = ref('all')
var selectedLogoModal = ref(null)

var filteredLogos = computed(() => {
  var q = logoQuery.value.trim().toLowerCase()
  var cat = selectedLogoCategory.value

  return PACKAGING_LOGOS.filter((logo) => {
    if (cat !== 'all' && logo.category !== cat) return false
    if (!q) return true
    return (
      logo.titleFa.toLowerCase().includes(q) ||
      logo.authorityFa.toLowerCase().includes(q) ||
      logo.summaryFa.toLowerCase().includes(q) ||
      logo.descriptionFa.toLowerCase().includes(q) ||
      (logo.badge && logo.badge.toLowerCase().includes(q))
    )
  })
})

function openLogoDetail(logo) {
  selectedLogoModal.value = logo
}

function closeLogoDetail() {
  selectedLogoModal.value = null
}

// Add to checklist state
var isAddModalOpen = ref(false)
var selectedTemplateId = ref('')
var selectedCategoryId = ref('')
var itemToAddTitle = ref('')

// Manual input state
var isManualModalOpen = ref(false)
var manualCodeInput = ref('')

function loadHistory() {
  historyItems.value = barcodeHistoryRepository.filter(historyQuery.value, historyFilter.value)
}

watch([historyQuery, historyFilter], loadHistory)

var filteredHistory = computed(() => historyItems.value)

var availableCategories = computed(() => {
  if (!selectedTemplateId.value) return []
  var tpl = store.templates.find((t) => t.id === selectedTemplateId.value)
  return tpl ? tpl.categories : []
})

async function startCamera() {
  cameraError.value = null
  isScanning.value = true

  if (!navigator?.mediaDevices?.getUserMedia) {
    cameraError.value = 'مرورگر شما از دسترسی به دوربین پشتیبانی نمی‌کند.'
    isScanning.value = false
    return
  }

  stopCamera()

  try {
    var constraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }
    var stream = await navigator.mediaDevices.getUserMedia(constraints)
    currentStream = stream

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play().catch(() => {})

      // Check torch capability
      var track = stream.getVideoTracks()[0]
      if (track && track.getCapabilities) {
        var capabilities = track.getCapabilities()
        hasTorch.value = Boolean(capabilities.torch)
      } else {
        hasTorch.value = false
      }

      runScanningLoop()
    }
  } catch (err) {
    console.error('Camera access error:', err)
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'دسترسی به دوربین توسط کاربر مسدود شده است. لطفاً در تنظیمات مرورگر اجازه دهید.'
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = 'دوربینی بر روی این دستگاه یافت نشد.'
    } else {
      cameraError.value = 'امکان اتصال به دوربین فراهم نشد. می‌توانید بارکد را به صورت دستی یا عکس وارد کنید.'
    }
    isScanning.value = false
  }
}

function stopCamera() {
  if (scanAnimFrame) {
    cancelAnimationFrame(scanAnimFrame)
    scanAnimFrame = null
  }
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop())
    currentStream = null
  }
  isTorchOn.value = false
  hasTorch.value = false
}

async function toggleTorch() {
  if (!currentStream || !hasTorch.value) return
  var track = currentStream.getVideoTracks()[0]
  if (!track) return

  try {
    isTorchOn.value = !isTorchOn.value
    await track.applyConstraints({
      advanced: [{ torch: isTorchOn.value }]
    })
  } catch (err) {
    console.error('Torch toggle failed:', err)
    isTorchOn.value = false
  }
}

function switchCamera() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment'
  startCamera()
}

var lastScanTimestamp = 0
var pendingCandidate = null
var candidateStreak = 0

async function runScanningLoop() {
  if (!isScanning.value || currentResult.value) return

  var now = Date.now()
  // Throttle scanning to every 100ms
  if (now - lastScanTimestamp > 100 && videoRef.value && videoRef.value.readyState >= 2) {
    lastScanTimestamp = now
    try {
      var detected = await barcodeScannerEngine.detect(videoRef.value)
      if (detected && detected.rawValue) {
        if (pendingCandidate === detected.rawValue) {
          candidateStreak++
        } else {
          pendingCandidate = detected.rawValue
          candidateStreak = 1
        }

        // Require 2 consecutive matching frames to eliminate noise/blur misreads
        if (candidateStreak >= 2) {
          pendingCandidate = null
          candidateStreak = 0
          handleSuccessfulScan(detected.rawValue, detected.format)
          return
        }
      } else {
        candidateStreak = 0
        pendingCandidate = null
      }
    } catch {
      // ignore frame detection glitches
    }
  }

  scanAnimFrame = requestAnimationFrame(runScanningLoop)
}

async function handleSuccessfulScan(code, format = 'unknown') {
  barcodeScannerEngine.playSuccessFeedback()

  // Inspect offline details
  var enriched = BarcodeLookupService.inspect(code, format)
  currentResult.value = enriched

  // Save to history
  barcodeHistoryRepository.add({
    code: enriched.normalizedValue || enriched.rawValue,
    format: enriched.format,
    type: enriched.type,
    title: enriched.title,
    countryFa: enriched.country?.countryFa,
    countryFlag: enriched.country?.flag,
    brand: enriched.iranianCompany?.name,
    category: enriched.iranianCompany?.category,
    ttac: enriched.ttac
  })
  loadHistory()

  // Pre-fill add to checklist title
  itemToAddTitle.value = enriched.localItem?.title || enriched.iranianCompany?.name || (enriched.country ? `${enriched.title}` : enriched.rawValue)
  if (store.templates.length > 0) {
    selectedTemplateId.value = store.activeTemplateId || store.templates[0].id
    var tpl = store.templates.find((t) => t.id === selectedTemplateId.value)
    selectedCategoryId.value = tpl?.categories[0]?.id || ''
  }

  // Fetch online product details in background if it's a numeric barcode and not local item
  if (!enriched.localItem && /^\d{8,14}$/.test(enriched.normalizedValue)) {
    isFetchingOnline.value = true
    try {
      var online = await BarcodeLookupService.fetchOnlineDetails(enriched.normalizedValue)
      if (online && online.title) {
        currentResult.value = {
          ...currentResult.value,
          onlineProduct: online,
          title: online.title || currentResult.value.title
        }
        itemToAddTitle.value = online.title
      }
    } finally {
      isFetchingOnline.value = false
    }
  }
}

function resumeScanner() {
  currentResult.value = null
  isScanning.value = true
  runScanningLoop()
}

async function onFileSelected(event) {
  var file = event.target?.files?.[0]
  if (!file) return

  var detected = await barcodeScannerEngine.detectFromFile(file)
  if (detected && detected.rawValue) {
    handleSuccessfulScan(detected.rawValue, detected.format)
  } else {
    alert('بارکد یا کد QR واضحی در این تصویر یافت نشد. لطفاً زاویه یا نور تصویر را بررسی کنید.')
  }
  event.target.value = ''
}

function handleManualSubmit() {
  var code = manualCodeInput.value.trim()
  if (!code) return
  isManualModalOpen.value = false
  manualCodeInput.value = ''
  handleSuccessfulScan(code, 'manual')
}

function openManualEdit(code) {
  manualCodeInput.value = code
  isManualModalOpen.value = true
}

function copyCode(value) {
  if (!value) return
  navigator.clipboard.writeText(value)
  copiedNotice.value = true
  setTimeout(() => {
    copiedNotice.value = false
  }, 2000)
}

function handleClearHistory() {
  requestConfirm('آیا کل تاریخچه اسکن‌ها پاک شود؟', () => {
    barcodeHistoryRepository.clear()
    loadHistory()
  })
}

function handleRemoveHistoryItem(id) {
  barcodeHistoryRepository.remove(id)
  loadHistory()
}

function openAddToChecklistModal() {
  if (store.templates.length === 0) return
  if (!selectedTemplateId.value) {
    selectedTemplateId.value = store.activeTemplateId || store.templates[0].id
  }
  var tpl = store.templates.find((t) => t.id === selectedTemplateId.value)
  if (!selectedCategoryId.value || !tpl?.categories.some((c) => c.id === selectedCategoryId.value)) {
    selectedCategoryId.value = tpl?.categories[0]?.id || ''
  }
  isAddModalOpen.value = true
}

function confirmAddToChecklist() {
  if (!itemToAddTitle.value.trim() || !selectedTemplateId.value || !selectedCategoryId.value) return
  var tpl = store.templates.find((t) => t.id === selectedTemplateId.value)
  var cat = tpl?.findCategory(selectedCategoryId.value)
  if (cat) {
    cat.addItem(itemToAddTitle.value.trim(), currentResult.value ? `بارکد: ${currentResult.value.normalizedValue}` : '')
    store.schedulePersist()
    isAddModalOpen.value = false
    router.push({ name: 'checklist-detail', params: { id: tpl.id } })
  }
}

watch(activeTab, (tab) => {
  if (tab === 'scanner') {
    startCamera()
  } else {
    stopCamera()
    if (tab === 'history') {
      loadHistory()
    }
  }
})

onMounted(() => {
  loadHistory()
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <section class="space-y-5 sm:space-y-6">
    <!-- Navigation header -->
    <div class="flex items-center justify-between">
      <RouterLink
        to="/"
        class="inline-flex min-h-[36px] items-center gap-1 text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-300 hover:text-brand-700 transition-colors"
      >
        <AppIcon name="chevron" :size="16" class="rotate-180 shrink-0" />
        <span>بازگشت به خانه</span>
      </RouterLink>
    </div>

    <!-- Title & Description -->
    <div>
      <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <span class="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 shrink-0">
          <AppIcon name="scan" :size="24" />
        </span>
        <span>بارکدخوان و راهنمای نمادهای کالا</span>
      </h1>
      <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        اسکن سریع بارکدها و QR کد، تشخیص کشور و شرکت سازنده همراه با راهنمای جامع نمادهای بسته‌بندی، استاندارد و سلامت
      </p>
    </div>

    <!-- Tabs Segmented Control (full width on mobile, perfectly aligned) -->
    <div class="grid grid-cols-3 w-full rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 shadow-inner">
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'scanner' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'scanner'"
      >
        <AppIcon name="camera" :size="16" class="shrink-0" />
        <span class="hidden sm:inline">اسکنر بارکد</span>
        <span class="sm:hidden">اسکنر</span>
      </button>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'logos' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'logos'"
      >
        <AppIcon name="tag" :size="16" class="shrink-0" />
        <span class="hidden sm:inline">راهنمای نمادها</span>
        <span class="sm:hidden">نمادهای کالا</span>
      </button>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'history'"
      >
        <AppIcon name="history" :size="16" class="shrink-0" />
        <span>تاریخچه</span>
        <span
          v-if="historyItems.length"
          class="rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none shrink-0"
          :class="activeTab === 'history' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
        >
          {{ historyItems.length }}
        </span>
      </button>
    </div>

    <!-- TAB 1: SCANNER -->
    <div v-show="activeTab === 'scanner'" class="space-y-4">
      <!-- Camera Viewport Card -->
      <div class="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl aspect-[4/3] sm:aspect-[16/9] max-h-[480px] flex items-center justify-center">
        <!-- Live Video Element -->
        <video
          ref="videoRef"
          playsinline
          muted
          class="h-full w-full object-cover"
        />

        <!-- Camera overlay / Scanning box -->
        <div v-if="!cameraError && !currentResult" class="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div class="relative h-48 w-64 sm:h-56 sm:w-80 rounded-2xl border-2 border-brand-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            <!-- Animated Scan Line -->
            <div class="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" style="animation: scanline 2s ease-in-out infinite;" />
            <!-- Corner Accents -->
            <div class="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-brand-300 rounded-tl" />
            <div class="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-brand-300 rounded-tr" />
            <div class="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-brand-300 rounded-bl" />
            <div class="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-brand-300 rounded-br" />
          </div>
        </div>

        <!-- Camera Error fallback -->
        <div v-if="cameraError" class="p-6 text-center space-y-3 max-w-sm">
          <span class="text-3xl">📷</span>
          <p class="text-sm text-slate-300">{{ cameraError }}</p>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              class="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-600 transition-colors"
              @click="startCamera"
            >
              تلاش مجدد
            </button>
            <button
              type="button"
              class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              @click="fileInputRef?.click()"
            >
              انتخاب عکس از گالری
            </button>
          </div>
        </div>

        <!-- Camera floating controls toolbar -->
        <div v-if="!cameraError" class="absolute top-3 inset-x-3 flex items-center justify-between text-xs">
          <span class="rounded-full bg-slate-900/70 px-3 py-1 font-medium backdrop-blur text-slate-200">
            {{ isScanning && !currentResult ? 'در حال اسکن...' : 'اسکن متوقف است' }}
          </span>

          <div class="flex items-center gap-2">
            <button
              v-if="hasTorch"
              type="button"
              class="flex size-9 items-center justify-center rounded-full bg-slate-900/70 backdrop-blur text-white hover:bg-slate-800 transition-colors"
              :class="isTorchOn ? 'text-amber-400 ring-2 ring-amber-400' : ''"
              title="فلش / چراغ‌قوه"
              @click="toggleTorch"
            >
              <AppIcon name="flash" :size="18" />
            </button>
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-full bg-slate-900/70 backdrop-blur text-white hover:bg-slate-800 transition-colors"
              title="تغییر دوربین"
              @click="switchCamera"
            >
              <AppIcon name="refresh" :size="18" />
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons under Camera -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          @click="fileInputRef?.click()"
        >
          <AppIcon name="image" :size="18" class="text-brand-500" />
          <span>اسکن از عکس گالری</span>
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          @click="isManualModalOpen = true"
        >
          <AppIcon name="keyboard" :size="18" class="text-brand-500" />
          <span>ورود دستی بارکد</span>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileSelected"
        />
      </div>

      <!-- SCANNED RESULT CARD -->
      <div
        v-if="currentResult"
        class="rounded-3xl border border-brand-200 bg-white p-5 shadow-lg dark:border-brand-900/60 dark:bg-slate-800 space-y-4 animate-fade-in"
      >
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 uppercase">
                {{ currentResult.format || 'بارکد' }}
              </span>
              <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {{ currentResult.type === 'barcode' ? 'کالای بازرگانی' : (currentResult.type === 'qr' ? 'کد QR' : (currentResult.type === 'ttac' ? 'سامانه سلامت' : 'متن')) }}
              </span>
            </div>
            <h2 class="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ currentResult.title }}
            </h2>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            @click="copyCode(currentResult.normalizedValue || currentResult.rawValue)"
          >
            <AppIcon :name="copiedNotice ? 'check' : 'copy'" :size="15" :class="copiedNotice ? 'text-emerald-500' : ''" />
            <span>{{ copiedNotice ? 'کپی شد!' : 'کپی بارکد' }}</span>
          </button>
        </div>

        <!-- Raw Barcode value with Edit action -->
        <div class="flex items-center gap-2">
          <div class="flex-1 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/60 font-mono text-sm sm:text-base text-center tracking-wider text-slate-800 dark:text-slate-200 break-all select-all">
            {{ currentResult.normalizedValue || currentResult.rawValue }}
          </div>
          <button
            type="button"
            class="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 transition-colors"
            title="ویرایش یا تصحیح دستی رقم بارکد"
            @click="openManualEdit(currentResult.normalizedValue || currentResult.rawValue)"
          >
            <AppIcon name="edit" :size="18" />
          </button>
        </div>

        <!-- Country Detection Info -->
        <div v-if="currentResult.country" class="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
          <span class="text-3xl shrink-0">{{ currentResult.country.flag }}</span>
          <div class="flex-1">
            <span class="block text-xs text-slate-400">کشور سازنده / ثبت برند</span>
            <span class="block text-sm font-bold text-slate-800 dark:text-slate-200">
              {{ currentResult.country.countryFa }}
              <span class="text-xs font-normal text-slate-400">(پیش‌شماره GS1: {{ currentResult.country.prefix }})</span>
            </span>
            <span v-if="currentResult.country.isIran" class="inline-block mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ محصول ثبت‌شده یا تولید داخل کشور ایران (پیش‌شماره ۶۲۶)
            </span>
          </div>
        </div>

        <!-- Iranian Manufacturer Info -->
        <div v-if="currentResult.iranianCompany" class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs sm:text-sm">
          <span class="block font-semibold text-emerald-800 dark:text-emerald-300">
            شرکت / برند داخلی: {{ currentResult.iranianCompany.name }}
          </span>
          <span class="block text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
            دسته‌بندی: {{ currentResult.iranianCompany.category }}
          </span>
        </div>

        <!-- TTAC Pharma Authenticity Label -->
        <div v-if="currentResult.ttac" class="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20 text-xs space-y-1">
          <span class="block font-bold text-sky-800 dark:text-sky-300">برچسب رهگیری و اصالت سلامت (سازمان غذا و دارو)</span>
          <p v-if="currentResult.ttac.uid" class="text-slate-600 dark:text-slate-300">شناسه ردیابی (UID): <span class="font-mono font-bold">{{ currentResult.ttac.uid }}</span></p>
          <p v-if="currentResult.ttac.gtin" class="text-slate-600 dark:text-slate-300">کد تجاری فرآورده (GTIN): <span class="font-mono font-bold">{{ currentResult.ttac.gtin }}</span></p>
          <a
            :href="currentResult.ttac.checkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sky-600 font-semibold underline mt-1"
          >
            استعلام اصالت در سامانه تی‌تک (ttac.ir) ↗
          </a>
        </div>

        <!-- URL Clickable Action -->
        <div v-if="currentResult.type === 'url'" class="pt-1">
          <a
            :href="currentResult.rawValue"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full min-h-[44px] rounded-2xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
          >
            باز کردن پیوند در مرورگر ↗
          </a>
        </div>

        <!-- Packaging logos guide quick tip -->
        <div class="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/60 p-2.5 dark:border-sky-900/40 dark:bg-sky-950/20 text-xs">
          <span class="text-slate-600 dark:text-slate-300">
            🏷️ نیاز به بررسی نشان استاندارد، سیب سلامت یا علائم روی بسته دارید؟
          </span>
          <button
            type="button"
            class="font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 px-2 py-1"
            @click="activeTab = 'logos'"
          >
            راهنمای نمادها ←
          </button>
        </div>

        <!-- Action buttons -->
        <div class="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-brand-500 text-white text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
            @click="openAddToChecklistModal"
          >
            <AppIcon name="plus" :size="18" />
            <span>افزودن به لیست خرید</span>
          </button>
          <button
            type="button"
            class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium hover:bg-slate-100 transition-colors"
            @click="resumeScanner"
          >
            <AppIcon name="refresh" :size="16" />
            <span>اسکن مورد بعدی</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: HISTORY -->
    <div v-show="activeTab === 'history'" class="space-y-4">
      <!-- Search & Filter Controls -->
      <div class="space-y-3">
        <div class="relative">
          <input
            v-model="historyQuery"
            type="search"
            placeholder="جستجو در بارکدها، کشور، برند یا عنوان..."
            class="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              v-for="f in [
                { key: 'all', label: 'همه' },
                { key: 'barcode', label: 'بارکد کالا' },
                { key: 'qr', label: 'کد QR' },
                { key: 'iran', label: 'تولید ایران 🇮🇷' }
              ]"
              :key="f.key"
              type="button"
              class="min-h-[32px] px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              :class="historyFilter === f.key ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
              @click="historyFilter = f.key"
            >
              {{ f.label }}
            </button>
          </div>

          <button
            v-if="historyItems.length"
            type="button"
            class="text-xs text-red-500 hover:underline shrink-0"
            @click="handleClearHistory"
          >
            پاک کردن همه
          </button>
        </div>
      </div>

      <!-- History List -->
      <div v-if="filteredHistory.length" class="space-y-2.5">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase">
                  {{ item.format }}
                </span>
                <span v-if="item.countryFlag" class="text-sm">
                  {{ item.countryFlag }} {{ item.countryFa }}
                </span>
              </div>
              <h3 class="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                {{ item.title }}
              </h3>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600"
                title="کپی بارکد"
                @click="copyCode(item.code)"
              >
                <AppIcon name="copy" :size="16" />
              </button>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
                title="حذف از تاریخچه"
                @click="handleRemoveHistoryItem(item.id)"
              >
                <AppIcon name="trash" :size="16" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 dark:border-slate-700/60 pt-2">
            <span class="font-mono text-slate-600 dark:text-slate-300 tracking-wider">{{ item.code }}</span>
            <span>{{ JalaliDate.dateTime(item.scannedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12 text-slate-400 space-y-2">
        <AppIcon name="box" :size="44" class="mx-auto text-slate-300 dark:text-slate-600" />
        <p class="text-sm">تاریخچه اسکن خالی است.</p>
        <p class="text-xs text-slate-500">بارکد یا کد QR محصولی را اسکن کنید تا اینجا ثبت شود.</p>
      </div>
    </div>

    <!-- TAB 3: PACKAGING LOGOS GUIDE -->
    <div v-show="activeTab === 'logos'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="space-y-3">
        <div class="relative">
          <input
            v-model="logoQuery"
            type="search"
            placeholder="جستجو در نمادها (استاندارد، سیب سلامت، حلال، بازیافت، مایکروویو...)"
            class="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <!-- Category pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            v-for="cat in LOGO_CATEGORIES"
            :key="cat.id"
            type="button"
            class="min-h-[32px] px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            :class="selectedLogoCategory === cat.id ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
            @click="selectedLogoCategory = cat.id"
          >
            {{ cat.titleFa }}
          </button>
        </div>
      </div>

      <!-- Quick Guidance Banner -->
      <div class="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-3.5 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200 flex items-start gap-2.5">
        <AppIcon name="lightbulb" :size="20" class="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div class="space-y-1">
          <p class="font-bold">راهنمای شناخت نشان‌ها و علائم درج‌شده روی کالاهای مصرفی</p>
          <p class="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-300">
            برای اطمینان از اصالت کالاهای دارای علامت استاندارد، کد ۱۰ رقمی زیر نشان را به شماره پیامکی <strong>۱۰۰۰۱۵۱۷</strong> ارسال کنید. برای استعلام فرآورده‌های سلامت و دارو نیز از سامانه تی‌تک (ttac.ir) استفاده نمایید.
          </p>
        </div>
      </div>

      <!-- Logos Grid -->
      <div v-if="filteredLogos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <article
          v-for="logo in filteredLogos"
          :key="logo.id"
          class="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-brand-400 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-800 transition-all cursor-pointer"
          @click="openLogoDetail(logo)"
        >
          <div>
            <div class="flex items-start gap-3">
              <!-- SVG Icon Preview -->
              <div
                class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-2 text-slate-800 dark:text-slate-100 transition-transform group-hover:scale-105"
                v-html="logo.svg"
              />

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-1">
                  <span
                    class="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    :class="logo.badgeTone === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : (logo.badgeTone === 'sky' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : (logo.badgeTone === 'rose' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'))"
                  >
                    {{ logo.badge }}
                  </span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {{ logo.titleFa }}
                </h3>
                <p class="text-[11px] text-slate-400 line-clamp-1">
                  {{ logo.authorityFa }}
                </p>
              </div>
            </div>

            <p class="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {{ logo.summaryFa }}
            </p>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span class="text-brand-600 dark:text-brand-400 font-medium group-hover:underline">
              مشاهده توضیحات و نحوه استعلام ←
            </span>
          </div>
        </article>
      </div>

      <!-- Empty state when no logo matches -->
      <div v-else class="text-center py-12 text-slate-400 space-y-2">
        <AppIcon name="search" :size="44" class="mx-auto text-slate-300 dark:text-slate-600" />
        <p class="text-sm">نمادی با این عنوان یا مشخصات یافت نشد.</p>
        <p class="text-xs text-slate-500">کلمات دیگری مانند استاندارد، سلامت، بازیافت یا پلاستیک را امتحان کنید.</p>
      </div>
    </div>

    <!-- LOGO DETAIL MODAL -->
    <div
      v-if="selectedLogoModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      @click.self="closeLogoDetail"
    >
      <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-800 space-y-4">
        <!-- Header with large SVG -->
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700">
          <div class="flex items-center gap-3.5">
            <div
              class="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-2.5 shadow-inner"
              v-html="selectedLogoModal.svg"
            />
            <div>
              <span
                class="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold mb-1"
                :class="selectedLogoModal.badgeTone === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : (selectedLogoModal.badgeTone === 'sky' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : (selectedLogoModal.badgeTone === 'rose' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'))"
              >
                {{ selectedLogoModal.badge }}
              </span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ selectedLogoModal.titleFa }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                مرجع صدور: {{ selectedLogoModal.authorityFa }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 transition-colors"
            aria-label="بستن پنجره"
            @click="closeLogoDetail"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <!-- Description -->
        <div class="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div>
            <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-1">
              مفهوم و اهمیت نشان:
            </h4>
            <p>{{ selectedLogoModal.descriptionFa }}</p>
          </div>

          <div v-if="selectedLogoModal.whereFa">
            <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-1">
              معمولاً روی چه کالاهایی درج می‌شود؟
            </h4>
            <p class="text-slate-600 dark:text-slate-400">{{ selectedLogoModal.whereFa }}</p>
          </div>

          <!-- Verification Box -->
          <div class="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/30 space-y-1.5">
            <div class="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200">
              <AppIcon name="search" :size="16" />
              <span>نحوه بررسی و استعلام اصالت:</span>
            </div>
            <p class="text-xs text-sky-800 dark:text-sky-300">
              {{ selectedLogoModal.verificationFa }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            class="min-h-[40px] px-5 rounded-xl bg-brand-500 text-white text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-colors shadow-sm"
            @click="closeLogoDetail"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>

    <!-- ADD TO CHECKLIST MODAL -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-800 space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
          افزودن به لیست خرید
        </h3>

        <div class="space-y-3 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">نام آیتم</label>
            <input
              v-model="itemToAddTitle"
              type="text"
              class="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">انتخاب لیست</label>
            <select
              v-model="selectedTemplateId"
              class="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option v-for="tpl in store.templates" :key="tpl.id" :value="tpl.id">
                {{ tpl.icon }} {{ tpl.title }}
              </option>
            </select>
          </div>

          <div v-if="availableCategories.length">
            <label class="block text-xs font-semibold text-slate-500 mb-1">دسته‌بندی</label>
            <select
              v-model="selectedCategoryId"
              class="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="min-h-[40px] px-4 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm"
            @click="isAddModalOpen = false"
          >
            انصراف
          </button>
          <button
            type="button"
            class="min-h-[40px] px-4 rounded-xl bg-brand-500 text-white text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-colors"
            @click="confirmAddToChecklist"
          >
            افزودن
          </button>
        </div>
      </div>
    </div>

    <!-- MANUAL CODE INPUT MODAL -->
    <div
      v-if="isManualModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-800 space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
          ورود دستی شماره بارکد
        </h3>
        <p class="text-xs text-slate-400">
          ارقام بارکد زیر خطوط محصول را بدون خط تیره وارد کنید:
        </p>

        <input
          v-model="manualCodeInput"
          type="text"
          inputmode="numeric"
          dir="ltr"
          placeholder="مثال: 6260123456789"
          class="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-center font-mono text-base tracking-wider dark:border-slate-700 dark:bg-slate-900"
          @keydown.enter="handleManualSubmit"
        />

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="min-h-[40px] px-4 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm"
            @click="isManualModalOpen = false"
          >
            انصراف
          </button>
          <button
            type="button"
            class="min-h-[40px] px-4 rounded-xl bg-brand-500 text-white text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-colors"
            @click="handleManualSubmit"
          >
            استعلام بارکد
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :is-open="isPending"
      :label="pendingLabel"
      @confirm="confirmAction"
      @cancel="cancelAction"
    />
  </section>
</template>

<style scoped>
@keyframes scanline {
  0% { top: 0%; opacity: 0.8; }
  50% { top: 100%; opacity: 1; }
  100% { top: 0%; opacity: 0.8; }
}
</style>
