import { ingredientGroups } from '../src/data/ingredients/index.js'
import { defaultChecklistDefinitions } from '../src/data/defaultChecklists.js'

var itemIds = new Set()
defaultChecklistDefinitions.forEach((tpl) => tpl.categories.forEach((cat) => cat.items.forEach((item) => itemIds.add(item.id))))

var seen = new Set()
var errors = []
ingredientGroups.forEach((group) => group.ingredients.forEach((ingredient) => {
  if (seen.has(ingredient.id)) errors.push(`duplicate id: ${ingredient.id}`)
  seen.add(ingredient.id)
  ;['name', 'whatIsIt', 'role', 'verdict', 'verdictNote'].forEach((field) => {
    if (!ingredient[field]) errors.push(`${ingredient.id}: missing ${field}`)
  })
  if (!ingredient.sources.length) errors.push(`${ingredient.id}: no sources`)
  ingredient.itemIds.forEach((id) => { if (!itemIds.has(id)) errors.push(`${ingredient.id}: unknown itemId ${id}`) })
}))

console.log(`${seen.size} ingredients checked`)
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
