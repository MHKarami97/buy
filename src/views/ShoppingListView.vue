<script setup>
import { useChecklistStore } from '../stores/checklistStore'

var store = useChecklistStore()

function updateQuantity(entry, event) {
  store.updateItemQuantity(
    entry.item.id,
    event.target.value,
    entry.category.id,
    entry.template.id
  )
}

function changeQuantity(entry, amount) {
  store.updateItemQuantity(
    entry.item.id,
    Math.max(0, entry.item.quantity + amount),
    entry.category.id,
    entry.template.id
  )
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
        :key="`${entry.template.id}-${entry.category.id}-${entry.item.id}`"
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
            :disabled="entry.item.quantity === 0"
            @click="changeQuantity(entry, -1)"
          >−</button>
          <input
            :value="entry.item.quantity"
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
