<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

var route = useRoute()
var router = useRouter()
var isOccasionRoute = computed(() => String(route.name ?? '').startsWith('occasion'))

function goHome() {
  router.push('/')
}
</script>

<template>
  <nav
    class="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16"
  >
    <button
      type="button"
      class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm"
      :class="route.name === 'home' ? 'text-brand-500 font-semibold' : 'text-slate-500 dark:text-slate-400'"
      @click="goHome"
    >
      <span class="text-xl">🏠</span>
      <span>خرید‌ها</span>
    </button>
    <RouterLink
      to="/shopping-list"
      class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm"
      :class="route.name === 'shopping-list' ? 'text-brand-500 font-semibold' : 'text-slate-500 dark:text-slate-400'"
    >
      <span class="text-xl">🛒</span>
      <span>لیست خرید</span>
    </RouterLink>
    <RouterLink
      to="/guide"
      class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm"
      :class="route.name === 'guide' ? 'text-brand-500 font-semibold' : 'text-slate-500 dark:text-slate-400'"
    >
      <span class="text-xl">📖</span>
      <span>راهنما</span>
    </RouterLink>
    <RouterLink
      to="/occasions"
      class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 text-sm"
      :class="isOccasionRoute ? 'text-brand-500 font-semibold' : 'text-slate-500 dark:text-slate-400'"
    >
      <span class="text-xl">🎉</span>
      <span>مناسبتی</span>
    </RouterLink>
  </nav>
</template>
