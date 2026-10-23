<script setup>
defineProps({
  guide: { type: Object, required: true }
})

var KIND_STYLES = {
  check: {
    icon: '✅',
    box: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-900/10'
  },
  avoid: {
    icon: '⛔',
    box: 'border-red-200 bg-red-50/70 dark:border-red-800/60 dark:bg-red-900/10'
  },
  label: {
    icon: '🏷️',
    box: 'border-brand-100 bg-brand-50/70 dark:border-brand-700/50 dark:bg-brand-700/10'
  },
  storage: {
    icon: '🧊',
    box: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
  },
  tip: {
    icon: '💡',
    box: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-900/10'
  }
}

function styleOf(kind) {
  return KIND_STYLES[kind] ?? KIND_STYLES.tip
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm leading-7 text-slate-600 dark:text-slate-300">{{ guide.summary }}</p>

    <section
      v-for="section in guide.sections"
      :key="section.title"
      class="rounded-xl border p-3 sm:p-4"
      :class="styleOf(section.kind).box"
    >
      <h3 class="flex items-center gap-2 text-sm font-semibold mb-2">
        <span aria-hidden="true">{{ styleOf(section.kind).icon }}</span>
        <span>{{ section.title }}</span>
      </h3>
      <ul class="space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200 list-disc pr-5 marker:text-slate-400">
        <li v-for="point in section.points" :key="point">{{ point }}</li>
      </ul>
    </section>
  </div>
</template>
