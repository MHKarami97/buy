<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="inline-flex items-center gap-3 min-h-[44px] text-sm text-slate-700 dark:text-slate-200"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      dir="ltr"
      class="relative inline-block h-6 w-11 flex-shrink-0 rounded-full transition-colors"
      :class="modelValue ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'"
    >
      <span
        class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </span>
    <span>{{ label }}</span>
  </button>
</template>
