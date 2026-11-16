import { GuideRepository } from './GuideRepository'

/**
 * Repository Pattern for food/product ingredients.
 * Ingredients are linked to shopping items through stable item ids, so one
 * ingredient can appear in many guides without duplicating its content.
 */
export class IngredientRepository {
  constructor(groups) {
    this.groups = groups
    this.byId = new Map()
    this.byItemId = new Map()
    this.searchTextById = new Map()
    this.groups.forEach((group) => group.ingredients.forEach((ingredient) => this.#index(ingredient)))
  }

  get count() {
    return this.byId.size
  }

  findById(ingredientId) {
    return this.byId.get(ingredientId) ?? null
  }

  findForItemIds(itemIds) {
    var seen = new Set()
    var result = []
    itemIds.forEach((itemId) => {
      ;(this.byItemId.get(itemId) ?? []).forEach((ingredient) => {
        if (seen.has(ingredient.id)) return
        seen.add(ingredient.id)
        result.push(ingredient)
      })
    })
    return result
  }

  searchTextOf(ingredient) {
    return this.searchTextById.get(ingredient.id) ?? ''
  }

  search(query) {
    var tokens = GuideRepository.normalize(query).split(' ').filter(Boolean)
    if (tokens.length === 0) return []
    var result = []
    this.byId.forEach((ingredient) => {
      var text = this.searchTextById.get(ingredient.id)
      if (tokens.every((token) => text.includes(token))) result.push(ingredient)
    })
    return result
  }

  #index(ingredient) {
    this.byId.set(ingredient.id, ingredient)
    ingredient.itemIds.forEach((itemId) => {
      var list = this.byItemId.get(itemId) ?? []
      list.push(ingredient)
      this.byItemId.set(itemId, list)
    })
    var parts = [ingredient.name, ...ingredient.aliases, ingredient.whatIsIt, ingredient.role, ingredient.verdictNote]
    this.searchTextById.set(ingredient.id, GuideRepository.normalize(parts.join(' ')))
  }
}
