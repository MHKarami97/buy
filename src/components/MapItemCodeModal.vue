<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import { itemProductCodeRepository } from '../services/barcode/ItemProductCodeRepository'
import { suggestMatchingItems, flattenTemplateItems } from '../services/barcode/itemMatcher'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  isOpen: { type: Boolean, default: false },
  initialItem: { type: Object, default: null },
  initialBarcode: { type: String, default: '' },
  initialIfdaCode: { type: String, default: '' },
  initialStandardCode: { type: String, default: '' },
  initialBrand: { type: String, default: '' },
  initialProductTitle: { type: String, default: '' },
  initialManufacturer: { type: String, default: '' },
  initialLicenseStatus: { type: String, default: '' }
})

var emit = defineEmits(['close', 'saved'])

var store = useChecklistStore()

var selectedItem = ref(null)
var itemSearchQuery = ref('')

var barcode = ref('')
var ifdaCode = ref('')
var standardCode = ref('')
var brand = ref('')
var productTitle = ref('')
var manufacturer = ref('')
var licenseStatus = ref('')

var allAppItems = computed(() => flattenTemplateItems(store.templates))

// Suggestions based on product title or brand
var suggestions = computed(() => {
  var seed = productTitle.value || brand.value || itemSearchQuery.value
  if (!seed) return []
  return suggestMatchingItems(seed, allAppItems.value, 6)
})

// Search results when user types in search box
var searchResults = computed(() => {
  var q = itemSearchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allAppItems.value.filter((it) => {
    return (
      it.title.toLowerCase().includes(q) ||
      it.categoryName.toLowerCase().includes(q) ||
      it.templateTitle.toLowerCase().includes(q)
    )
  }).slice(0, 8)
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      barcode.value = props.initialBarcode || ''
      ifdaCode.value = props.initialIfdaCode || ''
      standardCode.value = props.initialStandardCode || ''
      brand.value = props.initialBrand || ''
      productTitle.value = props.initialProductTitle || ''
      manufacturer.value = props.initialManufacturer || ''
      licenseStatus.value = props.initialLicenseStatus || ''
      itemSearchQuery.value = ''

      if (props.initialItem) {
        selectedItem.value = props.initialItem
      } else {
        // Try to pre-select existing mapping if barcode or ifda is provided
        var existing = null
        if (props.initialBarcode) {
          existing = allAppItems.value.find((it) => {
            var m = itemProductCodeRepository.getForItem(it.id)
            return m && m.barcode === props.initialBarcode
          })
        }
        if (!existing && suggestions.value.length > 0) {
          // Pre-select top suggestion if strong match
          selectedItem.value = suggestions.value[0]
        } else {
          selectedItem.value = existing || null
        }
      }
    }
  },
  { immediate: true }
)

function selectItem(item) {
  selectedItem.value = item
  itemSearchQuery.value = ''
  // If item already has some codes, load existing values to avoid overwriting them
  var existing = itemProductCodeRepository.getForItem(item.id)
  if (existing) {
    if (!barcode.value && existing.barcode) barcode.value = existing.barcode
    if (!ifdaCode.value && existing.ifdaCode) ifdaCode.value = existing.ifdaCode
    if (!standardCode.value && existing.standardCode) standardCode.value = existing.standardCode
    if (!brand.value && existing.brand) brand.value = existing.brand
    if (!productTitle.value && existing.productTitle) productTitle.value = existing.productTitle
    if (!manufacturer.value && existing.manufacturer) manufacturer.value = existing.manufacturer
    if (!licenseStatus.value && existing.licenseStatus) licenseStatus.value = existing.licenseStatus
  }
}

function handleSave() {
  if (!selectedItem.value) {
    alert('لطفاً یک آیتم از لیست کالاهای اپ انتخاب کنید.')
    return
  }

  var saved = itemProductCodeRepository.saveMapping({
    itemId: selectedItem.value.id,
    itemTitle: selectedItem.value.title,
    templateId: selectedItem.value.templateId,
    templateTitle: selectedItem.value.templateTitle,
    categoryId: selectedItem.value.categoryId,
    categoryName: selectedItem.value.categoryName,
    barcode: barcode.value.trim(),
    ifdaCode: ifdaCode.value.trim(),
    standardCode: standardCode.value.trim(),
    brand: brand.value.trim(),
    productTitle: productTitle.value.trim(),
    manufacturer: manufacturer.value.trim(),
    licenseStatus: licenseStatus.value.trim()
  })

  emit('saved', saved)
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-xl">🔗</span>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
              اتصال کدها و پروانه به کالا (نگاشت کالا)
            </h2>
            <p class="text-xs text-slate-400">
              ارتباط‌دهی بارکد، پروانه غذا و دارو و کد استاندارد به آیتم خرید
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Section 1: Item Selection & Suggestions -->
      <div class="space-y-2.5 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
          ۱. انتخاب آیتم مقصد در برنامه
        </label>

        <!-- Current Selected Item Badge -->
        <div v-if="selectedItem" class="flex items-center justify-between rounded-xl bg-brand-50 p-3 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-brand-700 dark:text-brand-300">{{ selectedItem.title }}</span>
              <span class="rounded bg-brand-200/60 dark:bg-brand-900 px-1.5 py-0.5 text-[10px] text-brand-800 dark:text-brand-200">انتخاب‌شده</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {{ selectedItem.templateTitle }} ← {{ selectedItem.categoryName }}
            </p>
          </div>

          <button
            type="button"
            class="text-xs text-slate-400 hover:text-red-500 px-2 py-1"
            title="تغییر آیتم"
            @click="selectedItem = null"
          >
            تغییر
          </button>
        </div>

        <!-- Search input to pick item -->
        <div v-else class="space-y-2">
          <div class="relative">
            <input
              v-model="itemSearchQuery"
              type="search"
              placeholder="جستجوی نام آیتم (مثلاً دستمال کاغذی، پنیر...)"
              class="w-full min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <!-- Suggested items chips -->
          <div v-if="suggestions.length > 0" class="space-y-1">
            <span class="block text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
              ✨ پیشنهادهای هوشمند بر اساس نام کالا:
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="sug in suggestions"
                :key="sug.id"
                type="button"
                class="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300 transition-colors"
                @click="selectItem(sug)"
              >
                + {{ sug.title }} <span class="text-[10px] text-slate-400">({{ sug.categoryName }})</span>
              </button>
            </div>
          </div>

          <!-- Search Results Dropdown/List -->
          <div v-if="searchResults.length > 0" class="max-h-40 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900 space-y-1">
            <button
              v-for="item in searchResults"
              :key="item.id"
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              @click="selectItem(item)"
            >
              <span class="font-bold text-slate-800 dark:text-slate-100">{{ item.title }}</span>
              <span class="text-[10px] text-slate-400">{{ item.categoryName }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: Codes and Identification details -->
      <div class="space-y-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
          ۲. مشخصات و کدهای شناسایی کالا
        </label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <!-- Barcode -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">بارکد تجاری (GTIN / EAN):</label>
            <input
              v-model="barcode"
              type="text"
              placeholder="مثال: 6262637600129"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- IFDA Code -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">شماره پروانه بهداشتی ساخت (غذا و دارو):</label>
            <input
              v-model="ifdaCode"
              type="text"
              placeholder="مثال: 32/11159"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- Standard Code -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">کد ۱۰ رقمی استاندارد ملی ایران:</label>
            <input
              v-model="standardCode"
              type="text"
              placeholder="مثال: 1001517"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- Brand -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">نام برند / نشان تجاری:</label>
            <input
              v-model="brand"
              type="text"
              placeholder="مثال: تکلان پاک"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- Official product title -->
          <div class="sm:col-span-2">
            <label class="block text-[11px] text-slate-500 mb-1">شرح رسمی یا مدل کالا:</label>
            <input
              v-model="productTitle"
              type="text"
              placeholder="مثال: دستمال کاغذی، 150 برگ دو لایه، 1 عدد"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- Manufacturer -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">شرکت تولیدکننده / صاحب پروانه:</label>
            <input
              v-model="manufacturer"
              type="text"
              placeholder="مثال: تکلان پاک"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <!-- License status -->
          <div>
            <label class="block text-[11px] text-slate-500 mb-1">وضعیت پروانه / استاندارد:</label>
            <input
              v-model="licenseStatus"
              type="text"
              placeholder="مثال: دارای اعتبار یا عدم اعتبار"
              class="w-full min-h-[38px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          انصراف
        </button>
        <button
          type="button"
          class="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-600 transition-colors disabled:opacity-50"
          :disabled="!selectedItem"
          @click="handleSave"
        >
          ذخیره و اتصال مشخصات
        </button>
      </div>
    </div>
  </div>
</template>
