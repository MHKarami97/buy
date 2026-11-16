var KIND_ORDER = ['check', 'avoid', 'label', 'storage', 'tip']

/**
 * Pure domain service: builds a side-by-side comparison of two guides
 * (section by section) and of the ingredients attached to them.
 */
export class GuideComparer {
  static compare(first, second, ingredientsOf = function () { return [] }) {
    var rows = KIND_ORDER
      .map(function (kind) {
        return {
          kind: kind,
          title: GuideComparer.#titleOf(kind, first, second),
          first: GuideComparer.#pointsOf(first, kind),
          second: GuideComparer.#pointsOf(second, kind)
        }
      })
      .filter(function (row) { return row.first.length > 0 || row.second.length > 0 })

    var firstIngredients = ingredientsOf(first)
    var secondIngredients = ingredientsOf(second)
    var secondIds = new Set(secondIngredients.map(function (item) { return item.id }))
    var firstIds = new Set(firstIngredients.map(function (item) { return item.id }))

    return {
      first: first,
      second: second,
      rows: rows,
      ingredients: {
        shared: firstIngredients.filter(function (item) { return secondIds.has(item.id) }),
        onlyFirst: firstIngredients.filter(function (item) { return !secondIds.has(item.id) }),
        onlySecond: secondIngredients.filter(function (item) { return !firstIds.has(item.id) })
      }
    }
  }

  static #pointsOf(guide, kind) {
    return guide.sections
      .filter(function (section) { return section.kind === kind })
      .flatMap(function (section) { return section.points })
  }

  static #titleOf(kind, first, second) {
    var section = first.sections.find(function (item) { return item.kind === kind })
      ?? second.sections.find(function (item) { return item.kind === kind })
    return section ? section.title : kind
  }
}
