import { source } from '../guides/guideBuilder'

export { source }

export var Verdict = Object.freeze({
  GOOD: 'good',
  NEUTRAL: 'neutral',
  CAUTION: 'caution',
  AVOID: 'avoid'
})

export var VERDICT_LABELS = Object.freeze({
  [Verdict.GOOD]: 'مفید یا مناسب',
  [Verdict.NEUTRAL]: 'خنثی / بسته به مقدار',
  [Verdict.CAUTION]: 'با احتیاط',
  [Verdict.AVOID]: 'بهتر است کم‌تر مصرف شود'
})

export function defineIngredient(definition) {
  return Object.freeze({
    id: definition.id,
    name: definition.name,
    aliases: definition.aliases ?? [],
    whatIsIt: definition.whatIsIt,
    role: definition.role,
    verdict: definition.verdict,
    verdictNote: definition.verdictNote,
    itemIds: definition.itemIds ?? [],
    sources: definition.sources ?? []
  })
}

export function defineIngredientGroup(definition) {
  return Object.freeze({
    id: definition.id,
    name: definition.name,
    icon: definition.icon,
    ingredients: definition.ingredients
  })
}
