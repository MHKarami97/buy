import { storageService } from '../StorageService.js'

var STORAGE_KEY = 'item-product-codes'
var MAX_MAPPINGS = 500

export class ItemProductCodeRepository {
  constructor(storage = storageService) {
    this.storage = storage
    this.listeners = new Set()
  }

  notifyChange() {
    for (var cb of this.listeners) {
      try {
        cb()
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('item-product-codes-changed'))
    }
  }

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getAll() {
    var raw = this.storage.get(STORAGE_KEY, [])
    if (!Array.isArray(raw)) return []
    return raw.sort((a, b) => (b.updatedAt || b.registeredAt || 0) - (a.updatedAt || a.registeredAt || 0))
  }

  saveAll(entries) {
    var capped = (entries || []).slice(0, MAX_MAPPINGS)
    var success = this.storage.set(STORAGE_KEY, capped)
    this.notifyChange()
    return success
  }

  getForItem(itemId) {
    if (!itemId) return null
    var id = String(itemId)
    var all = this.getAll()
    return all.find((rec) => String(rec.itemId) === id) || null
  }

  hasCodesForItem(itemId) {
    var record = this.getForItem(itemId)
    if (!record) return false
    return Boolean(record.barcode || record.ifdaCode || record.standardCode)
  }

  saveMapping(data) {
    if (!data || !data.itemId) return null

    var all = this.getAll()
    var existingIndex = all.findIndex((rec) => String(rec.itemId) === String(data.itemId))
    var now = Date.now()

    if (existingIndex !== -1) {
      var prev = all[existingIndex]
      all[existingIndex] = {
        ...prev,
        ...data,
        barcode: data.barcode !== undefined ? data.barcode : prev.barcode,
        ifdaCode: data.ifdaCode !== undefined ? data.ifdaCode : prev.ifdaCode,
        standardCode: data.standardCode !== undefined ? data.standardCode : prev.standardCode,
        brand: data.brand || prev.brand || '',
        productTitle: data.productTitle || prev.productTitle || '',
        manufacturer: data.manufacturer || prev.manufacturer || '',
        licenseStatus: data.licenseStatus || prev.licenseStatus || '',
        itemTitle: data.itemTitle || prev.itemTitle,
        templateId: data.templateId || prev.templateId,
        templateTitle: data.templateTitle || prev.templateTitle,
        categoryId: data.categoryId || prev.categoryId,
        categoryName: data.categoryName || prev.categoryName,
        updatedAt: now,
        registeredAt: prev.registeredAt || now
      }
      this.saveAll(all)
      return all[existingIndex]
    }

    var newEntry = {
      id: data.id || `ipc-${now}-${Math.random().toString(36).slice(2, 7)}`,
      itemId: String(data.itemId),
      itemTitle: data.itemTitle || '',
      templateId: data.templateId || '',
      templateTitle: data.templateTitle || '',
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || '',
      barcode: data.barcode || '',
      ifdaCode: data.ifdaCode || '',
      standardCode: data.standardCode || '',
      brand: data.brand || '',
      productTitle: data.productTitle || '',
      manufacturer: data.manufacturer || '',
      licenseStatus: data.licenseStatus || '',
      registeredAt: now,
      updatedAt: now,
      notes: data.notes || ''
    }

    all.unshift(newEntry)
    this.saveAll(all)
    return newEntry
  }

  remove(id) {
    var all = this.getAll().filter((rec) => rec.id !== id)
    this.saveAll(all)
    return all
  }

  removeByItemId(itemId) {
    var all = this.getAll().filter((rec) => String(rec.itemId) !== String(itemId))
    this.saveAll(all)
    return all
  }

  clear() {
    this.saveAll([])
    return []
  }

  filter(query = '', filterType = 'all') {
    var q = query.trim().toLowerCase()
    return this.getAll().filter((rec) => {
      // Type filters
      if (filterType === 'barcode' && !rec.barcode) return false
      if (filterType === 'ifda' && !rec.ifdaCode) return false
      if (filterType === 'standard' && !rec.standardCode) return false

      if (!q) return true
      return (
        rec.itemTitle?.toLowerCase().includes(q) ||
        rec.productTitle?.toLowerCase().includes(q) ||
        rec.brand?.toLowerCase().includes(q) ||
        rec.barcode?.toLowerCase().includes(q) ||
        rec.ifdaCode?.toLowerCase().includes(q) ||
        rec.standardCode?.toLowerCase().includes(q) ||
        rec.manufacturer?.toLowerCase().includes(q) ||
        rec.categoryName?.toLowerCase().includes(q)
      )
    })
  }
}

export var itemProductCodeRepository = new ItemProductCodeRepository()
