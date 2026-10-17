<script setup>
import { computed, ref, watch } from 'vue'

var props = defineProps({
  entry: { type: Object, required: true }
})
var emit = defineEmits(['confirm', 'postpone'])

var pendingQuantity = ref(props.entry.item.quantity)
var hasChange = computed(() => pendingQuantity.value !== props.entry.item.quantity)

watch(
  () => props.entry.item.quantity,
  (quantity) => {
    pendingQuantity.value = quantity
  }
)

function changeQuantity(amount) {
  pendingQuantity.value = Math.max(0, pendingQuantity.value + amount)
}

function onInput(event) {
  pendingQuantity.value = Math.max(0, Number(event.target.value) || 0)
}

function confirm() {
  if (hasChange.value) emit('confirm', pendingQuantity.value)
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-3"
    :class="entry.isLow ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50 dark:bg-slate-700/40'"
  >
    <div class="flex-1 min-w-[8rem]">
      <p class="flex items-center gap-2 text-sm sm:text-base text-slate-800 dark:text-slate-100">
        <span>{{ entry.item.title }}</span>
        <span
          v-if="entry.isLow"
          class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-200"
        >کم</span>
      </p>
      <p class="text-xs text-slate-400 mt-0.5">{{ entry.category.name }}</p>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 overflow-hidden shadow-sm">
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
          aria-label="کاهش تعداد"
          :disabled="pendingQuantity === 0"
          @click="changeQuantity(-0.5)"
        >−</button>
        <input
          :value="pendingQuantity"
          type="number"
          min="0"
          step="0.5"
          inputmode="decimal"
          aria-label="تعداد موجود"
          class="quantity-input w-12 h-10 border-x border-slate-200 dark:border-slate-600 bg-transparent text-center text-sm font-bold text-brand-600 dark:text-brand-300 focus:outline-none"
          @input="onInput"
        />
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-600 transition-colors"
          aria-label="افزایش تعداد"
          @click="changeQuantity(0.5)"
        >+</button>
      </div>

      <button
        v-if="hasChange"
        type="button"
        class="min-h-[40px] px-3 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
        @click="confirm"
      >
        تأیید
      </button>

      <button
        type="button"
        class="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        aria-label="حذف موقت از لیست خرید"
        title="حذف موقت از لیست خرید"
        @click="emit('postpone')"
      >
        ✕
      </button>
    </div>
  </div>
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
