<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '../stores/checklistStore'
import { useConfirm } from '../composables/useConfirm'
import ProgressBar from '../components/ProgressBar.vue'
import FilterSortBar from '../components/FilterSortBar.vue'
import AddItemForm from '../components/AddItemForm.vue'
import VirtualItemList from '../components/VirtualItemList.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

var props = defineProps({ id: { type: String, required: true } })
var store = useChecklistStore()
var router = useRouter()
var { isPending, pendingLabel, requestConfirm, confirmAction, cancelAction } = useConfirm()

if (store.activeTemplateId !== props.id) {
  store.selectTemplate(props.id)
}

var template = computed(() => store.activeTemplate)

function handleRemoveItem(itemId) {
  requestConfirm('این آیتم حذف شود؟', () => store.removeItem(itemId))
}

function handleResetTemplate() {
  requestConfirm('تعداد همه آیتم‌ها صفر شود؟', () => store.resetActiveTemplate())
}

function handleDeleteTemplate() {
  requestConfirm('این خرید کامل حذف شود؟', () => {
    store.deleteTemplate(props.id)
    router.push('/')
  })
}
</script>

<template>
  <section v-if="template" class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <span>{{ template.icon }}</span>
          <span>{{ template.title }}</span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">{{ template.description }}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          class="min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm"
          @click="handleResetTemplate"
        >
          ریست
        </button>
        <button
          v-if="template.isCustom"
          type="button"
          class="min-h-[44px] px-3 rounded-xl border border-red-300 text-red-500 text-xs sm:text-sm"
          @click="handleDeleteTemplate"
        >
          حذف
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-2 text-sm">
        <span>پیشرفت کلی</span>
        <span class="font-semibold">{{ template.overallProgress }}%</span>
      </div>
      <ProgressBar :percent="template.overallProgress" />
    </div>

    <div v-if="store.activeCategory" class="space-y-4">
      <FilterSortBar />
      <VirtualItemList
        :items="store.visibleItems"
        @toggle="store.toggleItem"
        @update-quantity="store.updateItemQuantity($event.id, $event.quantity)"
        @remove="handleRemoveItem"
      />
      <AddItemForm @add="(title) => store.addItem(title)" />
    </div>
  </section>

  <ConfirmDialog
    :is-open="isPending"
    :label="pendingLabel"
    @confirm="confirmAction"
    @cancel="cancelAction"
  />
</template>
