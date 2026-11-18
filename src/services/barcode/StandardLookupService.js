import { normalizePersianText } from './itemMatcher'

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function normalizeLicenseNumber(input) {
  if (!input) return ''
  var str = String(input).trim()

  for (var i = 0; i < 10; i++) {
    str = str.split(PERSIAN_DIGITS[i]).join(String(i))
    str = str.split(ARABIC_DIGITS[i]).join(String(i))
  }

  // Preserve leading 'G' or 'g' for gold licenses, strip all other punctuation and whitespace
  var isGold = /^g/i.test(str)
  var digits = str.replace(/[^0-9]/g, '')
  return isGold ? ('G' + digits) : digits
}

export function parseStandardReportHtml(html, defaultLicenseNo = '') {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'empty_response', errorMessage: 'پاسخی از سامانه استاندارد دریافت نشد.' }
  }

  if (/شماره پروانه کاربرد علامت استاندارد نامشخص است|موردی یافت نشد|اطلاعاتی یافت نشد/i.test(html)) {
    return { ok: false, error: 'not_found', errorMessage: 'پروانه‌ای با این شماره در سامانه استاندارد یافت نشد.' }
  }

  function clean(val) {
    if (!val) return ''
    var noHtml = val.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    return noHtml
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function extractByLabel(pattern) {
    var rx = new RegExp('<label[^>]*>[^<]*' + pattern + '[^<]*<\\/label>\\s*([^<\\r\\n]+)', 'i')
    var m = html.match(rx)
    if (m && clean(m[1])) return clean(m[1])

    var inlineRx = new RegExp(pattern + '[\\s\\t]*[:\\t]+[\\s\\t]*([^<\\r\\n]+)', 'i')
    var inlineM = html.match(inlineRx)
    if (inlineM && clean(inlineM[1])) return clean(inlineM[1])

    return ''
  }

  var manufacturer = extractByLabel('نام[\\sـ]*واحد')
  var province = extractByLabel('استان')
  var address = extractByLabel('آدرس[\\sـ]*کارخانه')

  var product = ''
  var model = ''
  var brand = ''
  var licenseNumber = defaultLicenseNo || ''
  var statusText = ''
  var expiryDate = ''
  var history = []

  var tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i)
  if (tableMatch) {
    var rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    var rowMatch
    while ((rowMatch = rowRegex.exec(tableMatch[1])) !== null) {
      var cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
      var cells = []
      var cellMatch
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(clean(cellMatch[1]))
      }

      if (cells.length >= 7) {
        if (/ردیف|رديف/i.test(cells[0]) || /فرآورده/i.test(cells[1]) || /شماره پروانه/i.test(cells[4])) {
          continue
        }
        if (!product && cells[1]) product = cells[1]
        if (!model && cells[2]) model = cells[2]
        if (!brand && cells[3]) brand = cells[3]
        if (cells[4]) licenseNumber = cells[4]
        if (!statusText && cells[5]) statusText = cells[5]
        if (!expiryDate && cells[6]) expiryDate = cells[6]

        if (cells[7] && cells[8]) {
          history.push({ status: cells[7], fromDate: cells[8] })
        }
      } else if (cells.length === 2 && cells[0] && cells[1]) {
        if (!/وضعیت/i.test(cells[0]) && !/تاریخ/i.test(cells[1])) {
          history.push({ status: cells[0], fromDate: cells[1] })
        }
      }
    }
  }

  if (!manufacturer && !product && !statusText) {
    var alertMatch = html.match(/alert\(['"]([^'"]+)['"]\)/)
    if (alertMatch) {
      return { ok: false, error: 'portal_error', errorMessage: alertMatch[1] }
    }
    return { ok: false, error: 'not_found', errorMessage: 'پروانه‌ای با این شماره در سامانه استاندارد یافت نشد.' }
  }

  var isSuspendedOrRevoked = /تعلیق|ابطال|منقضی|غیرفعال|غیر معتبر/i.test(statusText)
  var isValid = /معتبر/i.test(statusText) && !isSuspendedOrRevoked

  var reportUrl = licenseNumber
    ? `https://isom.inso.gov.ir/parvaneh/m_p_report.php?license_no=${licenseNumber}`
    : ''

  return {
    ok: true,
    status: isValid ? 'valid' : (isSuspendedOrRevoked ? 'invalid' : 'unknown'),
    data: {
      licenseNumber: licenseNumber || defaultLicenseNo,
      manufacturer,
      province,
      address,
      product,
      model,
      brand,
      statusText: statusText || 'معتبر',
      expiryDate,
      history,
      reportUrl
    }
  }
}

export function parseStandardHtml(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'empty_response', errorMessage: 'پاسخی از سامانه استاندارد دریافت نشد.' }
  }

  if (/کد امنیتی به درستی وارد نشده/i.test(html)) {
    return { ok: false, error: 'invalid_captcha', errorMessage: 'کد امنیتی به درستی وارد نشده است.' }
  }

  if (/اطلاعاتی یافت نشد|موردی یافت نشد|پروانه ای با این شماره|پروانه‌ای با این شماره/i.test(html)) {
    return { ok: false, error: 'not_found', errorMessage: 'پروانه‌ای با این شماره در سامانه استاندارد یافت نشد.' }
  }

  function clean(val) {
    if (!val) return ''
    var noHtml = val.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    return noHtml
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function extractByLabel(pattern) {
    var cellRegex = new RegExp('<td[^>]*>[^<]*' + pattern + '[^<]*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>', 'i')
    var cellMatch = html.match(cellRegex)
    if (cellMatch && clean(cellMatch[1])) return clean(cellMatch[1])

    var inlineRegex = new RegExp(pattern + '[\\s\\t]*[:\\t]+[\\s\\t]*([^<\\r\\n]+)', 'i')
    var inlineMatch = html.match(inlineRegex)
    if (inlineMatch && clean(inlineMatch[1])) return clean(inlineMatch[1])

    return ''
  }

  var licenseRaw = extractByLabel('شماره[\\sـ]*پروانه')
  var licenseType = /اجباری/i.test(licenseRaw) ? 'اجباری' : (/تشویقی/i.test(licenseRaw) ? 'تشویقی' : '')
  var licenseNumber = licenseRaw.replace(/اجباری|تشویقی/gi, '').trim()

  var province = extractByLabel('است[ـ\\s]*ان')
  var manufacturer = extractByLabel('واحد[\\sـ]*تولیدی')
  var product = extractByLabel('ف[ـ\\s]*رآورده')
  var brand = extractByLabel('علامت[\\sـ]*تجاری')
  var expiryDate = extractByLabel('تاری[ـ\\s]*خ[\\sـ]*اعتب[ـ\\s]*ار')
  var statusText = extractByLabel('آخرین[\\sـ]*وضعیت')

  var reportMatch = html.match(/m_p_report\.php\?l__n=([a-zA-Z0-9+=/]+)/i)
  var reportUrl = reportMatch ? ('https://isom.inso.gov.ir/parvaneh/m_p_report.php?l__n=' + reportMatch[1]) : ''

  if (!manufacturer && !product && !statusText) {
    var alertMatch = html.match(/alert\(['"]([^'"]+)['"]\)/)
    if (alertMatch) {
      return { ok: false, error: 'portal_error', errorMessage: alertMatch[1] }
    }
    return { ok: false, error: 'parse_error', errorMessage: 'ساختار پاسخ سامانه استاندارد قابل استخراج نبود.' }
  }

  var isSuspendedOrRevoked = /تعلیق|ابطال|منقضی|غیرفعال|غیر معتبر/i.test(statusText)
  var isValid = /معتبر/i.test(statusText) && !isSuspendedOrRevoked

  return {
    ok: true,
    status: isValid ? 'valid' : (isSuspendedOrRevoked ? 'invalid' : 'unknown'),
    data: {
      licenseNumber: licenseNumber || '',
      licenseType,
      province,
      manufacturer,
      product,
      brand,
      expiryDate,
      statusText: statusText || 'معتبر',
      reportUrl
    }
  }
}

export class StandardLookupService {
  constructor(proxyBaseUrl = '') {
    this.proxyBaseUrl = (proxyBaseUrl || '').replace(/\/+$/, '')
  }

  getCandidateBases() {
    var bases = []
    if (this.proxyBaseUrl) {
      bases.push(this.proxyBaseUrl.replace(/\/+$/, ''))
    }
    bases.push('/api')

    // If already running directly on the worker or if custom proxy provided, avoid redundant worker call
    var isAlreadyOnProxy = typeof window !== 'undefined' && window.location?.origin?.includes('smart-buy-proxy')
    if (!isAlreadyOnProxy && !this.proxyBaseUrl) {
      bases.push('https://smart-buy-proxy.mhkarami97.workers.dev/api')
    }
    return Array.from(new Set(bases))
  }

  async fetchReport(licenseNumber, timeoutMs = 8000) {
    var normNumber = normalizeLicenseNumber(licenseNumber)
    if (!normNumber) {
      return {
        ok: false,
        error: 'invalid_number',
        errorMessage: 'شماره پروانه وارد شده نامعتبر است.'
      }
    }

    var bases = this.getCandidateBases()
    var lastError = null

    for (var base of bases) {
      var targetUrl = `${base}/standard/report?license_no=${encodeURIComponent(normNumber)}`
      var controller = new AbortController()
      var timer = setTimeout(() => controller.abort(), timeoutMs)

      try {
        var response = await fetch(targetUrl, {
          method: 'GET',
          headers: { Accept: 'application/json, text/html' },
          signal: controller.signal
        })
        clearTimeout(timer)

        if (response.ok) {
          var contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            var data = await response.json()
            return data
          }
          var html = await response.text()
          return parseStandardReportHtml(html, normNumber)
        }
      } catch (err) {
        clearTimeout(timer)
        lastError = err
      }
    }

    return {
      ok: false,
      error: 'network_error',
      errorMessage: 'خطا در برقراری ارتباط با سامانه استاندارد.',
      details: lastError?.message
    }
  }

  async fetchCaptcha(timeoutMs = 3000) {
    var bases = this.getCandidateBases()
    var lastError = null

    for (var base of bases) {
      var targetUrl = `${base}/standard/captcha`
      var controller = new AbortController()
      var timer = setTimeout(() => controller.abort(), timeoutMs)

      try {
        var response = await fetch(targetUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        })
        clearTimeout(timer)

        if (response.ok) {
          var data = await response.json()
          if (data && data.ok && data.captchaImage && !data.captchaImage.startsWith('data:image/jpeg;base64,ZXJy')) {
            return {
              ok: true,
              sessionId: data.sessionId,
              captchaImage: data.captchaImage,
              usedBase: base
            }
          }
          if (data && !data.ok) {
            return {
              ok: false,
              error: data.error || 'captcha_failed',
              errorMessage: data.errorMessage || 'دریافت کد امنیتی از سامانه استاندارد انجام نشد.'
            }
          }
        } else if (response.status === 524 || response.status === 526 || response.status === 502) {
          // Worker returned gateway timeout or SSL 526 from inso.gov.ir; don't loop endlessly
          lastError = new Error(`HTTP ${response.status}`)
          break
        }
      } catch (err) {
        clearTimeout(timer)
        lastError = err
      }
    }

    return {
      ok: false,
      error: 'captcha_failed',
      errorMessage: 'سامانه پروانه استاندارد به دلیل محدودیت‌های شبکه دولتی/SSL از سرورهای خارج کشور در دسترس نیست.',
      details: lastError?.message
    }
  }

  async inquire({ licenseNumber, captcha, sessionId }, timeoutMs = 4000) {
    var normNumber = normalizeLicenseNumber(licenseNumber)
    if (!normNumber) {
      return {
        ok: false,
        error: 'invalid_number',
        errorMessage: 'شماره پروانه وارد شده نامعتبر است.'
      }
    }

    var normCaptcha = normalizeLicenseNumber(captcha)
    if (!normCaptcha || normCaptcha.length < 4) {
      return {
        ok: false,
        error: 'invalid_captcha',
        errorMessage: 'لطفاً کد امنیتی را به صورت صحیح وارد نمایید.'
      }
    }

    var bases = this.getCandidateBases()
    var lastError = null

    for (var base of bases) {
      var targetUrl = `${base}/standard/inquiry`
      var controller = new AbortController()
      var timer = setTimeout(() => controller.abort(), timeoutMs)

      try {
        var response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            licenseNumber: normNumber,
            captcha: normCaptcha,
            sessionId
          }),
          signal: controller.signal
        })
        clearTimeout(timer)

        if (response.ok) {
          var result = await response.json()
          return result
        } else if (response.status === 524 || response.status === 526 || response.status === 502) {
          lastError = new Error(`HTTP ${response.status}`)
          break
        }
      } catch (err) {
        clearTimeout(timer)
        lastError = err
      }
    }

    return {
      ok: false,
      error: 'network_error',
      errorMessage: 'خطا در برقراری ارتباط با سامانه استاندارد.',
      details: lastError?.message
    }
  }
}

export const standardLookupService = new StandardLookupService()
