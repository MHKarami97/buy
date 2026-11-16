import { ConsumptionAnalyzer } from './ConsumptionAnalyzer.js'
import { MonthlyCostAnalyzer } from './MonthlyCostAnalyzer.js'
import { ItemPriceRepository } from './ItemPriceRepository.js'
import { JalaliDate } from './JalaliDate.js'

/**
 * Pure read-model for the dashboard. No DOM, no storage: everything is
 * passed in so it can be unit tested and reused.
 */
export class DashboardInsights {
  /** Items whose projected stock runs out within `horizonDays`, soonest first. */
  static upcomingShortages(histories, quantityByKey, options = {}) {
    var now = options.now ?? Date.now()
    var horizonDays = options.horizonDays ?? 7
    var limit = options.limit ?? 4
    var analyze = options.analyze ?? ConsumptionAnalyzer.analyze
    var result = []

    histories.forEach(function (history, key) {
      var quantity = quantityByKey.get(key)
      if (!(quantity > 0)) return
      var stats = analyze(history, now, quantity)
      if (stats.daysLeft === null || stats.daysLeft > horizonDays) return
      result.push({
        key: key,
        title: history.title,
        templateTitle: history.templateTitle,
        daysLeft: stats.daysLeft,
        runOutAt: stats.runOutAt
      })
    })

    return result
      .sort(function (a, b) { return a.daysLeft - b.daysLeft })
      .slice(0, limit)
  }

  /** Spending of the current Jalali month compared with the previous one. */
  static monthSpending(histories, prices, now = Date.now()) {
    var months = MonthlyCostAnalyzer.analyze(histories, function (key, timestamp) {
      return ItemPriceRepository.resolvePrice(prices[key], timestamp)
    })
    var currentIndex = JalaliDate.monthIndex(now)
    var current = months.find(function (month) { return month.monthIndex === currentIndex }) ?? null
    var previous = months.find(function (month) { return month.monthIndex === currentIndex - 1 }) ?? null
    var previousTotal = previous ? previous.total : 0
    var total = current ? current.total : 0

    return {
      label: JalaliDate.monthName(currentIndex),
      total: total,
      purchaseCount: current ? current.purchaseCount : 0,
      unpricedCount: current ? current.unpricedCount : 0,
      previousTotal: previousTotal,
      changePercent: previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null,
      hasAnyPrice: Object.keys(prices).length > 0
    }
  }

  /** Lists with the lowest stock progress (excluding fully stocked ones). */
  static laggingLists(templates, limit = 3) {
    return templates
      .filter(function (template) { return template.overallProgress < 100 })
      .sort(function (a, b) { return a.overallProgress - b.overallProgress })
      .slice(0, limit)
  }

  static quantityByKey(templates, buildKey) {
    var map = new Map()
    templates.forEach(function (template) {
      template.categories.forEach(function (category) {
        category.items.forEach(function (item) {
          map.set(buildKey(template.id, category.id, item.id), item.quantity)
        })
      })
    })
    return map
  }
}
