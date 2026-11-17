<script setup>
import { useChecklistStore } from '../stores/checklistStore'
import AppIcon from './AppIcon.vue'
import AppLogo from './AppLogo.vue'

var store = useChecklistStore()
</script>

<template>
  <header
    class="sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <AppLogo :size="34" class="transition-transform group-hover:scale-105" />
        <div class="flex flex-col">
          <span class="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
            خرید هوشمند
          </span>
          <span class="text-[10px] font-medium text-brand-600 dark:text-brand-400 leading-tight mt-0.5">
            دستیار هوشمند کالا
          </span>
        </div>
      </RouterLink>

      <div class="flex items-center gap-1">
        <RouterLink
          to="/settings"
          class="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="تنظیمات"
        >
          <AppIcon name="sliders" />
        </RouterLink>
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          :aria-label="store.isDarkMode ? 'حالت روشن' : 'حالت تاریک'"
          @click="store.toggleTheme"
        >
          <AppIcon :name="store.isDarkMode ? 'sun' : 'moon'" />
        </button>
      </div>
    </div>
  </header>
</template>
