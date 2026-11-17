import { storageService } from '../StorageService'
import { normalizePersianText } from './itemMatcher'

const STORAGE_KEY = 'smart_buy_standard_history_v1'
const MAX_HISTORY = 100

export class StandardHistoryRepository {
  constructor(storage = storageService) {
    this.storage = storage
  }

  getAll() {
    var raw = this.storage.get(STORAGE_KEY, [])
    return Array.isArray(raw) ? raw : []
  }

  add(record) {
    if (!record || !record.licenseNumber) return null

    var current = this.getAll()
    var id = record.id || `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    var entry = {
      id,
      licenseNumber: String(record.licenseNumber).trim(),
      licenseType: record.licenseType || '',
      province: record.province || '',
      manufacturer: record.manufacturer || '',
      product: record.product || '',
      brand: record.brand || '',
      expiryDate: record.expiryDate || '',
      status: record.status || 'valid', // 'valid' | 'invalid' | 'unknown'
      statusText: record.statusText || '',
      reportUrl: record.reportUrl || '',
      timestamp: record.timestamp || new Date().toISOString()
    }

    // Prepend and dedup by licenseNumber
    var filtered = current.filter((item) => item.licenseNumber !== entry.licenseNumber)
    filtered.unshift(entry)

    if (filtered.length > MAX_HISTORY) {
      filtered = filtered.slice(0, MAX_HISTORY)
    }

    this.storage.set(STORAGE_KEY, filtered)
    return entry
  }

  remove(id) {
    var current = this.getAll()
    var filtered = current.filter((item) => item.id !== id)
    this.storage.set(STORAGE_KEY, filtered)
  }

  clear() {
    this.storage.set(STORAGE_KEY, [])
  }

  filter(query = '', statusFilter = 'all') {
    var all = this.getAll()
    var normQuery = normalizePersianText(query || '').toLowerCase()

    return all.filter((item) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'valid' && item.status !== 'valid') return false
        if (statusFilter === 'invalid' && item.status === 'valid') return false
      }

      if (!normQuery) return true

      var searchCorpus = [
        item.licenseNumber,
        item.manufacturer,
        item.product,
        item.brand,
        item.province,
        item.statusText
      ]
        .filter(Boolean)
        .map((text) => normalizePersianText(text).toLowerCase())
        .join(' ')

      return searchCorpus.includes(normQuery)
    })
  }
}

export const standardHistoryRepository = new StandardHistoryRepository()
