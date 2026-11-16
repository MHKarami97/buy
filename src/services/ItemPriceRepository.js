import { storageService } from './StorageService.js'

var PRICES_KEY = 'item-prices'
var MAX_ENTRIES_PER_ITEM = 60

/**
 * Repository Pattern: per-item unit price history, keyed exactly like
 * QuantityHistoryRepository (templateId::categoryId::itemId).
 * Each entry is a [timestamp, price] tuple so that old purchases keep the
 * price that was valid when they happened.
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
    var value = Math.round(Number(price))
    if (!Number.isFinite(value) || value <= 0) return false
    var all = this.getAll()
    var entries = Array.isArray(all[key]) ? all[key] : []
    var last = entries[entries.length - 1]
    if (last && last[1] === value) return false
    entries.push([timestamp, value])
    if (entries.length > MAX_ENTRIES_PER_ITEM) entries.shift()
    all[key] = entries
    return this.storage.set(PRICES_KEY, all)
  }
}

export var itemPriceRepository = new ItemPriceRepository()
