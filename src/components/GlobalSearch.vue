<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { useDebouncedValue } from '../composables/useDebounce'
import { ItemSearchService } from '../services/ItemSearchService'
import AppIcon from './AppIcon.vue'

var SEARCH_LIMIT = 40

var store = useChecklistStore()
var router = useRouter()
var query = ref('')
var activeIndex = ref(-1)
var { debouncedValue: debouncedQuery, setValue: setDebouncedQuery } = useDebouncedValue('', 200)

var results = computed(function () {
  return ItemSearchService.search(store.mainTemplates, debouncedQuery.value, SEARCH_LIMIT)
})
var hasQuery = computed(function () {
  return debouncedQuery.value.trim().length > 0
})
var isLimited = computed(function () {
  return results.value.length >= SEARCH_LIMIT
})

function onInput(event) {
  query.value = event.target.value
  activeIndex.value = -1
  setDebouncedQuery(query.value)
}

function clear() {
  query.value = ''
  activeIndex.value = -1
  setDebouncedQuery('')
}

function openResult(result) {
  router.push({
    name: 'checklist-detail',
    params: { id: result.template.id },
    query: { category: result.category.id, q: result.item.title }
  })
}

function moveActive(step) {
  var count = results.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + step + count) % count
}

function openActive() {
  var result = results.value[activeIndex.value]
  if (result) openResult(result)
}

function entryKey(result) {
  return result.template.id + '-' + result.category.id + '-' + result.item.id
}
</script>

<template>
  <div class="relative">
    <div class="relative">
      <span class="pointer-events-none absolute inset-y-0 start-4 flex items-center text-slate-400" aria-hidden="true">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <input
        :value="query"
        type="search"
        inputmode="search"
        enterkeyhint="search"
        autocomplete="off"
        placeholder="جستجوی کالا در همه لیست‌ها..."
        aria-label="جستجوی کالا در همه لیست‌ها"
        class="w-full min-h-[52px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ps-12 pe-12 text-sm sm:text-base shadow-sm placeholder:text-slate-400 transition-shadow focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-400/20 [&::-webkit-search-cancel-button]:hidden"
        @input="onInput"
        @keydown.esc="clear"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter.prevent="openActive"
      />

      <button
        v-if="query"
        type="button"
        class="absolute inset-y-0 end-2 my-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition-colors"
        aria-label="پاک کردن جستجو"
        @click="clear"
      >
        ✕
      </button>

      <RouterLink
        v-else
        to="/scanner"
        class="absolute inset-y-0 end-2 my-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="اسکن بارکد"
        aria-label="اسکن بارکد"
      >
        <AppIcon name="scan" :size="20" />
      </RouterLink>
    </div>

    <div v-if="hasQuery && results.length" class="mt-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
      <p class="px-4 pt-3 pb-1 text-xs text-slate-400">
        {{ results.length }} نتیجه<span v-if="isLimited"> (حداکثر نمایش)</span>
      </p>
      <ul class="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700" role="listbox">
        <li v-for="(result, index) in results" :key="entryKey(result)" role="option" :aria-selected="index === activeIndex">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-right min-h-[52px] transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60"
            :class="index === activeIndex ? 'bg-brand-50 dark:bg-brand-700/20' : ''"
            @click="openResult(result)"
            @mouseenter="activeIndex = index"
          >
            <span class="text-xl" aria-hidden="true">{{ result.template.icon }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100">
                {{ result.item.title }}
              </span>
              <span class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span class="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5">{{ result.template.title }}</span>
                <span class="truncate">{{ result.category.name }}</span>
              </span>
            </span>
            <span class="text-slate-300 dark:text-slate-600" aria-hidden="true">‹</span>
          </button>
        </li>
      </ul>
    </div>

    <p
      v-else-if="hasQuery"
      class="mt-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 px-3 py-6 text-center text-sm text-slate-400"
    >
      موردی پیدا نشد.
    </p>
  </div>
</template>