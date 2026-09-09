<script setup>
import { ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'

var store = useChecklistStore()
var pendingQuantities = ref({})

function entryKey(entry) {
  return `${entry.template.id}-${entry.category.id}-${entry.item.id}`
}

function pendingQuantity(entry) {
  return pendingQuantities.value[entryKey(entry)] ?? entry.item.quantity
}

function updateQuantity(entry, event) {
  var quantity = Math.max(0, Number(event.target.value) || 0)
  pendingQuantities.value[entryKey(entry)] = quantity
}

function changeQuantity(entry, amount) {
  pendingQuantities.value[entryKey(entry)] = Math.max(0, pendingQuantity(entry) + amount)
}

function confirmQuantity(entry) {
  var key = entryKey(entry)
  var quantity = pendingQuantity(entry)
  if (quantity <= 0) return
  store.updateItemQuantity(entry.item.id, quantity, entry.category.id, entry.template.id)
  delete pendingQuantities.value[key]
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">لیست خرید</h1>
      <p class="text-sm text-slate-400 mt-1">آیتم‌هایی که موجودی آن‌ها صفر است</p>
    </div>

    <div class="space-y-2">
      <div
        v-for="entry in store.shoppingItems"
        :key="entryKey(entry)"
        class="flex items-center gap-3 rounded-xl px-3 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm sm:text-base text-slate-800 dark:text-slate-100">{{ entry.item.title }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ entry.template.title }} / {{ entry.category.name }}</p>
        </div>
        <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 overflow-hidden shadow-sm">
          <button
            type="button"
            class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
            aria-label="کاهش تعداد"
            :disabled="pendingQuantity(entry) === 0"
            @click="changeQuantity(entry, -1)"
          >−</button>
          <input
            :value="pendingQuantity(entry)"
            type="number"
            min="0"
            inputmode="numeric"
            aria-label="تعداد موجود"
            class="quantity-input w-12 h-10 border-x border-slate-200 dark:border-slate-600 bg-transparent text-center text-sm font-bold text-brand-600 dark:text-brand-300 focus:outline-none"
            @input="updateQuantity(entry, $event)"
          />
          <button
            type="button"
            class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="افزایش تعداد"
            @click="changeQuantity(entry, 1)"
          >+</button>
        </div>
        <button
          v-if="pendingQuantity(entry) > 0"
          type="button"
          class="min-h-[40px] px-3 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
          @click="confirmQuantity(entry)"
        >
          تأیید
        </button>
      </div>
      <p v-if="!store.shoppingItems.length" class="text-center text-sm text-slate-400 py-8">
        لیست خرید خالی است
      </p>
    </div>
  </section>
</template>

<style scoped>
.quantity-input {
  -moz-appearance: textfield;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
</style>
