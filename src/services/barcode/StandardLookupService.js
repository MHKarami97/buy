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
    bases.push('https://smart-buy-proxy.mhkarami97.workers.dev/api')
    return bases
  }

  async fetchCaptcha(timeoutMs = 8000) {
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
        }
      } catch (err) {
        clearTimeout(timer)
        lastError = err
      }
    }

    return {
      ok: false,
      error: 'captcha_failed',
      errorMessage: 'دریافت کد امنیتی از سامانه استاندارد با خطا مواجه شد.',
      details: lastError?.message
    }
  }

  async inquire({ licenseNumber, captcha, sessionId }, timeoutMs = 12000) {
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
