/**
 * Item Matcher and Suggestion Engine
 * Suggests matching checklist items for scanned products, barcodes, and IFDA licenses.
 */

var STOP_WORDS = new Set([
  'و', 'از', 'به', 'در', 'با', 'برای', 'تا', 'یک', 'عدد', 'بسته', 'گرم', 'کیلو',
  'کیلوگرم', 'میلی', 'لیتر', 'برگ', 'لایه', 'طرح', 'رنگ', 'نوع', 'سایز', 'مدل'
])

export function normalizePersianText(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[آأإ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[\u200C\u200B\u00A0]/g, ' ') // ZWNJ and spaces
    .replace(/[،,؛;\.\-\_\/\\\"\'«»\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractTokens(str) {
  var norm = normalizePersianText(str)
  if (!norm) return []
  return norm
    .split(' ')
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
}

/**
 * Searches and ranks checklist items by relevance to a query or product title
 * @param {string} queryOrTitle
 * @param {Array<{ id: string, title: string, categoryId: string, categoryName: string, templateId: string, templateTitle: string, note?: string }>} allItems
 * @param {number} [limit=5]
 * @returns {Array<object>}
 */
export function suggestMatchingItems(queryOrTitle, allItems = [], limit = 5) {
  if (!queryOrTitle || !Array.isArray(allItems) || allItems.length === 0) {
    return []
  }

  var normQuery = normalizePersianText(queryOrTitle)
  var queryTokens = extractTokens(queryOrTitle)
  if (queryTokens.length === 0) return []

  var scored = []

  for (var item of allItems) {
    var normItem = normalizePersianText(item.title)
    var itemTokens = extractTokens(item.title)
    var score = 0

    // Exact title match
    if (normItem === normQuery) {
      score += 150
    } else if (normQuery.includes(normItem)) {
      score += 80
    } else if (normItem.includes(normQuery)) {
      score += 70
    }

    // Token matching
    var matchedTokens = 0
    for (var qt of queryTokens) {
      if (itemTokens.includes(qt)) {
        matchedTokens++
        score += 30
      } else if (normItem.includes(qt)) {
        score += 15
      }
    }

    // Keyword match in category name
    var normCat = normalizePersianText(item.categoryName || '')
    for (var qt of queryTokens) {
      if (normCat.includes(qt)) {
        score += 10
      }
    }

    if (score > 0) {
      scored.push({
        item,
        score,
        matchedTokens
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.item)
}

/**
 * Flattens all items from templates into a searchable flat list
 * @param {Array} templates
 * @returns {Array}
 */
export function flattenTemplateItems(templates = []) {
  var list = []
  for (var tpl of templates || []) {
    for (var cat of tpl.categories || []) {
      for (var item of cat.items || []) {
        list.push({
          id: item.id,
          title: item.title,
          note: item.note || '',
          categoryId: cat.id,
          categoryName: cat.name,
          templateId: tpl.id,
          templateTitle: tpl.title
        })
      }
    }
  }
  return list
}
