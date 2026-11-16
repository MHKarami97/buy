<script setup>
import { computed, ref, watch } from 'vue'
import { guideRepository } from '../data/guides'
import { preferencesRepository } from '../services/PreferencesRepository'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'
import IngredientCard from './IngredientCard.vue'

var props = defineProps({
  guide: { type: Object, required: true }
})

var KIND_STYLES = {
  check: {
    icon: '✅',
    box: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-900/10'
  },
  avoid: {
    icon: '⛔',
    box: 'border-red-200 bg-red-50/70 dark:border-red-800/60 dark:bg-red-900/10'
  },
  label: {
    icon: '🏷️',
    box: 'border-brand-100 bg-brand-50/70 dark:border-brand-700/50 dark:bg-brand-700/10'
  },
  storage: {
    icon: '🧊',
    box: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
  },
  tip: {
    icon: '💡',
    box: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-900/10'
  }
}
var STORE_MODE_KINDS = ['check', 'avoid', 'label']

var { isAvoided } = useIngredientPreferences()
var isStoreMode = ref(preferencesRepository.getLabelMode())
var checked = ref({})

var ingredients = computed(() => guideRepository.ingredientsForGuide(props.guide))
var avoidedIngredients = computed(() => ingredients.value.filter((ingredient) => isAvoided(ingredient.id)))
var storeSections = computed(() =>
  props.guide.sections
    .filter((section) => STORE_MODE_KINDS.includes(section.kind))
    .map((section, sectionIndex) => ({
      section: section,
      points: section.points.map((point, pointIndex) => ({ text: point, key: `${sectionIndex}-${pointIndex}` }))
    }))
)
var totalPoints = computed(() => storeSections.value.reduce((sum, entry) => sum + entry.points.length, 0))
var checkedCount = computed(() => Object.values(checked.value).filter(Boolean).length)

watch(isStoreMode, (value) => preferencesRepository.setLabelMode(value))
watch(
  () => props.guide.id,
  () => {
    checked.value = {}
  }
)

function styleOf(kind) {
  return KIND_STYLES[kind] ?? KIND_STYLES.tip
}

function togglePoint(key) {
  checked.value = { ...checked.value, [key]: !checked.value[key] }
}
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="w-full min-h-[44px] rounded-xl border text-sm font-medium transition-colors"
      :class="isStoreMode
        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'"
      :aria-pressed="isStoreMode"
      @click="isStoreMode = !isStoreMode"
    >
      🛒 حالت چک‌لیست فروشگاه {{ isStoreMode ? '(روشن)' : '(خاموش)' }}
    </button>

    <template v-if="isStoreMode">
      <p class="text-xs text-slate-400">
        هر مورد را هنگام نگاه کردن به برچسب تیک بزنید. {{ checkedCount }} از {{ totalPoints }} بررسی شد.
      </p>

      <p
        v-if="avoidedIngredients.length"
        class="rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3 text-sm leading-7 text-red-700 dark:text-red-300"
        role="alert"
      >
        ⚠️ مواد پرهیزیِ شما که ممکن است در این کالا باشد: {{ avoidedIngredients.map((item) => item.name).join('، ') }}
      </p>

      <section v-for="entry in storeSections" :key="entry.section.title" class="space-y-2">
        <h3 class="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true">{{ styleOf(entry.section.kind).icon }}</span>
          <span>{{ entry.section.title }}</span>
        </h3>
        <ul class="space-y-2">
          <li v-for="point in entry.points" :key="point.key">
            <button
              type="button"
              class="flex w-full items-start gap-3 rounded-xl border p-3 text-right text-base leading-8 transition-colors"
              :class="checked[point.key]
                ? 'border-emerald-300 bg-emerald-50 text-slate-400 line-through dark:border-emerald-800 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'"
              :aria-pressed="Boolean(checked[point.key])"
              @click="togglePoint(point.key)"
            >
              <span class="mt-1 text-lg" aria-hidden="true">{{ checked[point.key] ? '✅' : '⬜' }}</span>
              <span class="flex-1">{{ point.text }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section v-if="ingredients.length" class="space-y-2">
        <h3 class="text-sm font-semibold">🧪 موادی که ممکن است ببینید</h3>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="ingredient in ingredients"
            :key="ingredient.id"
            class="rounded-full px-3 py-1 text-xs"
            :class="isAvoided(ingredient.id)
              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 font-semibold'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
          >{{ isAvoided(ingredient.id) ? '🚫 ' : '' }}{{ ingredient.name }}</li>
        </ul>
      </section>
    </template>

    <template v-else>
      <p class="text-sm leading-7 text-slate-600 dark:text-slate-300">{{ guide.summary }}</p>

      <section
        v-for="section in guide.sections"
        :key="section.title"
        class="rounded-xl border p-3 sm:p-4"
        :class="styleOf(section.kind).box"
      >
        <h3 class="flex items-center gap-2 text-sm font-semibold mb-2">
          <span aria-hidden="true">{{ styleOf(section.kind).icon }}</span>
          <span>{{ section.title }}</span>
        </h3>
        <ul class="space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200 list-disc pr-5 marker:text-slate-400">
          <li v-for="point in section.points" :key="point">{{ point }}</li>
        </ul>
      </section>

      <section
        v-if="ingredients.length"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2"
      >
        <h3 class="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true">🧪</span>
          <span>مواد تشکیل‌دهنده‌ای که ممکن است پشت بسته ببینید</span>
        </h3>
        <p class="text-xs text-slate-400">حضور هر ماده به برند و محصول بستگی دارد؛ فهرست روی بسته ملاک است.</p>
        <IngredientCard v-for="ingredient in ingredients" :key="ingredient.id" :ingredient="ingredient" />
      </section>
    </template>
  </div>
</template>
