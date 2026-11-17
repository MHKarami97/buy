import test from 'node:test'
import assert from 'node:assert/strict'

globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} }
var { ItemPriceRepository } = await import('../src/services/ItemPriceRepository.js')

function makeRepository() {
  var data = {}
  return new ItemPriceRepository({
    get: (key, fallback) => data[key] ?? fallback,
    set: (key, value) => {
      data[key] = JSON.parse(JSON.stringify(value))
      return true
    }
  })
}

test('record appends and old purchases keep their historical price', () => {
  var repository = makeRepository()
  repository.record('k', 400000, 1000)
  repository.record('k', 500000, 2000)
  assert.equal(repository.priceAt('k', 1500), 400000)
  assert.equal(repository.priceAt('k', 2500), 500000)
  assert.equal(repository.getCurrent('k'), 500000)
})

test('correctLast replaces the typo in place and fixes reports that used it', () => {
  var repository = makeRepository()
  repository.record('k', 400000, 1000)
  repository.record('k', 5000000, 2000)
  assert.equal(repository.correctLast('k', 500000), true)
  assert.equal(repository.priceAt('k', 2500), 500000)
  assert.equal(repository.priceAt('k', 1500), 400000)
  assert.equal(repository.getAll().k.length, 2)
})

test('correctLast on the first price also fixes back-filled earlier purchases', () => {
  var repository = makeRepository()
  repository.record('k', 1000000, 5000)
  repository.correctLast('k', 100000)
  assert.equal(repository.priceAt('k', 1000), 100000)
})

test('correctLast merges with the previous entry when values become equal', () => {
  var repository = makeRepository()
  repository.record('k', 400000, 1000)
  repository.record('k', 450000, 2000)
  repository.correctLast('k', 400000)
  assert.equal(repository.getAll().k.length, 1)
  assert.equal(repository.getCurrent('k'), 400000)
})

test('correctLast ignores invalid or unchanged values and falls back to record when empty', () => {
  var repository = makeRepository()
  assert.equal(repository.correctLast('k', 0), false)
  assert.equal(repository.correctLast('k', 120000), true)
  assert.equal(repository.getCurrent('k'), 120000)
  assert.equal(repository.correctLast('k', 120000), false)
  assert.equal(repository.correctLast('k', 'abc'), false)
})
