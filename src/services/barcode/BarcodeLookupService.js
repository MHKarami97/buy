import { lookupGs1Country, lookupIranianCompany, parseTtacCode, normalizeBarcode } from './gs1CountryPrefixes.js'
import { defaultChecklistDefinitions } from '../../data/defaultChecklists.js'

/**
 * Service to enrich scanned barcodes and QR codes with metadata:
 * - GS1 Country of Origin & Flag
 * - Iranian Manufacturer & Category (for 626...)
 * - TTAC Pharmaceutical Traceability (for 2D health codes)
 * - Matching local application items
 * - Online product lookup (Open Food Facts - public, non-filtered)
 */
export class BarcodeLookupService {
  /**
   * Fast synchronous inspection (offline first)
   * @param {string} rawValue
   * @param {string} [format='unknown']
   */
  static inspect(rawValue, format = 'unknown') {
    var raw = String(rawValue || '').trim()
    var normalized = normalizeBarcode(raw)
    var isNumeric = /^\d{8,14}$/.test(normalized)

    var country = isNumeric ? lookupGs1Country(normalized) : null
    var iranianCompany = isNumeric ? lookupIranianCompany(normalized) : null
    var ttac = parseTtacCode(raw)

    var type = 'text'
    if (ttac && ttac.isTtac) {
      type = 'ttac'
    } else if (/^https?:\/\//i.test(raw)) {
      type = 'url'
    } else if (/^WIFI:/i.test(raw)) {
      type = 'wifi'
    } else if (isNumeric) {
      type = 'barcode'
    } else if (format.toLowerCase().includes('qr')) {
      type = 'qr'
    }

    var matchingLocalItem = this.findMatchingChecklistItem(raw, normalized)

    return {
      rawValue: raw,
      normalizedValue: normalized,
      format,
      type,
      country,
      iranianCompany,
      ttac,
      localItem: matchingLocalItem,
      title: matchingLocalItem?.title || iranianCompany?.name || (ttac ? 'برچسب اصالت سلامت (TTAC)' : (country ? `کالای ${country.countryFa}` : raw))
    }
  }

  /**
   * Finds matching item in the app's default checklists
   */
  static findMatchingChecklistItem(raw, normalized) {
    var query = raw.toLowerCase()
    for (var def of defaultChecklistDefinitions) {
      for (var cat of def.categories || []) {
        for (var item of cat.items || []) {
          if (item.id === query || item.title === raw) {
            return {
              id: item.id,
              title: item.title,
              note: item.note,
              templateTitle: def.title,
              templateId: def.id,
              categoryId: cat.id
            }
          }
        }
      }
    }
    return null
  }

  /**
   * Online product lookup from Open Food Facts API (non-filtered, free).
   * Safe with 2500ms timeout; returns null on error/timeout without throwing.
   * @param {string} barcode
   * @returns {Promise<{ title?: string, brand?: string, category?: string, imageUrl?: string } | null>}
   */
  static async fetchOnlineDetails(barcode) {
    var digits = normalizeBarcode(barcode)
    if (!/^\d{8,14}$/.test(digits)) return null

    var controller = new AbortController()
    var timer = setTimeout(() => controller.abort(), 2500)

    try {
      var url = `https://world.openfoodfacts.org/api/v2/product/${digits}.json?fields=product_name,product_name_fa,product_name_en,brands,categories,image_front_small_url`
      var response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      })
      clearTimeout(timer)

      if (!response.ok) return null
      var data = await response.json()
      if (data && data.status === 1 && data.product) {
        var p = data.product
        var name = p.product_name_fa || p.product_name || p.product_name_en || ''
        return {
          title: name.trim(),
          brand: (p.brands || '').trim(),
          category: (p.categories || '').split(',')[0]?.trim() || '',
          imageUrl: p.image_front_small_url || null
        }
      }
      return null
    } catch {
      clearTimeout(timer)
      return null
    }
  }
}
