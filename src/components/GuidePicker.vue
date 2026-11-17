<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { searchGuidesForPicker } from '../services/GuidePickerSearch'

var props = defineProps({
  modelValue: { type: String, default: '' },
  groups: { type: Array, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: 'انتخاب کنید' },
  excludeId: { type: String, default: '' }
})
var emit = defineEmits(['update:modelValue'])

var isOpen = ref(false)
var query = ref('')
var activeIndex = ref(0)
var searchInput = ref(null)
var listElement = ref(null)

var selected = computed(
  () => props.groups.flatMap((group) => group.guides).find((guide) => guide.id === props.modelValue) ?? null
)

var rows = computed(() => {
  var index = 0
  return searchGuidesForPicker(props.groups, query.value, props.excludeId).map((result) => ({
    group: result.group,
    entries: result.guides.map((guide) => ({ guide, index: index++ }))
  }))
})
var flat = computed(() => rows.value.flatMap((row) => row.entries.map((entry) => entry.guide)))
var resultCount = computed(() => flat.value.length)

watch(query, () => {
  activeIndex.value = 0
})

watch(isOpen, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

async function open() {
  query.value = ''
  isOpen.value = true
  await nextTick()
  var currentIndex = flat.value.findIndex((guide) => guide.id === props.modelValue)
  activeIndex.value = Math.max(0, currentIndex)
  searchInput.value?.focus()
  scrollActiveIntoView()
}

function close() {
  isOpen.value = false
}

function choose(guide) {
  emit('update:modelValue', guide.id)
  close()
}

function clearSelection() {
  emit('update:modelValue', '')
  close()
}

function scrollActiveIntoView() {
  nextTick(() => {
    listElement.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  })
}

function move(step) {
  if (!flat.value.length) return
  activeIndex.value = (activeIndex.value + step + flat.value.length) % flat.value.length
  scrollActiveIntoView()
}

function chooseActive() {
  var guide = flat.value[activeIndex.value]
  if (guide) choose(guide)
}
</script>

<template>
  <div>
    <span class="mb-1 block text-xs text-slate-500 dark:text-slate-400">{{ label }}</span>
    <button
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      class="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-right text-sm transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
      @click="open"
    >
      <template v-if="selected">
        <span aria-hidden="true">{{ selected.icon }}</span>
        <span class="flex-1 truncate font-medium">{{ selected.title }}</span>
      </template>
      <span v-else class="flex-1 truncate text-slate-400">{{ placeholder }}</span>
      <AppIcon name="search" :size="18" class="text-slate-400" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
        @click.self="close"
        @keydown.esc.prevent="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          class="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-xl dark:bg-slate-900 sm:max-w-md sm:rounded-3xl"
        >
          <div class="space-y-3 border-b border-slate-100 p-3 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <h2 class="px-1 text-sm font-semibold">{{ label }}</h2>
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="بستن"
                @click="close"
              >
                <AppIcon name="close" :size="20" />
              </button>
            </div>
            <div class="relative">
              <AppIcon name="search" :size="18" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref="searchInput"
                v-model="query"
                type="search"
                enterkeyhint="done"
                autocomplete="off"
                placeholder="تایپ کنید؛ مثلاً روغن، شیر، برنج…"
                aria-label="جستجوی کالا"
                class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-10 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-slate-700 dark:bg-slate-800"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="chooseActive"
              />
            </div>
            <p class="px-1 text-[11px] text-slate-400" aria-live="polite">
              {{ query ? `${resultCount} مورد پیدا شد` : 'همه‌ی کالاها' }}
            </p>
          </div>

          <div ref="listElement" class="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]" role="listbox" :aria-label="label">
            <section v-for="row in rows" :key="row.group.id">
              <h3 class="sticky top-0 bg-slate-50/95 px-4 py-1.5 text-[11px] font-semibold text-slate-500 backdrop-blur dark:bg-slate-800/95 dark:text-slate-400">
                {{ row.group.icon }} {{ row.group.name }}
              </h3>
              <button
                v-for="entry in row.entries"
                :key="entry.guide.id"
                type="button"
                role="option"
                :aria-selected="entry.guide.id === modelValue"
                :data-active="entry.index === activeIndex"
                class="flex min-h-[48px] w-full items-center gap-3 px-4 text-right text-sm transition-colors"
                :class="entry.index === activeIndex ? 'bg-brand-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'"
                @click="choose(entry.guide)"
                @mouseenter="activeIndex = entry.index"
              >
                <span aria-hidden="true">{{ entry.guide.icon }}</span>
                <span class="flex-1 truncate">{{ entry.guide.title }}</span>
                <span v-if="entry.guide.id === modelValue" class="text-brand-600 dark:text-brand-300" aria-hidden="true">✓</span>
              </button>
            </section>

            <p v-if="!resultCount" class="px-4 py-10 text-center text-sm text-slate-400">
              موردی برای «{{ query }}» پیدا نشد.
            </p>
          </div>

          <button
            v-if="modelValue"
            type="button"
            class="min-h-[48px] border-t border-slate-100 text-sm text-red-500 dark:border-slate-800"
            @click="clearSelection"
          >
            پاک کردن انتخاب
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
