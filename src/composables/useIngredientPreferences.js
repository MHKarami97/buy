import { computed, ref } from 'vue'
import { preferencesRepository } from '../services/PreferencesRepository'

var avoidedIds = ref(preferencesRepository.getAvoidedIngredientIds())
var avoidedSet = computed(() => new Set(avoidedIds.value))
var avoidedCount = computed(() => avoidedIds.value.length)

function isAvoided(ingredientId) {
  return avoidedSet.value.has(ingredientId)
}

function save(next) {
  avoidedIds.value = next
  preferencesRepository.setAvoidedIngredientIds(next)
}

function toggleAvoided(ingredientId) {
  save(
    isAvoided(ingredientId)
      ? avoidedIds.value.filter((id) => id !== ingredientId)
      : [...avoidedIds.value, ingredientId]
  )
}

function clearAvoided() {
  save([])
}

/** Shared (module-level) state so every component sees the same avoided list. */
export function useIngredientPreferences() {
  return { avoidedIds, avoidedCount, isAvoided, toggleAvoided, clearAvoided }
}
