<script setup>
import { nextTick, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import TemplateCard from '../components/TemplateCard.vue'

var store = useChecklistStore()
var isCreating = ref(false)
var newTitle = ref('')
var titleInput = ref(null)

async function startCreating() {
  isCreating.value = true
  await nextTick()
  titleInput.value?.focus()
}

function cancelCreating() {
  isCreating.value = false
  newTitle.value = ''
}

function createCustom() {
  if (!newTitle.value.trim()) return
  store.createCustomTemplate(newTitle.value.trim())
  newTitle.value = ''
  isCreating.value = false
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">خرید‌ها</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.mainTemplates.length }} لیست</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <RouterLink
          to="/shopping-list"
          class="min-h-[44px] px-4 rounded-xl border border-brand-300 text-brand-600 dark:text-brand-300 text-sm flex items-center"
        >
          لیست خرید
        </RouterLink>
        <RouterLink
          to="/low-stock"
          class="min-h-[44px] px-4 rounded-xl border border-amber-300 text-amber-600 dark:text-amber-300 text-sm flex items-center"
        >
          هشدار مواد کم
        </RouterLink>
        <RouterLink
          to="/guide"
          class="min-h-[44px] px-4 rounded-xl border border-violet-300 text-violet-600 dark:text-violet-300 text-sm flex items-center"
        >
          📖 راهنمای خرید
        </RouterLink>
        <RouterLink
          to="/occasions"
          class="min-h-[44px] px-4 rounded-xl border border-emerald-300 text-emerald-600 dark:text-emerald-300 text-sm flex items-center"
        >
          خرید مناسبتی
        </RouterLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <TemplateCard v-for="tpl in store.mainTemplates" :key="tpl.id" :template="tpl" />
    </div>

    <div class="w-full">
      <form v-if="isCreating" class="flex w-full flex-col sm:flex-row items-stretch gap-2" @submit.prevent="createCustom">
        <input
          ref="titleInput"
          v-model="newTitle"
          type="text"
          placeholder="نام لیست جدید..."
          class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <div class="flex gap-2">
          <button type="submit" class="flex-1 sm:flex-none min-h-[44px] px-6 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            ایجاد
          </button>
          <button type="button" class="flex-1 sm:flex-none min-h-[44px] px-6 rounded-xl border border-slate-300 dark:border-slate-600 text-sm" @click="cancelCreating">
            انصراف
          </button>
        </div>
      </form>
      <button
        v-else
        type="button"
        class="w-full min-h-[48px] rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        @click="startCreating"
      >
        + لیست جدید
      </button>
    </div>
  </section>
</template>
