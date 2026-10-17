<script setup>
import { computed, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import ToggleSwitch from './ToggleSwitch.vue'
import ShoppingEntryRow from './ShoppingEntryRow.vue'
import ShoppingNotesCard from './ShoppingNotesCard.vue'

var props = defineProps({
  scope: { type: String, default: 'main' },
  title: { type: String, default: 'لیست خرید' },
  emptyText: { type: String, default: 'لیست خرید خالی است' }
})

var store = useChecklistStore()
var showLowStock = ref(false)
var expandedLists = ref({})
var isPostponedExpanded = ref(true)

function groupByTemplate(entries) {
  var groups = new Map()
  entries.forEach((entry) => {
    var group = groups.get(entry.template.id)
    if (!group) {
      group = { template: entry.template, entries: [] }
      groups.set(entry.template.id, group)
    }
    group.entries.push(entry)
  })
  return Array.from(groups.values())
}

var shoppingGroups = computed(() =>
  groupByTemplate(store.shoppingEntriesFor(props.scope, showLowStock.value))
)
var postponedGroups = computed(() =>
  groupByTemplate(store.postponedEntriesFor(props.scope, showLowStock.value))
)
var postponedCount = computed(() =>
  postponedGroups.value.reduce((sum, group) => sum + group.entries.length, 0)
)
var subtitle = computed(() =>
  showLowStock.value
    ? 'آیتم‌های تمام‌شده و موادی که مقدارشان نیم واحد است'
    : 'آیتم‌هایی که موجودی آن‌ها صفر است'
)

function entryKey(entry) {
  return `${entry.template.id}-${entry.category.id}-${entry.item.id}`
}

function isListExpanded(templateId) {
  return expandedLists.value[templateId] ?? true
}

function toggleList(templateId) {
  expandedLists.value[templateId] = !isListExpanded(templateId)
}

function confirmQuantity(entry, quantity) {
  store.updateItemQuantity(entry.item.id, quantity, entry.category.id, entry.template.id)
}

function postpone(entry) {
  store.postponeItem(entry.item.id, entry.category.id, entry.template.id)
}

function restore(entry) {
  store.restorePostponedItem(entry.item.id, entry.category.id, entry.template.id)
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-x-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">{{ title }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ subtitle }}</p>
      </div>
      <ToggleSwitch v-model="showLowStock" label="نمایش مواد کم" />
    </div>

    <ShoppingNotesCard :scope="scope" />

    <div v-if="shoppingGroups.length" class="space-y-4">
      <section
        v-for="group in shoppingGroups"
        :key="group.template.id"
        class="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          :aria-expanded="isListExpanded(group.template.id)"
          @click="toggleList(group.template.id)"
        >
          <span class="text-xl" aria-hidden="true">{{ group.template.icon }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">{{ group.template.title }}</span>
            <span class="block text-xs text-slate-400 mt-0.5">{{ group.entries.length }} آیتم برای خرید</span>
          </span>
          <span class="text-lg text-slate-400" aria-hidden="true">{{ isListExpanded(group.template.id) ? '⌃' : '⌄' }}</span>
        </button>

        <div v-if="isListExpanded(group.template.id)" class="space-y-2 border-t border-slate-100 dark:border-slate-700/60 p-2">
          <ShoppingEntryRow
            v-for="entry in group.entries"
            :key="entryKey(entry)"
            :entry="entry"
            @confirm="(quantity) => confirmQuantity(entry, quantity)"
            @postpone="postpone(entry)"
          />
        </div>
      </section>
    </div>
    <p v-else class="text-center text-sm text-slate-400 py-8">{{ emptyText }}</p>

    <section
      v-if="postponedCount"
      class="overflow-hidden rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        :aria-expanded="isPostponedExpanded"
        @click="isPostponedExpanded = !isPostponedExpanded"
      >
        <span>
          <span class="block text-sm font-semibold text-slate-600 dark:text-slate-300">حذف‌شده‌های موقت</span>
          <span class="block text-xs text-slate-400 mt-0.5">{{ postponedCount }} آیتم فعلاً در لیست خرید نیست</span>
        </span>
        <span class="text-lg text-slate-400" aria-hidden="true">{{ isPostponedExpanded ? '⌃' : '⌄' }}</span>
      </button>

      <div v-if="isPostponedExpanded" class="space-y-3 border-t border-slate-100 dark:border-slate-700/60 p-2">
        <div v-for="group in postponedGroups" :key="group.template.id" class="space-y-2">
          <p class="px-2 pt-1 text-xs text-slate-400">{{ group.template.icon }} {{ group.template.title }}</p>
          <div
            v-for="entry in group.entries"
            :key="entryKey(entry)"
            class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-3 bg-slate-50 dark:bg-slate-700/30 opacity-80"
          >
            <div class="flex-1 min-w-[8rem]">
              <p class="text-sm text-slate-600 dark:text-slate-300">{{ entry.item.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ entry.category.name }}</p>
            </div>
            <button
              type="button"
              class="min-h-[40px] px-3 rounded-xl border border-brand-300 text-brand-600 dark:text-brand-300 text-xs font-medium hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
              @click="restore(entry)"
            >
              برگشت به لیست خرید
            </button>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
