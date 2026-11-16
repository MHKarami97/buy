<script setup>
import { computed } from 'vue'
import { VERDICT_LABELS } from '../data/ingredients/ingredientBuilder'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'

var props = defineProps({
  ingredient: { type: Object, required: true },
  open: { type: Boolean, default: false }
})

var VERDICT_STYLES = {
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  caution: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  avoid: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
}

var { isAvoided, toggleAvoided } = useIngredientPreferences()
var badgeClass = computed(() => VERDICT_STYLES[props.ingredient.verdict] ?? VERDICT_STYLES.neutral)
var badgeLabel = computed(() => VERDICT_LABELS[props.ingredient.verdict] ?? '')
var avoided = computed(() => isAvoided(props.ingredient.id))
</script>

<template>
  <details
    :open="open"
    class="group rounded-xl border bg-white/70 dark:bg-slate-800/50 p-3"
    :class="avoided ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'"
  >
    <summary class="flex flex-wrap items-center gap-2 cursor-pointer list-none min-h-[44px]">
      <span class="text-sm font-semibold flex-1 min-w-[10rem]">
        <span v-if="avoided" aria-hidden="true">🚫 </span>{{ ingredient.name }}
      </span>
      <span class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="badgeClass">{{ badgeLabel }}</span>
    </summary>
    <div class="mt-2 space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
      <p><strong>چیست؟</strong> {{ ingredient.whatIsIt }}</p>
      <p><strong>چه کاری می‌کند؟</strong> {{ ingredient.role }}</p>
      <p><strong>خوب است یا نه؟</strong> {{ ingredient.verdictNote }}</p>
      <p v-if="ingredient.aliases.length" class="text-xs text-slate-400">
        نام‌های دیگر: {{ ingredient.aliases.join('، ') }}
      </p>
      <ul v-if="ingredient.sources.length" class="text-xs space-y-1">
        <li v-for="item in ingredient.sources" :key="item.url">
          <a :href="item.url" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-300 underline">{{ item.title }}</a>
        </li>
      </ul>
      <button
        type="button"
        class="min-h-[40px] px-3 rounded-xl border text-xs font-medium transition-colors"
        :class="avoided
          ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
          : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
        :aria-pressed="avoided"
        @click.stop="toggleAvoided(ingredient.id)"
      >
        {{ avoided ? '✓ در فهرست پرهیز من است (برای حذف بزنید)' : '🚫 این ماده را پرهیز می‌کنم' }}
      </button>
    </div>
  </details>
</template>
