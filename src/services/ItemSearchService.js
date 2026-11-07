import { GuideRepository } from './GuideRepository'

const DEFAULT_LIMIT = 40

export class ItemSearchService {
  static search(templates, query, limit = DEFAULT_LIMIT) {
    var tokens = GuideRepository.normalize(query).split(' ').filter(Boolean)
    if (tokens.length === 0) {
      return []
    }

    var results = []
    for (var template of templates) {
      for (var category of template.categories) {
        for (var item of category.activeItems) {
          var haystack = GuideRepository.normalize(item.title)
          if (tokens.every((token) => haystack.includes(token))) {
            results.push({ template, category, item })
            if (results.length >= limit) {
              return results
            }
          }
        }
      }
    }
    return results
  }
}
