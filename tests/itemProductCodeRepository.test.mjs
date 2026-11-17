import test from 'node:test'
import assert from 'node:assert/strict'
import { ItemProductCodeRepository } from '../src/services/barcode/ItemProductCodeRepository.js'

test('ItemProductCodeRepository saves, merges and retrieves mappings', () => {
  var fakeStorage = {
    data: {},
    get(k, fallback) { return this.data[k] ?? fallback },
    set(k, v) { this.data[k] = v; return true }
  }

  var repo = new ItemProductCodeRepository(fakeStorage)
  assert.equal(repo.getAll().length, 0)

  // Save barcode mapping for an item
  var entry1 = repo.saveMapping({
    itemId: 'tissues',
    itemTitle: 'دستمال کاغذی',
    templateId: 'kitchen-pantry',
    templateTitle: 'آشپزخانه و خواربار',
    categoryId: 'cleaning-paper',
    categoryName: 'شوینده و بهداشتی',
    barcode: '6262637600129',
    brand: 'تکلان پاک',
    productTitle: 'دستمال کاغذی، 150 برگ دو لایه، 1 عدد'
  })

  assert.ok(entry1)
  assert.equal(repo.hasCodesForItem('tissues'), true)
  assert.equal(repo.hasCodesForItem('unknown-item'), false)

  var item = repo.getForItem('tissues')
  assert.equal(item.barcode, '6262637600129')
  assert.equal(item.brand, 'تکلان پاک')

  // Later, user maps IFDA license code to the same item: fields should merge!
  var entry2 = repo.saveMapping({
    itemId: 'tissues',
    ifdaCode: '32/11159',
    standardCode: '1001517',
    licenseStatus: 'عدم اعتبار'
  })

  var updatedItem = repo.getForItem('tissues')
  assert.equal(updatedItem.barcode, '6262637600129') // preserved!
  assert.equal(updatedItem.ifdaCode, '32/11159')      // merged!
  assert.equal(updatedItem.standardCode, '1001517')  // merged!
  assert.equal(updatedItem.licenseStatus, 'عدم اعتبار')

  // Search and filter
  assert.equal(repo.filter('تکلان').length, 1)
  assert.equal(repo.filter('32/11159').length, 1)
  assert.equal(repo.filter('1001517').length, 1)
  assert.equal(repo.filter('', 'barcode').length, 1)
  assert.equal(repo.filter('', 'ifda').length, 1)
  assert.equal(repo.filter('', 'standard').length, 1)

  // Remove
  repo.remove(updatedItem.id)
  assert.equal(repo.getAll().length, 0)
  assert.equal(repo.hasCodesForItem('tissues'), false)
})
