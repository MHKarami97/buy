import { storageService } from '../StorageService.js'

var STORAGE_KEY = 'ifda-inquiry-history'
var MAX_HISTORY_ITEMS = 200

export class IfdaHistoryRepository {
  constructor(storage = storageService) {
    this.storage = storage
  }

  getAll() {
    var raw = this.storage.get(STORAGE_KEY, [])
    if (!Array.isArray(raw)) return []
    return raw.sort((a, b) => (b.inquiredAt || 0) - (a.inquiredAt || 0))
  }

  saveAll(entries) {
    var capped = (entries || []).slice(0, MAX_HISTORY_ITEMS)
    return this.storage.set(STORAGE_KEY, capped)
  }

  add(entry) {
    var items = this.getAll()
    var newRecord = {
      id: entry.id || `ifda-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: entry.code || '',
      title: entry.title || entry.name || '',
      brand: entry.brand || '',
      manufacturer: entry.manufacturer || '',
      licenseStatus: entry.licenseStatus || '',
      issueDate: entry.issueDate || '',
      expiryDate: entry.expiryDate || '',
      inquiredAt: entry.inquiredAt || Date.now(),
      url: entry.url || `https://cerfood.ir/p/${entry.code}`,
      mappedItemId: entry.mappedItemId || null,
      mappedItemTitle: entry.mappedItemTitle || null
    }

    // Avoid duplicates if inquired within last 3 seconds
    if (items.length > 0 && items[0].code === newRecord.code && (Date.now() - items[0].inquiredAt < 3000)) {
      return items[0]
    }

    items.unshift(newRecord)
    this.saveAll(items)
    return newRecord
  }

  update(id, updates) {
    var items = this.getAll()
    var idx = items.findIndex((item) => item.id === id)
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates }
      this.saveAll(items)
      return items[idx]
    }
    return null
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

  filter(query = '', statusFilter = 'all') {
    var q = query.trim().toLowerCase()
    return this.getAll().filter((item) => {
      if (statusFilter === 'valid' && !['دارای اعتبار', 'معتبر'].some((s) => item.licenseStatus?.includes(s))) {
        return false
      }
      if (statusFilter === 'invalid' && !['عدم اعتبار', 'فاقد اعتبار', 'منقضی'].some((s) => item.licenseStatus?.includes(s))) {
        return false
      }

      if (!q) return true
      return (
        item.code.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.manufacturer && item.manufacturer.toLowerCase().includes(q))
      )
    })
  }
}

export var ifdaHistoryRepository = new IfdaHistoryRepository()
