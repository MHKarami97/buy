<script setup>
import { computed } from 'vue'
import { guideRepository } from '../data/guides'
import { useIngredientPreferences } from '../composables/useIngredientPreferences'

var props = defineProps({
  item: { type: Object, required: true }
})

var { isAvoided } = useIngredientPreferences()
var flagged = computed(() =>
  guideRepository.ingredientsForItem(props.item).filter((ingredient) => isAvoided(ingredient.id))
)
</script>

<template>
  <p
    v-if="flagged.length"
    class="mt-1 text-xs leading-6 text-red-600 dark:text-red-300"
    role="note"
  >
    <span aria-hidden="true">⚠️</span>
    ممکن است دارای: {{ flagged.map((ingredient) => ingredient.name).join('، ') }}
  </p>
</template>
