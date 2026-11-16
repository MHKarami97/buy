<script setup>
import { useChecklistStore } from '../stores/checklistStore'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'
import AppIcon from '../components/AppIcon.vue'
import CloudBackupCard from '../components/cloud/CloudBackupCard.vue'
import DataManagementCard from '../components/DataManagementCard.vue'

var store = useChecklistStore()
var { avoidedCount, clearAvoided } = useIngredientPreferences()
var currentYear = new Date().getFullYear()
</script>

<template>
  <section class="space-y-8">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">تنظیمات</h1>
      <p class="mt-1 text-sm text-slate-400">ظاهر برنامه، پشتیبان‌گیری و مدیریت داده</p>
    </div>

    <section class="space-y-3" aria-labelledby="appearance-title">
      <h2 id="appearance-title" class="text-sm font-semibold text-slate-500">ظاهر</h2>
      <button
        type="button"
        class="flex w-full min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right dark:border-slate-700 dark:bg-slate-800"
        :aria-pressed="store.isDarkMode"
        @click="store.toggleTheme"
      >
        <span class="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-slate-700 dark:text-amber-300">
          <AppIcon :name="store.isDarkMode ? 'moon' : 'sun'" />
        </span>
        <span class="flex-1">
          <span class="block text-sm font-semibold">حالت تاریک</span>
          <span class="block text-xs text-slate-400">{{ store.isDarkMode ? 'روشن است' : 'خاموش است' }}</span>
        </span>
      </button>
    </section>

    <section class="space-y-3" aria-labelledby="cloud-title">
      <h2 id="cloud-title" class="text-sm font-semibold text-slate-500">پشتیبان‌گیری ابری</h2>
      <CloudBackupCard />
    </section>

    <section class="space-y-3" aria-labelledby="data-title">
      <h2 id="data-title" class="text-sm font-semibold text-slate-500">مدیریت داده</h2>
      <DataManagementCard />
    </section>

    <section class="space-y-3" aria-labelledby="prefs-title">
      <h2 id="prefs-title" class="text-sm font-semibold text-slate-500">ترجیحات مواد</h2>
      <div class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <span class="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
          <AppIcon name="shield" />
        </span>
        <span class="flex-1">
          <span class="block text-sm font-semibold">مواد پرهیزی</span>
          <span class="block text-xs text-slate-400">{{ avoidedCount }} ماده علامت‌خورده</span>
        </span>
        <button
          v-if="avoidedCount"
          type="button"
          class="min-h-[40px] rounded-xl border border-red-300 px-3 text-xs text-red-600 dark:text-red-300"
          @click="clearAvoided"
        >پاک کردن</button>
      </div>
    </section>

    <section class="space-y-3" aria-labelledby="about-title">
      <h2 id="about-title" class="text-sm font-semibold text-slate-500">درباره</h2>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p class="text-sm font-bold">خرید هوشمند</p>
        <p class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
          ساخته‌شده توسط <span class="font-medium text-slate-700 dark:text-slate-200">محمدحسین کرمی</span>
        </p>
        <a
          href="https://mhkarami97.ir"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-brand-300 px-4 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-700"
        >
          <span>mhkarami97.ir</span>
          <span aria-hidden="true">↗</span>
        </a>
        <p class="mt-3 text-[11px] text-slate-400">© {{ currentYear }} خرید هوشمند</p>
      </div>
    </section>
  </section>
</template>
