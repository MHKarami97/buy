<script setup>
import { ref, watch, computed } from 'vue'
import { toEnglishDigits, toPersianDigits, classifyNumberKind } from '../services/ocr/digitNormalizer'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialNumber: {
    type: String,
    default: ''
  },
  candidates: {
    type: Array,
    default: () => []
  },
  snapshotUrl: {
    type: String,
    default: ''
  },
  engine: {
    type: String,
    default: 'onnx-rapidocr'
  },
  durationMs: {
    type: Number,
    default: 0
  },
  context: {
    type: String,
    default: 'scanner' // 'standard' | 'ifda' | 'scanner'
  }
})

var emit = defineEmits(['close', 'confirm', 'rescan'])

var editedCode = ref('')
var selectedDestination = ref('standard')
var copied = ref(false)

watch(
  () => props.initialNumber,
  (val) => {
    editedCode.value = val || ''
  },
  { immediate: true }
)

watch(
  () => props.context,
  (ctx) => {
    if (ctx === 'standard') selectedDestination.value = 'standard'
    else if (ctx === 'ifda') selectedDestination.value = 'ifda'
    else selectedDestination.value = 'scanner'
  },
  { immediate: true }
)

var classification = computed(() => {
  return classifyNumberKind(editedCode.value)
})

function convertToEnglish() {
  editedCode.value = toEnglishDigits(editedCode.value)
}

function convertToPersian() {
  editedCode.value = toPersianDigits(editedCode.value)
}

function clearInput() {
  editedCode.value = ''
}

function pickCandidate(candidate) {
  if (!candidate) return
  editedCode.value = candidate.english || candidate.raw || ''
}

function copyToClipboard() {
  if (!editedCode.value) return
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(editedCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function handleConfirm() {
  var val = editedCode.value.trim()
  if (!val) return
  emit('confirm', {
    code: val,
    destination: selectedDestination.value,
    classification: classification.value
  })
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div
      class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
            <AppIcon name="sparkle" :size="20" />
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-white text-base">
              نتیجه تشخیص عدد (OCR)
            </h3>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span class="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-semibold">
                {{ engine === 'onnx-rapidocr' ? 'RapidOCR (ONNX Runtime)' : 'موتور هوشمند محلی' }}
              </span>
              <span v-if="durationMs > 0">{{ durationMs }}ms</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          @click="emit('close')"
        >
          <AppIcon name="close" :size="20" />
        </button>
      </div>

      <div class="space-y-4 pt-4">
        <!-- Captured Snapshot Preview -->
        <div v-if="snapshotUrl" class="space-y-1">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>تصویر کادر اسکن‌شده از روی کالا:</span>
            <span class="text-[11px] text-slate-400">بررسی تطابق با کالا</span>
          </label>
          <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-slate-700 shadow-inner max-h-36 flex items-center justify-center">
            <img :src="snapshotUrl" alt="Scanned Area" class="max-h-36 w-full object-contain" />
          </div>
        </div>

        <!-- Editable Input Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              عدد خوانده‌شده (امکان ویرایش):
            </label>
            <span
              v-if="classification"
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="classification.kind === 'standard_license' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'"
            >
              {{ classification.labelFa }}
            </span>
          </div>

          <div class="relative">
            <input
              v-model="editedCode"
              type="text"
              dir="ltr"
              class="w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 py-2.5 text-center font-mono text-xl font-bold tracking-wider text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-indigo-900/70 dark:bg-slate-900/60 dark:text-white dark:focus:border-indigo-400 shadow-sm"
              placeholder="عدد را بررسی یا ویرایش کنید..."
            />
          </div>

          <!-- Quick Digit Tools -->
          <div class="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                @click="convertToEnglish"
              >
                <span>انگلیسی</span>
                <span class="font-mono font-semibold">123</span>
              </button>
              <button
                type="button"
                class="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                @click="convertToPersian"
              >
                <span>فارسی</span>
                <span class="font-semibold">۱۲۳</span>
              </button>
              <button
                type="button"
                class="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                @click="clearInput"
              >
                پاک کردن
              </button>
            </div>
            <button
              type="button"
              class="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
              @click="copyToClipboard"
            >
              <span>{{ copied ? 'کپی شد ✓' : 'کپی' }}</span>
              <AppIcon name="copy" :size="14" />
            </button>
          </div>
        </div>

        <!-- Detected Candidate Chips (if multiple numbers found) -->
        <div v-if="candidates && candidates.length > 1" class="space-y-1.5 pt-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">
            سایر شماره‌های تشخیص‌داده‌شده در تصویر:
          </label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(cand, idx) in candidates"
              :key="idx"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors"
              :class="editedCode === cand.english || editedCode === cand.persian ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'"
              @click="pickCandidate(cand)"
            >
              <span class="font-mono dir-ltr">{{ cand.english }}</span>
              <span class="text-[10px] text-slate-400">({{ cand.labelFa }})</span>
            </button>
          </div>
        </div>

        <!-- Destination Selection -->
        <div class="space-y-1.5 pt-1">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-300">
            اقدام پس از تایید:
          </label>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <label
              class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer text-center transition-colors"
              :class="selectedDestination === 'standard' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-600' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400'"
            >
              <input v-model="selectedDestination" type="radio" value="standard" class="sr-only" />
              <span>استعلام استاندارد</span>
              <span class="text-[10px] opacity-75">پروانه ۱۰ رقمی</span>
            </label>

            <label
              class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer text-center transition-colors"
              :class="selectedDestination === 'ifda' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400'"
            >
              <input v-model="selectedDestination" type="radio" value="ifda" class="sr-only" />
              <span>غذا و دارو</span>
              <span class="text-[10px] opacity-75">سیب سلامت</span>
            </label>

            <label
              class="flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer text-center transition-colors"
              :class="selectedDestination === 'scanner' ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-600' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400'"
            >
              <input v-model="selectedDestination" type="radio" value="scanner" class="sr-only" />
              <span>بارکد کالا</span>
              <span class="text-[10px] opacity-75">استعلام کد</span>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/80">
          <button
            type="button"
            class="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            :disabled="!editedCode.trim()"
            @click="handleConfirm"
          >
            تایید و استعلام کد
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors text-xs font-semibold flex items-center gap-1"
            @click="emit('rescan')"
          >
            <AppIcon name="camera" class="w-4 h-4" />
            <span>اسکن مجدد</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
