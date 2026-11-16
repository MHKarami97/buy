import { computed, ref } from 'vue'
import { preferencesRepository } from '../services/PreferencesRepository'

var avoidedIds = ref(preferencesRepository.getAvoidedIngredientIds())
var avoidedSet = computed(() => new Set(avoidedIds.value))
var avoidedCount = computed(() => avoidedIds.value.length)

function isAvoided(ingredientId) {
  return avoidedSet.value.has(ingredientId)
}

function toggleAvoided(ingredientId) {
  var next = isAvoided(ingredientId)
    ? avoidedIds.value.filter((id) => id !== ingredientId)
    : [...avoidedIds.value, ingredientId]
  avoidedIds.value = next
  preferencesRepository.setAvoidedIngredientIds(next)
}

/** Shared (module-level) state so every component sees the same avoided list. */
export function useIngredientPreferences() {
  return { avoidedIds, avoidedCount, isAvoided, toggleAvoided }
}
