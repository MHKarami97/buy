<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { guideRepository } from '../data/guides'
import { useDebouncedValue } from '../composables/useDebounce'
import { useGuideDialog } from '../composables/useGuideDialog'

var route = useRoute()
var { open } = useGuideDialog()
var { debouncedValue: debouncedQuery, setValue: setDebouncedQuery } = useDebouncedValue('', 200)

var query = ref('')
var selectedGroupId = ref('all')

var results = computed(() => guideRepository.search(debouncedQuery.value, selectedGroupId.value))
var resultCount = computed(() => results.value.reduce((sum, result) => sum + result.guides.length, 0))

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
        {{ guideRepository.guideCount }} راهنما برای مقایسه و انتخاب بهتر کالا در فروشگاه
      </p>
    </div>

    <input
      v-model="query"
      type="search"
      placeholder="جستجو؛ مثلاً کره، ماهی، سیب‌زمینی، برچسب..."
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
    <p v-else class="text-center text-sm text-slate-400 py-10">راهنمایی با این عبارت پیدا نشد</p>
  </section>
</template>
