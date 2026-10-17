<script setup>
import ShoppingListPanel from '../components/ShoppingListPanel.vue'
</script>

<template>
  <div class="space-y-4">
    <RouterLink
      to="/occasions"
      class="inline-flex items-center min-h-[44px] text-sm text-brand-600 dark:text-brand-300"
    >
      → خرید مناسبتی
    </RouterLink>
    <ShoppingListPanel
      scope="occasion"
      title="لیست خرید مناسبتی"
      empty-text="هیچ آیتمی برای خرید مناسبتی وجود ندارد"
    />
  </div>
</template>
