<script setup>
var props = defineProps({
  item: { type: Object, required: true }
})
var emit = defineEmits(['toggle', 'update-quantity', 'remove'])

function changeQuantity(amount) {
  emit('update-quantity', { id: props.item.id, quantity: Math.max(0, props.item.quantity + amount) })
}
</script>

<template>
  <div
    class="group flex items-center gap-3 rounded-xl px-3 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 animate-fade-in"
  >
    <div class="flex-1 min-w-0">
      <p class="text-sm sm:text-base text-slate-800 dark:text-slate-100">
        {{ item.title }}
      </p>
      <p v-if="item.note" class="text-xs text-slate-400 mt-0.5">{{ item.note }}</p>
    </div>

    <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 overflow-hidden shadow-sm">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
        aria-label="کاهش تعداد"
        :disabled="item.quantity === 0"
        @click="changeQuantity(-1)"
      >
        −
      </button>
      <input
        :value="item.quantity"
        type="number"
        min="0"
        inputmode="numeric"
        aria-label="تعداد موجود"
        class="quantity-input w-12 h-10 border-x border-slate-200 dark:border-slate-600 bg-transparent text-center text-sm font-bold text-brand-600 dark:text-brand-300 focus:outline-none"
        @input="emit('update-quantity', { id: item.id, quantity: $event.target.value })"
      />
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-600 transition-colors"
        aria-label="افزایش تعداد"
        @click="changeQuantity(1)"
      >
        +
      </button>
    </div>

    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 focus:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-opacity"
      aria-label="حذف آیتم"
      @click="emit('remove', item.id)"
    >
      🗑️
    </button>
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
