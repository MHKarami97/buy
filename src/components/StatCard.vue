<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' }
});
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4">
    <p class="text-xs text-slate-400">{{ label }}</p>
    <p class="mt-1 text-base sm:text-lg font-bold text-brand-600 dark:text-brand-300">{{ value }}</p>
    <p v-if="hint" class="mt-0.5 text-11px text-slate-400">{{ hint }}</p>
  </div>
</template>
