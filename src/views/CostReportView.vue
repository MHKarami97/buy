<script setup>
import { computed, onMounted, ref } from 'vue'
import { quantityHistoryRepository } from '../services/QuantityHistoryRepository.js'
import { ItemPriceRepository, itemPriceRepository } from '../services/ItemPriceRepository.js'
import { MonthlyCostAnalyzer } from '../services/MonthlyCostAnalyzer.js'
import { formatToman, formatPercent } from '../services/currency.js'
import { formatInteger } from '../services/format.js'
import BarChart from '../components/BarChart.vue'

var CHART_MONTHS = 12

var months = ref([])
var selectedIndex = ref(null)

var selected = computed(() => months.value.find((month) => month.monthIndex === selectedIndex.value) ?? null)
var previous = computed(() => {
  if (!selected.value) return null
  return months.value.find((month) => month.monthIndex === selected.value.monthIndex - 1) ?? null
})
var change = computed(() => {
  if (!selected.value || !previous.value || previous.value.total === 0) return null
  return ((selected.value.total - previous.value.total) / previous.value.total) * 100
})
var bars = computed(() =>
  months.value.slice(-CHART_MONTHS).map((month) => ({
    label: month.label,
    title: `${month.fullLabel}: ${formatToman(month.total)}`,
    value: Math.round(month.total / 1000),
    tone: month.monthIndex === selectedIndex.value ? '#3b6fe0' : '#f59e0b'
  }))
)
var templateShares = computed(() => (selected.value ? MonthlyCostAnalyzer.byTemplate(selected.value) : []))
var pricedItems = computed(() => (selected.value ? selected.value.items.filter((item) => item.cost > 0) : []))
var unpricedItems = computed(() => (selected.value ? selected.value.items.filter((item) => item.unpricedPurchases > 0) : []))

onMounted(() => {
  var histories = quantityHistoryRepository.getAll()
  var prices = itemPriceRepository.getAll()
  months.value = MonthlyCostAnalyzer.analyze(histories, (key, timestamp) =>
    ItemPriceRepository.resolvePrice(prices[key], timestamp)
  )
  selectedIndex.value = months.value.length ? months.value[months.value.length - 1].monthIndex : null
})
</script>

<template>
  <section class="space-y-6">
    <div>
      <RouterLink to="/" class="inline-flex items-center min-h-[44px] text-sm text-brand-600 dark:text-brand-300">→ خانه</RouterLink>
      <h1 class="text-xl sm:text-2xl font-bold">💰 گزارش ماهانه‌ی هزینه</h1>
      <p class="text-sm text-slate-400 mt-1">هزینه از «افزایش موجودی × قیمت واحد» در لحظه‌ی خرید حساب می‌شود.</p>
    </div>

    <p
      v-if="!months.length"
      class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 px-3 py-10 text-center text-sm leading-7 text-slate-400"
    >
      هنوز خریدی ثبت نشده است. در «لیست خرید» قیمت واحد آیتم را بنویسید و سپس موجودی را تأیید کنید.
    </p>

    <template v-else>
      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <label class="text-sm text-slate-500" for="month-select">ماه:</label>
        <select
          id="month-select"
          v-model="selectedIndex"
          class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-sm px-3"
        >
          <option v-for="month in [...months].reverse()" :key="month.monthIndex" :value="month.monthIndex">{{ month.fullLabel }}</option>
        </select>
      </div>

      <div v-if="selected" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p class="text-xs text-slate-400">جمع هزینه</p>
          <p class="mt-1 text-lg font-bold text-brand-600 dark:text-brand-300">{{ formatToman(selected.total) }}</p>
          <p v-if="change !== null" class="mt-1 text-xs" :class="change > 0 ? 'text-red-500' : 'text-emerald-600'">
            {{ change > 0 ? '▲' : '▼' }} {{ formatPercent(Math.abs(change)) }} نسبت به ماه قبل
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p class="text-xs text-slate-400">تعداد خرید</p>
          <p class="mt-1 text-lg font-bold">{{ formatInteger(selected.purchaseCount) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <p class="text-xs text-slate-400">خرید بدون قیمت</p>
          <p class="mt-1 text-lg font-bold" :class="selected.unpricedCount ? 'text-amber-600' : ''">{{ formatInteger(selected.unpricedCount) }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-500">هزینه‌ی هر ماه شمسی (هزار تومان)</h2>
        <BarChart :bars="bars" unit="هزار تومان" />
      </div>

      <div v-if="selected && templateShares.length" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-500">سهم هر لیست</h2>
        <ul class="space-y-3">
          <li v-for="share in templateShares" :key="share.title">
            <div class="flex items-center justify-between text-sm">
              <span>{{ share.title }}</span>
              <span class="text-xs text-slate-400">{{ formatToman(share.cost) }} · {{ formatPercent(share.share) }}</span>
            </div>
            <div class="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden" role="presentation">
              <div class="h-full rounded-full bg-brand-500" :style="{ width: `${share.share}%` }"></div>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="pricedItems.length" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <h2 class="px-4 pt-4 text-sm font-semibold text-slate-500">آیتم‌ها در این ماه</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-400">
                <th class="px-4 py-2 text-right font-medium">آیتم</th>
                <th class="px-2 py-2 text-center font-medium">مقدار خرید</th>
                <th class="px-4 py-2 text-left font-medium">هزینه</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pricedItems" :key="item.key" class="border-t border-slate-100 dark:border-slate-700">
                <td class="px-4 py-2">
                  <p>{{ item.title }}</p>
                  <p class="text-[11px] text-slate-400">{{ item.templateTitle }}</p>
                </td>
                <td class="px-2 py-2 text-center">{{ formatInteger(item.quantity) }}</td>
                <td class="px-4 py-2 text-left whitespace-nowrap">{{ formatToman(item.cost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="unpricedItems.length" class="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 p-3 text-xs leading-7 text-amber-800 dark:text-amber-200">
        برای این آیتم‌ها قیمت ثبت نشده و در جمع نیامده‌اند: {{ unpricedItems.map((item) => item.title).join('، ') }}
      </div>

      <p class="text-xs leading-6 text-slate-400">
        هر افزایش موجودی خرید حساب می‌شود؛ اگر موجودی را برای اصلاح اشتباه بالا ببرید، هزینه‌ی اضافه ثبت می‌شود. قیمت‌ها فقط روی همین دستگاه ذخیره می‌شوند و در پشتیبان Google Drive نیستند.
      </p>
    </template>
  </section>
</template>
