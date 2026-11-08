import { JalaliDate } from './JalaliDate.js';

var DAY_MS = 24 * 60 * 60 * 1000;

function sum(values) {
  return values.reduce(function (total, value) { return total + value; }, 0);
}

function mean(values) {
  return values.length ? sum(values) / values.length : null;
}

function median(values) {
  if (!values.length) {
    return null;
  }
  var sorted = values.slice().sort(function (a, b) { return a - b; });
  var middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Pure domain service. Definitions:
 * - restock: an event where quantity increased (purchase)
 * - consumption: an event where quantity decreased
 * - refill interval: days between two consecutive restocks
 * - depletion time: days from a restock until quantity reached 0
 */
export class ConsumptionAnalyzer {
  static analyze(history, now = Date.now(), currentQuantity = null) {
    var events = history.events;
    if (!events.length) {
      return ConsumptionAnalyzer.empty();
    }

    var restocks = events.filter(function (event) { return event.isRestock; });
    var drops = events.filter(function (event) { return event.isConsumption; });
    var intervals = ConsumptionAnalyzer.refillIntervals(restocks);
    var intervalDays = intervals.map(function (interval) { return interval.days; });

    var totalBought = round2(sum(restocks.map(function (event) { return event.delta; })));
    var totalConsumed = round2(-sum(drops.map(function (event) { return event.delta; })));
    var spanDays = Math.max((now - events[0].t) / DAY_MS, 1);
    var dailyConsumption = totalConsumed / spanDays;

    var lastRestock = restocks[restocks.length - 1] ?? null;
    var medianInterval = median(intervalDays);
    var nextRestockAt = lastRestock && medianInterval !== null
      ? lastRestock.t + medianInterval * DAY_MS
      : null;

    var quantity = currentQuantity ?? events[events.length - 1].q;
    var daysLeft = quantity > 0 && dailyConsumption > 0 ? quantity / dailyConsumption : null;

    return {
      eventCount: events.length,
      restockCount: restocks.length,
      consumptionCount: drops.length,
      totalBought,
      totalConsumed,
      spanDays,
      dailyConsumption,
      intervals,
      averageIntervalDays: mean(intervalDays),
      medianIntervalDays: medianInterval,
      minIntervalDays: intervalDays.length ? Math.min.apply(null, intervalDays) : null,
      maxIntervalDays: intervalDays.length ? Math.max.apply(null, intervalDays) : null,
      lastIntervalDays: intervalDays.length ? intervalDays[intervalDays.length - 1] : null,
      averageDepletionDays: mean(ConsumptionAnalyzer.depletionDurations(events)),
      lastRestockAt: lastRestock ? lastRestock.t : null,
      nextRestockAt,
      daysLeft,
      runOutAt: daysLeft !== null ? now + daysLeft * DAY_MS : null
    };
  }

  static refillIntervals(restocks) {
    var intervals = [];
    for (var index = 1; index < restocks.length; index++) {
      intervals.push({
        from: restocks[index - 1].t,
        to: restocks[index].t,
        days: (restocks[index].t - restocks[index - 1].t) / DAY_MS
      });
    }
    return intervals;
  }

  static depletionDurations(events) {
    var durations = [];
    var restockAt = null;
    events.forEach(function (event) {
      if (event.isRestock) {
        restockAt = event.t;
      } else if (event.q === 0 && restockAt !== null) {
        durations.push((event.t - restockAt) / DAY_MS);
        restockAt = null;
      }
    });
    return durations;
  }

  /** Per Jalali month totals, gaps filled with zeros so the chart axis is continuous. */
  static monthlyTotals(histories) {
    var buckets = new Map();
    var list = Array.isArray(histories) ? histories : [histories];

    list.forEach(function (history) {
      history.events.forEach(function (event) {
        var index = JalaliDate.monthIndex(event.t);
        var bucket = buckets.get(index) ?? { bought: 0, consumed: 0, restocks: 0 };
        if (event.isRestock) {
          bucket.bought += event.delta;
          bucket.restocks += 1;
        } else {
          bucket.consumed -= event.delta;
        }
        buckets.set(index, bucket);
      });
    });

    if (!buckets.size) {
      return [];
    }
    var indexes = Array.from(buckets.keys());
    var first = Math.min.apply(null, indexes);
    var last = Math.max.apply(null, indexes);
    var result = [];
    for (var index = first; index <= last; index++) {
      var bucket = buckets.get(index) ?? { bought: 0, consumed: 0, restocks: 0 };
      result.push({
        monthIndex: index,
        label: JalaliDate.monthName(index),
        fullLabel: JalaliDate.monthLabel(index),
        bought: round2(bucket.bought),
        consumed: round2(bucket.consumed),
        restocks: bucket.restocks
      });
    }
    return result;
  }

  static empty() {
    return {
      eventCount: 0, restockCount: 0, consumptionCount: 0, totalBought: 0, totalConsumed: 0,
      spanDays: 0, dailyConsumption: 0, intervals: [], averageIntervalDays: null,
      medianIntervalDays: null, minIntervalDays: null, maxIntervalDays: null,
      lastIntervalDays: null, averageDepletionDays: null, lastRestockAt: null,
      nextRestockAt: null, daysLeft: null, runOutAt: null
    };
  }
}
