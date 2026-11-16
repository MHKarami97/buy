<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { guideRepository } from '../data/guides'
import { GuideComparer } from '../services/GuideComparer'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'

var KIND_ICONS = { check: '✅', avoid: '⛔', label: '🏷️', storage: '🧊', tip: '💡' }

var route = useRoute()
var router = useRouter()
var { isAvoided } = useIngredientPreferences()

var firstId = ref(typeof route.query.a === 'string' ? route.query.a : '')
var secondId = ref(typeof route.query.b === 'string' ? route.query.b : '')

var first = computed(() => guideRepository.findById(firstId.value))
var second = computed(() => guideRepository.findById(secondId.value))
var comparison = computed(() =>
  first.value && second.value
    ? GuideComparer.compare(first.value, second.value, (guide) => guideRepository.ingredientsForGuide(guide))
    : null
)

watch([firstId, secondId], () => {
  router.replace({ query: { a: firstId.value || undefined, b: secondId.value || undefined } })
})

function swap() {
  var current = firstId.value
  firstId.value = secondId.value
  secondId.value = current
}

function chipClass(ingredient) {
  return isAvoided(ingredient.id)
    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 font-semibold'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}
</script>

<template>
  <section class="space-y-5">
    <div>
      <RouterLink to="/guide" class="inline-flex items-center min-h-[44px] text-sm text-brand-600 dark:text-brand-300">→ راهنمای خرید</RouterLink>
      <h1 class="text-xl sm:text-2xl font-bold">⚖️ مقایسه‌ی دو کالا</h1>
      <p class="text-sm text-slate-400 mt-1">دو راهنما را انتخاب کنید تا نکته‌ها و مواد تشکیل‌دهنده‌شان کنار هم دیده شود.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
      <select
        v-model="firstId"
        aria-label="کالای اول"
        class="min-h-[44px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
      >
        <option value="">کالای اول را انتخاب کنید</option>
        <optgroup v-for="group in guideRepository.groups" :key="group.id" :label="`${group.icon} ${group.name}`">
          <option v-for="guide in group.guides" :key="guide.id" :value="guide.id">{{ guide.icon }} {{ guide.title }}</option>
        </optgroup>
      </select>
      <button
        type="button"
        class="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 dark:border-slate-600 text-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="جابه‌جایی دو کالا"
        @click="swap"
      >⇄</button>
      <select
        v-model="secondId"
        aria-label="کالای دوم"
        class="min-h-[44px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
      >
        <option value="">کالای دوم را انتخاب کنید</option>
        <optgroup v-for="group in guideRepository.groups" :key="group.id" :label="`${group.icon} ${group.name}`">
          <option v-for="guide in group.guides" :key="guide.id" :value="guide.id">{{ guide.icon }} {{ guide.title }}</option>
        </optgroup>
      </select>
    </div>

    <p v-if="!comparison" class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 px-3 py-10 text-center text-sm text-slate-400">
      هر دو کالا را انتخاب کنید.
    </p>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="guide in [comparison.first, comparison.second]" :key="guide.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 class="flex items-center gap-2 font-semibold"><span aria-hidden="true">{{ guide.icon }}</span>{{ guide.title }}</h2>
          <p class="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ guide.summary }}</p>
        </div>
      </div>

      <section v-for="row in comparison.rows" :key="row.kind" class="space-y-2">
        <h3 class="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true">{{ KIND_ICONS[row.kind] }}</span>{{ row.title }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ul
            v-for="(points, index) in [row.first, row.second]"
            :key="index"
            class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm leading-7 list-disc pr-8 space-y-1"
          >
            <li v-if="!points.length" class="list-none -mr-5 text-xs text-slate-400">موردی ثبت نشده</li>
            <li v-for="point in points" :key="point">{{ point }}</li>
          </ul>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="text-sm font-semibold">🧪 مواد تشکیل‌دهنده‌ی مرتبط</h3>
        <p v-if="!comparison.ingredients.shared.length && !comparison.ingredients.onlyFirst.length && !comparison.ingredients.onlySecond.length" class="text-xs text-slate-400">
          برای این دو کالا ماده‌ای ثبت نشده است.
        </p>
        <div v-if="comparison.ingredients.shared.length" class="space-y-1">
          <p class="text-xs text-slate-400">مشترک</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="item in comparison.ingredients.shared" :key="item.id" class="rounded-full px-3 py-1 text-xs" :class="chipClass(item)">{{ item.name }}</li>
          </ul>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1">
            <p class="text-xs text-slate-400">فقط در {{ comparison.first.title }}</p>
            <ul class="flex flex-wrap gap-2">
              <li v-for="item in comparison.ingredients.onlyFirst" :key="item.id" class="rounded-full px-3 py-1 text-xs" :class="chipClass(item)">{{ item.name }}</li>
              <li v-if="!comparison.ingredients.onlyFirst.length" class="text-xs text-slate-400">—</li>
            </ul>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-slate-400">فقط در {{ comparison.second.title }}</p>
            <ul class="flex flex-wrap gap-2">
              <li v-for="item in comparison.ingredients.onlySecond" :key="item.id" class="rounded-full px-3 py-1 text-xs" :class="chipClass(item)">{{ item.name }}</li>
              <li v-if="!comparison.ingredients.onlySecond.length" class="text-xs text-slate-400">—</li>
            </ul>
          </div>
        </div>
        <p class="text-xs text-slate-400">حضور هر ماده به برند و محصول بستگی دارد و فهرست روی بسته ملاک است.</p>
      </section>
    </template>
  </section>
</template>
