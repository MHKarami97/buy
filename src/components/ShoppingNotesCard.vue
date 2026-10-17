<script setup>
import { computed, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'

var props = defineProps({
  scope: { type: String, default: 'main' }
})

var store = useChecklistStore()
var newNote = ref('')
var isCompletedExpanded = ref(false)

var notes = computed(() => store.notesFor(props.scope))
var pendingNotes = computed(() => notes.value.filter((note) => !note.isChecked))
var completedNotes = computed(() => notes.value.filter((note) => note.isChecked))

function addNote() {
  store.addShoppingNote(newNote.value, props.scope)
  newNote.value = ''
}

function toggleNote(noteId) {
  store.toggleShoppingNote(noteId, props.scope)
}
</script>

<template>
  <section class="rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden">
    <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
      <div>
        <h2 class="text-sm font-semibold">نوت‌های لیست خرید</h2>
        <p class="text-xs text-slate-400 mt-1">{{ pendingNotes.length }} مورد باقی‌مانده</p>
      </div>
      <span class="text-xl" aria-hidden="true">📝</span>
    </div>

    <div class="p-3 space-y-3">
      <form class="flex gap-2" @submit.prevent="addNote">
        <input
          v-model="newNote"
          type="text"
          placeholder="مثلاً تماس با فروشگاه"
          class="flex-1 min-w-0 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button type="submit" class="min-h-[44px] px-4 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">افزودن</button>
      </form>

      <div v-if="pendingNotes.length" class="space-y-2">
        <label
          v-for="note in pendingNotes"
          :key="note.id"
          class="note-row flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-700/30 px-3 py-3 cursor-pointer"
        >
          <input class="note-checkbox" type="checkbox" :checked="note.isChecked" @change="toggleNote(note.id)" />
          <span class="flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-200">{{ note.text }}</span>
          <span class="text-xs text-slate-300 dark:text-slate-500" aria-hidden="true">✓</span>
        </label>
      </div>
      <p v-else class="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 px-3 py-4 text-center text-xs text-slate-400">
        هنوز چیزی اضافه نشده است
      </p>
    </div>

    <div v-if="completedNotes.length" class="border-t border-slate-100 dark:border-slate-700/60 pt-2">
      <button
        type="button"
        class="flex w-full items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        @click="isCompletedExpanded = !isCompletedExpanded"
      >
        <span>انجام شده‌ها <span class="text-slate-300 dark:text-slate-600">({{ completedNotes.length }})</span></span>
        <span>{{ isCompletedExpanded ? '⌃' : '⌄' }}</span>
      </button>
      <div v-if="isCompletedExpanded" class="space-y-2 px-3 pb-3">
        <label
          v-for="note in completedNotes"
          :key="note.id"
          class="note-row flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-700/20 px-3 py-3 cursor-pointer"
        >
          <input class="note-checkbox" type="checkbox" checked @change="toggleNote(note.id)" />
          <span class="flex-1 min-w-0 text-sm text-slate-400 line-through">{{ note.text }}</span>
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.note-checkbox {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  border: 2px solid rgb(203 213 225);
  border-radius: 0.45rem;
  background: white;
  display: grid;
  place-content: center;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
}

.note-checkbox::before {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  transform: scale(0);
  transition: transform 120ms ease;
}

.note-checkbox:checked {
  border-color: rgb(16 185 129);
  background: rgb(16 185 129);
}

.note-checkbox:checked::before {
  transform: scale(1);
}

.note-checkbox:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(96 165 250 / 30%);
}

.note-row:has(.note-checkbox:checked) {
  border-color: rgb(167 243 208);
}
</style>
