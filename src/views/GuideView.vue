<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { guideRepository } from '../data/guides'
import { useDebouncedValue } from '../composables/useDebounce'
import { useGuideDialog } from '../composables/useGuideDialog'
import IngredientCard from '../components/IngredientCard.vue'

var route = useRoute()
var { open } = useGuideDialog()
var { debouncedValue: debouncedQuery, setValue: setDebouncedQuery } = useDebouncedValue('', 200)

var query = ref('')
var selectedGroupId = ref('all')

var results = computed(() => guideRepository.search(debouncedQuery.value, selectedGroupId.value))
var resultCount = computed(() => results.value.reduce((sum, result) => sum + result.guides.length, 0))
var ingredientResults = computed(() =>
  guideRepository.searchIngredients(debouncedQuery.value).map((ingredient) => ({
    ingredient: ingredient,
    guides: guideRepository.guidesForIngredient(ingredient)
  }))
)
var hasAnyResult = computed(() => resultCount.value > 0 || ingredientResults.value.length > 0)

watch(query, (value) => setDebouncedQuery(value))

onMounted(() => {
  var guideId = route.query.g
  if (typeof guideId === 'string') open(guideRepository.findById(guideId))
})
</script>

<template>
  <section class="space-y-5">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">راهنمای خرید</h1>
      <p class="text-sm text-slate-400 mt-1">
        {{ guideRepository.guideCount }} راهنما و {{ guideRepository.ingredientCount }} ماده تشکیل‌دهنده برای مقایسه و انتخاب بهتر کالا
      </p>
    </div>

    <input
      v-model="query"
      type="search"
      placeholder="جستجو؛ مثلاً کره، ماهی، فولیک اسید، جانشین کاکائو..."
      class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
    />

    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="selectedGroupId === 'all'"
        class="min-h-[40px] px-3 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
        :class="selectedGroupId === 'all' ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
        @click="selectedGroupId = 'all'"
      >همه</button>
      <button
        v-for="group in guideRepository.groups"
        :key="group.id"
        type="button"
        role="tab"
        :aria-selected="selectedGroupId === group.id"
        class="min-h-[40px] px-3 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
        :class="selectedGroupId === group.id ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
        @click="selectedGroupId = group.id"
      >{{ group.icon }} {{ group.name }}</button>
    </div>

    <section v-if="ingredientResults.length" class="space-y-3">
      <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <span aria-hidden="true">🧪</span>
        <span>مواد تشکیل‌دهنده</span>
        <span class="text-xs text-slate-400">({{ ingredientResults.length }})</span>
      </h2>
      <div v-for="entry in ingredientResults" :key="entry.ingredient.id" class="space-y-2">
        <IngredientCard :ingredient="entry.ingredient" :open="ingredientResults.length === 1" />
        <div v-if="entry.guides.length" class="flex flex-wrap items-center gap-2 pr-1">
          <span class="text-xs text-slate-400">کالاهای مرتبط:</span>
          <button
            v-for="guide in entry.guides"
            :key="guide.id"
            type="button"
            class="min-h-[36px] px-3 rounded-full bg-slate-100 dark:bg-slate-800 text-xs hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
            @click="open(guide)"
          >{{ guide.icon }} {{ guide.title }}</button>
        </div>
      </div>
    </section>

    <div v-if="resultCount" class="space-y-6">
      <section v-for="result in results" :key="result.group.id" class="space-y-3">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <span aria-hidden="true">{{ result.group.icon }}</span>
          <span>{{ result.group.name }}</span>
          <span class="text-xs text-slate-400">({{ result.guides.length }})</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="guide in result.guides"
            :key="guide.id"
            type="button"
            class="text-right rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 min-h-[44px] hover:border-brand-400 hover:shadow-md transition-all"
            @click="open(guide)"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl" aria-hidden="true">{{ guide.icon }}</span>
              <h3 class="font-semibold text-sm sm:text-base leading-tight">{{ guide.title }}</h3>
            </div>
            <p class="text-xs text-slate-400 mt-2 leading-6 line-clamp-2">{{ guide.summary }}</p>
          </button>
        </div>
      </section>
    </div>
    <p v-if="!hasAnyResult" class="text-center text-sm text-slate-400 py-10">راهنما یا ماده‌ای با این عبارت پیدا نشد</p>
  </section>
</template>
