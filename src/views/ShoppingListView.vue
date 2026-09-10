<script setup>
import { computed, ref } from 'vue'
import { useChecklistStore } from '../stores/checklistStore'

var store = useChecklistStore()
var pendingQuantities = ref({})
var expandedLists = ref({})
var expandedCompletedNotes = ref(false)
var newNote = ref('')

var pendingNotes = computed(() => store.shoppingNotes.filter((note) => !note.isChecked))
var completedNotes = computed(() => store.shoppingNotes.filter((note) => note.isChecked))

var shoppingLists = computed(() => {
  var lists = new Map()

  store.shoppingItems.forEach((entry) => {
    var list = lists.get(entry.template.id)
    if (!list) {
      list = { template: entry.template, entries: [] }
      lists.set(entry.template.id, list)
    }
    list.entries.push(entry)
  })

  return Array.from(lists.values())
})

function isListExpanded(templateId) {
  return expandedLists.value[templateId] ?? true
}

function toggleList(templateId) {
  expandedLists.value[templateId] = !isListExpanded(templateId)
}

function entryKey(entry) {
  return `${entry.template.id}-${entry.category.id}-${entry.item.id}`
}

function pendingQuantity(entry) {
  return pendingQuantities.value[entryKey(entry)] ?? entry.item.quantity
}

function updateQuantity(entry, event) {
  var quantity = Math.max(0, Number(event.target.value) || 0)
  pendingQuantities.value[entryKey(entry)] = quantity
}

function changeQuantity(entry, amount) {
  pendingQuantities.value[entryKey(entry)] = Math.max(0, pendingQuantity(entry) + amount)
}

function confirmQuantity(entry) {
  var key = entryKey(entry)
  var quantity = pendingQuantity(entry)
  if (quantity <= 0) return
  store.updateItemQuantity(entry.item.id, quantity, entry.category.id, entry.template.id)
  delete pendingQuantities.value[key]
}

function addNote() {
  store.addShoppingNote(newNote.value)
  newNote.value = ''
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">لیست خرید</h1>
      <p class="text-sm text-slate-400 mt-1">آیتم‌هایی که موجودی آن‌ها صفر است</p>
    </div>

    <section class="rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-3 space-y-3">
      <h2 class="text-sm font-semibold">نوت‌های لیست خرید</h2>
      <form class="flex gap-2" @submit.prevent="addNote">
        <input v-model="newNote" type="text" placeholder="مثلاً تماس با فروشگاه" class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" />
        <button type="submit" class="min-h-[44px] px-4 rounded-xl bg-brand-500 text-white text-sm">افزودن</button>
      </form>
      <div v-if="pendingNotes.length" class="space-y-2">
        <label v-for="note in pendingNotes" :key="note.id" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :checked="note.isChecked" @change="store.toggleShoppingNote(note.id)" />
          <span>{{ note.text }}</span>
        </label>
      </div>
      <div v-if="completedNotes.length" class="border-t border-slate-100 dark:border-slate-700/60 pt-2">
        <button type="button" class="flex w-full items-center justify-between text-xs text-slate-400" @click="expandedCompletedNotes = !expandedCompletedNotes">
          <span>انجام شده‌ها ({{ completedNotes.length }})</span>
          <span>{{ expandedCompletedNotes ? '⌃' : '⌄' }}</span>
        </button>
        <div v-if="expandedCompletedNotes" class="space-y-2 mt-2">
          <label v-for="note in completedNotes" :key="note.id" class="flex items-center gap-2 text-sm text-slate-400 line-through">
            <input type="checkbox" checked @change="store.toggleShoppingNote(note.id)" />
            <span>{{ note.text }}</span>
          </label>
        </div>
      </div>
    </section>

    <div v-if="shoppingLists.length" class="space-y-4">
      <section
        v-for="list in shoppingLists"
        :key="list.template.id"
        class="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          :aria-expanded="isListExpanded(list.template.id)"
          @click="toggleList(list.template.id)"
        >
          <span class="text-xl" aria-hidden="true">{{ list.template.icon }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">{{ list.template.title }}</span>
            <span class="block text-xs text-slate-400 mt-0.5">{{ list.entries.length }} آیتم برای خرید</span>
          </span>
          <span class="text-lg text-slate-400" aria-hidden="true">{{ isListExpanded(list.template.id) ? '⌃' : '⌄' }}</span>
        </button>

        <div v-if="isListExpanded(list.template.id)" class="space-y-2 border-t border-slate-100 dark:border-slate-700/60 p-2">
          <div
            v-for="entry in list.entries"
            :key="entryKey(entry)"
            class="flex items-center gap-3 rounded-xl px-3 py-3 bg-slate-50 dark:bg-slate-700/40"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm sm:text-base text-slate-800 dark:text-slate-100">{{ entry.item.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ entry.category.name }}</p>
            </div>
            <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 overflow-hidden shadow-sm">
              <button
                type="button"
                class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                aria-label="کاهش تعداد"
                :disabled="pendingQuantity(entry) === 0"
                @click="changeQuantity(entry, -0.5)"
              >−</button>
              <input
                :value="pendingQuantity(entry)"
                type="number"
                min="0"
                step="0.5"
                inputmode="decimal"
                aria-label="تعداد موجود"
                class="quantity-input w-12 h-10 border-x border-slate-200 dark:border-slate-600 bg-transparent text-center text-sm font-bold text-brand-600 dark:text-brand-300 focus:outline-none"
                @input="updateQuantity(entry, $event)"
              />
              <button
                type="button"
                class="w-10 h-10 flex items-center justify-center text-lg font-semibold text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-600 transition-colors"
                aria-label="افزایش تعداد"
                @click="changeQuantity(entry, 0.5)"
              >+</button>
            </div>
            <button
              v-if="pendingQuantity(entry) > 0"
              type="button"
              class="min-h-[40px] px-3 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
              @click="confirmQuantity(entry)"
            >
              تأیید
            </button>
          </div>
        </div>
      </section>
    </div>
    <p v-else class="text-center text-sm text-slate-400 py-8">
        لیست خرید خالی است
    </p>
  </section>
</template>

<style scoped>
.quantity-input {
  -moz-appearance: textfield;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
</style>
