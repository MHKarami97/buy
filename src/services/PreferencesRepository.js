import { storageService } from './StorageService'

const PREFERENCES_KEY = 'preferences'
const DEFAULT_EXPORT_OPTIONS = Object.freeze({
  includeLowStock: false,
  includeGuides: false,
  includeIngredients: false
})

export class PreferencesRepository {
  constructor(storage = storageService) {
    this.storage = storage
  }

  getShowLowStock(scope = 'main') {
    var preferences = this.readAll()
    return preferences.showLowStock?.[scope] === true
  }

  setShowLowStock(scope, isEnabled) {
    var preferences = this.readAll()
    preferences.showLowStock = { ...preferences.showLowStock, [scope]: Boolean(isEnabled) }
    return this.storage.set(PREFERENCES_KEY, preferences)
  }

  getOnlyAvoidedFilter(scope = 'main') {
    return this.readAll().onlyAvoidedFilter?.[scope] === true
  }

  setOnlyAvoidedFilter(scope, isEnabled) {
    var preferences = this.readAll()
    preferences.onlyAvoidedFilter = { ...preferences.onlyAvoidedFilter, [scope]: Boolean(isEnabled) }
    return this.storage.set(PREFERENCES_KEY, preferences)
  }

  getAvoidedIngredientIds() {
    var ids = this.readAll().avoidedIngredients
    return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []
  }

  setAvoidedIngredientIds(ids) {
    return this.#write('avoidedIngredients', Array.from(new Set(ids)))
  }

  getExportOptions() {
    var stored = this.readAll().exportOptions
    return { ...DEFAULT_EXPORT_OPTIONS, ...(stored && typeof stored === 'object' ? stored : {}) }
  }

  setExportOptions(options) {
    var sanitized = {}
    Object.keys(DEFAULT_EXPORT_OPTIONS).forEach((key) => {
      sanitized[key] = Boolean(options?.[key])
    })
    return this.#write('exportOptions', sanitized)
  }

  getLabelMode() {
    return this.readAll().labelMode === true
  }

  setLabelMode(isEnabled) {
    return this.#write('labelMode', Boolean(isEnabled))
  }

  readAll() {
    var stored = this.storage.get(PREFERENCES_KEY, {})
    return stored && typeof stored === 'object' ? stored : {}
  }

  #write(field, value) {
    var preferences = this.readAll()
    preferences[field] = value
    return this.storage.set(PREFERENCES_KEY, preferences)
  }
}

export const preferencesRepository = new PreferencesRepository()
