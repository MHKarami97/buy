<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import ToggleSwitch from './ToggleSwitch.vue'
import { guideRepository } from '../data/guides'
import { VERDICT_LABELS } from '../data/ingredients/ingredientBuilder'
import { preferencesRepository } from '../services/PreferencesRepository'
import { JalaliDate } from '../services/JalaliDate.js'
import { ShoppingListDocumentBuilder } from '../services/export/ShoppingListDocumentBuilder'
import { PrintService } from '../services/export/PrintService'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'

var props = defineProps({
  modelValue: { type: Boolean, default: false },
  scope: { type: String, default: 'main' },
  title: { type: String, default: 'لیست خرید' }
})
var emit = defineEmits(['update:modelValue'])

var store = useChecklistStore()
var { isAvoided } = useIngredientPreferences()
var options = ref(preferencesRepository.getExportOptions())
var excluded = ref({})
var isBusy = ref(false)
var errorText = ref('')

var builder = new ShoppingListDocumentBuilder({
  findGuide: (item) => guideRepository.findForItem(item),
  ingredientsOfItem: (item) => guideRepository.ingredientsForItem(item),
  isAvoided: isAvoided,
  verdictLabels: VERDICT_LABELS,
  fontStylesheetHref: new URL('fonts/Vazirmatn-font-face.css', document.baseURI).href
})

var entries = computed(() =>
  props.modelValue ? store.shoppingEntriesFor(props.scope, options.value.includeLowStock) : []
)
var groups = computed(() => {
  var map = new Map()
  entries.value.forEach((entry) => {
    var group = map.get(entry.template.id) ?? { template: entry.template, entries: [] }
    group.entries.push(entry)
    map.set(entry.template.id, group)
  })
  return Array.from(map.values())
})
var selectedGroups = computed(() =>
  groups.value
    .map((group) => ({ ...group, entries: group.entries.filter((entry) => !excluded.value[keyOf(entry)]) }))
    .filter((group) => group.entries.length > 0)
)
var selectedCount = computed(() => selectedGroups.value.reduce((sum, group) => sum + group.entries.length, 0))
var guideCount = computed(() => {
  var ids = new Set()
  selectedGroups.value.forEach((group) =>
    group.entries.forEach((entry) => {
      var guide = guideRepository.findForItem(entry.item)
      if (guide) ids.add(guide.id)
    })
  )
  return ids.size
})
var ingredientCount = computed(() => {
  var ids = new Set()
  selectedGroups.value.forEach((group) =>
    group.entries.forEach((entry) =>
      guideRepository.ingredientsForItem(entry.item).forEach((ingredient) => ids.add(ingredient.id))
    )
  )
  return ids.size
})

function keyOf(entry) {
  return `${entry.template.id}::${entry.category.id}::${entry.item.id}`
}

function toggleEntry(entry) {
  excluded.value = { ...excluded.value, [keyOf(entry)]: !excluded.value[keyOf(entry)] }
}

function close() {
  emit('update:modelValue', false)
}

async function generate() {
  if (!selectedCount.value || isBusy.value) return
  isBusy.value = true
  errorText.value = ''
  try {
    var html = builder.build({
      title: props.title,
      generatedAtText: JalaliDate.dateTime(Date.now()),
      groups: selectedGroups.value,
      options: options.value
    })
    await PrintService.printHtml(html)
    close()
  } catch (error) {
    errorText.value = 'ساخت خروجی ناموفق بود. دوباره تلاش کنید.'
    console.error('PDF export failed', error)
  } finally {
    isBusy.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) close()
}

watch(options, (value) => preferencesRepository.setExportOptions(value), { deep: true })
watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) {
      excluded.value = {}
      errorText.value = ''
    }
  }
)
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="export-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="خروجی PDF لیست خرید"
          class="flex w-full sm:max-w-xl max-h-[88vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-xl"
        >
          <header class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <h2 class="flex-1 text-base font-bold">📄 خروجی PDF</h2>
            <button type="button" class="min-w-[44px] min-h-[44px] rounded-lg text-slate-400 hover:text-slate-700" aria-label="بستن" @click="close">✕</button>
          </header>

          <div class="flex-1 overflow-y-auto space-y-4 p-4">
            <div class="space-y-1">
              <ToggleSwitch v-model="options.includeLowStock" label="شامل مواد کم" />
              <ToggleSwitch v-model="options.includeGuides" label="شامل راهنمای خرید" />
              <ToggleSwitch v-model="options.includeIngredients" label="شامل مواد تشکیل‌دهنده" />
              <p class="text-xs text-slate-400">این انتخاب‌ها ذخیره می‌شوند و دفعه‌ی بعد به‌صورت پیش‌فرض می‌آیند.</p>
            </div>

            <p class="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs leading-6 text-slate-600 dark:text-slate-300">
              {{ selectedCount }} آیتم
              <template v-if="options.includeGuides"> · {{ guideCount }} راهنما</template>
              <template v-if="options.includeIngredients"> · {{ ingredientCount }} ماده</template>
            </p>

            <details class="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <summary class="cursor-pointer text-sm font-medium min-h-[36px] flex items-center">پیش‌نمایش و انتخاب آیتم‌ها</summary>
              <div class="mt-2 space-y-3">
                <section v-for="group in groups" :key="group.template.id" class="space-y-1">
                  <p class="text-xs font-semibold text-slate-500">{{ group.template.icon }} {{ group.template.title }}</p>
                  <label
                    v-for="entry in group.entries"
                    :key="keyOf(entry)"
                    class="flex items-center gap-3 min-h-[40px] text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      class="size-4 accent-brand-500"
                      :checked="!excluded[keyOf(entry)]"
                      @change="toggleEntry(entry)"
                    />
                    <span class="flex-1">{{ entry.item.title }}</span>
                    <span v-if="entry.isLow" class="text-[10px] px-2 rounded-full bg-amber-100 text-amber-700">کم</span>
                  </label>
                </section>
                <p v-if="!groups.length" class="text-xs text-slate-400">آیتمی برای خروجی وجود ندارد.</p>
              </div>
            </details>

            <p class="text-xs leading-6 text-slate-400">
              پس از زدن دکمه، پنجره‌ی چاپ مرورگر باز می‌شود؛ مقصد را «Save as PDF / ذخیره به‌صورت PDF» انتخاب کنید.
            </p>
            <p v-if="errorText" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-600">{{ errorText }}</p>
          </div>

          <footer class="flex gap-2 border-t border-slate-200 dark:border-slate-800 p-3">
            <button
              type="button"
              class="flex-1 min-h-[44px] rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
              :disabled="!selectedCount || isBusy"
              @click="generate"
            >{{ isBusy ? 'در حال آماده‌سازی...' : 'ساخت PDF' }}</button>
            <button type="button" class="min-h-[44px] px-5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm" @click="close">انصراف</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.export-fade-enter-active,
.export-fade-leave-active {
  transition: opacity 0.15s ease;
}
.export-fade-enter-from,
.export-fade-leave-to {
  opacity: 0;
}
</style>
