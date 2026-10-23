<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useGuideDialog } from '../composables/useGuideDialog'
import GuideContent from './GuideContent.vue'

var { activeGuide, close } = useGuideDialog()

function onKeydown(event) {
  if (event.key === 'Escape' && activeGuide.value) close()
}

watch(activeGuide, (guide) => {
  document.body.style.overflow = guide ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="guide-fade">
      <div
        v-if="activeGuide"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="activeGuide.title"
          class="flex w-full sm:max-w-2xl max-h-[88vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-xl"
        >
          <header class="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <span class="text-2xl" aria-hidden="true">{{ activeGuide.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-400">راهنمای خرید</p>
              <h2 class="text-base sm:text-lg font-bold leading-tight">{{ activeGuide.title }}</h2>
            </div>
            <button
              type="button"
              class="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="بستن راهنما"
              @click="close"
            >✕</button>
          </header>
          <div class="overflow-y-auto overscroll-contain px-4 py-4">
            <GuideContent :guide="activeGuide" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.15s ease;
}
.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}
</style>
