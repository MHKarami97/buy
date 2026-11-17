<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { itemProductCodeRepository } from '../services/barcode/ItemProductCodeRepository'
import ItemCodeDetailsModal from './ItemCodeDetailsModal.vue'
import MapItemCodeModal from './MapItemCodeModal.vue'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  item: { type: Object, required: true }
})

var isDetailsOpen = ref(false)
var isEditOpen = ref(false)
var mapping = ref(null)

function refresh() {
  if (props.item?.id) {
    mapping.value = itemProductCodeRepository.getForItem(props.item.id)
  } else {
    mapping.value = null
  }
}

var unsubscribe = null

onMounted(() => {
  refresh()
  unsubscribe = itemProductCodeRepository.subscribe(refresh)
  if (typeof window !== 'undefined') {
    window.addEventListener('item-product-codes-changed', refresh)
  }
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  if (typeof window !== 'undefined') {
    window.removeEventListener('item-product-codes-changed', refresh)
  }
})

var hasCodes = computed(() => {
  return Boolean(mapping.value && (mapping.value.barcode || mapping.value.ifdaCode || mapping.value.standardCode))
})

function openDetails() {
  isDetailsOpen.value = true
}

function handleEdit() {
  isDetailsOpen.value = false
  isEditOpen.value = true
}
</script>

<template>
  <div v-if="hasCodes" class="inline-flex items-center">
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors shadow-2xs"
      :title="`مشاهده کدهای ثبت‌شده کالا (بارکد / پروانه غذا و دارو / استاندارد)`"
      @click="openDetails"
    >
      <AppIcon name="check" :size="12" class="text-emerald-600 dark:text-emerald-400" />
      <span>شناسه و اصالت</span>
    </button>

    <ItemCodeDetailsModal
      :is-open="isDetailsOpen"
      :item="item"
      :mapping="mapping"
      @close="isDetailsOpen = false"
      @edit="handleEdit"
      @deleted="refresh"
    />

    <MapItemCodeModal
      :is-open="isEditOpen"
      :initial-item="item"
      :initial-barcode="mapping?.barcode"
      :initial-ifda-code="mapping?.ifdaCode"
      :initial-standard-code="mapping?.standardCode"
      :initial-brand="mapping?.brand"
      :initial-product-title="mapping?.productTitle"
      :initial-manufacturer="mapping?.manufacturer"
      :initial-license-status="mapping?.licenseStatus"
      @close="isEditOpen = false"
      @saved="refresh"
    />
  </div>
</template>
