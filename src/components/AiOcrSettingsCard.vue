<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ocrModelManager } from '../services/ocr/OcrModelManager'
import AppIcon from './AppIcon.vue'

var selectedEngine = ref(ocrModelManager.getPreferredEngine())
var isDownloaded = ref(false)
var cachedSize = ref(null)
var isDownloading = ref(false)
var downloadProgress = ref(0)
var downloadError = ref(null)
var isDeleting = ref(false)

async function refreshStatus() {
  isDownloaded.value = await ocrModelManager.isModelDownloaded()
  cachedSize.value = await ocrModelManager.getCachedModelSize()
  selectedEngine.value = ocrModelManager.getPreferredEngine()
}

function handleEngineChange(engine) {
  selectedEngine.value = engine
  ocrModelManager.setPreferredEngine(engine)
}

async function handleDownload() {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0
  downloadError.value = null

  var res = await ocrModelManager.downloadModel((p) => {
    downloadProgress.value = p.percent || 0
  })

  isDownloading.value = false
  if (res.ok) {
    await refreshStatus()
    // Auto-switch to rapidocr once downloaded
    ocrModelManager.setPreferredEngine('rapidocr')
    selectedEngine.value = 'rapidocr'
  } else {
    downloadError.value = res.error || 'خطا در دانلود مدل. لطفاً اتصال اینترنت خود را بررسی نمایید.'
  }
}

async function handleDelete() {
  if (!confirm('آیا مایلید مدل RapidOCR از حافظه دستگاه پاک شود؟ (در این صورت موتور محلی جایگزین خواهد شد)')) return
  isDeleting.value = true
  await ocrModelManager.deleteModel()
  isDeleting.value = false
  await refreshStatus()
}

onMounted(() => {
  refreshStatus()
  if (typeof window !== 'undefined') {
    window.addEventListener('ocr-model-changed', refreshStatus)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('ocr-model-changed', refreshStatus)
  }
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800 space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-700/80">
      <div class="flex items-center gap-3">
        <span class="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
          <AppIcon name="sparkle" :size="24" />
        </span>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            موتور تشخیص هوشمند ارقام (OCR)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            خواندن ارقام روی کالاها (پروانه استاندارد، غذا و دارو و بارکدها)
          </p>
        </div>
      </div>
      <span
        class="rounded-full px-2.5 py-1 text-[11px] font-bold"
        :class="isDownloaded ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
      >
        {{ isDownloaded ? 'مدل RapidOCR آماده است ✓' : 'موتور محلی فعال' }}
      </span>
    </div>

    <!-- Engine Options -->
    <div class="space-y-2">
      <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
        انتخاب روش اسکن و پردازش:
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Local Engine Option -->
        <label
          class="flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all"
          :class="selectedEngine === 'local' ? 'border-brand-500 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/30 ring-1 ring-brand-500' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-800/80'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="ocr-engine"
                value="local"
                :checked="selectedEngine === 'local'"
                class="text-brand-600 focus:ring-brand-500"
                @change="handleEngineChange('local')"
              />
              <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                موتور محلی آفلاین
              </span>
            </div>
            <span class="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              پیش‌فرض
            </span>
          </div>
          <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            کاملاً آفلاین، بدون نیاز به اینترنت و بدون دانلود مدل (۰ مگابایت). سرعت فوق‌العاده بالا روی تمام دستگاه‌ها.
          </p>
        </label>

        <!-- RapidOCR Neural Net Option -->
        <label
          class="flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all"
          :class="selectedEngine === 'rapidocr' ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-800/80'"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="ocr-engine"
                value="rapidocr"
                :checked="selectedEngine === 'rapidocr'"
                class="text-indigo-600 focus:ring-indigo-500"
                @change="handleEngineChange('rapidocr')"
              />
              <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                شبکه عصبی RapidOCR
              </span>
            </div>
            <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              دقت حداکثری
            </span>
          </div>
          <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            مبتنی بر مدل عمیق PP-OCRv4 و ONNX Runtime. دقت فوق‌العاده در خواندن انواع فونت‌ها، اعداد ناواضح یا کج.
          </p>
        </label>
      </div>
    </div>

    <!-- Model Status & Action Box -->
    <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/50 space-y-3">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-600 dark:text-slate-300 font-medium">وضعیت مدل در حافظه دستگاه:</span>
        <div class="flex items-center gap-1.5 font-bold">
          <span v-if="isDownloaded" class="text-emerald-600 dark:text-emerald-400">
            دانلود شده ({{ cachedSize || '~10.8 MB' }})
          </span>
          <span v-else class="text-amber-600 dark:text-amber-400">
            دانلود نشده (حجم فایل: ~10.8 مگابایت)
          </span>
        </div>
      </div>

      <!-- Downloading Progress Bar -->
      <div v-if="isDownloading" class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <span>در حال دریافت مدل از سرور...</span>
          <span>{{ downloadProgress }}%</span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            class="h-full bg-indigo-600 transition-all duration-200"
            :style="{ width: `${downloadProgress}%` }"
          />
        </div>
      </div>

      <!-- Download Error -->
      <div
        v-if="downloadError"
        class="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
      >
        {{ downloadError }}
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button
          v-if="!isDownloaded"
          type="button"
          class="flex min-h-[40px] items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          :disabled="isDownloading"
          @click="handleDownload"
        >
          <AppIcon v-if="!isDownloading" name="download" :size="16" />
          <div v-else class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>{{ isDownloading ? 'در حال دانلود مدل...' : 'دانلود مدل هوش مصنوعی RapidOCR (~10.8 MB)' }}</span>
        </button>

        <button
          v-if="isDownloaded"
          type="button"
          class="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 transition-colors disabled:opacity-50"
          :disabled="isDeleting"
          @click="handleDelete"
        >
          <AppIcon name="trash" :size="16" />
          <span>{{ isDeleting ? 'در حال حذف...' : 'حذف مدل از حافظه' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
