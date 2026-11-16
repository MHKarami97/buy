<script setup>
import { nextTick, ref, watch } from 'vue'
import { itemPriceRepository } from '../services/ItemPriceRepository'
import { formatToman, groupDigits, parseTomanInput } from '../services/currency'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  priceKey: { type: String, required: true }
})

var current = ref(itemPriceRepository.getCurrent(props.priceKey))
var isEditing = ref(false)
var draft = ref('')
var inputElement = ref(null)

watch(
  () => props.priceKey,
  (key) => {
    current.value = itemPriceRepository.getCurrent(key)
    isEditing.value = false
  }
)

async function startEditing() {
  draft.value = current.value ? groupDigits(String(current.value)) : ''
  isEditing.value = true
  await nextTick()
  inputElement.value?.focus()
  inputElement.value?.select()
}

function onInput(event) {
  var digits = parseTomanInput(event.target.value)
  draft.value = digits ? groupDigits(digits) : ''
  event.target.value = draft.value
}

function save() {
  var value = Number(parseTomanInput(draft.value))
  if (value > 0) {
    itemPriceRepository.record(props.priceKey, value)
    current.value = value
  }
  isEditing.value = false
}

function cancel() {
  isEditing.value = false
}
</script>

<template>
  <div class="w-full">
    <div v-if="isEditing" class="flex items-stretch gap-2">
      <div class="relative flex-1">
        <input
          ref="inputElement"
          :value="draft"
          type="text"
          inputmode="numeric"
          dir="ltr"
          autocomplete="off"
          placeholder="مثلاً 120,000"
          aria-label="قیمت واحد به تومان"
          class="h-11 w-full rounded-xl border border-brand-300 bg-white pl-16 pr-3 text-left text-sm font-semibold tabular-nums text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-brand-700 dark:bg-slate-700 dark:text-slate-100"
          @input="onInput"
          @keydown.enter.prevent="save"
          @keydown.esc.prevent="cancel"
        />
        <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">تومان</span>
      </div>
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-xl bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
        aria-label="ذخیره‌ی قیمت"
        @click="save"
      >✓</button>
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-xl border border-slate-300 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
        aria-label="انصراف"
        @click="cancel"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <button
      v-else
      type="button"
      class="inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 text-xs transition-colors"
      :class="current
        ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300'
        : 'border border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400'"
      :aria-label="current ? `قیمت واحد ${formatToman(current)}، برای ویرایش بزنید` : 'ثبت قیمت واحد'"
      @click="startEditing"
    >
      <AppIcon name="wallet" :size="16" />
      <template v-if="current">
        <span class="font-semibold">{{ formatToman(current) }}</span>
        <span class="text-[10px] opacity-70">ویرایش</span>
      </template>
      <span v-else>ثبت قیمت واحد</span>
    </button>
  </div>
</template>
