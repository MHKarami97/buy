<script setup>
import { computed, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'

var store = useChecklistStore()
var pendingQuantities = ref({})

var lowStockLists = computed(() => {
  var lists = new Map()
  store.lowStockItems.forEach((entry) => {
    var list = lists.get(entry.template.id)
    if (!list) {
      list = { template: entry.template, entries: [] }
      lists.set(entry.template.id, list)
    }
    list.entries.push(entry)
  })
  return Array.from(lists.values())
})

function entryKey(entry) {
  return `${entry.template.id}-${entry.category.id}-${entry.item.id}`
}

function pendingQuantity(entry) {
  return pendingQuantities.value[entryKey(entry)] ?? entry.item.quantity
}

function changeQuantity(entry, amount) {
  pendingQuantities.value[entryKey(entry)] = Math.max(0, pendingQuantity(entry) + amount)
}

function confirmQuantity(entry) {
  var key = entryKey(entry)
  var quantity = pendingQuantity(entry)
  store.updateItemQuantity(entry.item.id, quantity, entry.category.id, entry.template.id)
  delete pendingQuantities.value[key]
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">هشدار مواد کم</h1>
      <p class="text-sm text-slate-400 mt-1">موادی که مقدارشان نیم واحد است</p>
    </div>

    <div v-if="lowStockLists.length" class="space-y-4">
      <section
        v-for="list in lowStockLists"
        :key="list.template.id"
        class="overflow-hidden rounded-xl border border-amber-200 dark:border-amber-700/60 bg-white dark:bg-slate-800"
      >
        <div class="flex items-center gap-3 px-4 py-3 border-b border-amber-100 dark:border-amber-700/40">
          <span class="text-xl">{{ list.template.icon }}</span>
          <span class="text-sm font-semibold">{{ list.template.title }}</span>
        </div>
        <div class="space-y-2 p-2">
          <div v-for="entry in list.entries" :key="entryKey(entry)" class="flex items-center gap-3 rounded-xl px-3 py-3 bg-amber-50 dark:bg-amber-900/20">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-800 dark:text-slate-100">{{ entry.item.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ entry.category.name }}</p>
            </div>
            <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 overflow-hidden">
              <button type="button" class="w-10 h-10 text-lg text-slate-500 disabled:opacity-40" :disabled="pendingQuantity(entry) === 0" @click="changeQuantity(entry, -0.5)">−</button>
              <input :value="pendingQuantity(entry)" type="number" min="0" step="0.5" inputmode="decimal" class="quantity-input w-12 h-10 border-x border-slate-200 dark:border-slate-600 bg-transparent text-center text-sm font-bold text-brand-600" @input="pendingQuantities[entryKey(entry)] = Number($event.target.value)" />
              <button type="button" class="w-10 h-10 text-lg text-brand-600" @click="changeQuantity(entry, 0.5)">+</button>
            </div>
            <button type="button" class="min-h-[40px] px-3 rounded-xl bg-emerald-500 text-white text-xs" @click="confirmQuantity(entry)">تأیید</button>
          </div>
        </div>
      </section>
    </div>
    <p v-else class="text-center text-sm text-slate-400 py-8">ماده کم‌ی وجود ندارد</p>
  </section>
</template>

<style scoped>
.quantity-input { appearance: textfield; -moz-appearance: textfield; }
.quantity-input::-webkit-inner-spin-button, .quantity-input::-webkit-outer-spin-button { margin: 0; -webkit-appearance: none; }
</style>
