import test from 'node:test'
import assert from 'node:assert/strict'
import { ChecklistItem } from '../src/models/ChecklistItem.js'
import { FilterStrategies, applyItemStrategy } from '../src/services/ItemFilterStrategies.js'

test('ChecklistItem defaults isEssential to true and toggles it', () => {
  var item = new ChecklistItem({ id: 'item-1', title: 'برنج' })
  assert.equal(item.isEssential, true)

  item.toggleEssential()
  assert.equal(item.isEssential, false)

  item.toggleEssential()
  assert.equal(item.isEssential, true)
})

test('ChecklistItem serializes and deserializes isEssential', () => {
  var item = new ChecklistItem({ id: 'item-2', title: 'سس کاکائو', isEssential: false })
  var json = item.toJSON()
  assert.equal(json.isEssential, false)

  var restored = ChecklistItem.fromJSON(json)
  assert.equal(restored.isEssential, false)
})

test('FilterStrategies filters items by essential and nonEssential', () => {
  var items = [
    new ChecklistItem({ id: '1', title: 'برنج', isEssential: true }),
    new ChecklistItem({ id: '2', title: 'شکلات', isEssential: false }),
    new ChecklistItem({ id: '3', title: 'نان', isEssential: true }),
    new ChecklistItem({ id: '4', title: 'چیپس', isEssential: false })
  ]

  var essentials = applyItemStrategy(items, 'essential')
  assert.equal(essentials.length, 2)
  assert.deepEqual(essentials.map((i) => i.id), ['1', '3'])

  var nonEssentials = applyItemStrategy(items, 'nonEssential')
  assert.equal(nonEssentials.length, 2)
  assert.deepEqual(nonEssentials.map((i) => i.id), ['2', '4'])
})
