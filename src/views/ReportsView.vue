<script setup>
import { computed, onMounted, ref } from 'vue';
import { useChecklistStore } from '../stores/checklistStore';
import { quantityHistoryRepository } from '../services/QuantityHistoryRepository.js';
import { ConsumptionAnalyzer } from '../services/ConsumptionAnalyzer.js';
import { JalaliDate } from '../services/JalaliDate.js';
import { formatDays, formatInteger, formatNumber } from '../services/format.js';
import BarChart from '../components/BarChart.vue';

var SORTS = {
  frequent: function (a, b) { return nullsLast(a.stats.averageIntervalDays, b.stats.averageIntervalDays, 1); },
  consumption: function (a, b) { return b.stats.dailyConsumption - a.stats.dailyConsumption; },
  recent: function (a, b) { return b.lastChangeAt - a.lastChangeAt; }
};

function nullsLast(a, b, direction) {
  if (a === null && b === null) { return 0; }
  if (a === null) { return 1; }
  if (b === null) { return -1; }
  return (a - b) * direction;
}

var store = useChecklistStore();
var histories = ref(new Map());
var query = ref('');
var sortKey = ref('frequent');

var quantityByKey = computed(function () {
  var map = new Map();
  store.templates.forEach(function (template) {
    template.categories.forEach(function (category) {
      category.items.forEach(function (item) {
        map.set(template.id + '::' + category.id + '::' + item.id, item.quantity);
      });
    });
  });
  return map;
});

var rows = computed(function () {
  var now = Date.now();
  var result = [];
  histories.value.forEach(function (history, key) {
    var parts = key.split('::');
    result.push({
      key: key,
      history: history,
      stats: ConsumptionAnalyzer.analyze(history, now, quantityByKey.value.get(key) ?? null),
      lastChangeAt: history.lastEvent.t,
      route: { name: 'item-history', params: { templateId: parts[0], categoryId: parts[1], itemId: parts[2] } }
    });
  });
  return result;
});

var filteredRows = computed(function () {
  var text = query.value.trim();
  return rows.value
    .filter(function (row) { return !text || row.history.title.includes(text); })
    .sort(SORTS[sortKey.value]);
});

var frequentBars = computed(function () {
  return rows.value
    .filter(function (row) { return row.stats.averageIntervalDays !== null; })
    .sort(SORTS.frequent)
    .slice(0, 10)
    .map(function (row) {
      return { label: row.history.title.slice(0, 8), title: row.history.title, value: Math.round(row.stats.averageIntervalDays * 10) / 10 };
    });
});

var monthlyActivity = computed(function () {
  return ConsumptionAnalyzer.monthlyTotals(rows.value.map(function (row) { return row.history; })).map(function (month) {
    return { label: month.label, title: month.fullLabel, value: month.restocks, tone: '#10b981' };
  });
});

onMounted(function () {
  histories.value = quantityHistoryRepository.getAll();
});
</script>

<template>
  <section class="space-y-6">
    <div>
      <RouterLink to="/" class="inline-flex items-center min-h-44px text-sm text-brand-600 dark:text-brand-300">→ خانه</RouterLink>
      <h1 class="text-xl sm:text-2xl font-bold">📊 گزارش مصرف</h1>
      <p class="text-sm text-slate-400 mt-1">{{ formatInteger(rows.length) }} آیتم دارای تاریخچه</p>
    </div>

    <p
      v-if="!rows.length"
      class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 px-3 py-10 text-center text-sm text-slate-400"
    >
      هنوز تغییری ثبت نشده است. با تغییر مقدار آیتم‌ها، گزارش‌ها اینجا ساخته می‌شود.
    </p>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-slate-500">پرتکرارترین خریدها (میانگین فاصله، روز)</h2>
          <BarChart v-if="frequentBars.length" :bars="frequentBars" unit="روز" />
          <p v-else class="text-xs text-slate-400">برای محاسبه، هر آیتم دست‌کم به دو بار خرید نیاز دارد.</p>
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-slate-500">تعداد خریدها در هر ماه شمسی</h2>
          <BarChart :bars="monthlyActivity" unit="خرید" />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          v-model="query"
          type="search"
          placeholder="جستجوی آیتم..."
          class="min-h-44px rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <select v-model="sortKey" class="min-h-44px rounded-xl bg-slate-100 dark:bg-slate-800 text-sm px-3">
          <option value="frequent">کوتاه‌ترین فاصلهٔ خرید</option>
          <option value="consumption">بیشترین مصرف روزانه</option>
          <option value="recent">آخرین تغییر</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RouterLink
          v-for="row in filteredRows"
          :key="row.key"
          :to="row.route"
          class="block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-brand-400 hover:shadow-md transition-all"
        >
          <p class="font-semibold text-sm sm:text-base">{{ row.history.title }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ row.history.templateTitle }} · {{ row.history.categoryName }}</p>
          <dl class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt class="text-11px text-slate-400">فاصلهٔ خرید</dt>
              <dd class="text-sm font-bold text-brand-600 dark:text-brand-300">{{ formatDays(row.stats.averageIntervalDays) }}</dd>
            </div>
            <div>
              <dt class="text-11px text-slate-400">مصرف روزانه</dt>
              <dd class="text-sm font-bold">{{ formatNumber(row.stats.dailyConsumption) }}</dd>
            </div>
            <div>
              <dt class="text-11px text-slate-400">خرید بعدی</dt>
              <dd class="text-sm font-bold">{{ row.stats.nextRestockAt ? JalaliDate.short(row.stats.nextRestockAt) : '—' }}</dd>
            </div>
          </dl>
        </RouterLink>
      </div>
    </template>
  </section>
</template>
