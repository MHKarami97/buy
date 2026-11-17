import { GuideRepository } from './GuideRepository'

var textCache = new WeakMap()

/** Normalized searchable text of a guide for the picker: title plus keywords only (summaries add too much noise). */
function textsOf(guide) {
  var cached = textCache.get(guide)
  if (cached) return cached
  var entry = {
    title: GuideRepository.normalize(guide.title),
    all: GuideRepository.normalize([guide.title, ...(guide.keywords ?? [])].join(' '))
  }
  textCache.set(guide, entry)
  return entry
}

/**
 * Filters grouped guides for the compare picker.
 * - every typed word must appear in the title or keywords (order independent),
 * - guides whose *title* matches come first inside each group,
 * - `excludeId` hides the guide already chosen in the other slot.
 *
 * @param {{ id: string, name: string, icon: string, guides: object[] }[]} groups
 * @param {string} query
 * @param {string} [excludeId]
 * @returns {{ group: object, guides: object[] }[]}
 */
export function searchGuidesForPicker(groups, query, excludeId = '') {
  var tokens = GuideRepository.normalize(query).split(' ').filter(Boolean)

  return groups
    .map(function (group) {
      var matches = group.guides
        .filter(function (guide) { return guide.id !== excludeId })
        .map(function (guide) {
          var texts = textsOf(guide)
          var isMatch = tokens.every(function (token) { return texts.all.includes(token) })
          var inTitle = tokens.every(function (token) { return texts.title.includes(token) })
          return { guide: guide, isMatch: isMatch, rank: inTitle ? 0 : 1 }
        })
        .filter(function (entry) { return entry.isMatch })
        .sort(function (a, b) { return a.rank - b.rank })
        .map(function (entry) { return entry.guide })
      return { group: group, guides: matches }
    })
    .filter(function (result) { return result.guides.length > 0 })
}
