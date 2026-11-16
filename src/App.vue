<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useChecklistStore } from './stores/checklistStore'
import { useCloudSyncStore } from './stores/cloudSyncStore'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import GuideDialog from './components/GuideDialog.vue'
import SyncFailedBar from './components/cloud/SyncFailedBar.vue'
import CloudConflictModal from './components/cloud/CloudConflictModal.vue'

var store = useChecklistStore()
var cloudStore = useCloudSyncStore()

onMounted(() => {
  store.initialize()
  cloudStore.start()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4">
      <RouterView />
    </main>
    <div class="bottom-nav-spacer sm:hidden" aria-hidden="true"></div>
    <BottomNav class="sm:hidden" />
    <UpdatePrompt />
    <GuideDialog />
    <SyncFailedBar />
    <CloudConflictModal />
    <Transition name="toast">
      <div
        v-if="store.quantityNotice"
        class="toast-position fixed right-5 z-50 max-w-[calc(100vw-2rem)] rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg"
        role="status"
      >
        مقدار «{{ store.quantityNotice.itemTitle }}» به {{ store.quantityNotice.quantity }} تغییر کرد
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Reserves room under the content for the floating bottom bar (bar ~5rem + gap + safe area). */
.bottom-nav-spacer {
  flex: none;
  height: calc(6.5rem + env(safe-area-inset-bottom, 0px));
}

.toast-position {
  bottom: calc(6.5rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 640px) {
  .toast-position {
    bottom: 1.25rem;
  }
}

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
