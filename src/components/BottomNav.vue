<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import AppIcon from './AppIcon.vue'
import { PRIMARY_FEATURES, MORE_FEATURES, TONES, isFeatureActive } from '../data/appFeatures'

var route = useRoute()
var store = useChecklistStore()
var isMoreOpen = ref(false)

var shoppingCount = computed(() => store.shoppingItems.length)
var isMoreActive = computed(() => MORE_FEATURES.some((feature) => isFeatureActive(feature, route.path)))

function badgeOf(feature) {
  return feature.id === 'shopping-list' && shoppingCount.value > 0 ? shoppingCount.value : 0
}

function closeMore() {
  isMoreOpen.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMore()
}

watch(() => route.fullPath, closeMore)
watch(isMoreOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div>
    <nav
      aria-label="منوی اصلی"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <ul
        class="pointer-events-auto mx-auto grid max-w-md grid-cols-5 rounded-3xl bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 backdrop-blur-xl dark:bg-slate-900/85 dark:ring-slate-700/60"
      >
        <li v-for="feature in PRIMARY_FEATURES" :key="feature.id">
          <RouterLink
            :to="feature.to"
            class="group flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] transition-colors"
            :class="isFeatureActive(feature, route.path) ? 'font-semibold text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'"
            :aria-current="isFeatureActive(feature, route.path) ? 'page' : undefined"
          >
            <span
              class="relative flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200"
              :class="isFeatureActive(feature, route.path)
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'group-active:scale-90'"
            >
              <AppIcon :name="feature.icon" :size="22" />
              <span
                v-if="badgeOf(feature)"
                class="absolute -top-1 -left-0.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white dark:ring-slate-900"
              >{{ badgeOf(feature) > 99 ? '99+' : badgeOf(feature) }}</span>
            </span>
            <span class="truncate">{{ feature.title }}</span>
          </RouterLink>
        </li>
        <li>
          <button
            type="button"
            class="group flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] transition-colors"
            :class="isMoreOpen || isMoreActive ? 'font-semibold text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'"
            aria-haspopup="dialog"
            :aria-expanded="isMoreOpen"
            @click="isMoreOpen = !isMoreOpen"
          >
            <span
              class="flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200"
              :class="isMoreOpen || isMoreActive ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'group-active:scale-90'"
            >
              <AppIcon name="more" :size="22" />
            </span>
            <span>بیشتر</span>
          </button>
        </li>
      </ul>
    </nav>

    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="isMoreOpen" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:hidden" @click.self="closeMore">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="امکانات بیشتر"
            class="sheet-panel w-full rounded-t-3xl bg-white p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl dark:bg-slate-900"
          >
            <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true"></div>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-bold">امکانات بیشتر</h2>
              <button type="button" class="flex size-11 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="بستن" @click="closeMore">
                <AppIcon name="close" :size="20" />
              </button>
            </div>
            <ul class="grid grid-cols-3 gap-3">
              <li v-for="feature in MORE_FEATURES" :key="feature.id">
                <RouterLink
                  :to="feature.to"
                  class="flex h-full flex-col items-center gap-2 rounded-2xl border border-slate-100 p-3 text-center text-xs font-medium transition-colors active:scale-95 dark:border-slate-800"
                  :class="isFeatureActive(feature, route.path) ? 'border-brand-300 bg-brand-50/60 dark:border-brand-700 dark:bg-brand-700/10' : 'bg-slate-50/60 dark:bg-slate-800/40'"
                >
                  <span class="flex size-11 items-center justify-center rounded-2xl" :class="TONES[feature.tone]">
                    <AppIcon :name="feature.icon" />
                  </span>
                  <span class="leading-5">{{ feature.title }}</span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .sheet-enter-active .sheet-panel,
  .sheet-leave-active .sheet-panel {
    transition: none;
  }
}
</style>
