<script setup>
import { computed } from 'vue'
import { guideRepository } from '../data/guides'
import { useGuideDialog } from '../composables/useGuideDialog'
import AppIcon from './AppIcon.vue'

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
    class="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 active:scale-95 dark:bg-brand-700/20 dark:text-brand-200 dark:hover:bg-brand-700/30"
    :aria-label="`راهنمای خرید ${item.title}`"
    @click.stop="open(guide)"
  >
    <AppIcon name="book" :size="16" />
    <span>راهنما</span>
  </button>
</template>
