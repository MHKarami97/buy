/**
 * Service for Health License (سازمان غذا و دارو - IFDA / سیب سلامت) inquiry.
 * Supports normalization, HTML / JSON-LD parsing from cerfood.ir,
 * and graceful fallback when offline or CORS-restricted.
 */

export function normalizeIfdaCode(input) {
  if (!input) return { valid: false, normalized: '', raw: '' }
  var raw = String(input).trim()
  var ascii = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\s\t\r\n]+/g, '')
    .replace(/[\\_\-؍،|]/g, '/')

  var m = ascii.match(/^(\d{1,4})\/(\d{2,8})$/)
  if (!m) {
    return { valid: false, normalized: ascii, raw, part1: '', part2: '' }
  }

  return {
    valid: true,
    normalized: `${m[1]}/${m[2]}`,
    part1: m[1],
    part2: m[2],
    raw
  }
}

export class IfdaLookupService {
  /**
   * Normalizes an IFDA / health license string (e.g. "۳۲/۱۱۱۵۹" -> "32/11159")
   */
  static normalizeCode(input) {
    return normalizeIfdaCode(input)
  }

  /**
   * Decodes numeric and named HTML entities
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
      .replace(/&laquo;|&#xAB;/g, '«')
      .replace(/&raquo;|&#xBB;/g, '»')
      .replace(/&middot;|&#xB7;/g, '·')
      .replace(/&zwnj;/g, '\u200C')
      .trim()
  }

  /**
   * Parses official cerfood.ir product page HTML
   * @param {string} html
   * @param {string} code
   * @returns {{ ok: boolean, data?: object, error?: string }}
   */
  static parseCerfoodHtml(html, code = '') {
    if (!html || typeof html !== 'string') {
      return { ok: false, error: 'محتوای صفحه دریافت نشد' }
    }

    var normalizedCode = this.normalizeCode(code).normalized || code

    // 1. Try parsing JSON-LD Schema Product
    var jsonMatches = html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)
    for (var match of jsonMatches) {
      try {
        var obj = JSON.parse(match[1])
        if (obj && (obj['@type'] === 'Product' || obj.type === 'Product')) {
          var licenseStatus = ''
          var issueDate = ''
          var expiryDate = ''

          if (Array.isArray(obj.additionalProperty)) {
            for (var prop of obj.additionalProperty) {
              if (prop.name === 'وضعیت پروانه') licenseStatus = prop.value
              if (prop.name === 'تاریخ صدور') issueDate = prop.value
              if (prop.name === 'تاریخ انقضا') expiryDate = prop.value
            }
          }

          return {
            ok: true,
            data: {
              code: normalizedCode,
              name: obj.name || '',
              brand: obj.brand?.name || '',
              manufacturer: obj.manufacturer?.name || '',
              address: obj.manufacturer?.address?.streetAddress || '',
              telephone: obj.manufacturer?.telephone || '',
              image: obj.image || null,
              licenseStatus: licenseStatus || 'ثبت‌شده در سامانه',
              issueDate: issueDate || '',
              expiryDate: expiryDate || '',
              source: 'cerfood.ir'
            }
          }
        }
      } catch {
        // continue
      }
    }

    // 2. Fallback: Parse from meta description or HTML structure
    var metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    if (metaDescMatch) {
      var metaContent = this.decodeHtmlEntities(metaDescMatch[1])
      // Example: «دستمال کاغذی» · از تکلان پاک · برند تکلان پاک · وضعیت پروانه: عدم اعتبار · شماره پروانه 32/11159
      var nameMatch = metaContent.match(/«([^»]+)»/)
      var brandMatch = metaContent.match(/برند\s+([^·]+)/)
      var manuMatch = metaContent.match(/از\s+([^·]+)/)
      var statusMatch = metaContent.match(/وضعیت پروانه:\s*([^·]+)/)

      if (nameMatch || brandMatch || manuMatch) {
        return {
          ok: true,
          data: {
            code: normalizedCode,
            name: nameMatch ? nameMatch[1].trim() : '',
            brand: brandMatch ? brandMatch[1].trim() : '',
            manufacturer: manuMatch ? manuMatch[1].trim() : '',
            address: '',
            telephone: '',
            image: null,
            licenseStatus: statusMatch ? statusMatch[1].trim() : 'ثبت‌شده در سامانه',
            issueDate: '',
            expiryDate: '',
            source: 'cerfood.ir'
          }
        }
      }
    }

    // 3. Fallback: Parse H1 and Title
    var h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match && !html.includes('صفحه مورد نظر یافت نشد')) {
      var titleText = this.decodeHtmlEntities(h1Match[1])
      return {
        ok: true,
        data: {
          code: normalizedCode,
          name: titleText,
          brand: '',
          manufacturer: '',
          address: '',
          telephone: '',
          image: null,
          licenseStatus: 'ثبت‌شده در سامانه',
          issueDate: '',
          expiryDate: '',
          source: 'cerfood.ir'
        }
      }
    }

    return {
      ok: false,
      error: 'اطلاعات پروانه در ساختار صفحه سرفود یافت نشد یا معتبر نیست'
    }
  }

  /**
   * Queries cerfood.ir for health license details
   * @param {string} code
   * @param {object} [options]
   * @param {number} [options.timeoutMs=5000]
   * @returns {Promise<{ ok: boolean, status: string, data?: object, error?: string, errorMessage?: string, url: string, code: string }>}
   */
  static async fetchIfdaDetails(code, options = {}) {
    var norm = this.normalizeCode(code)
    var directUrl = norm.valid ? `https://cerfood.ir/p/${norm.part1}/${norm.part2}` : `https://cerfood.ir/p/${code}`

    if (!norm.valid) {
      return {
        ok: false,
        status: 'invalid_code',
        error: 'فرمت شماره پروانه نامعتبر است',
        errorMessage: 'الگوی شماره پروانه بهداشتی ساخت باید مانند ۳۲/۱۱۱۵۹ باشد.',
        url: directUrl,
        code: String(code || '')
      }
    }

    var timeoutMs = options.timeoutMs || 5000
    var controller = new AbortController()
    var timer = setTimeout(() => controller.abort(), timeoutMs)

    var candidateUrls = []
    if (typeof window !== 'undefined' && window.location) {
      candidateUrls.push(`/api/cerfood/p/${norm.part1}/${norm.part2}`)
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
          var parsed = this.parseCerfoodHtml(html, norm.normalized)
          if (parsed.ok) {
            return {
              ok: true,
              status: 'success',
              data: parsed.data,
              url: directUrl,
              code: norm.normalized
            }
          }
          return {
            ok: false,
            status: 'not_found',
            error: 'دیتا دریافت نشد یا خطا خورد',
            errorMessage: 'این پروانه در پایگاه داده سرفود ثبت نشده یا اطلاعات آن ناقص است.',
            url: directUrl,
            code: norm.normalized
          }
        } else if (response.status === 404) {
          clearTimeout(timer)
          return {
            ok: false,
            status: 'not_found',
            error: 'دیتا دریافت نشد یا خطا خورد',
            errorMessage: 'پروانه‌ای با این شماره در سامانه سرفود ثبت نشده است (کد ۴۰۴).',
            url: directUrl,
            code: norm.normalized
          }
        }
      } catch (err) {
        lastError = err
      }
    }

    clearTimeout(timer)

    return {
      ok: false,
      status: 'failed',
      error: 'دیتا دریافت نشد یا خطا خورد',
      errorMessage: 'امکان برقراری ارتباط با سامانه سرفود در این مرورگر وجود ندارد یا پاسخی دریافت نشد.',
      details: lastError?.message,
      url: directUrl,
      code: norm.normalized
    }
  }
}
