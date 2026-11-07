<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { useDebouncedValue } from '../composables/useDebounce'
import { ItemSearchService } from '../services/ItemSearchService'

var store = useChecklistStore()
var router = useRouter()
var query = ref('')
var { debouncedValue: debouncedQuery, setValue: setDebouncedQuery } = useDebouncedValue('', 200)

var results = computed(() => ItemSearchService.search(store.mainTemplates, debouncedQuery.value))
var hasQuery = computed(() => debouncedQuery.value.trim().length > 0)

function onInput(event) {
  query.value = event.target.value
  setDebouncedQuery(query.value)
}

function clear() {
  query.value = ''
  setDebouncedQuery('')
}

function openResult(result) {
  router.push({
    name: 'checklist-detail',
    params: { id: result.template.id },
    query: { category: result.category.id, q: result.item.title }
  })
}

function entryKey(result) {
  return result.template.id + '-' + result.category.id + '-' + result.item.id
}
</script>

<template>
  <div class="relative">
    <input
      :value="query"
      type="search"
      placeholder="جستجو در همه دسته‌ها..."
      aria-label="جستجوی کلی آیتم‌ها"
      class="w-full min-h-44px rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      @input="onInput"
      @keydown.esc="clear"
    />

    <ul
      v-if="hasQuery && results.length"
      class="mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700"
    >
      <li v-for="result in results" :key="entryKey(result)">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-right min-h-44px hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          @click="openResult(result)"
        >
          <span class="text-xl" aria-hidden="true">{{ result.template.icon }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm text-slate-800 dark:text-slate-100">{{ result.item.title }}</span>
            <span class="block truncate text-xs text-slate-400">
              {{ result.template.title }} › {{ result.category.name }}
            </span>
          </span>
        </button>
      </li>
    </ul>

    <p v-else-if="hasQuery" class="mt-2 text-center text-sm text-slate-400 py-4">موردی پیدا نشد.</p>
  </div>
</template>
