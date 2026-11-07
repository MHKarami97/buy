import { storageService } from './StorageService'

const PREFERENCES_KEY = 'preferences'

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

  readAll() {
    var stored = this.storage.get(PREFERENCES_KEY, {})
    return stored && typeof stored === 'object' ? stored : {}
  }
}

export const preferencesRepository = new PreferencesRepository()
