import { storageService } from './StorageService.js'

var PRICES_KEY = 'item-prices'
var MAX_ENTRIES_PER_ITEM = 60

/**
 * Repository Pattern: per-item unit price history, keyed exactly like
 * QuantityHistoryRepository (templateId::categoryId::itemId).
 * Each entry is a [timestamp, price] tuple so that old purchases keep the
 * price that was valid when they happened.
 *
 * Two ways to change a price:
 *  - record():      the price really changed. Appends a new entry; past
 *                   purchases keep the price that applied back then.
 *  - correctLast(): the last price was a typo. Replaces it in place (same
 *                   timestamp), so every report that used it is fixed too.
 */
export class ItemPriceRepository {
  constructor(storage = storageService) {
    this.storage = storage
  }

  static resolvePrice(entries, timestamp) {
    if (!Array.isArray(entries) || entries.length === 0) return null
    var chosen = null
    for (var entry of entries) {
      if (entry[0] > timestamp) break
      chosen = entry[1]
    }
    return chosen ?? entries[0][1]
  }

  static #normalize(price) {
    var value = Math.round(Number(price))
    return Number.isFinite(value) && value > 0 ? value : null
  }

  getAll() {
    var raw = this.storage.get(PRICES_KEY, {})
    return raw && typeof raw === 'object' ? raw : {}
  }

  getCurrent(key) {
    var entries = this.getAll()[key]
    return Array.isArray(entries) && entries.length ? entries[entries.length - 1][1] : null
  }

  priceAt(key, timestamp) {
    return ItemPriceRepository.resolvePrice(this.getAll()[key], timestamp)
  }

  record(key, price, timestamp = Date.now()) {
    var value = ItemPriceRepository.#normalize(price)
    if (value === null) return false
    var all = this.getAll()
    var entries = Array.isArray(all[key]) ? all[key] : []
    var last = entries[entries.length - 1]
    if (last && last[1] === value) return false
    entries.push([timestamp, value])
    if (entries.length > MAX_ENTRIES_PER_ITEM) entries.shift()
    all[key] = entries
    return this.storage.set(PRICES_KEY, all)
  }

  /**
   * Fixes a mistyped last price without creating a new history entry.
   * If the corrected value equals the entry before it, the two are merged.
   * Falls back to record() when the item has no price yet.
   */
  correctLast(key, price) {
    var value = ItemPriceRepository.#normalize(price)
    if (value === null) return false
    var all = this.getAll()
    var entries = Array.isArray(all[key]) ? all[key] : []
    if (entries.length === 0) return this.record(key, value)

    var lastIndex = entries.length - 1
    if (entries[lastIndex][1] === value) return false

    var previous = entries[lastIndex - 1]
    if (previous && previous[1] === value) {
      entries.pop()
    } else {
      entries[lastIndex] = [entries[lastIndex][0], value]
    }
    all[key] = entries
    return this.storage.set(PRICES_KEY, all)
  }
}

export var itemPriceRepository = new ItemPriceRepository()
