<script setup>
import { computed } from 'vue';
import { formatNumber } from '../services/format.js';

var props = defineProps({
  bars: { type: Array, required: true },
  unit: { type: String, default: '' },
  color: { type: String, default: '#3b6fe0' },
  height: { type: Number, default: 200 },
  barWidth: { type: Number, default: 44 }
});

var PAD = { top: 22, bottom: 28, side: 8 };

var layout = computed(function () {
  var width = Math.max(320, props.bars.length * props.barWidth + PAD.side * 2);
  var max = Math.max(0.0001, Math.max.apply(null, props.bars.map(function (bar) { return bar.value; })));
  var plotHeight = props.height - PAD.top - PAD.bottom;
  var slot = (width - PAD.side * 2) / props.bars.length;

  var items = props.bars.map(function (bar, index) {
    var barHeight = (bar.value / max) * plotHeight;
    var barPixelWidth = Math.min(28, slot * 0.6);
    return {
      key: index,
      x: PAD.side + slot * index + (slot - barPixelWidth) / 2,
      y: PAD.top + plotHeight - barHeight,
      width: barPixelWidth,
      height: Math.max(barHeight, bar.value > 0 ? 1 : 0),
      center: PAD.side + slot * index + slot / 2,
      label: bar.label,
      value: formatNumber(bar.value),
      tone: bar.tone ?? props.color,
      title: (bar.title ?? bar.label) + ': ' + formatNumber(bar.value) + ' ' + props.unit
    };
  });

  return { width: width, items: items, baseline: PAD.top + plotHeight };
});
</script>

<template>
  <div class="overflow-x-auto no-scrollbar" dir="ltr">
    <svg
      :viewBox="`0 0 ${layout.width} ${height}`"
      :style="{ minWidth: Math.min(layout.width, 640) + 'px' }"
      class="w-full h-auto text-slate-400"
      role="img"
    >
      <line :x1="8" :x2="layout.width - 8" :y1="layout.baseline" :y2="layout.baseline" stroke="currentColor" stroke-opacity="0.3" />
      <g v-for="item in layout.items" :key="item.key">
        <title>{{ item.title }}</title>
        <rect :x="item.x" :y="item.y" :width="item.width" :height="item.height" rx="4" :fill="item.tone" />
        <text :x="item.center" :y="item.y - 5" text-anchor="middle" font-size="10" fill="currentColor">{{ item.value }}</text>
        <text :x="item.center" :y="height - 10" text-anchor="middle" font-size="10" fill="currentColor">{{ item.label }}</text>
      </g>
    </svg>
  </div>
</template>
