import { storageService } from '../StorageService.js'

var STORAGE_KEY = 'barcode-scan-history'
var MAX_HISTORY_ITEMS = 200

export class BarcodeHistoryRepository {
  constructor(storage = storageService) {
    this.storage = storage
  }

  getAll() {
    var raw = this.storage.get(STORAGE_KEY, [])
    if (!Array.isArray(raw)) return []
    return raw.sort((a, b) => (b.scannedAt || 0) - (a.scannedAt || 0))
  }

  saveAll(entries) {
    var capped = (entries || []).slice(0, MAX_HISTORY_ITEMS)
    return this.storage.set(STORAGE_KEY, capped)
  }

  add(entry) {
    var items = this.getAll()
    var newRecord = {
      id: entry.id || `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: entry.code || '',
      format: entry.format || 'unknown',
      type: entry.type || 'barcode',
      title: entry.title || entry.code || '',
      countryFa: entry.countryFa || null,
      countryFlag: entry.countryFlag || null,
      brand: entry.brand || null,
      category: entry.category || null,
      scannedAt: entry.scannedAt || Date.now(),
      ttac: entry.ttac || null
    }

    // Avoid duplicate if scanned within last 3 seconds
    if (items.length > 0 && items[0].code === newRecord.code && (Date.now() - items[0].scannedAt < 3000)) {
      return items[0]
    }

    items.unshift(newRecord)
    this.saveAll(items)
    return newRecord
  }

  remove(id) {
    var items = this.getAll().filter((item) => item.id !== id)
    this.saveAll(items)
    return items
  }

  clear() {
    this.saveAll([])
    return []
  }

  filter(query = '', typeFilter = 'all') {
    var q = query.trim().toLowerCase()
    return this.getAll().filter((item) => {
      // Type match
      if (typeFilter === 'barcode' && item.type !== 'barcode') return false
      if (typeFilter === 'qr' && item.type !== 'qr' && item.type !== 'url') return false
      if (typeFilter === 'iran' && !item.code.startsWith('626')) return false

      // Query match
      if (!q) return true
      return (
        item.code.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.countryFa && item.countryFa.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q))
      )
    })
  }
}

export var barcodeHistoryRepository = new BarcodeHistoryRepository()
