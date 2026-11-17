/**
 * Cloudflare Worker Proxy for Smart Buy (خرید هوشمند)
 * Bypasses CORS restrictions for Iranian portals:
 * - cerfood.ir (غذا و دارو)
 * - irancode.ir (ایران‌کد)
 * - isom.inso.gov.ir (پروانه استاندارد + کپچا)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '86400'
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    }
  })
}

function normalizePersianText(str) {
  if (!str) return ''
  return String(str)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseStandardHtml(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'empty_response', errorMessage: 'پاسخی از سامانه استاندارد دریافت نشد.' }
  }

  if (/کد امنیتی به درستی وارد نشده/i.test(html)) {
    return { ok: false, error: 'invalid_captcha', errorMessage: 'کد امنیتی به درستی وارد نشده است.' }
  }

  if (/اطلاعاتی یافت نشد|موردی یافت نشد|پروانه ای با این شماره/i.test(html)) {
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

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // 1. Cerfood Proxy: /api/cerfood/p/:part1/:part2
    if (path.startsWith('/api/cerfood/') || path.startsWith('/cerfood/')) {
      const subPath = path.replace(/^\/api\/cerfood/, '').replace(/^\/cerfood/, '')
      const targetUrl = 'https://cerfood.ir' + subPath
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        const body = await resp.text()
        return new Response(body, {
          status: resp.status,
          headers: {
            'Content-Type': resp.headers.get('content-type') || 'text/html; charset=utf-8',
            ...CORS_HEADERS
          }
        })
      } catch (err) {
        return jsonResponse({ ok: false, error: 'fetch_failed', details: err.message }, 502)
      }
    }

    // 2. IranCode Proxy: /api/irancode/01/:barcode
    if (path.startsWith('/api/irancode/') || path.startsWith('/irancode/')) {
      const subPath = path.replace(/^\/api\/irancode/, '').replace(/^\/irancode/, '')
      const targetUrl = 'https://irancode.ir' + subPath
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        const body = await resp.text()
        return new Response(body, {
          status: resp.status,
          headers: {
            'Content-Type': resp.headers.get('content-type') || 'text/html; charset=utf-8',
            ...CORS_HEADERS
          }
        })
      } catch (err) {
        return jsonResponse({ ok: false, error: 'fetch_failed', details: err.message }, 502)
      }
    }

    // 3. Standard Captcha: /api/standard/captcha
    if (path === '/api/standard/captcha' || path === '/standard/captcha') {
      const abortCtrl = new AbortController()
      const timer = setTimeout(() => abortCtrl.abort(), 3500)

      try {
        // Step 1: Handshake with ArvanCloud on HTTP port 80 (avoids SSL 526)
        const resp1 = await fetch('http://isom.inso.gov.ir/parvaneh/', {
          redirect: 'manual',
          signal: abortCtrl.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        })
        const setCookies1 = resp1.headers.getSetCookie ? resp1.headers.getSetCookie() : [resp1.headers.get('set-cookie')]
        const cookies1 = (setCookies1 || []).map((c) => (c || '').split(';')[0]).filter(Boolean)

        // Step 2: Request with ArvanCloud cookies to get PHP session
        const resp2 = await fetch('http://isom.inso.gov.ir/parvaneh/', {
          redirect: 'manual',
          signal: abortCtrl.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cookie': cookies1.join('; ')
          }
        })
        const setCookies2 = resp2.headers.getSetCookie ? resp2.headers.getSetCookie() : [resp2.headers.get('set-cookie')]
        const allCookies = [...cookies1, ...(setCookies2 || []).map((c) => (c || '').split(';')[0]).filter(Boolean)]

        // Step 3: Fetch captcha JPEG image
        const captchaResp = await fetch('http://isom.inso.gov.ir/standard/verif_img.php', {
          signal: abortCtrl.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'http://isom.inso.gov.ir/parvaneh/',
            'Cookie': allCookies.join('; ')
          }
        })
        clearTimeout(timer)

        if (!captchaResp.ok) {
          return jsonResponse({ ok: false, error: 'captcha_failed', errorMessage: `خطای سامانه استاندارد (${captchaResp.status})` }, 502)
        }

        const arrayBuffer = await captchaResp.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)

        // Validate that response is actually a JPEG image (starts with 0xFF 0xD8)
        if (uint8.length < 100 || uint8[0] !== 0xff || uint8[1] !== 0xd8) {
          return jsonResponse({ ok: false, error: 'invalid_image', errorMessage: 'تصویر کد امنیتی دریافت نشد.' }, 502)
        }

        let binary = ''
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i])
        }
        const base64 = btoa(binary)
        const dataUrl = `data:image/jpeg;base64,${base64}`

        const sessionToken = btoa(JSON.stringify(allCookies))

        return jsonResponse({
          ok: true,
          sessionId: sessionToken,
          captchaImage: dataUrl
        })
      } catch (err) {
        clearTimeout(timer)
        return jsonResponse({
          ok: false,
          error: 'portal_unreachable',
          errorMessage: 'سامانه پروانه استاندارد به دلیل محدودیت‌های گواهی امنیتی داخلی یا فایروال دولتی از خارج کشور در دسترس نیست.',
          details: err.message
        }, 502)
      }
    }

    // 4. Standard Inquiry: /api/standard/inquiry
    if (path === '/api/standard/inquiry' || path === '/standard/inquiry') {
      if (request.method !== 'POST') {
        return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405)
      }

      const abortCtrl = new AbortController()
      const timer = setTimeout(() => abortCtrl.abort(), 4000)

      try {
        const payload = await request.json()
        const { licenseNumber, captcha, sessionId } = payload

        if (!licenseNumber || !captcha) {
          clearTimeout(timer)
          return jsonResponse({ ok: false, error: 'missing_fields', errorMessage: 'شماره پروانه و کد امنیتی الزامی است.' }, 400)
        }

        let cookies = []
        if (sessionId) {
          try {
            cookies = JSON.parse(atob(sessionId))
          } catch {
            cookies = [`PHPSESSID=${sessionId}`]
          }
        }

        const formData = new URLSearchParams()
        formData.append('l__no', String(licenseNumber).trim())
        formData.append('captcha', String(captcha).trim())
        formData.append('proceed', 'نمایش')

        const postResp = await fetch('http://isom.inso.gov.ir/parvaneh/', {
          method: 'POST',
          signal: abortCtrl.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'http://isom.inso.gov.ir/parvaneh/',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies.join('; ')
          },
          body: formData.toString()
        })
        clearTimeout(timer)

        const html = await postResp.text()
        const parsed = parseStandardHtml(html)
        return jsonResponse(parsed)
      } catch (err) {
        clearTimeout(timer)
        return jsonResponse({
          ok: false,
          error: 'inquiry_failed',
          errorMessage: 'پاسخی از سامانه پروانه استاندارد دریافت نشد.',
          details: err.message
        }, 502)
      }
    }

    return jsonResponse({ ok: false, error: 'not_found' }, 404)
  }
}
