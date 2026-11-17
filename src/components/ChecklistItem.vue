<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import GuideLinkButton from './GuideLinkButton.vue'
import ItemHistoryLink from './ItemHistoryLink.vue'
import ItemPriceField from './ItemPriceField.vue'
import { useChecklistStore } from '../stores/checklistStore'
import { QuantityHistoryRepository } from '../services/QuantityHistoryRepository.js'

var props = defineProps({
  item: { type: Object, required: true }
})
var emit = defineEmits(['toggle', 'update-quantity', 'remove', 'toggle-visibility'])

var store = useChecklistStore()

var priceKey = computed(() => {
  var templateId = store.activeTemplateId
  var categoryId = store.activeCategory?.id
  if (!templateId || !categoryId) return null
  return QuantityHistoryRepository.buildKey(templateId, categoryId, props.item.id)
})

function changeQuantity(amount) {
  emit('update-quantity', { id: props.item.id, quantity: Math.max(0, props.item.quantity + amount) })
}
</script>

<template>
  <div class="space-y-2 rounded-2xl border border-slate-100 bg-white px-3 py-3 animate-fade-in dark:border-slate-700/60 dark:bg-slate-800">
    <div class="flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-sm sm:text-base text-slate-800 dark:text-slate-100">
          {{ item.title }}
        </p>
        <p v-if="item.note" class="mt-0.5 text-xs text-slate-400">{{ item.note }}</p>
      </div>

      <div class="flex shrink-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-600 dark:bg-slate-700">
        <button
          type="button"
          class="flex size-10 items-center justify-center text-lg font-semibold text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-40 dark:hover:bg-slate-600"
          aria-label="کاهش تعداد"
          :disabled="item.quantity === 0"
          @click="changeQuantity(-0.5)"
        >
          −
        </button>
        <input
          :value="item.quantity"
          type="number"
          min="0"
          step="0.5"
          inputmode="decimal"
          aria-label="تعداد موجود"
          class="quantity-input h-10 w-12 border-x border-slate-200 bg-transparent text-center text-sm font-bold text-brand-600 focus:outline-none dark:border-slate-600 dark:text-brand-300"
          @input="emit('update-quantity', { id: item.id, quantity: $event.target.value })"
        />
        <button
          type="button"
          class="flex size-10 items-center justify-center text-lg font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-600"
          aria-label="افزایش تعداد"
          @click="changeQuantity(0.5)"
        >
          +
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-slate-100 pt-2 dark:border-slate-700/60">
      <ItemPriceField v-if="priceKey" :price-key="priceKey" />
      <GuideLinkButton :item="item" />

      <div class="ms-auto flex items-center">
        <ItemHistoryLink :item="item" />
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 active:scale-90 dark:hover:bg-slate-700"
          :aria-label="item.isHidden ? 'بازگردانی' : 'پنهان‌سازی'"
          :title="item.isHidden ? 'بازگردانی' : 'پنهان‌سازی'"
          @click="emit('toggle-visibility', item.id)"
        >
          <AppIcon :name="item.isHidden ? 'eye' : 'eyeOff'" :size="20" />
        </button>
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-90 dark:hover:bg-red-900/20"
          aria-label="حذف آیتم"
          title="حذف آیتم"
          @click="emit('remove', item.id)"
        >
          <AppIcon name="trash" :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quantity-input {
  appearance: textfield;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
</style>
