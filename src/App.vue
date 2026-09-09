<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useChecklistStore } from './stores/checklistStore'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import AppFooter from './components/AppFooter.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

var store = useChecklistStore()

onMounted(() => {
  store.initialize()
})
</script>

<template>
  <div class="min-h-screen flex flex-col pb-16 sm:pb-0">
    <AppHeader />
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4">
      <RouterView />
    </main>
    <AppFooter />
    <BottomNav class="sm:hidden" />
    <UpdatePrompt />
    <Transition name="toast">
      <div
        v-if="store.quantityNotice"
        class="fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2rem)] rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg"
        role="status"
      >
        مقدار «{{ store.quantityNotice.itemTitle }}» به {{ store.quantityNotice.quantity }} تغییر کرد
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
