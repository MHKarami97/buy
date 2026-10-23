<script setup>
import { computed } from 'vue'
import { guideRepository } from '../data/guides'
import { useGuideDialog } from '../composables/useGuideDialog'

var props = defineProps({
  item: { type: Object, required: true }
})

var { open } = useGuideDialog()
var guide = computed(() => guideRepository.findForItem(props.item))
</script>

<template>
  <button
    v-if="guide"
    type="button"
    class="inline-flex items-center gap-1 min-h-[32px] px-2 rounded-lg text-xs text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
    :aria-label="`راهنمای خرید ${item.title}`"
    @click.stop="open(guide)"
  >
    <span aria-hidden="true">📖</span>
    <span>راهنمای خرید</span>
  </button>
</template>
