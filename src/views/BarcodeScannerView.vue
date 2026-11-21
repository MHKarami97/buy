<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { barcodeScannerEngine } from '../services/barcode/BarcodeScannerEngine'
import { BarcodeLookupService } from '../services/barcode/BarcodeLookupService'
import { barcodeHistoryRepository } from '../services/barcode/BarcodeHistoryRepository'
import { JalaliDate } from '../services/JalaliDate'
import { PACKAGING_LOGOS, LOGO_CATEGORIES } from '../data/packagingLogos.js'
import { IfdaLookupService, normalizeIfdaCode, formatIfdaInput } from '../services/barcode/IfdaLookupService'
import { ifdaHistoryRepository } from '../services/barcode/IfdaHistoryRepository'
import { standardLookupService, normalizeLicenseNumber } from '../services/barcode/StandardLookupService'
import { standardHistoryRepository } from '../services/barcode/StandardHistoryRepository'
import { preferencesRepository } from '../services/PreferencesRepository'
import { itemProductCodeRepository } from '../services/barcode/ItemProductCodeRepository'
import { rapidOcrEngine } from '../services/ocr/RapidOcrEngine'
import { toEnglishDigits, toPersianDigits } from '../services/ocr/digitNormalizer'
import { ocrModelManager } from '../services/ocr/OcrModelManager'
import MapItemCodeModal from '../components/MapItemCodeModal.vue'
import ItemCodeDetailsModal from '../components/ItemCodeDetailsModal.vue'
import OcrResultModal from '../components/OcrResultModal.vue'
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
var isFetchingIranCode = ref(false)
var iranCodeResult = ref(null)
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

// OCR (RapidOCR) state
var scanMode = ref('barcode') // 'barcode' | 'ocr'
var ocrContext = ref('scanner') // 'scanner' | 'standard' | 'ifda'
var isOcrProcessing = ref(false)
var isOcrModalOpen = ref(false)
var ocrResultData = ref(null)
var ocrNotice = ref(null)
var isOcrModelReady = ref(false)

// Manual input state
var isManualModalOpen = ref(false)
var manualCodeInput = ref('')

// IFDA (غذا و دارو) Inquiry state
var ifdaInput = ref('')
var isFetchingIfda = ref(false)
var ifdaResult = ref(null)
var ifdaHistoryQuery = ref('')
var ifdaHistoryStatusFilter = ref('all') // 'all' | 'valid' | 'invalid'
var ifdaHistoryItems = ref([])

// Standard (استاندارد) Inquiry state
var standardInput = ref('')
var isFetchingStandard = ref(false)
var standardResult = ref(null)
var standardHistoryQuery = ref('')
var standardHistoryStatusFilter = ref('all') // 'all' | 'valid' | 'invalid'
var standardHistoryItems = ref([])

// Mapped Items state
var mappedQuery = ref('')
var mappedFilter = ref('all') // 'all' | 'barcode' | 'ifda' | 'standard'
var mappedItems = ref([])
var mappedCount = ref(0)

// Modal states for mapping and item details
var isMapModalOpen = ref(false)
var mapModalParams = ref({
  initialItem: null,
  initialBarcode: '',
  initialIfdaCode: '',
  initialStandardCode: '',
  initialBrand: '',
  initialProductTitle: '',
  initialManufacturer: '',
  initialLicenseStatus: ''
})
var isDetailsModalOpen = ref(false)
var selectedMappingForDetails = ref(null)

function loadHistory() {
  historyItems.value = barcodeHistoryRepository.filter(historyQuery.value, historyFilter.value)
}

function loadIfdaHistory() {
  ifdaHistoryItems.value = ifdaHistoryRepository.filter(ifdaHistoryQuery.value, ifdaHistoryStatusFilter.value)
}

function loadStandardHistory() {
  standardHistoryItems.value = standardHistoryRepository.filter(standardHistoryQuery.value, standardHistoryStatusFilter.value)
}

function loadMappedItems() {
  mappedItems.value = itemProductCodeRepository.filter(mappedQuery.value, mappedFilter.value)
  mappedCount.value = itemProductCodeRepository.getAll().length
}

watch([historyQuery, historyFilter], loadHistory)
watch([ifdaHistoryQuery, ifdaHistoryStatusFilter], loadIfdaHistory)
watch([standardHistoryQuery, standardHistoryStatusFilter], loadStandardHistory)
watch([mappedQuery, mappedFilter], loadMappedItems)
watch(ifdaInput, (newVal, oldVal) => {
  var formatted = formatIfdaInput(newVal, oldVal)
  if (formatted !== newVal) {
    ifdaInput.value = formatted
  }
})

async function submitStandardInquiry(sampleCode) {
  var targetCode = (sampleCode || standardInput.value || '').trim()
  if (!targetCode) return
  standardInput.value = targetCode

  isFetchingStandard.value = true
  standardResult.value = null

  try {
    var res = await standardLookupService.fetchReport(targetCode)
    standardResult.value = res
    if (res.ok && res.data) {
      standardHistoryRepository.add({
        licenseNumber: res.data.licenseNumber || targetCode,
        province: res.data.province,
        address: res.data.address,
        manufacturer: res.data.manufacturer,
        product: res.data.product,
        model: res.data.model,
        brand: res.data.brand,
        expiryDate: res.data.expiryDate,
        status: res.status,
        statusText: res.data.statusText,
        reportUrl: res.data.reportUrl
      })
      loadStandardHistory()
      loadMappedItems()
    } else {
      standardHistoryRepository.add({
        licenseNumber: targetCode,
        status: 'valid',
        statusText: 'استعلام پروانه',
        reportUrl: `https://isom.inso.gov.ir/parvaneh/m_p_report.php?license_no=${targetCode}`
      })
      loadStandardHistory()
    }
  } catch {
    standardResult.value = {
      ok: false,
      error: 'proxy_blocked',
      errorMessage: 'سرور سازمان استاندارد اتصال سرورهای خارجی را محدود کرده است.'
    }
  } finally {
    isFetchingStandard.value = false
  }
}

function openStandardReport(code) {
  var targetCode = normalizeLicenseNumber(code || standardInput.value || '')
  if (!targetCode) return
  standardInput.value = targetCode
  standardHistoryRepository.add({
    licenseNumber: targetCode,
    status: 'valid',
    statusText: 'استعلام پروانه',
    reportUrl: `https://isom.inso.gov.ir/parvaneh/m_p_report.php?license_no=${targetCode}`
  })
  loadStandardHistory()
  window.open(`https://isom.inso.gov.ir/parvaneh/m_p_report.php?license_no=${targetCode}`, '_blank')
}

function openSmsInquiry(code) {
  var norm = normalizeLicenseNumber(code || standardInput.value || '')
  if (!norm) return
  window.location.href = `sms:10001517?body=${encodeURIComponent(norm)}`
}

async function submitIfdaInquiry(sampleCode) {
  var targetCode = (sampleCode || ifdaInput.value || '').trim()
  if (!targetCode) return
  ifdaInput.value = targetCode

  isFetchingIfda.value = true
  ifdaResult.value = null

  try {
    var res = await IfdaLookupService.fetchIfdaDetails(targetCode)
    ifdaResult.value = res
    if (res.ok && res.data) {
      ifdaHistoryRepository.add({
        code: res.code,
        title: res.data.name,
        brand: res.data.brand,
        manufacturer: res.data.manufacturer,
        licenseStatus: res.data.licenseStatus,
        issueDate: res.data.issueDate,
        expiryDate: res.data.expiryDate,
        url: res.url
      })
      loadIfdaHistory()
    }
  } finally {
    isFetchingIfda.value = false
  }
}

function handleClearIfdaHistory() {
  requestConfirm('آیا کل تاریخچه استعلام‌های غذا و دارو پاک شود؟', () => {
    ifdaHistoryRepository.clear()
    loadIfdaHistory()
  })
}

function handleRemoveIfdaHistoryItem(id) {
  ifdaHistoryRepository.remove(id)
  loadIfdaHistory()
}

function openMapModal(params = {}) {
  mapModalParams.value = {
    initialItem: params.initialItem || null,
    initialBarcode: params.initialBarcode || '',
    initialIfdaCode: params.initialIfdaCode || '',
    initialStandardCode: params.initialStandardCode || '',
    initialBrand: params.initialBrand || '',
    initialProductTitle: params.initialProductTitle || '',
    initialManufacturer: params.initialManufacturer || '',
    initialLicenseStatus: params.initialLicenseStatus || ''
  }
  isMapModalOpen.value = true
}

function openMapModalFromIfda(itemOrResult) {
  var data = itemOrResult?.data || itemOrResult || {}
  mapModalParams.value = {
    initialItem: null,
    initialBarcode: '',
    initialIfdaCode: data.code || ifdaResult.value?.code || ifdaInput.value || '',
    initialStandardCode: '',
    initialBrand: data.brand || '',
    initialProductTitle: data.title || data.name || '',
    initialManufacturer: data.manufacturer || '',
    initialLicenseStatus: data.licenseStatus || ''
  }
  isMapModalOpen.value = true
}

function openMapModalForScannedBarcode() {
  if (!currentResult.value) return
  mapModalParams.value = {
    initialItem: currentResult.value.localItem || null,
    initialBarcode: currentResult.value.normalizedValue || currentResult.value.rawValue || '',
    initialIfdaCode: '',
    initialStandardCode: '',
    initialBrand: currentResult.value.iranCodeData?.brand || currentResult.value.iranianCompany?.name || currentResult.value.onlineProduct?.brand || '',
    initialProductTitle: currentResult.value.iranCodeData?.labelDescription || currentResult.value.onlineProduct?.title || currentResult.value.title || '',
    initialManufacturer: currentResult.value.iranCodeData?.member || currentResult.value.iranianCompany?.name || '',
    initialLicenseStatus: ''
  }
  isMapModalOpen.value = true
}

function openMapModalForNew() {
  mapModalParams.value = {
    initialItem: null,
    initialBarcode: '',
    initialIfdaCode: '',
    initialStandardCode: '',
    initialBrand: '',
    initialProductTitle: '',
    initialManufacturer: '',
    initialLicenseStatus: ''
  }
  isMapModalOpen.value = true
}

function openDetailsForMapping(mapping) {
  selectedMappingForDetails.value = mapping
  isDetailsModalOpen.value = true
}

function openEditForMapping(mapping) {
  mapModalParams.value = {
    initialItem: {
      id: mapping.itemId,
      title: mapping.itemTitle,
      templateId: mapping.templateId,
      templateTitle: mapping.templateTitle,
      categoryId: mapping.categoryId,
      categoryName: mapping.categoryName
    },
    initialBarcode: mapping.barcode || '',
    initialIfdaCode: mapping.ifdaCode || '',
    initialStandardCode: mapping.standardCode || '',
    initialBrand: mapping.brand || '',
    initialProductTitle: mapping.productTitle || '',
    initialManufacturer: mapping.manufacturer || '',
    initialLicenseStatus: mapping.licenseStatus || ''
  }
  isDetailsModalOpen.value = false
  isMapModalOpen.value = true
}

function handleDeleteMapping(id) {
  requestConfirm('آیا این مشخصات ثبت‌شده برای کالا حذف شود؟', () => {
    itemProductCodeRepository.remove(id)
    loadMappedItems()
  })
}

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
  if (!isScanning.value || currentResult.value || scanMode.value === 'ocr') return

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

  // Inspect offline details (Country, flag, Iranian manufacturer, format) immediately
  var enriched = BarcodeLookupService.inspect(code, format)
  currentResult.value = enriched

  // Save to history initially
  var savedRecord = barcodeHistoryRepository.add({
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

  // Reset online / IranCode query states
  iranCodeResult.value = null
  isFetchingIranCode.value = false

  // Concurrently query IranCode (irancode.ir/01/<barcode>) for products
  if (/^\d{8,14}$/.test(enriched.normalizedValue)) {
    isFetchingIranCode.value = true
    BarcodeLookupService.fetchIranCodeDetails(enriched.normalizedValue).then((res) => {
      iranCodeResult.value = res
      if (res.ok && res.data) {
        var officialTitle = res.data.labelDescription || res.data.brand
        if (officialTitle) {
          currentResult.value = {
            ...currentResult.value,
            title: officialTitle,
            iranCodeData: res.data
          }
          itemToAddTitle.value = officialTitle

          // Update record in history if available
          if (savedRecord?.id) {
            barcodeHistoryRepository.update(savedRecord.id, {
              title: officialTitle,
              brand: res.data.brand || res.data.member || savedRecord.brand,
              category: res.data.breakTitle || res.data.gpc || savedRecord.category
            })
            loadHistory()
          }
        }
      }
    }).finally(() => {
      isFetchingIranCode.value = false
    })
  }

  // Fetch online product details from Open Food Facts in background if not matching local item
  if (!enriched.localItem && /^\d{8,14}$/.test(enriched.normalizedValue)) {
    isFetchingOnline.value = true
    try {
      var online = await BarcodeLookupService.fetchOnlineDetails(enriched.normalizedValue)
      if (online && online.title) {
        // Only override title if IranCode hasn't already provided an official label
        var hasIranCodeTitle = Boolean(currentResult.value?.iranCodeData?.labelDescription)
        currentResult.value = {
          ...currentResult.value,
          onlineProduct: online,
          title: hasIranCodeTitle ? currentResult.value.title : (online.title || currentResult.value.title)
        }
        if (!hasIranCodeTitle) {
          itemToAddTitle.value = online.title
        }
      }
    } finally {
      isFetchingOnline.value = false
    }
  }
}

function resumeScanner() {
  currentResult.value = null
  iranCodeResult.value = null
  isFetchingIranCode.value = false
  isScanning.value = true
  runScanningLoop()
}

async function onFileSelected(event) {
  var file = event.target?.files?.[0]
  if (!file) return

  if (scanMode.value === 'ocr') {
    isOcrProcessing.value = true
    ocrNotice.value = null
    try {
      var res = await rapidOcrEngine.recognize(file, { targetKind: ocrContext.value })
      if (res && res.ok && (res.bestNumber || (res.candidates && res.candidates.length > 0))) {
        ocrResultData.value = res
        isOcrModalOpen.value = true
      } else {
        alert('عددی در این تصویر تشخیص داده نشد. لطفاً زاویه و کیفیت تصویر را بررسی کنید.')
      }
    } catch (err) {
      console.error('File OCR failed:', err)
      alert('خطا در پردازش تصویر. لطفاً مجدداً امتحان کنید.')
    } finally {
      isOcrProcessing.value = false
    }
  } else {
    var detected = await barcodeScannerEngine.detectFromFile(file)
    if (detected && detected.rawValue) {
      handleSuccessfulScan(detected.rawValue, detected.format)
    } else {
      alert('بارکد یا کد QR واضحی در این تصویر یافت نشد. لطفاً زاویه یا نور تصویر را بررسی کنید.')
    }
  }
  event.target.value = ''
}

function startOcrForContext(context = 'scanner') {
  ocrContext.value = context
  scanMode.value = 'ocr'
  activeTab.value = 'scanner'
  ocrNotice.value = null
  startCamera()
}

function switchScanMode(mode) {
  scanMode.value = mode
  ocrNotice.value = null
  if (mode === 'barcode') {
    runScanningLoop()
  }
}

async function captureAndRecognizeOcr() {
  if (!videoRef.value || isOcrProcessing.value) return
  isOcrProcessing.value = true
  ocrNotice.value = null

  try {
    // Focused horizontal box in center of viewport: 80% width, 30% height
    var roi = { x: 0.1, y: 0.35, width: 0.8, height: 0.3 }
    var res = await rapidOcrEngine.recognize(videoRef.value, {
      roi,
      targetKind: ocrContext.value
    })

    if (res && res.ok && (res.bestNumber || (res.candidates && res.candidates.length > 0))) {
      ocrResultData.value = res
      isOcrModalOpen.value = true
    } else {
      ocrNotice.value = 'عددی در کادر مشخص‌شده یافت نشد. لطفاً دوربین را روی شماره تنظیم کرده و دوباره دکمه را بزنید.'
      setTimeout(() => {
        ocrNotice.value = null
      }, 4000)
    }
  } catch (err) {
    console.error('Camera OCR recognition error:', err)
    ocrNotice.value = 'خطایی در تشخیص عدد رخ داد. لطفاً مجدداً تلاش کنید.'
  } finally {
    isOcrProcessing.value = false
  }
}

function handleOcrConfirm({ code, destination }) {
  isOcrModalOpen.value = false
  var cleanCode = toEnglishDigits(code).trim()
  if (!cleanCode) return

  if (destination === 'standard') {
    standardInput.value = cleanCode
    activeTab.value = 'standard'
    submitStandardInquiry(cleanCode)
  } else if (destination === 'ifda') {
    ifdaInput.value = cleanCode
    activeTab.value = 'ifda'
    submitIfdaInquiry(cleanCode)
  } else {
    handleSuccessfulScan(cleanCode, 'ocr')
  }
}

function handleOcrRescan() {
  isOcrModalOpen.value = false
  scanMode.value = 'ocr'
  activeTab.value = 'scanner'
  startCamera()
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

var unsubMapping = null

watch(activeTab, (tab) => {
  if (tab === 'scanner') {
    startCamera()
  } else {
    stopCamera()
    if (tab === 'history') {
      loadHistory()
    } else if (tab === 'ifda') {
      loadIfdaHistory()
    } else if (tab === 'standard') {
      loadStandardHistory()
    } else if (tab === 'mapped') {
      loadMappedItems()
    }
  }
})

async function checkOcrModelStatus() {
  isOcrModelReady.value = await ocrModelManager.isModelDownloaded()
}

onMounted(() => {
  rapidOcrEngine.init().catch(() => {})
  checkOcrModelStatus()
  loadHistory()
  loadIfdaHistory()
  loadStandardHistory()
  loadMappedItems()
  unsubMapping = itemProductCodeRepository.subscribe(loadMappedItems)
  if (typeof window !== 'undefined') {
    window.addEventListener('item-product-codes-changed', loadMappedItems)
    window.addEventListener('ocr-model-changed', checkOcrModelStatus)
  }
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
  if (unsubMapping) unsubMapping()
  if (typeof window !== 'undefined') {
    window.removeEventListener('item-product-codes-changed', loadMappedItems)
    window.removeEventListener('ocr-model-changed', checkOcrModelStatus)
  }
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

    <!-- Tabs Segmented Control (Smooth horizontal scroll on mobile, flex on desktop) -->
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800 shadow-inner flex-nowrap">
      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'scanner' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'scanner'"
      >
        <AppIcon name="camera" :size="16" class="shrink-0" />
        <span>اسکنر بارکد</span>
      </button>

      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'ifda' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'ifda'"
      >
        <span class="text-sm shrink-0">🍏</span>
        <span>استعلام غذا و دارو</span>
      </button>

      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'standard' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'standard'"
      >
        <span class="text-sm shrink-0">🏅</span>
        <span>استعلام استاندارد</span>
      </button>

      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'mapped' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'mapped'"
      >
        <span class="text-sm shrink-0">🏷️</span>
        <span>کالاهای ثبت‌شده</span>
        <span
          v-if="mappedCount > 0"
          class="rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none shrink-0"
          :class="activeTab === 'mapped' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
        >
          {{ mappedCount }}
        </span>
      </button>

      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
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

      <button
        type="button"
        class="shrink-0 md:flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150"
        :class="activeTab === 'logos' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        @click="activeTab = 'logos'"
      >
        <AppIcon name="tag" :size="16" class="shrink-0" />
        <span>نمادهای کالا</span>
      </button>
    </div>

    <!-- TAB 1: SCANNER -->
    <div v-show="activeTab === 'scanner'" class="space-y-4">
      <!-- Mode Switcher: Barcode Scanner vs Number OCR -->
      <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all"
          :class="scanMode === 'barcode' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="switchScanMode('barcode')"
        >
          <AppIcon name="scan" :size="16" />
          <span>اسکن بارکد و QR</span>
        </button>

        <button
          type="button"
          class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all"
          :class="scanMode === 'ocr' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
          @click="switchScanMode('ocr')"
        >
          <AppIcon name="sparkle" :size="16" />
          <span>تشخیص عدد کالا (OCR)</span>
        </button>
      </div>

      <!-- Informative Model Banner in OCR Mode -->
      <div
        v-if="scanMode === 'ocr'"
        class="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 p-3 text-xs border border-indigo-100 dark:border-indigo-900/60 shadow-sm animate-fade-in"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-base shrink-0">💡</span>
          <span class="text-slate-700 dark:text-slate-300">
            {{ isOcrModelReady ? 'مدل هوش مصنوعی RapidOCR فعال است (دقت حداکثری)' : 'برای اسکن دقیق‌تر و بهتر انواع فونت‌ها، می‌توانید مدل هوش مصنوعی RapidOCR را دانلود کنید.' }}
          </span>
        </div>
        <RouterLink
          to="/settings#ai-ocr"
          class="shrink-0 font-bold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200 underline underline-offset-2 flex items-center gap-0.5"
        >
          <span>{{ isOcrModelReady ? 'تنظیمات' : 'دانلود مدل' }}</span>
          <span class="text-[10px]">←</span>
        </RouterLink>
      </div>

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
          <!-- Barcode Mode Viewfinder -->
          <div v-if="scanMode === 'barcode'" class="relative h-48 w-64 sm:h-56 sm:w-80 rounded-2xl border-2 border-brand-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
            <!-- Animated Scan Line -->
            <div class="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse" style="animation: scanline 2s ease-in-out infinite;" />
            <!-- Corner Accents -->
            <div class="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-brand-300 rounded-tl" />
            <div class="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-brand-300 rounded-tr" />
            <div class="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-brand-300 rounded-bl" />
            <div class="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-brand-300 rounded-br" />
          </div>

          <!-- OCR Mode Number Viewfinder -->
          <div v-else class="relative h-24 w-72 sm:w-96 rounded-2xl border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center">
            <!-- Glowing line -->
            <div class="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#818cf8] animate-pulse" />
            <!-- Corner Accents -->
            <div class="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-indigo-300 rounded-tl" />
            <div class="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-indigo-300 rounded-tr" />
            <div class="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-indigo-300 rounded-bl" />
            <div class="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-indigo-300 rounded-br" />
            <!-- Contextual instruction pill -->
            <span class="absolute -bottom-7 rounded-full bg-slate-900/90 px-3 py-0.5 text-[11px] font-semibold text-indigo-200 backdrop-blur whitespace-nowrap shadow-sm">
              {{ ocrContext === 'standard' ? 'کادر را روی شماره پروانه استاندارد بگیرید' : ocrContext === 'ifda' ? 'کادر را روی شماره پروانه بهداشتی بگیرید' : 'کادر را روی شماره پروانه یا بارکد کالا بگیرید' }}
            </span>
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
          <span class="rounded-full bg-slate-900/70 px-3 py-1 font-medium backdrop-blur text-slate-200 flex items-center gap-1.5">
            <span class="size-2 rounded-full" :class="scanMode === 'ocr' ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400 animate-pulse'" />
            <span>{{ scanMode === 'ocr' ? 'حالت خواندن عدد (RapidOCR)' : (isScanning && !currentResult ? 'در حال اسکن بارکد...' : 'اسکن متوقف است') }}</span>
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

      <!-- Dedicated OCR Action Button when in OCR Mode -->
      <div v-if="scanMode === 'ocr'" class="space-y-2">
        <button
          type="button"
          class="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          :disabled="isOcrProcessing"
          @click="captureAndRecognizeOcr"
        >
          <div v-if="isOcrProcessing" class="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <AppIcon v-else name="sparkle" :size="20" />
          <span>{{ isOcrProcessing ? 'در حال پردازش با هوش مصنوعی (RapidOCR)...' : 'خواندن عدد از روی کالا 📷' }}</span>
        </button>

        <div
          v-if="ocrNotice"
          class="rounded-xl bg-amber-50 p-3 text-center text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800 animate-fade-in"
        >
          {{ ocrNotice }}
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
          <span>{{ scanMode === 'ocr' ? 'خواندن عدد از عکس گالری' : 'اسکن از عکس گالری' }}</span>
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          @click="isManualModalOpen = true"
        >
          <AppIcon name="keyboard" :size="18" class="text-brand-500" />
          <span>{{ scanMode === 'ocr' ? 'ورود دستی شماره' : 'ورود دستی بارکد' }}</span>
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

        <!-- Iranian Manufacturer Info (Local offline lookup) -->
        <div v-if="currentResult.iranianCompany" class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs sm:text-sm">
          <span class="block font-semibold text-emerald-800 dark:text-emerald-300">
            شرکت / برند داخلی: {{ currentResult.iranianCompany.name }}
          </span>
          <span class="block text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">
            دسته‌بندی: {{ currentResult.iranianCompany.category }}
          </span>
        </div>

        <!-- IranCode National Product Portal Section (مرکز ملی شماره‌گذاری کالا و خدمات) -->
        <div
          v-if="/^\d{8,14}$/.test(currentResult.normalizedValue)"
          class="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-900/40 space-y-2.5"
        >
          <div class="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2 dark:border-slate-700/80">
            <div class="flex items-center gap-1.5">
              <span class="text-base">🏢</span>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                مرکز ملی شماره‌گذاری کالا و خدمات (ایران‌کد / GS1)
              </span>
            </div>
            <a
              :href="`https://irancode.ir/01/${currentResult.normalizedValue}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
            >
              <span>مشاهده در irancode.ir</span>
              <span class="text-[10px]">↗</span>
            </a>
          </div>

          <!-- 1. Loading State -->
          <div v-if="isFetchingIranCode" class="flex items-center gap-2 py-1 text-xs text-slate-500 dark:text-slate-400">
            <div class="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span>در حال استعلام همزمان اطلاعات کالا از سامانه ایران‌کد...</span>
          </div>

          <!-- 2. Success State -->
          <div v-else-if="iranCodeResult && iranCodeResult.ok && iranCodeResult.data" class="space-y-2 text-xs">
            <div class="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
              <div class="flex items-start gap-1.5">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓ شرح رسمی:</span>
                <span class="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {{ iranCodeResult.data.labelDescription || 'ثبت‌شده در سامانه' }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div v-if="iranCodeResult.data.brand">
                  <span class="text-slate-400">نام برند: </span>
                  <span class="font-semibold text-slate-800 dark:text-slate-200">{{ iranCodeResult.data.brand }}</span>
                </div>
                <div v-if="iranCodeResult.data.member">
                  <span class="text-slate-400">عضو / شرکت: </span>
                  <span class="font-semibold text-slate-800 dark:text-slate-200">{{ iranCodeResult.data.member }}</span>
                </div>
                <div v-if="iranCodeResult.data.gpc" class="sm:col-span-2">
                  <span class="text-slate-400">ساختار GPC: </span>
                  <span>{{ iranCodeResult.data.gpc }}</span>
                </div>
                <div v-if="iranCodeResult.data.breakTitle" class="sm:col-span-2">
                  <span class="text-slate-400">بریک کالا: </span>
                  <span>{{ iranCodeResult.data.breakTitle }}</span>
                  <span v-if="iranCodeResult.data.breakCode" class="text-slate-400"> (کد: {{ iranCodeResult.data.breakCode }})</span>
                </div>
                <div v-if="iranCodeResult.data.iranCode">
                  <span class="text-slate-400">ایران‌کد: </span>
                  <span class="font-mono font-semibold">{{ iranCodeResult.data.iranCode }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Error / Failure / Not found State -->
          <div v-else-if="iranCodeResult && !iranCodeResult.ok" class="rounded-xl border border-amber-200/80 bg-amber-50/60 p-2.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs space-y-1.5">
            <div class="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
              <span>⚠️</span>
              <span>{{ iranCodeResult.error || 'دیتا دریافت نشد یا خطا خورد' }}</span>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ iranCodeResult.errorMessage || 'امکان واکشی مستقیم اطلاعات در این مرورگر وجود نداشت یا پاسخی از سامانه دریافت نشد.' }}
            </p>
            <div class="pt-1">
              <a
                :href="iranCodeResult.url || `https://irancode.ir/01/${currentResult.normalizedValue}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 transition-colors"
              >
                <span>مشاهده مستقیم در سامانه ایران‌کد (irancode.ir) ↗</span>
              </a>
            </div>
          </div>
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

        <!-- Map to item action -->
        <button
          type="button"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
          @click="openMapModalForScannedBarcode"
        >
          <span>🔗</span>
          <span>اتصال این بارکد به آیتم خرید (نگاشت و ذخیره کدهای کالا)</span>
        </button>

        <!-- Action buttons -->
        <div class="grid grid-cols-2 gap-2 pt-1">
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

    <!-- TAB: IFDA INQUIRY (استعلام سازمان غذا و دارو) -->
    <div v-show="activeTab === 'ifda'" class="space-y-4">
      <!-- Info Header -->
      <div class="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-4 sm:p-5 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-teal-950/20 space-y-2">
        <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base">
          <span class="text-2xl">🍏</span>
          <span>استعلام پروانه بهداشتی ساخت (سازمان غذا و دارو - سامانه سرفود)</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          شماره پروانه بهداشتی درج‌شده در کنار نشان سیب سلامت (به فرمت <strong>۳۲/۱۱۱۵۹</strong>) را وارد کنید تا نام رسمی، برند، کارخانه سازنده و وضعیت اعتبار پروانه استعلام شود.
        </p>
      </div>

      <!-- Input Form -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800 space-y-3">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
          شماره پروانه بهداشتی ساخت:
        </label>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div class="relative flex-1">
            <input
              v-model="ifdaInput"
              type="text"
              inputmode="numeric"
              maxlength="12"
              dir="ltr"
              placeholder="مثال: 32/11159 یا ۳۲/۱۱۱۵۹"
              class="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center font-mono text-base font-bold tracking-wider text-slate-800 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              @keydown.enter="submitIfdaInquiry()"
            />
          </div>

          <button
            type="button"
            class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors shrink-0 shadow-sm"
            title="اسکن شماره پروانه بهداشتی از روی بسته کالا با هوش مصنوعی"
            @click="startOcrForContext('ifda')"
          >
            <AppIcon name="camera" :size="16" />
            <span>اسکن از کالا (OCR)</span>
          </button>

          <button
            type="button"
            class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 shrink-0"
            :disabled="!ifdaInput.trim() || isFetchingIfda"
            @click="submitIfdaInquiry()"
          >
            <div v-if="isFetchingIfda" class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <AppIcon v-else name="search" :size="16" />
            <span>{{ isFetchingIfda ? 'در حال استعلام...' : 'استعلام پروانه' }}</span>
          </button>
        </div>

        <!-- Example test chip -->
        <div class="flex items-center gap-2 pt-1 text-xs">
          <span class="text-slate-400">نمونه پروانه تستی:</span>
          <button
            type="button"
            class="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
            @click="submitIfdaInquiry('32/11159')"
          >
            ۳۲/۱۱۱۵۹ (دستمال کاغذی تکلان پاک)
          </button>
        </div>
      </div>

      <!-- Result Card -->
      <div
        v-if="ifdaResult"
        class="rounded-3xl border p-4 sm:p-5 shadow-lg space-y-3.5 animate-fade-in"
        :class="ifdaResult.ok ? 'border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-800' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20'"
      >
        <!-- Success State -->
        <div v-if="ifdaResult.ok && ifdaResult.data" class="space-y-3">
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
            <div>
              <div class="flex items-center gap-2">
                <span class="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  سازمان غذا و دارو
                </span>
                <span
                  class="rounded-lg px-2 py-0.5 text-[11px] font-bold"
                  :class="['دارای اعتبار', 'معتبر'].some((s) => ifdaResult.data.licenseStatus.includes(s))
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'"
                >
                  {{ ifdaResult.data.licenseStatus }}
                </span>
              </div>
              <h2 class="mt-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ ifdaResult.data.name }}
              </h2>
            </div>

            <a
              :href="ifdaResult.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline shrink-0"
            >
              <span>مشاهده در سرفود</span>
              <span>↗</span>
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-400 block mb-0.5">شماره پروانه بهداشتی:</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-100">{{ ifdaResult.data.code }}</span>
            </div>
            <div v-if="ifdaResult.data.brand" class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-400 block mb-0.5">نام تجاری / برند:</span>
              <span class="font-bold text-slate-800 dark:text-slate-100">{{ ifdaResult.data.brand }}</span>
            </div>
            <div v-if="ifdaResult.data.manufacturer" class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50 sm:col-span-2">
              <span class="text-slate-400 block mb-0.5">کارخانه / شرکت سازنده:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-100">{{ ifdaResult.data.manufacturer }}</span>
            </div>
            <div v-if="ifdaResult.data.address" class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50 sm:col-span-2">
              <span class="text-slate-400 block mb-0.5">نشانی کارخانه:</span>
              <span class="text-slate-700 dark:text-slate-300 leading-relaxed">{{ ifdaResult.data.address }}</span>
            </div>
            <div v-if="ifdaResult.data.issueDate" class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-400 block mb-0.5">تاریخ صدور:</span>
              <span class="font-mono font-medium text-slate-800 dark:text-slate-200">{{ ifdaResult.data.issueDate }}</span>
            </div>
            <div v-if="ifdaResult.data.expiryDate" class="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-400 block mb-0.5">تاریخ انقضا:</span>
              <span class="font-mono font-medium text-slate-800 dark:text-slate-200">{{ ifdaResult.data.expiryDate }}</span>
            </div>
          </div>

          <!-- Action: Map this IFDA to checklist item -->
          <div class="pt-1">
            <button
              type="button"
              class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
              @click="openMapModalFromIfda(ifdaResult.data)"
            >
              <span>🔗</span>
              <span>اتصال این پروانه به آیتم خرید (نگاشت کالا)</span>
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="space-y-2 text-xs">
          <div class="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <span>⚠️</span>
            <span>{{ ifdaResult.error || 'دیتا دریافت نشد یا خطا خورد' }}</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ ifdaResult.errorMessage || 'امکان استعلام آنلاین در این مرورگر وجود نداشت یا پروانه‌ای با این شماره ثبت نشده است.' }}
          </p>
          <div class="pt-1">
            <a
              :href="ifdaResult.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 transition-colors"
            >
              <span>مشاهده مستقیم در سامانه سرفود (cerfood.ir) ↗</span>
            </a>
          </div>
        </div>
      </div>

      <!-- IFDA Inquiry History -->
      <div class="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            تاریخچه استعلام‌های غذا و دارو
          </h3>
          <button
            v-if="ifdaHistoryItems.length"
            type="button"
            class="text-xs text-red-500 hover:underline"
            @click="handleClearIfdaHistory"
          >
            پاک کردن تاریخچه
          </button>
        </div>

        <!-- Search & Filter in history -->
        <div class="space-y-2">
          <input
            v-model="ifdaHistoryQuery"
            type="search"
            placeholder="جستجو در تاریخچه پروانه‌ها، نام محصول، برند..."
            class="w-full min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />

          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              v-for="st in [
                { key: 'all', label: 'همه' },
                { key: 'valid', label: 'دارای اعتبار' },
                { key: 'invalid', label: 'عدم اعتبار' }
              ]"
              :key="st.key"
              type="button"
              class="min-h-[28px] px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors"
              :class="ifdaHistoryStatusFilter === st.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
              @click="ifdaHistoryStatusFilter = st.key"
            >
              {{ st.label }}
            </button>
          </div>
        </div>

        <!-- History cards list -->
        <div v-if="ifdaHistoryItems.length" class="space-y-2">
          <div
            v-for="item in ifdaHistoryItems"
            :key="item.id"
            class="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 space-y-2"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{{ item.code }}</span>
                  <span
                    v-if="item.licenseStatus"
                    class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    :class="['دارای اعتبار', 'معتبر'].some((s) => item.licenseStatus.includes(s))
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'"
                  >
                    {{ item.licenseStatus }}
                  </span>
                </div>
                <h4 class="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {{ item.title || 'فرآورده بهداشتی / غذایی' }}
                  <span v-if="item.brand" class="text-slate-400 font-normal">({{ item.brand }})</span>
                </h4>
              </div>

              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                  title="اتصال به آیتم خرید"
                  @click="openMapModalFromIfda(item)"
                >
                  اتصال به آیتم
                </button>
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500"
                  title="حذف"
                  @click="handleRemoveIfdaHistoryItem(item.id)"
                >
                  <AppIcon name="trash" :size="14" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 dark:border-slate-700/60 pt-1.5">
              <a
                :href="item.url || `https://cerfood.ir/p/${item.code}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                مشاهده در سرفود ↗
              </a>
              <span>{{ JalaliDate.dateTime(item.inquiredAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-slate-400 text-xs">
          تاریخچه استعلام غذا و دارو خالی است.
        </div>
      </div>
    </div>

    <!-- TAB: STANDARD (استعلام پروانه نشان استاندارد) -->
    <div v-show="activeTab === 'standard'" class="space-y-4">
      <!-- Info Header -->
      <div class="rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-blue-50/50 p-4 sm:p-5 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-blue-950/20 space-y-2">
        <div class="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-sm sm:text-base">
          <span class="text-2xl">🏅</span>
          <span>استعلام مستقیم پروانه نشان استاندارد ملی ایران</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          شماره پروانه کاربرد نشان استاندارد اجباری (۱۰ رقمی مانند <strong>۷۳۳۹۹۶۹۹۲۳</strong>) یا استاندارد تشویقی (۹ رقمی) را وارد کنید تا اطلاعات کامل واحد تولیدی، فرآورده، برند، آدرس کارخانه و تاریخ اعتبار مستقیماً بدون نیاز به کد امنیتی دریافت و ثبت شود.
        </p>
      </div>

      <!-- Input Form -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800 space-y-4">
        <!-- License Number Input -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
            شماره پروانه کاربرد نشان استاندارد:
          </label>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div class="relative flex-1">
              <input
                v-model="standardInput"
                type="text"
                dir="ltr"
                placeholder="مثال: 7339969923"
                class="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center font-mono text-base font-bold tracking-wider text-slate-800 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                @keydown.enter="submitStandardInquiry()"
              />
            </div>

            <!-- Scan from Product Button -->
            <button
              type="button"
              class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-sky-300 bg-sky-50 px-3.5 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 transition-colors shrink-0 shadow-sm"
              title="اسکن شماره پروانه ۱۰ رقمی از روی بسته کالا با هوش مصنوعی"
              @click="startOcrForContext('standard')"
            >
              <AppIcon name="camera" :size="16" />
              <span>اسکن از کالا (OCR)</span>
            </button>

            <!-- Submit Button -->
            <button
              type="button"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-sky-700 transition-colors disabled:opacity-50 shrink-0"
              :disabled="!standardInput.trim() || isFetchingStandard"
              @click="submitStandardInquiry()"
            >
              <div v-if="isFetchingStandard" class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <AppIcon v-else name="search" :size="16" />
              <span>{{ isFetchingStandard ? 'در حال دریافت اطلاعات...' : 'استعلام پروانه' }}</span>
            </button>
          </div>
        </div>

        <!-- Quick sample and SMS helper -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <span class="text-slate-400">نمونه پروانه:</span>
            <button
              type="button"
              class="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 transition-colors"
              @click="submitStandardInquiry('7339969923')"
            >
              ۷۳۳۹۹۶۹۹۲۳ (تکلان پاک)
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="standardInput.trim()"
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 dark:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 px-2.5 py-1 rounded-xl transition-colors border border-sky-200 dark:border-sky-800"
              @click="openStandardReport(standardInput)"
            >
              <span>🌐</span>
              <span>شناسنامه رسمی در استاندارد ↗</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
              @click="openSmsInquiry()"
            >
              <span>📲</span>
              <span>پیامک سریع به ۱۰۰۰۱۵۱۷</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Result Card -->
      <div
        v-if="standardResult"
        class="rounded-3xl border p-4 sm:p-5 shadow-lg space-y-4 animate-fade-in"
        :class="standardResult.ok ? 'border-sky-200 bg-white dark:border-sky-900/60 dark:bg-slate-800' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20'"
      >
        <!-- Success State -->
        <div v-if="standardResult.ok && standardResult.data" class="space-y-3.5">
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">🏅</span>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {{ standardResult.data.product || standardResult.data.brand || 'پروانه استاندارد' }}
                </h3>
              </div>
              <p v-if="standardResult.data.manufacturer" class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                واحد تولیدی: {{ standardResult.data.manufacturer }}
              </p>
            </div>

            <!-- Status Badge -->
            <span
              class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold shrink-0"
              :class="standardResult.status === 'valid'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : (standardResult.status === 'invalid'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300')"
            >
              <span class="size-1.5 rounded-full" :class="standardResult.status === 'valid' ? 'bg-emerald-600' : (standardResult.status === 'invalid' ? 'bg-rose-600' : 'bg-amber-600')" />
              <span>{{ standardResult.data.statusText || 'معتبر' }}</span>
            </span>
          </div>

          <!-- Structured Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-500">شماره پروانه:</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                {{ standardResult.data.licenseNumber }}
              </span>
            </div>

            <div v-if="standardResult.data.brand" class="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-500">علامت تجاری:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ standardResult.data.brand }}</span>
            </div>

            <div v-if="standardResult.data.province" class="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-500">استان و شهر:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ standardResult.data.province }}</span>
            </div>

            <div v-if="standardResult.data.expiryDate" class="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <span class="text-slate-500">تاریخ اعتبار:</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ standardResult.data.expiryDate }}</span>
            </div>

            <div v-if="standardResult.data.model" class="col-span-full flex items-start justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50 gap-2">
              <span class="text-slate-500 shrink-0">مدل / نوع بسته‌بندی:</span>
              <span class="font-medium text-slate-800 dark:text-slate-200 text-left">{{ standardResult.data.model }}</span>
            </div>

            <div v-if="standardResult.data.address" class="col-span-full flex items-start justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50 gap-2">
              <span class="text-slate-500 shrink-0">آدرس کارخانه:</span>
              <span class="font-medium text-slate-800 dark:text-slate-200 text-left">{{ standardResult.data.address }}</span>
            </div>
          </div>

          <!-- History / Renewals -->
          <div v-if="standardResult.data.history && standardResult.data.history.length" class="space-y-1.5 pt-1">
            <h4 class="text-[11px] font-bold text-slate-600 dark:text-slate-400">سوابق پروانه و تمدیدها:</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(hist, idx) in standardResult.data.history"
                :key="idx"
                class="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
              >
                <span>{{ hist.status }}</span>
                <span class="text-slate-400">({{ hist.fromDate }})</span>
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
              @click="openMapModal({
                initialStandardCode: standardResult.data.licenseNumber,
                initialProductTitle: standardResult.data.product || standardResult.data.brand,
                initialBrand: standardResult.data.brand,
                initialManufacturer: standardResult.data.manufacturer,
                initialLicenseStatus: standardResult.data.statusText
              })"
            >
              <AppIcon name="tag" :size="14" />
              <span>ثبت و اتصال به کالا در لیست خرید</span>
            </button>

            <a
              v-if="standardResult.data.reportUrl"
              :href="standardResult.data.reportUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 dark:text-sky-400"
            >
              <span>مشاهده شناسنامه رسمی در سایت استاندارد ↗</span>
            </a>
          </div>
        </div>

        <!-- Direct Official Portal Link (Zero Captcha, No 526, No Cookie Loop) -->
        <div v-else class="space-y-3.5 text-xs">
          <div class="rounded-2xl border border-sky-300 bg-sky-50/90 p-4 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200 space-y-2.5">
            <div class="flex items-center gap-2 font-bold text-sm text-sky-900 dark:text-sky-100">
              <span class="text-xl">🏛️</span>
              <span>استعلام و مشاهده شناسنامه رسمی در سایت استاندارد</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              شناسنامه رسمی این پروانه (شامل مشخصات فرآورده، نام کارخانه، آدرس و تاریخ اعتبار) مستقیماً و <strong>بدون نیاز به کد امنیتی</strong> در دسترس است. با کلیک روی دکمه زیر، شناسنامه رسمی در صفحه سازمان استاندارد باز می‌شود:
            </p>

            <div class="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                class="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
                @click="openStandardReport(standardInput)"
              >
                <span>🌐</span>
                <span>مشاهده شناسنامه رسمی پروانه در سایت استاندارد ↗</span>
              </button>

              <button
                type="button"
                class="flex min-h-[46px] items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors shrink-0"
                @click="openSmsInquiry()"
              >
                <span>📲</span>
                <span>پیامک سریع به ۱۰۰۰۱۵۱۷</span>
              </button>
            </div>
          </div>

          <!-- Quick Action Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-500">شماره پروانه:</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ standardInput }}</span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-sm"
              @click="openMapModal({
                initialStandardCode: standardInput,
                initialLicenseStatus: 'معتبر'
              })"
            >
              <AppIcon name="tag" :size="14" />
              <span>ثبت مشخصات و اتصال به کالا در لیست خرید</span>
            </button>
          </div>
        </div>
      </div>

      <!-- History of Standard Inquiries -->
      <div class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-700">
          <div class="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
            <AppIcon name="history" :size="16" />
            <span>تاریخچه استعلام‌های نشان استاندارد</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {{ standardHistoryItems.length }}
            </span>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center gap-1 text-xs">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
              :class="standardHistoryStatusFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
              @click="standardHistoryStatusFilter = 'all'"
            >
              همه
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
              :class="standardHistoryStatusFilter === 'valid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
              @click="standardHistoryStatusFilter = 'valid'"
            >
              معتبر
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
              :class="standardHistoryStatusFilter === 'invalid' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
              @click="standardHistoryStatusFilter = 'invalid'"
            >
              منقضی/نامعتبر
            </button>
          </div>
        </div>

        <!-- Search Bar in History -->
        <div v-if="standardHistoryRepository.getAll().length > 3" class="relative">
          <input
            v-model="standardHistoryQuery"
            type="text"
            placeholder="جستجو در تاریخچه پروانه‌ها، شرکت و کالا..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>

        <!-- List -->
        <div v-if="standardHistoryItems.length" class="divide-y divide-slate-100 dark:divide-slate-700 max-h-[380px] overflow-y-auto">
          <div
            v-for="item in standardHistoryItems"
            :key="item.id"
            class="py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-sky-700 dark:text-sky-300">{{ item.licenseNumber }}</span>
                <span
                  class="rounded-md px-1.5 py-0.2 text-[10px] font-bold"
                  :class="item.status === 'valid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'"
                >
                  {{ item.statusText || (item.status === 'valid' ? 'معتبر' : 'نامعتبر') }}
                </span>
              </div>
              <p class="truncate text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {{ item.product || item.brand || item.manufacturer || 'بدون عنوان' }}
                <span v-if="item.manufacturer && item.product" class="text-slate-400 text-[10px]">({{ item.manufacturer }})</span>
              </p>
              <p v-if="item.address" class="truncate text-slate-400 text-[10px] mt-0.5">
                📍 {{ item.address }}
              </p>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                title="اتصال به کالا"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700"
                @click="openMapModal({
                  initialStandardCode: item.licenseNumber,
                  initialProductTitle: item.product || item.brand,
                  initialBrand: item.brand,
                  initialManufacturer: item.manufacturer,
                  initialLicenseStatus: item.statusText
                })"
              >
                <AppIcon name="tag" :size="14" />
              </button>

              <button
                type="button"
                title="استعلام مجدد"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-700"
                @click="submitStandardInquiry(item.licenseNumber)"
              >
                <AppIcon name="search" :size="14" />
              </button>

              <button
                type="button"
                title="حذف از تاریخچه"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                @click="standardHistoryRepository.remove(item.id); loadStandardHistory()"
              >
                <AppIcon name="trash" :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-slate-400 text-xs">
          تاریخچه استعلام استاندارد خالی است.
        </div>
      </div>
    </div>

    <!-- TAB: MAPPED ITEMS (کالاهای متصل‌شده به کدهای کالا) -->
    <div v-show="activeTab === 'mapped'" class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏷️</span>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              کالاهای دارای شناسه و اصالت ثبت‌شده
            </h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            نگاشت بارکد، پروانه غذا و دارو و کد استاندارد ملی به آیتم‌های موجود در لیست خرید
          </p>
        </div>

        <button
          type="button"
          class="flex min-h-[40px] items-center justify-center gap-1.5 rounded-2xl bg-brand-500 px-4 text-xs sm:text-sm font-semibold text-white shadow hover:bg-brand-600 transition-colors shrink-0"
          @click="openMapModalForNew"
        >
          <AppIcon name="plus" :size="16" />
          <span>ثبت نگاشت جدید</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="space-y-2">
        <input
          v-model="mappedQuery"
          type="search"
          placeholder="جستجو در کالاهای ثبت‌شده (نام کالا، برند، بارکد، پروانه...)"
          class="w-full min-h-[44px] rounded-2xl border border-slate-200 bg-white px-4 text-xs sm:text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            v-for="mf in [
              { key: 'all', label: 'همه کالاهای ثبت‌شده' },
              { key: 'barcode', label: 'دارای بارکد' },
              { key: 'ifda', label: 'دارای پروانه غذا و دارو' },
              { key: 'standard', label: 'دارای نشان استاندارد' }
            ]"
            :key="mf.key"
            type="button"
            class="min-h-[30px] px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            :class="mappedFilter === mf.key ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
            @click="mappedFilter = mf.key"
          >
            {{ mf.label }}
          </button>
        </div>
      </div>

      <!-- Mapped Items Grid / List -->
      <div v-if="mappedItems.length" class="space-y-3">
        <div
          v-for="item in mappedItems"
          :key="item.id"
          class="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-brand-300 dark:border-slate-700/80 dark:bg-slate-800 transition-all space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <span class="rounded-lg bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  {{ item.templateTitle || 'لیست خرید' }}
                </span>
                <span v-if="item.categoryName" class="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {{ item.categoryName }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                {{ item.itemTitle }}
              </h3>
              <p v-if="item.productTitle || item.brand" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ item.productTitle || item.brand }}
              </p>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                @click="openDetailsForMapping(item)"
              >
                شناسنامه
              </button>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 dark:border-slate-700 dark:hover:bg-slate-700"
                title="ویرایش نگاشت"
                @click="openEditForMapping(item)"
              >
                <AppIcon name="edit" :size="15" />
              </button>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:hover:bg-red-950/30"
                title="حذف نگاشت"
                @click="handleDeleteMapping(item.id)"
              >
                <AppIcon name="trash" :size="15" />
              </button>
            </div>
          </div>

          <!-- Registered Codes Pills -->
          <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs font-mono">
            <span
              v-if="item.barcode"
              class="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
            >
              <span>📊 بارکد:</span>
              <span class="font-bold">{{ item.barcode }}</span>
            </span>
            <span
              v-if="item.ifdaCode"
              class="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
            >
              <span>🍏 پروانه:</span>
              <span class="font-bold">{{ item.ifdaCode }}</span>
            </span>
            <span
              v-if="item.standardCode"
              class="inline-flex items-center gap-1 rounded-xl bg-sky-50 px-2.5 py-1 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60"
            >
              <span>🇮🇷 استاندارد:</span>
              <span class="font-bold">{{ item.standardCode }}</span>
            </span>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span v-if="item.manufacturer">کارخانه: {{ item.manufacturer }}</span>
            <span v-else></span>
            <span>ثبت: {{ JalaliDate.date(item.registeredAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12 text-slate-400 space-y-3">
        <span class="text-4xl block">🏷️</span>
        <p class="text-sm">هیچ کالایی با کدهای شناسایی و اصالت ثبت نشده است.</p>
        <p class="text-xs text-slate-500">
          می‌توانید پس از اسکن بارکد یا استعلام پروانه غذا و دارو، آن را به آیتم‌های لیست خرید خود متصل کنید.
        </p>
        <button
          type="button"
          class="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 transition-colors"
          @click="openMapModalForNew"
        >
          ثبت اولین نگاشت کالا
        </button>
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
            <div class="flex items-center gap-2">
              <span class="font-mono text-slate-600 dark:text-slate-300 tracking-wider">{{ item.code }}</span>
              <a
                v-if="/^\d{8,14}$/.test(item.code)"
                :href="`https://irancode.ir/01/${item.code}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline"
                title="مشاهده مستقیم در مرکز ملی شماره‌گذاری کالا (ایران‌کد)"
              >
                <span>ایران‌کد</span>
                <span class="text-[9px]">↗</span>
              </a>
            </div>
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

        <div class="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            class="min-h-[40px] px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center gap-1"
            @click="startOcrForContext('scanner'); isManualModalOpen = false"
          >
            <AppIcon name="camera" :size="16" />
            <span>اسکن با دوربین (OCR)</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="min-h-[40px] px-3.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm"
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
    </div>

    <!-- OCR Result Review & Edit Modal -->
    <OcrResultModal
      :is-open="isOcrModalOpen"
      :initial-number="ocrResultData?.bestNumber || ''"
      :candidates="ocrResultData?.candidates || []"
      :snapshot-url="ocrResultData?.snapshotDataUrl || ''"
      :engine="ocrResultData?.engine || 'onnx-rapidocr'"
      :duration-ms="ocrResultData?.durationMs || 0"
      :context="ocrContext"
      @close="isOcrModalOpen = false"
      @confirm="handleOcrConfirm"
      @rescan="handleOcrRescan"
    />

    <!-- Map Item Code Modal -->
    <MapItemCodeModal
      :is-open="isMapModalOpen"
      :initial-item="mapModalParams.initialItem"
      :initial-barcode="mapModalParams.initialBarcode"
      :initial-ifda-code="mapModalParams.initialIfdaCode"
      :initial-standard-code="mapModalParams.initialStandardCode"
      :initial-brand="mapModalParams.initialBrand"
      :initial-product-title="mapModalParams.initialProductTitle"
      :initial-manufacturer="mapModalParams.initialManufacturer"
      :initial-license-status="mapModalParams.initialLicenseStatus"
      @close="isMapModalOpen = false"
      @saved="loadMappedItems"
    />

    <!-- Item Code Details Modal -->
    <ItemCodeDetailsModal
      :is-open="isDetailsModalOpen"
      :mapping="selectedMappingForDetails"
      @close="isDetailsModalOpen = false"
      @edit="openEditForMapping(selectedMappingForDetails)"
      @deleted="loadMappedItems"
    />

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
