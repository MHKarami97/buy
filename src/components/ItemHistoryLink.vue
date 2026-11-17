<script setup>
import { computed } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  item: { type: Object, required: true }
})

var store = useChecklistStore()

var target = computed(function () {
  var templateId = store.activeTemplateId
  var categoryId = store.activeCategory ? store.activeCategory.id : null
  if (!templateId || !categoryId) {
    return null
  }
  return {
    name: 'item-history',
    params: { templateId: templateId, categoryId: categoryId, itemId: props.item.id }
  }
})
</script>

<template>
  <RouterLink
    v-if="target"
    :to="target"
    class="flex size-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 active:scale-90 dark:hover:bg-slate-700"
    aria-label="نمودار و تاریخچه مصرف"
    title="نمودار و تاریخچه مصرف"
  >
    <AppIcon name="trend" :size="20" />
  </RouterLink>
</template>
