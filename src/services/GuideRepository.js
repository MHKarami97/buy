const ARABIC_TO_PERSIAN = { 'ي': 'ی', 'ك': 'ک', 'ى': 'ی', 'ۀ': 'ه', 'ة': 'ه' }
const DIGIT_OFFSETS = [['۰', '۹', 0x06f0], ['٠', '٩', 0x0660]]

/**
 * Repository Pattern for the shopping guides.
 * Resolves a guide for a checklist item in two steps:
 *   1. exact match on the stable default item id (itemIds),
 *   2. whole-word match of the item title against guide keywords
 *      (covers custom items and ids that are not mapped yet).
 * All lookups are memoised because shopping lists re-render often.
 */
export class GuideRepository {
  constructor(groups) {
    this.groups = groups
    this.guidesById = new Map()
    this.guideByItemId = new Map()
    this.keywordEntries = []
    this.searchTextById = new Map()
    this.titleCache = new Map()
    this.groups.forEach((group) => this.#indexGroup(group))
    this.keywordEntries.sort((a, b) => b.keyword.length - a.keyword.length)
  }

  static normalize(text) {
    var value = String(text ?? '')
      .replace(/[يكىۀة]/g, (char) => ARABIC_TO_PERSIAN[char])
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[\u200c\u200f\u200e]/g, ' ')
    DIGIT_OFFSETS.forEach(([from, to, base]) => {
      value = value.replace(new RegExp(`[${from}-${to}]`, 'g'), (char) => String(char.charCodeAt(0) - base))
    })
    return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  }

  get guideCount() {
    return this.guidesById.size
  }

  findById(guideId) {
    return this.guidesById.get(guideId) ?? null
  }

  findForItem(item) {
    if (!item) return null
    var byId = this.guideByItemId.get(item.id)
    if (byId) return byId
    return this.#findByTitle(item.title)
  }

  search(query, groupId = 'all') {
    var tokens = GuideRepository.normalize(query).split(' ').filter(Boolean)
    return this.groups
      .filter((group) => groupId === 'all' || group.id === groupId)
      .map((group) => ({
        group: group,
        guides: group.guides.filter((guide) => this.#matchesAll(guide, tokens))
      }))
      .filter((result) => result.guides.length > 0)
  }

  #indexGroup(group) {
    group.guides.forEach((guide) => {
      this.guidesById.set(guide.id, guide)
      guide.itemIds.forEach((itemId) => this.guideByItemId.set(itemId, guide))
      guide.keywords.forEach((keyword) => {
        this.keywordEntries.push({
          keyword: GuideRepository.normalize(keyword),
          excludes: guide.excludeKeywords.map((excluded) => GuideRepository.normalize(excluded)),
          guide: guide
        })
      })
      this.searchTextById.set(guide.id, this.#buildSearchText(guide))
    })
  }

  #buildSearchText(guide) {
    var parts = [guide.title, guide.summary, ...guide.keywords]
    guide.sections.forEach((section) => parts.push(section.title, ...section.points))
    return GuideRepository.normalize(parts.join(' '))
  }

  #findByTitle(title) {
    var normalizedTitle = GuideRepository.normalize(title)
    if (!normalizedTitle) return null
    if (this.titleCache.has(normalizedTitle)) return this.titleCache.get(normalizedTitle)

    var padded = ` ${normalizedTitle} `
    var match = this.keywordEntries.find(
      (entry) =>
        padded.includes(` ${entry.keyword} `) &&
        !entry.excludes.some((excluded) => padded.includes(` ${excluded} `))
    )
    var guide = match ? match.guide : null
    this.titleCache.set(normalizedTitle, guide)
    return guide
  }

  #matchesAll(guide, tokens) {
    if (tokens.length === 0) return true
    var text = this.searchTextById.get(guide.id)
    return tokens.every((token) => text.includes(token))
  }
}
