import test from 'node:test'
import assert from 'node:assert/strict'
import { DashboardInsights } from '../src/services/DashboardInsights.js'

var fakeAnalyze = (history, now, quantity) => ({
  daysLeft: history.rate > 0 ? quantity / history.rate : null,
  runOutAt: now
})
var history = (title, rate) => ({ title, templateTitle: 'L', rate })

test('upcoming shortages keep only items running out soon, sorted by urgency', () => {
  var histories = new Map([
    ['a', history('A', 1)],
    ['b', history('B', 0.5)],
    ['c', history('C', 0.01)],
    ['d', history('D', 0)],
    ['e', history('E', 1)]
  ])
  var quantities = new Map([['a', 3], ['b', 1], ['c', 5], ['d', 2], ['e', 0]])
  var result = DashboardInsights.upcomingShortages(histories, quantities, { analyze: fakeAnalyze })
  assert.deepEqual(result.map((r) => r.title), ['B', 'A'])
})

test('upcoming shortages respect the limit', () => {
  var histories = new Map(Array.from({ length: 6 }, (_, i) => [`k${i}`, history(`T${i}`, 1)]))
  var quantities = new Map(Array.from({ length: 6 }, (_, i) => [`k${i}`, i + 1]))
  assert.equal(DashboardInsights.upcomingShortages(histories, quantities, { analyze: fakeAnalyze, limit: 2 }).length, 2)
})

test('lagging lists are sorted ascending and exclude complete ones', () => {
  var lists = [
    { id: 1, overallProgress: 80 },
    { id: 2, overallProgress: 100 },
    { id: 3, overallProgress: 20 },
    { id: 4, overallProgress: 50 }
  ]
  assert.deepEqual(DashboardInsights.laggingLists(lists, 2).map((l) => l.id), [3, 4])
})

test('quantityByKey flattens templates into a key map', () => {
  var templates = [{ id: 't', categories: [{ id: 'c', items: [{ id: 'i', quantity: 2 }] }] }]
  var map = DashboardInsights.quantityByKey(templates, (t, c, i) => `${t}::${c}::${i}`)
  assert.equal(map.get('t::c::i'), 2)
})
