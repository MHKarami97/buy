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

  /**
   * Decodes numeric and named HTML entities from IranCode HTML responses
   * @param {string} str
   * @returns {string}
   */
  static decodeHtmlEntities(str) {
    if (!str) return ''
    return String(str)
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&zwnj;/g, '\u200C')
      .trim()
  }

  /**
   * Parses official IranCode product page HTML (https://irancode.ir/01/<barcode>)
   * @param {string} html
   * @param {string} [fallbackBarcode='']
   * @returns {{ ok: boolean, data?: object, error?: string }}
   */
  static parseIranCodeHtml(html, fallbackBarcode = '') {
    if (!html || typeof html !== 'string') {
      return { ok: false, error: 'محتوای صفحه دریافت نشد' }
    }

    var extractField = (labelPattern) => {
      var re = new RegExp(
        '<span class="[^"]*text-muted[^"]*">' + labelPattern + '\\s*</span>\\s*<span[^>]*>([^<]*)</span>',
        'i'
      )
      var m = html.match(re)
      return m ? this.decodeHtmlEntities(m[1]) : ''
    }

    var member = extractField('عضو:')
    var labelDescription = extractField('شرح برچسب:')
    var brand = extractField('نام برند:')
    var functionalName = extractField('نام عملیاتی:')
    var gpc = extractField('ساختار GPC:')
    var breakTitle = extractField('بریک:')
    var breakCode = extractField('کد بریک:')
    var iranCode = extractField('ایرانکد:')
    var country = extractField('کشور سازنده:')
    var gtin = extractField('GTIN Code:') || fallbackBarcode

    // If at least one informative property is found
    if (labelDescription || brand || member || breakTitle) {
      return {
        ok: true,
        data: {
          member,
          labelDescription,
          brand,
          functionalName,
          gpc,
          breakTitle,
          breakCode,
          iranCode,
          country: country || 'ایران',
          gtin
        }
      }
    }

    return {
      ok: false,
      error: 'اطلاعات کالا در ساختار صفحه ایران‌کد یافت نشد'
    }
  }

  /**
   * Concurrently queries IranCode portal (https://irancode.ir/01/<barcode>).
   * Supports local dev proxy /api/irancode and direct endpoint, handling
   * timeouts and CORS limitations gracefully.
   *
   * @param {string} barcode
   * @param {object} [options]
   * @param {number} [options.timeoutMs=5000]
   * @returns {Promise<{ ok: boolean, status: string, data?: object, error?: string, errorMessage?: string, url: string, barcode: string }>}
   */
  static async fetchIranCodeDetails(barcode, options = {}) {
    var digits = normalizeBarcode(barcode)
    var directUrl = `https://irancode.ir/01/${digits}`

    if (!/^\d{8,14}$/.test(digits)) {
      return {
        ok: false,
        status: 'invalid_code',
        error: 'بارکد نامعتبر است',
        errorMessage: 'طول بارکد کالا باید بین ۸ تا ۱۴ رقم باشد.',
        url: directUrl,
        barcode: digits
      }
    }

    var timeoutMs = options.timeoutMs || 5000
    var controller = new AbortController()
    var timer = setTimeout(() => controller.abort(), timeoutMs)

    // In dev environment or environments where a proxy is configured,
    // trying `/api/irancode/01/...` bypasses browser CORS restrictions.
    var candidateUrls = []
    if (typeof window !== 'undefined' && window.location) {
      candidateUrls.push(`/api/irancode/01/${digits}`)
    }
    candidateUrls.push(directUrl)

    var lastError = null

    for (var targetUrl of candidateUrls) {
      try {
        var response = await fetch(targetUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml'
          },
          signal: controller.signal
        })

        if (response.ok) {
          clearTimeout(timer)
          var html = await response.text()
          var parsed = this.parseIranCodeHtml(html, digits)
          if (parsed.ok) {
            return {
              ok: true,
              status: 'success',
              data: parsed.data,
              url: directUrl,
              barcode: digits
            }
          }
          return {
            ok: false,
            status: 'not_found',
            error: 'دیتا دریافت نشد یا خطا خورد',
            errorMessage: 'این بارکد در مرکز ملی شماره‌گذاری کالا و خدمات ثبت نشده است.',
            url: directUrl,
            barcode: digits
          }
        } else if (response.status === 404) {
          clearTimeout(timer)
          return {
            ok: false,
            status: 'not_found',
            error: 'دیتا دریافت نشد یا خطا خورد',
            errorMessage: 'این بارکد در پایگاه داده ایران‌کد یافت نشد (کد ۴۰۴).',
            url: directUrl,
            barcode: digits
          }
        }
      } catch (err) {
        lastError = err
        // continue to next candidate if available
      }
    }

    clearTimeout(timer)

    return {
      ok: false,
      status: 'failed',
      error: 'دیتا دریافت نشد یا خطا خورد',
      errorMessage: 'امکان برقراری ارتباط با سامانه ایران‌کد در این مرورگر وجود ندارد یا پاسخی دریافت نشد.',
      details: lastError?.message,
      url: directUrl,
      barcode: digits
    }
  }
}
