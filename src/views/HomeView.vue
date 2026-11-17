<script setup>
import { computed, onMounted, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import { JalaliDate } from '../services/JalaliDate.js'
import { formatInteger } from '../services/format.js'
import { formatToman, formatPercent } from '../services/currency.js'
import { DashboardInsights } from '../services/DashboardInsights.js'
import { QuantityHistoryRepository, quantityHistoryRepository } from '../services/QuantityHistoryRepository.js'
import { itemPriceRepository } from '../services/ItemPriceRepository.js'
import { guideRepository } from '../data/guides'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'
import { DASHBOARD_FEATURES, TONES } from '../data/appFeatures'
import GlobalSearch from '../components/GlobalSearch.vue'
import ProgressBar from '../components/ProgressBar.vue'
import AppIcon from '../components/AppIcon.vue'

var PREVIEW_LIMIT = 5

var store = useChecklistStore()
var { avoidedCount, isAvoided } = useIngredientPreferences()
var shortages = ref([])
var spending = ref(null)

var todayText = computed(() => JalaliDate.date(Date.now()))
var shoppingEntries = computed(() => store.shoppingItems)
var shoppingPreview = computed(() => shoppingEntries.value.slice(0, PREVIEW_LIMIT))
var lowStockCount = computed(() => store.lowStockItems.length)
var flaggedCount = computed(() =>
  avoidedCount.value === 0
    ? 0
    : shoppingEntries.value.filter((entry) =>
        guideRepository.ingredientsForItem(entry.item).some((ingredient) => isAvoided(ingredient.id))
      ).length
)
var laggingLists = computed(() => DashboardInsights.laggingLists(store.mainTemplates))
var listCount = computed(() => store.mainTemplates.length)

function daysText(days) {
  if (days < 1) return 'کمتر از یک روز'
  return `حدود ${formatInteger(Math.round(days))} روز`
}

function loadInsights() {
  var histories = quantityHistoryRepository.getAll()
  var quantities = DashboardInsights.quantityByKey(store.mainTemplates, QuantityHistoryRepository.buildKey)
  shortages.value = DashboardInsights.upcomingShortages(histories, quantities)
  spending.value = DashboardInsights.monthSpending(histories, itemPriceRepository.getAll())
}

onMounted(loadInsights)
</script>

<template>
  <section class="space-y-6">
    <header class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-lg shadow-brand-500/20">
      <div class="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -bottom-12 right-6 size-32 rounded-full bg-white/10" aria-hidden="true"></div>
      <p class="relative text-xs text-white/80">{{ todayText }}</p>
      <h1 class="relative mt-1 text-2xl font-bold">خرید هوشمند</h1>
      <p class="relative mt-1 text-sm text-white/85">وضعیت امروز خانه در یک نگاه</p>

      <div class="relative mt-4 grid grid-cols-2 gap-2">
        <RouterLink to="/shopping-list" class="rounded-2xl bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
          <span class="block text-2xl font-bold">{{ formatInteger(shoppingEntries.length) }}</span>
          <span class="block text-xs text-white/85">آیتم برای خرید</span>
        </RouterLink>
        <RouterLink to="/low-stock" class="rounded-2xl bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
          <span class="block text-2xl font-bold">{{ formatInteger(lowStockCount) }}</span>
          <span class="block text-xs text-white/85">مورد رو‌به‌اتمام</span>
        </RouterLink>
        <RouterLink to="/spending" class="rounded-2xl bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
          <span class="block text-base font-bold leading-8">
            {{ spending && spending.total > 0 ? formatToman(spending.total) : '—' }}
          </span>
          <span class="block text-xs text-white/85">
            هزینه‌ی {{ spending ? spending.label : 'این ماه' }}
            <template v-if="spending && spending.changePercent !== null">
              ({{ spending.changePercent > 0 ? '▲' : '▼' }}{{ formatPercent(Math.abs(spending.changePercent)) }})
            </template>
          </span>
        </RouterLink>
        <RouterLink to="/reports" class="rounded-2xl bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
          <span class="block text-2xl font-bold">{{ formatInteger(shortages.length) }}</span>
          <span class="block text-xs text-white/85">تا یک هفته‌ی دیگر تمام می‌شود</span>
        </RouterLink>
      </div>
    </header>

    <GlobalSearch />

    <RouterLink
      v-if="flaggedCount"
      to="/shopping-list"
      class="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300"
    >
      <AppIcon name="shield" />
      <span class="flex-1">{{ formatInteger(flaggedCount) }} آیتم لیست خرید ممکن است دارای مواد پرهیزی شما باشد.</span>
      <AppIcon name="chevron" :size="18" />
    </RouterLink>

    <section class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800" aria-labelledby="today-title">
      <div class="flex items-center justify-between">
        <h2 id="today-title" class="text-sm font-bold">امروز بخر</h2>
        <RouterLink v-if="shoppingEntries.length" to="/shopping-list" class="text-xs text-brand-600 dark:text-brand-300">مشاهده‌ی همه</RouterLink>
      </div>
      <p v-if="!shoppingEntries.length" class="mt-3 text-sm text-slate-400">همه‌چیز موجود است؛ آیتمی برای خرید نیست. 🎉</p>
      <ul v-else class="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
        <li v-for="entry in shoppingPreview" :key="`${entry.template.id}-${entry.item.id}`" class="flex items-center justify-between gap-2 py-2 text-sm">
          <span>{{ entry.item.title }}</span>
          <span class="text-xs text-slate-400">{{ entry.template.title }}</span>
        </li>
        <li v-if="shoppingEntries.length > PREVIEW_LIMIT" class="pt-2 text-xs text-slate-400">
          و {{ formatInteger(shoppingEntries.length - PREVIEW_LIMIT) }} آیتم دیگر
        </li>
      </ul>
    </section>

    <section v-if="shortages.length" class="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-900/10" aria-labelledby="soon-title">
      <h2 id="soon-title" class="text-sm font-bold">به‌زودی تمام می‌شود</h2>
      <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">برآورد بر اساس سرعت مصرف قبلی شما</p>
      <ul class="mt-3 space-y-2">
        <li v-for="item in shortages" :key="item.key" class="flex items-center justify-between gap-2 text-sm">
          <span>{{ item.title }}</span>
          <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{{ daysText(item.daysLeft) }}</span>
        </li>
      </ul>
    </section>

    <section v-if="spending && !spending.hasAnyPrice" class="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-7 text-slate-500 dark:border-slate-600 dark:text-slate-400">
      <span class="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 shrink-0">
        <AppIcon name="wallet" :size="20" />
      </span>
      <span>برای دیدن هزینه‌ی ماهانه، در «لیست خرید» قیمت واحد آیتم‌ها را وارد کنید.</span>
    </section>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <RouterLink
        to="/lists"
        class="flex min-h-[72px] items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 transition-colors hover:border-brand-400 dark:border-brand-700/50 dark:bg-brand-700/10"
      >
        <span class="flex size-12 items-center justify-center rounded-2xl bg-brand-500 text-white shrink-0">
          <AppIcon name="lists" :size="26" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-base font-bold">همه‌ی لیست‌ها</span>
          <span class="block text-xs text-slate-500 dark:text-slate-400 truncate">{{ formatInteger(listCount) }} لیست؛ مشاهده، ویرایش و ساخت</span>
        </span>
        <AppIcon name="chevron" class="text-brand-500 shrink-0" />
      </RouterLink>

      <RouterLink
        to="/scanner"
        class="flex min-h-[72px] items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 transition-colors hover:border-sky-400 dark:border-sky-700/50 dark:bg-sky-700/10"
      >
        <span class="flex size-12 items-center justify-center rounded-2xl bg-sky-500 text-white shrink-0">
          <AppIcon name="scan" :size="24" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-base font-bold">بارکدخوان هوشمند</span>
          <span class="block text-xs text-slate-500 dark:text-slate-400 truncate">اسکن کالا، QR و تشخیص کشور سازنده</span>
        </span>
        <AppIcon name="chevron" class="text-sky-500 shrink-0" />
      </RouterLink>
    </div>

    <section v-if="laggingLists.length" class="space-y-2" aria-labelledby="lagging-title">
      <h2 id="lagging-title" class="text-sm font-semibold text-slate-500">لیست‌هایی که بیشتر نیاز به توجه دارند</h2>
      <ul class="space-y-2">
        <li v-for="template in laggingLists" :key="template.id">
          <RouterLink
            :to="{ name: 'checklist-detail', params: { id: template.id } }"
            class="block rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="mb-2 flex items-center justify-between text-sm">
              <span>{{ template.icon }} {{ template.title }}</span>
              <span class="text-xs text-slate-400">{{ template.overallProgress }}٪</span>
            </div>
            <ProgressBar :percent="template.overallProgress" size="sm" />
          </RouterLink>
        </li>
      </ul>
    </section>

    <section aria-labelledby="features-title" class="space-y-3">
      <h2 id="features-title" class="text-sm font-semibold text-slate-500">امکانات</h2>
      <ul class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <li v-for="feature in DASHBOARD_FEATURES" :key="feature.id">
          <RouterLink
            :to="feature.to"
            class="group flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 motion-reduce:transition-none"
          >
            <span class="flex size-11 items-center justify-center rounded-2xl" :class="TONES[feature.tone]">
              <AppIcon :name="feature.icon" />
            </span>
            <span>
              <span class="block text-sm font-bold">{{ feature.title }}</span>
              <span class="mt-0.5 block text-xs leading-6 text-slate-500 dark:text-slate-400">{{ feature.desc }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </section>
</template>
