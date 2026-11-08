<script setup>
import { computed } from 'vue';
import { useChecklistStore } from '../stores/checklistStore';

var props = defineProps({
  item: { type: Object, required: true }
});

var store = useChecklistStore();

var target = computed(function () {
  var templateId = store.activeTemplateId;
  var categoryId = store.activeCategory ? store.activeCategory.id : null;
  if (!templateId || !categoryId) {
    return null;
  }
  return {
    name: 'item-history',
    params: { templateId: templateId, categoryId: categoryId, itemId: props.item.id }
  };
});
</script>

<template>
  <RouterLink
    v-if="target"
    :to="target"
    class="min-w-44px min-h-44px flex items-center justify-center text-slate-400 hover:text-brand-500 transition-colors"
    aria-label="نمودار و تاریخچه مصرف"
    title="نمودار و تاریخچه مصرف"
  >
    <span aria-hidden="true">📈</span>
  </RouterLink>
</template>
