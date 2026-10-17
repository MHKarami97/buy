<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { occasionPresets } from '../data/occasionPresets'
import TemplateCard from '../components/TemplateCard.vue'

var store = useChecklistStore()
var router = useRouter()
var customTitle = ref('')

function openTemplate(template) {
  if (template) router.push(`/checklist/${template.id}`)
}

function createFromPreset(presetId) {
  openTemplate(store.createOccasion(presetId, customTitle.value))
  customTitle.value = ''
}

function createEmpty() {
  openTemplate(store.createCustomOccasion(customTitle.value))
  customTitle.value = ''
}

function itemCount(preset) {
  return preset.categories.reduce((sum, category) => sum + category.items.length, 0)
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">خرید مناسبتی</h1>
        <p class="text-sm text-slate-400 mt-1">لیست‌های موقت برای مهمانی، سفر، تولد و ...</p>
      </div>
      <RouterLink
        to="/occasions/shopping"
        class="min-h-[44px] px-4 rounded-xl border border-brand-300 text-brand-600 dark:text-brand-300 text-sm flex items-center justify-center"
      >
        لیست خرید مناسبتی
      </RouterLink>
    </div>

    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-500">ساخت لیست جدید</h2>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="customTitle"
          type="text"
          placeholder="نام لیست (اختیاری)، مثلاً تولد علی"
          class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          @keyup.enter="createEmpty"
        />
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-sm"
          @click="createEmpty"
        >
          + لیست خالی
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          v-for="preset in occasionPresets"
          :key="preset.id"
          type="button"
          class="text-right rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 min-h-[44px] hover:border-brand-400 hover:shadow-md transition-all"
          @click="createFromPreset(preset.id)"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ preset.icon }}</span>
            <div class="min-w-0">
              <h3 class="font-semibold text-sm sm:text-base leading-tight">{{ preset.title }}</h3>
              <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">{{ preset.description }}</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-3">{{ itemCount(preset) }} آیتم پیش‌فرض</p>
        </button>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-500">لیست‌های من ({{ store.occasionTemplates.length }})</h2>
      <div v-if="store.occasionTemplates.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TemplateCard v-for="tpl in store.occasionTemplates" :key="tpl.id" :template="tpl" />
      </div>
      <p v-else class="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-3 py-6 text-center text-xs text-slate-400">
        هنوز لیست مناسبتی نساخته‌اید. یکی از قالب‌های بالا را انتخاب کنید.
      </p>
    </section>
  </section>
</template>
