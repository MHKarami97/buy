<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useChecklistStore } from '../stores/checklistStore';
import { quantityHistoryRepository, QuantityHistoryRepository } from '../services/QuantityHistoryRepository.js';
import { ConsumptionAnalyzer } from '../services/ConsumptionAnalyzer.js';
import { JalaliDate } from '../services/JalaliDate.js';
import { formatDays, formatInteger, formatNumber, formatSigned } from '../services/format.js';
import StockLineChart from '../components/StockLineChart.vue';
import BarChart from '../components/BarChart.vue';
import StatCard from '../components/StatCard.vue';

var props = defineProps({
  templateId: { type: String, required: true },
  categoryId: { type: String, required: true },
  itemId: { type: String, required: true }
});

var store = useChecklistStore();
var router = useRouter();
var history = ref(null);

var key = computed(function () {
  return QuantityHistoryRepository.buildKey(props.templateId, props.categoryId, props.itemId);
});

var item = computed(function () {
  var template = store.templates.find(function (tpl) { return tpl.id === props.templateId; });
  var category = template ? template.findCategory(props.categoryId) : null;
  return category ? category.findItem(props.itemId) : null;
});

var title = computed(function () {
  return item.value ? item.value.title : history.value ? history.value.title : '';
});

var currentQuantity = computed(function () {
  return item.value ? item.value.quantity : null;
});

var stats = computed(function () {
  return history.value ? ConsumptionAnalyzer.analyze(history.value, Date.now(), currentQuantity.value) : null;
});

var intervalBars = computed(function () {
  if (!stats.value) {
    return [];
  }
  return stats.value.intervals.map(function (interval) {
    return {
      label: JalaliDate.short(interval.to),
      value: Math.round(interval.days * 10) / 10,
      title: JalaliDate.date(interval.from) + ' ← ' + JalaliDate.date(interval.to)
    };
  });
});

var monthlyConsumption = computed(function () {
  return history.value
    ? ConsumptionAnalyzer.monthlyTotals(history.value).map(function (month) {
        return { label: month.label, value: month.consumed, title: month.fullLabel, tone: '#ef4444' };
      })
    : [];
});

var monthlyBought = computed(function () {
  return history.value
    ? ConsumptionAnalyzer.monthlyTotals(history.value).map(function (month) {
        return { label: month.label, value: month.bought, title: month.fullLabel, tone: '#10b981' };
      })
    : [];
});

var logRows = computed(function () {
  if (!history.value) {
    return [];
  }
  var events = history.value.events;
  return events
    .map(function (event, index) {
      var previous = index > 0 ? events[index - 1] : null;
      return { event: event, sincePrevious: previous ? (event.t - previous.t) / 86400000 : null };
    })
    .reverse();
});

function load() {
  history.value = quantityHistoryRepository.getByKey(key.value);
}

function clearHistory() {
  if (window.confirm('تاریخچهٔ این آیتم پاک شود؟ این کار قابل بازگشت نیست.')) {
    quantityHistoryRepository.remove(key.value);
    load();
  }
}

onMounted(load);
watch(key, load);
</script>

<template>
  <section class="space-y-6">
    <button type="button" class="inline-flex items-center min-h-44px text-sm text-brand-600 dark:text-brand-300" @click="router.back()">
      → بازگشت
    </button>

    <div>
      <h1 class="text-xl sm:text-2xl font-bold">📈 تاریخچه مصرف: {{ title }}</h1>
      <p v-if="history" class="text-sm text-slate-400 mt-1">
        {{ history.templateTitle }} · {{ history.categoryName }}
        <template v-if="currentQuantity !== null"> · موجودی فعلی: {{ formatNumber(currentQuantity) }}</template>
      </p>
    </div>

    <p
      v-if="!history || history.isEmpty"
      class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 px-3 py-10 text-center text-sm text-slate-400"
    >
      هنوز تغییری برای این آیتم ثبت نشده است. از این به بعد هر بار که مقدارش کم یا زیاد شود، اینجا ثبت می‌شود.
    </p>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="میانگین فاصلهٔ خرید" :value="formatDays(stats.averageIntervalDays)" :hint="stats.restockCount > 1 ? 'میانه: ' + formatDays(stats.medianIntervalDays) : 'حداقل دو خرید لازم است'" />
        <StatCard label="مصرف روزانه" :value="formatNumber(stats.dailyConsumption)" :hint="'مجموع مصرف: ' + formatNumber(stats.totalConsumed)" />
        <StatCard label="تعداد دفعات خرید" :value="formatInteger(stats.restockCount)" :hint="'مجموع خرید: ' + formatNumber(stats.totalBought)" />
        <StatCard label="میانگین زمان تا اتمام" :value="formatDays(stats.averageDepletionDays)" hint="از خرید تا رسیدن به صفر" />
        <StatCard label="آخرین خرید" :value="stats.lastRestockAt ? JalaliDate.date(stats.lastRestockAt) : '—'" />
        <StatCard label="خرید بعدی (تخمین)" :value="stats.nextRestockAt ? JalaliDate.date(stats.nextRestockAt) : '—'" hint="بر اساس میانهٔ فاصله‌ها" />
        <StatCard label="موجودی تا" :value="stats.runOutAt ? JalaliDate.date(stats.runOutAt) : '—'" :hint="stats.daysLeft !== null ? formatDays(stats.daysLeft) + ' دیگر' : ''" />
        <StatCard label="کمترین / بیشترین فاصله" :value="formatDays(stats.minIntervalDays) + ' / ' + formatDays(stats.maxIntervalDays)" />
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-500">روند موجودی</h2>
        <StockLineChart :history="history" />
      </div>

      <div v-if="intervalBars.length" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-500">فاصلهٔ بین خریدها (روز)</h2>
        <BarChart :bars="intervalBars" unit="روز" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-slate-500">مصرف ماهانه (شمسی)</h2>
          <BarChart :bars="monthlyConsumption" />
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-slate-500">خرید ماهانه (شمسی)</h2>
          <BarChart :bars="monthlyBought" />
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <h2 class="px-4 pt-4 pb-2 text-sm font-semibold text-slate-500">گزارش تغییرات</h2>
        <ul class="divide-y divide-slate-100 dark:divide-slate-700">
          <li v-for="row in logRows" :key="row.event.t + '-' + row.event.q" class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p>{{ JalaliDate.dateTime(row.event.t) }}</p>
              <p v-if="row.sincePrevious !== null" class="text-11px text-slate-400">{{ formatDays(row.sincePrevious) }} بعد از تغییر قبلی</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-400">{{ formatNumber(row.event.p) }} ← {{ formatNumber(row.event.q) }}</span>
              <span
                dir="ltr"
                class="min-w-14 text-center text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="row.event.isRestock ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-700/30 dark:text-emerald-100' : 'bg-red-50 text-red-500 dark:bg-red-700/30 dark:text-red-100'"
              >{{ formatSigned(row.event.delta) }}</span>
            </div>
          </li>
        </ul>
      </div>

      <button type="button" class="min-h-44px px-4 rounded-xl border border-red-300 text-red-500 text-sm" @click="clearHistory">
        پاک کردن تاریخچهٔ این آیتم
      </button>
    </template>
  </section>
</template>
