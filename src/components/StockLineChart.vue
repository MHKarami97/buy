<script setup>
import { computed, ref } from 'vue';
import { JalaliDate } from '../services/JalaliDate.js';
import { formatNumber, formatSigned } from '../services/format.js';

var props = defineProps({
  history: { type: Object, required: true },
  now: { type: Number, default: () => Date.now() }
});

var WIDTH = 640;
var HEIGHT = 240;
var PAD = { left: 40, right: 14, top: 14, bottom: 30 };
var DAY_MS = 86400000;

var selectedIndex = ref(null);

var layout = computed(function () {
  var events = props.history.events;
  var first = events[0];
  var last = events[events.length - 1];
  var vertices = [{ t: first.t, q: first.p }];
  events.forEach(function (event) {
    vertices.push({ t: event.t, q: event.p }, { t: event.t, q: event.q });
  });
  vertices.push({ t: Math.max(props.now, last.t), q: last.q });

  var xMin = first.t;
  var xMax = vertices[vertices.length - 1].t;
  if (xMax <= xMin) {
    xMax = xMin + DAY_MS;
  }
  var yMax = Math.max(1, Math.ceil(Math.max.apply(null, vertices.map(function (v) { return v.q; }))));

  var plotWidth = WIDTH - PAD.left - PAD.right;
  var plotHeight = HEIGHT - PAD.top - PAD.bottom;
  var toX = function (t) { return PAD.left + ((t - xMin) / (xMax - xMin)) * plotWidth; };
  var toY = function (q) { return PAD.top + plotHeight - (q / yMax) * plotHeight; };

  var points = vertices.map(function (v) { return toX(v.t).toFixed(1) + ',' + toY(v.q).toFixed(1); });
  var baseline = PAD.top + plotHeight;
  var area = 'M' + toX(xMin).toFixed(1) + ',' + baseline + ' L' + points.join(' L')
    + ' L' + toX(xMax).toFixed(1) + ',' + baseline + ' Z';

  var dots = events.map(function (event, index) {
    return { x: toX(event.t), y: toY(event.q), event: event, index: index };
  });

  var xTicks = [];
  for (var i = 0; i <= 4; i++) {
    var t = xMin + ((xMax - xMin) * i) / 4;
    xTicks.push({ x: toX(t), label: JalaliDate.short(t) });
  }
  var yTicks = [];
  for (var j = 0; j <= 4; j++) {
    var q = (yMax * j) / 4;
    yTicks.push({ y: toY(q), label: formatNumber(q) });
  }

  return { line: points.join(' '), area: area, dots: dots, xTicks: xTicks, yTicks: yTicks, baseline: baseline };
});

var selected = computed(function () {
  return selectedIndex.value === null ? null : props.history.events[selectedIndex.value] ?? null;
});

function pickNearest(event) {
  var rect = event.currentTarget.getBoundingClientRect();
  var x = ((event.clientX - rect.left) / rect.width) * WIDTH;
  var best = null;
  var bestDistance = Infinity;
  layout.value.dots.forEach(function (dot) {
    var distance = Math.abs(dot.x - x);
    if (distance < bestDistance) {
      best = dot.index;
      bestDistance = distance;
    }
  });
  selectedIndex.value = best;
}
</script>

<template>
  <div class="space-y-2">
    <div dir="ltr" class="w-full">
      <svg
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        class="w-full h-auto touch-pan-y select-none text-slate-400"
        role="img"
        aria-label="نمودار تغییر موجودی در طول زمان"
        @pointermove="pickNearest"
        @pointerdown="pickNearest"
      >
        <g v-for="tick in layout.yTicks" :key="'y' + tick.y">
          <line :x1="40" :x2="WIDTH - 14" :y1="tick.y" :y2="tick.y" stroke="currentColor" stroke-opacity="0.15" />
          <text :x="34" :y="tick.y + 3" text-anchor="end" font-size="10" fill="currentColor">{{ tick.label }}</text>
        </g>
        <text v-for="tick in layout.xTicks" :key="'x' + tick.x" :x="tick.x" :y="HEIGHT - 10" text-anchor="middle" font-size="10" fill="currentColor">{{ tick.label }}</text>
        <path :d="layout.area" fill="#3b6fe0" fill-opacity="0.12" />
        <polyline :points="layout.line" fill="none" stroke="#3b6fe0" stroke-width="2" stroke-linejoin="round" />
        <circle
          v-for="dot in layout.dots"
          :key="dot.index"
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.index === selectedIndex ? 6 : 3.5"
          :fill="dot.event.isRestock ? '#10b981' : '#ef4444'"
          stroke="white"
          stroke-width="1.5"
        />
      </svg>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
      <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> افزایش (خرید)</span>
      <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> کاهش (مصرف)</span>
    </div>

    <p v-if="selected" class="rounded-xl bg-slate-50 dark:bg-slate-700/40 px-3 py-2 text-xs sm:text-sm">
      {{ JalaliDate.dateTime(selected.t) }}:
      {{ formatNumber(selected.p) }} ← {{ formatNumber(selected.q) }}
      <span :class="selected.isRestock ? 'text-emerald-600' : 'text-red-500'" dir="ltr">({{ formatSigned(selected.delta) }})</span>
    </p>
    <p v-else class="text-xs text-slate-400">برای دیدن جزئیات هر تغییر، روی نمودار لمس کنید یا نشانگر را حرکت دهید.</p>
  </div>
</template>
