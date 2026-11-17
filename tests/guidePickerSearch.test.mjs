import test from 'node:test'
import assert from 'node:assert/strict'
import { searchGuidesForPicker } from '../src/services/GuidePickerSearch.js'

var groups = [
  { id: 'staples', name: 'مواد پایه', icon: '🛒', guides: [
    { id: 'rice', title: 'برنج', keywords: ['برنج ایرانی', 'پلو'] },
    { id: 'oil', title: 'روغن', keywords: ['روغن مایع', 'روغن سرخ کردنی'] },
    { id: 'olive-oil', title: 'روغن زیتون', keywords: ['زیتون'] }
  ] },
  { id: 'dairy', name: 'لبنیات', icon: '🥛', guides: [
    { id: 'milk', title: 'شیر', keywords: ['شیر پاستوریزه'] },
    { id: 'rice-pudding', title: 'شیربرنج', keywords: ['برنج'] }
  ] }
]

test('empty query returns everything, grouped', () => {
  var result = searchGuidesForPicker(groups, '')
  assert.equal(result.length, 2)
  assert.equal(result[0].guides.length, 3)
})

test('matches title and keywords, ignoring Arabic letter variants and ZWNJ', () => {
  var ids = (query) => searchGuidesForPicker(groups, query).flatMap((entry) => entry.guides.map((guide) => guide.id))
  assert.deepEqual(ids('پلو'), ['rice'])
  assert.deepEqual(ids('زيتون'), ['olive-oil'])
  assert.deepEqual(ids('سرخ کردنی'), ['oil'])
})

test('every typed word must match, in any order', () => {
  var ids = searchGuidesForPicker(groups, 'زیتون روغن').flatMap((entry) => entry.guides.map((guide) => guide.id))
  assert.deepEqual(ids, ['olive-oil'])
})

test('title matches are ranked before keyword-only matches inside a group', () => {
  var dairy = searchGuidesForPicker(groups, 'برنج').find((entry) => entry.group.id === 'dairy')
  assert.deepEqual(dairy.guides.map((guide) => guide.id), ['rice-pudding'])
  var staples = searchGuidesForPicker(groups, 'روغن').find((entry) => entry.group.id === 'staples')
  assert.deepEqual(staples.guides.map((guide) => guide.id), ['oil', 'olive-oil'])
})

test('excluded guide is hidden and empty groups are dropped', () => {
  var result = searchGuidesForPicker(groups, 'شیر', 'milk')
  assert.deepEqual(result.flatMap((entry) => entry.guides.map((guide) => guide.id)), ['rice-pudding'])
  assert.equal(searchGuidesForPicker(groups, 'نامعتبر').length, 0)
})
