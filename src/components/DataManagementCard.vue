<script setup>
import { ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'
import AppIcon from './AppIcon.vue'
import ConfirmDialog from './ConfirmDialog.vue'

var store = useChecklistStore()
var importInput = ref(null)
var pendingFile = ref(null)
var message = ref({ type: '', text: '' })

function openPicker() {
  importInput.value?.click()
}

function onFileChosen(event) {
  var file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  pendingFile.value = file
}

async function confirmImport() {
  var file = pendingFile.value
  pendingFile.value = null
  if (!file) return
  try {
    await store.importData(file)
    message.value = { type: 'success', text: 'داده‌ها با موفقیت جایگزین شد.' }
  } catch (error) {
    message.value = { type: 'error', text: 'فایل نامعتبر است و داده‌ای تغییر نکرد.' }
  }
}

function cancelImport() {
  pendingFile.value = null
}

function exportData() {
  store.exportData()
  message.value = { type: 'success', text: 'فایل پشتیبان دانلود شد.' }
}
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
        @click="exportData"
      >
        <span class="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
          <AppIcon name="download" />
        </span>
        <span>
          <span class="block text-sm font-semibold">خروجی (JSON)</span>
          <span class="block text-xs text-slate-400">ذخیره‌ی همه‌ی لیست‌ها در یک فایل</span>
        </span>
      </button>
      <button
        type="button"
        class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
        @click="openPicker"
      >
        <span class="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300">
          <AppIcon name="upload" />
        </span>
        <span>
          <span class="block text-sm font-semibold">ورودی (JSON)</span>
          <span class="block text-xs text-slate-400">بازگردانی از فایل پشتیبان</span>
        </span>
      </button>
    </div>
    <input ref="importInput" type="file" accept="application/json" class="hidden" @change="onFileChosen" />

    <p
      v-if="message.text"
      class="rounded-xl p-3 text-xs"
      :class="message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'"
      role="status"
    >{{ message.text }}</p>

    <ConfirmDialog
      :is-open="Boolean(pendingFile)"
      label="ورودی، تمام لیست‌های فعلی را با محتوای فایل جایگزین می‌کند. ادامه می‌دهید؟"
      @confirm="confirmImport"
      @cancel="cancelImport"
    />
  </div>
</template>
