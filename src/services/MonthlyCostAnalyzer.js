import { JalaliDate } from './JalaliDate.js'

function round(value) {
  return Math.round(value)
}

/**
 * Pure domain service. A purchase is a restock event (quantity went up);
 * its cost is delta x the unit price valid at that moment.
 * Purchases of items without any recorded price are counted separately.
 */
export class MonthlyCostAnalyzer {
  /**
   * @param {Map<string, import('../models/ItemHistory.js').ItemHistory>} histories
   * @param {(key: string, timestamp: number) => number|null} priceResolver
   */
  static analyze(histories, priceResolver) {
    var buckets = new Map()

    histories.forEach(function (history, key) {
      history.events.forEach(function (event) {
        if (!event.isRestock) return
        var index = JalaliDate.monthIndex(event.t)
        var bucket = buckets.get(index) ?? MonthlyCostAnalyzer.#emptyBucket(index)
        var item = bucket.items.get(key) ?? {
          key: key,
          title: history.title,
          templateTitle: history.templateTitle,
          categoryName: history.categoryName,
          quantity: 0,
          cost: 0,
          unpricedPurchases: 0
        }
        var price = priceResolver(key, event.t)
        item.quantity += event.delta
        bucket.purchaseCount += 1
        if (price === null) {
          item.unpricedPurchases += 1
          bucket.unpricedCount += 1
        } else {
          item.cost += event.delta * price
          bucket.total += event.delta * price
        }
        bucket.items.set(key, item)
        buckets.set(index, bucket)
      })
    })

    if (buckets.size === 0) return []
    var indexes = Array.from(buckets.keys())
    var first = Math.min.apply(null, indexes)
    var last = Math.max.apply(null, indexes)
    var result = []
    for (var index = first; index <= last; index++) {
      result.push(MonthlyCostAnalyzer.#finalize(buckets.get(index) ?? MonthlyCostAnalyzer.#emptyBucket(index)))
    }
    return result
  }

  static byTemplate(month) {
    var totals = new Map()
    month.items.forEach(function (item) {
      totals.set(item.templateTitle, (totals.get(item.templateTitle) ?? 0) + item.cost)
    })
    return Array.from(totals.entries())
      .map(function (entry) {
        return { title: entry[0], cost: entry[1], share: month.total > 0 ? (entry[1] / month.total) * 100 : 0 }
      })
      .sort(function (a, b) { return b.cost - a.cost })
  }

  static #emptyBucket(index) {
    return { monthIndex: index, total: 0, purchaseCount: 0, unpricedCount: 0, items: new Map() }
  }

  static #finalize(bucket) {
    var items = Array.from(bucket.items.values())
      .map(function (item) {
        return { ...item, quantity: Math.round(item.quantity * 100) / 100, cost: round(item.cost) }
      })
      .sort(function (a, b) { return b.cost - a.cost })
    return {
      monthIndex: bucket.monthIndex,
      label: JalaliDate.monthName(bucket.monthIndex),
      fullLabel: JalaliDate.monthLabel(bucket.monthIndex),
      total: round(bucket.total),
      purchaseCount: bucket.purchaseCount,
      unpricedCount: bucket.unpricedCount,
      items: items
    }
  }
}
