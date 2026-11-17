<script setup>
import { computed } from 'vue'
import { JalaliDate } from '../services/JalaliDate'
import { itemProductCodeRepository } from '../services/barcode/ItemProductCodeRepository'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  isOpen: { type: Boolean, default: false },
  item: { type: Object, default: null },
  mapping: { type: Object, default: null }
})

var emit = defineEmits(['close', 'edit', 'deleted'])

var activeMapping = computed(() => {
  if (props.mapping) return props.mapping
  if (props.item?.id) {
    return itemProductCodeRepository.getForItem(props.item.id)
  }
  return null
})

function copyValue(val) {
  if (!val) return
  navigator.clipboard.writeText(String(val))
  alert('در حافظه کپی شد: ' + val)
}

function handleDelete() {
  if (!activeMapping.value) return
  if (confirm('آیا اطلاعات کدهای ثبت‌شده برای این کالا حذف شود؟')) {
    itemProductCodeRepository.remove(activeMapping.value.id)
    emit('deleted', activeMapping.value.id)
    emit('close')
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
    >
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">📋</span>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
              شناسنامه و کدهای اصالت: {{ item?.title || activeMapping?.itemTitle || 'کالا' }}
            </h2>
          </div>
          <p v-if="activeMapping?.registeredAt" class="text-xs text-slate-400 mt-1">
            ثبت‌شده در سامانه: {{ JalaliDate.dateTime(activeMapping.registeredAt) }}
          </p>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Content if mapped data exists -->
      <div v-if="activeMapping" class="space-y-3">
        <!-- 1. Barcode / IranCode Card -->
        <div v-if="activeMapping.barcode" class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span class="flex items-center gap-1.5">
              <span>📊</span>
              <span>بارکد تجاری (GTIN / GS1):</span>
            </span>
            <a
              :href="`https://irancode.ir/01/${activeMapping.barcode}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5 text-[11px]"
            >
              <span>استعلام در ایران‌کد</span>
              <span>↗</span>
            </a>
          </div>

          <div class="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700">
            <span class="font-mono text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200">{{ activeMapping.barcode }}</span>
            <button
              type="button"
              class="text-xs text-slate-500 hover:text-brand-600 px-2 py-0.5"
              @click="copyValue(activeMapping.barcode)"
            >
              کپی
            </button>
          </div>
        </div>

        <!-- 2. IFDA Health License Card -->
        <div v-if="activeMapping.ifdaCode" class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 dark:border-emerald-950 dark:bg-emerald-950/20 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span class="flex items-center gap-1.5">
              <span>🍏</span>
              <span>پروانه بهداشتی ساخت (غذا و دارو):</span>
            </span>
            <a
              :href="`https://cerfood.ir/p/${activeMapping.ifdaCode}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 text-[11px]"
            >
              <span>استعلام در سرفود</span>
              <span>↗</span>
            </a>
          </div>

          <div class="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-emerald-200 dark:border-emerald-900/60">
            <span class="font-mono text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200">{{ activeMapping.ifdaCode }}</span>
            <div class="flex items-center gap-2">
              <span
                v-if="activeMapping.licenseStatus"
                class="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                :class="['دارای اعتبار', 'معتبر'].some((s) => activeMapping.licenseStatus.includes(s))
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'"
              >
                {{ activeMapping.licenseStatus }}
              </span>
              <button
                type="button"
                class="text-xs text-slate-500 hover:text-emerald-600 px-2 py-0.5"
                @click="copyValue(activeMapping.ifdaCode)"
              >
                کپی
              </button>
            </div>
          </div>
        </div>

        <!-- 3. National Standard Code Card -->
        <div v-if="activeMapping.standardCode" class="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 dark:border-sky-950 dark:bg-sky-950/20 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-sky-800 dark:text-sky-300">
            <span class="flex items-center gap-1.5">
              <span>🇮🇷</span>
              <span>نشان استاندارد ملی ایران:</span>
            </span>
            <span class="text-[11px] text-sky-600 dark:text-sky-400 font-normal">پیامک استعلام: ۱۰۰۰۱۵۱۷</span>
          </div>

          <div class="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-sky-200 dark:border-sky-900/60">
            <span class="font-mono text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200">{{ activeMapping.standardCode }}</span>
            <button
              type="button"
              class="text-xs text-slate-500 hover:text-sky-600 px-2 py-0.5"
              @click="copyValue(activeMapping.standardCode)"
            >
              کپی
            </button>
          </div>
        </div>

        <!-- 4. Manufacturer & Brand Overview -->
        <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div v-if="activeMapping.productTitle">
            <span class="text-slate-400">نام کامل ثبتی: </span>
            <span class="font-semibold text-slate-800 dark:text-slate-100">{{ activeMapping.productTitle }}</span>
          </div>
          <div v-if="activeMapping.brand">
            <span class="text-slate-400">نام تجاری / برند: </span>
            <span class="font-semibold text-slate-800 dark:text-slate-100">{{ activeMapping.brand }}</span>
          </div>
          <div v-if="activeMapping.manufacturer">
            <span class="text-slate-400">تولیدکننده / کارخانه: </span>
            <span class="font-semibold text-slate-800 dark:text-slate-100">{{ activeMapping.manufacturer }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state if no mapping -->
      <div v-else class="py-8 text-center text-slate-400 space-y-3">
        <span class="text-4xl block">🏷️</span>
        <p class="text-sm">هنوز هیچ بارکد، پروانه غذا و دارو یا کد استانداردی به این کالا متصل نشده است.</p>
        <button
          type="button"
          class="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 transition-colors"
          @click="emit('edit')"
        >
          ثبت و اتصال کدهای کالا
        </button>
      </div>

      <!-- Action buttons footer -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <button
            v-if="activeMapping"
            type="button"
            class="rounded-xl bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300 transition-colors"
            @click="emit('edit')"
          >
            ویرایش اطلاعات
          </button>
          <button
            v-if="activeMapping"
            type="button"
            class="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            @click="handleDelete"
          >
            حذف نگاشت
          </button>
        </div>

        <button
          type="button"
          class="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
</template>
