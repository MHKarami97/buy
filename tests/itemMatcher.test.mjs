import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizePersianText,
  extractTokens,
  suggestMatchingItems
} from '../src/services/barcode/itemMatcher.js'

test('normalizePersianText standardizes Persian characters and removes noise', () => {
  assert.equal(normalizePersianText('دستمال كاگذي يک‌بار مصرف'), 'دستمال کاگذی یک بار مصرف')
  assert.equal(normalizePersianText('آب‌معدنی (۱.۵ لیتری)'), 'اب معدنی ۱ ۵ لیتری')
})

test('extractTokens removes stop words and splits into keywords', () => {
  var tokens = extractTokens('دستمال کاغذی، 150 برگ دو لایه، 1 عدد، تکلان پاک')
  assert.ok(tokens.includes('دستمال'))
  assert.ok(tokens.includes('کاغذی'))
  assert.ok(tokens.includes('تکلان'))
  assert.ok(tokens.includes('پاک'))
  assert.equal(tokens.includes('عدد'), false) // stop word
  assert.equal(tokens.includes('برگ'), false) // stop word
})

test('suggestMatchingItems ranks the best matching checklist item first', () => {
  var mockAppItems = [
    { id: 'milk', title: 'شیر کم‌چرب', categoryName: 'لبنیات' },
    { id: 'tissues', title: 'دستمال کاغذی', categoryName: 'بهداشتی' },
    { id: 'toilet-paper', title: 'دستمال توالت', categoryName: 'بهداشتی' },
    { id: 'soap', title: 'صابون دستشویی', categoryName: 'شوینده' },
    { id: 'cheese', title: 'پنیر سفید', categoryName: 'لبنیات' }
  ]

  // Query from scanned Taklan product
  var results = suggestMatchingItems('دستمال کاغذی، 150 برگ دو لایه، 1 عدد، تکلان پاک', mockAppItems, 3)
  assert.ok(results.length >= 1)
  assert.equal(results[0].id, 'tissues') // top suggestion must be "دستمال کاغذی"
  assert.equal(results[1]?.id, 'toilet-paper') // second suggestion "دستمال توالت"
})
