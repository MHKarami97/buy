import test from 'node:test'
import assert from 'node:assert/strict'
import { DefaultsReconciler } from '../src/services/DefaultsReconciler.js'

function makeCategory(id, itemIds) {
  return {
    id,
    name: 'x',
    icon: '',
    items: itemIds.map((itemId) => ({ id: itemId, title: itemId, note: '', isCustom: false })),
    findItem(itemId) {
      return this.items.find((item) => item.id === itemId) ?? null
    },
    addItem(item) {
      this.items.push(item)
    }
  }
}

function makeTemplate(version, itemIds) {
  var categories = [makeCategory('staples-food', itemIds)]
  return {
    sourceDefinitionId: 'staples',
    version,
    title: 'x',
    description: 'd',
    icon: 'i',
    categories,
    findCategory(id) {
      return categories.find((category) => category.id === id) ?? null
    }
  }
}

function makeDefinition(version, itemIds) {
  return {
    id: 'staples',
    version,
    title: 'x',
    description: 'd',
    icon: 'i',
    categories: [{ id: 'staples-food', name: 'x', icon: '', items: itemIds.map((id) => ({ id, title: id, note: '' })) }]
  }
}

test('signature changes when an item id is added, not when the version is untouched', () => {
  var before = DefaultsReconciler.signatureOf(makeDefinition(2, ['rice']))
  var after = DefaultsReconciler.signatureOf(makeDefinition(2, ['rice', 'cooking-oil']))
  assert.notEqual(before, after)
  assert.equal(before, DefaultsReconciler.signatureOf(makeDefinition(2, ['rice'])))
})

test('new item is merged even though the definition version was NOT bumped', () => {
  var template = makeTemplate(2, ['rice'])
  var definition = makeDefinition(2, ['rice', 'cooking-oil'])

  var legacy = DefaultsReconciler.reconcileAll([template], [definition], [], {})
  assert.equal(legacy.changed, true)
  assert.ok(template.categories[0].findItem('cooking-oil'))
})

test('without a signature change nothing is merged, so removed items stay removed', () => {
  var definition = makeDefinition(2, ['rice', 'cooking-oil'])
  var signatures = { staples: DefaultsReconciler.signatureOf(definition) }
  var template = makeTemplate(2, ['rice'])

  var outcome = DefaultsReconciler.reconcileAll([template], [definition], [], signatures)
  assert.equal(outcome.changed, false)
  assert.equal(template.categories[0].findItem('cooking-oil'), null)
})

test('reconcile is idempotent and keeps the stored signature', () => {
  var template = makeTemplate(2, ['rice'])
  var definition = makeDefinition(2, ['rice', 'cooking-oil'])
  var first = DefaultsReconciler.reconcileAll([template], [definition], [], {})
  var second = DefaultsReconciler.reconcileAll(first.templates, [definition], [], first.signatures)
  assert.equal(second.changed, false)
  assert.equal(template.categories[0].items.length, 2)
  assert.deepEqual(second.signatures, first.signatures)
})

test('version bump still works without signatures (backward compatible)', () => {
  var template = makeTemplate(1, ['rice'])
  var definition = makeDefinition(2, ['rice', 'cooking-oil'])
  assert.equal(DefaultsReconciler.reconcile(template, definition), true)
  assert.equal(template.version, 2)
})

test('syncLabels renames default items and refreshes notes, even without a version bump', () => {
  var template = makeTemplate(2, ['cooking-oil'])
  template.categories[0].items[0].title = 'روغن مایع'
  var definition = makeDefinition(2, ['cooking-oil'])
  definition.categories[0].items[0].title = 'روغن سرخ‌کردنی'
  definition.categories[0].items[0].note = 'برای سرخ کردن'

  var signatures = { staples: DefaultsReconciler.signatureOf(definition) }
  var outcome = DefaultsReconciler.reconcileAll([template], [definition], [], signatures)

  var item = template.categories[0].findItem('cooking-oil')
  assert.equal(item.title, 'روغن سرخ‌کردنی')
  assert.equal(item.note, 'برای سرخ کردن')
  assert.equal(outcome.changed, true)
})

test('syncLabels never touches custom items and does not change quantities or flags', () => {
  var template = makeTemplate(2, ['rice'])
  var item = template.categories[0].items[0]
  item.isCustom = true
  item.title = 'برنج من'
  item.quantity = 3
  item.isHidden = true
  var definition = makeDefinition(2, ['rice'])
  definition.categories[0].items[0].title = 'برنج'

  assert.equal(DefaultsReconciler.syncLabels(template, definition), false)
  assert.equal(item.title, 'برنج من')
  assert.equal(item.quantity, 3)
  assert.equal(item.isHidden, true)
})

test('syncLabels updates template and category labels and is idempotent', () => {
  var template = makeTemplate(2, ['rice'])
  var definition = makeDefinition(2, ['rice'])
  definition.title = 'مواد غذایی پایه'
  definition.categories[0].name = 'اقلام پایه'

  assert.equal(DefaultsReconciler.syncLabels(template, definition), true)
  assert.equal(template.title, 'مواد غذایی پایه')
  assert.equal(template.categories[0].name, 'اقلام پایه')
  assert.equal(DefaultsReconciler.syncLabels(template, definition), false)
})
