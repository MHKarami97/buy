import test from 'node:test'
import assert from 'node:assert/strict'
import { ItemPriceRepository } from '../src/services/ItemPriceRepository.js'
import { MonthlyCostAnalyzer } from '../src/services/MonthlyCostAnalyzer.js'
import { GuideComparer } from '../src/services/GuideComparer.js'
import { ShoppingListDocumentBuilder } from '../src/services/export/ShoppingListDocumentBuilder.js'
import { ItemHistory, QuantityChange } from '../src/models/ItemHistory.js'

class FakeStorage {
  constructor() { this.map = new Map() }
  get(key, fallback = null) { return this.map.has(key) ? JSON.parse(this.map.get(key)) : fallback }
  set(key, value) { this.map.set(key, JSON.stringify(value)); return true }
}

var DAY = 24 * 60 * 60 * 1000

test('price resolves to the price valid at purchase time, with fallback to the earliest', () => {
  var entries = [[1000, 100], [2000, 150]]
  assert.equal(ItemPriceRepository.resolvePrice(entries, 1500), 100)
  assert.equal(ItemPriceRepository.resolvePrice(entries, 2500), 150)
  assert.equal(ItemPriceRepository.resolvePrice(entries, 500), 100)
  assert.equal(ItemPriceRepository.resolvePrice([], 500), null)
})

test('repository ignores invalid and unchanged prices', () => {
  var repo = new ItemPriceRepository(new FakeStorage())
  assert.equal(repo.record('a', 0), false)
  assert.equal(repo.record('a', 'abc'), false)
  assert.equal(repo.record('a', 1200, 10), true)
  assert.equal(repo.record('a', 1200, 20), false)
  assert.equal(repo.getCurrent('a'), 1200)
})

test('monthly cost counts only restocks and separates unpriced purchases', () => {
  var t = Date.UTC(2026, 0, 15)
  var priced = new ItemHistory('k1', { title: 'برنج', templateTitle: 'پایه' }, [
    new QuantityChange(t, 0, 2),
    new QuantityChange(t + DAY, 2, 0),
    new QuantityChange(t + 2 * DAY, 0, 1)
  ])
  var unpriced = new ItemHistory('k2', { title: 'شکر', templateTitle: 'پایه' }, [new QuantityChange(t, 0, 1)])
  var months = MonthlyCostAnalyzer.analyze(new Map([['k1', priced], ['k2', unpriced]]), (key) => (key === 'k1' ? 1000 : null))
  assert.equal(months.length, 1)
  assert.equal(months[0].total, 3000)
  assert.equal(months[0].purchaseCount, 3)
  assert.equal(months[0].unpricedCount, 1)
  assert.equal(months[0].items[0].title, 'برنج')
  assert.equal(MonthlyCostAnalyzer.byTemplate(months[0])[0].share, 100)
})

test('months without purchases are filled with zeros', () => {
  var h = new ItemHistory('k', { title: 'x' }, [new QuantityChange(Date.UTC(2026, 0, 1), 0, 1), new QuantityChange(Date.UTC(2026, 3, 1), 0, 1)])
  var months = MonthlyCostAnalyzer.analyze(new Map([['k', h]]), () => 10)
  assert.ok(months.length >= 4)
  assert.equal(months.some((m) => m.total === 0 && m.purchaseCount === 0), true)
})

test('guide comparer splits shared and unique ingredients and skips empty kinds', () => {
  var make = (id, kinds) => ({ id, sections: kinds.map(([kind, points]) => ({ kind, title: kind, points })) })
  var a = make('a', [['check', ['x']], ['storage', ['s']]])
  var b = make('b', [['check', ['y']], ['avoid', ['z']]])
  var ing = { 1: { id: 'i1' }, 2: { id: 'i2' }, 3: { id: 'i3' } }
  var result = GuideComparer.compare(a, b, (g) => (g.id === 'a' ? [ing[1], ing[2]] : [ing[2], ing[3]]))
  assert.deepEqual(result.rows.map((r) => r.kind), ['check', 'avoid', 'storage'])
  assert.deepEqual(result.ingredients.shared.map((i) => i.id), ['i2'])
  assert.deepEqual(result.ingredients.onlyFirst.map((i) => i.id), ['i1'])
  assert.deepEqual(result.ingredients.onlySecond.map((i) => i.id), ['i3'])
})

test('document builder escapes html and honours options', () => {
  var guide = { id: 'g', title: 'G<b>', icon: '📖', summary: 's', sections: [{ title: 'T', points: ['p&q'] }] }
  var ingredient = { id: 'i', name: 'ماده', verdict: 'avoid', whatIsIt: 'w', role: 'r', verdictNote: 'n' }
  var builder = new ShoppingListDocumentBuilder({
    findGuide: () => guide,
    ingredientsOfItem: () => [ingredient],
    isAvoided: (id) => id === 'i',
    verdictLabels: { avoid: 'پرهیز' }
  })
  var groups = [{ template: { icon: '🛒', title: 'لیست' }, entries: [{ item: { title: '<script>' }, category: { name: 'c' }, isLow: true }] }]
  var full = builder.build({ title: 't', generatedAtText: 'now', groups, options: { includeGuides: true, includeIngredients: true } })
  assert.ok(!full.includes('<script>'))
  assert.ok(full.includes('&lt;script&gt;'))
  assert.ok(full.includes('p&amp;q'))
  assert.ok(full.includes('در فهرست پرهیز شما'))
  var plain = builder.build({ title: 't', generatedAtText: 'now', groups, options: { includeGuides: false, includeIngredients: false } })
  assert.ok(!plain.includes('راهنمای خرید</h2>'))
  assert.ok(!plain.includes('مواد تشکیل‌دهنده‌ی مرتبط'))
})
