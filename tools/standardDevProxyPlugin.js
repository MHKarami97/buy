import https from 'node:https'
import { URL } from 'node:url'
import { parseStandardHtml } from '../src/services/barcode/StandardLookupService.js'

const agent = new https.Agent({ rejectUnauthorized: false })

function request(url, options = {}, cookies = []) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options.headers
    }
    if (cookies.length) {
      headers['Cookie'] = cookies.join('; ')
    }
    const req = https.request(
      u,
      {
        method: options.method || 'GET',
        headers,
        agent
      },
      (res) => {
        let chunks = []
        const setCookies = res.headers['set-cookie'] || []
        const newCookies = [...cookies]
        for (const sc of setCookies) {
          const c = sc.split(';')[0]
          const name = c.split('=')[0]
          const idx = newCookies.findIndex((x) => x.startsWith(name + '='))
          if (idx >= 0) newCookies[idx] = c
          else newCookies.push(c)
        }
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const body = Buffer.concat(chunks)
          if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
            const nextUrl = new URL(res.headers.location, url).toString()
            return resolve(request(nextUrl, options, newCookies))
          }
          resolve({ status: res.statusCode, headers: res.headers, body, cookies: newCookies })
        })
      }
    )
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

export function standardDevProxyPlugin() {
  return {
    name: 'standard-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, 'http://localhost')
        const pathname = parsedUrl.pathname

        if (pathname === '/api/standard/captcha') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Access-Control-Allow-Origin', '*')

          try {
            const init = await request('https://isom.inso.gov.ir/parvaneh/')
            const captcha = await request(
              'https://isom.inso.gov.ir/standard/verif_img.php',
              {
                headers: { 'Referer': 'https://isom.inso.gov.ir/parvaneh/' }
              },
              init.cookies
            )

            const base64 = 'data:image/jpeg;base64,' + captcha.body.toString('base64')
            const sessionToken = Buffer.from(JSON.stringify(captcha.cookies)).toString('base64')

            res.end(
              JSON.stringify({
                ok: true,
                sessionId: sessionToken,
                captchaImage: base64
              })
            )
          } catch (err) {
            res.statusCode = 500
            res.end(
              JSON.stringify({
                ok: false,
                error: 'captcha_failed',
                errorMessage: err?.message || 'خطا در دریافت کد امنیتی'
              })
            )
          }
          return
        }

        if (pathname === '/api/standard/inquiry') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Access-Control-Allow-Origin', '*')

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }))
            return
          }

          let bodyStr = ''
          req.on('data', (chunk) => {
            bodyStr += chunk
          })

          req.on('end', async () => {
            try {
              const payload = JSON.parse(bodyStr || '{}')
              const { licenseNumber, captcha, sessionId } = payload

              let cookies = []
              if (sessionId) {
                try {
                  cookies = JSON.parse(Buffer.from(sessionId, 'base64').toString('utf-8'))
                } catch {
                  cookies = [`PHPSESSID=${sessionId}`]
                }
              }

              const formData = new URLSearchParams()
              formData.append('l__no', String(licenseNumber || '').trim())
              formData.append('captcha', String(captcha || '').trim())
              formData.append('proceed', 'نمایش')

              const postResp = await request(
                'https://isom.inso.gov.ir/parvaneh/',
                {
                  method: 'POST',
                  headers: {
                    'Referer': 'https://isom.inso.gov.ir/parvaneh/',
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: formData.toString()
                },
                cookies
              )

              const html = postResp.body.toString('utf-8')
              const parsed = parseStandardHtml(html)
              res.end(JSON.stringify(parsed))
            } catch (err) {
              res.statusCode = 500
              res.end(
                JSON.stringify({
                  ok: false,
                  error: 'inquiry_failed',
                  errorMessage: err?.message || 'خطا در انجام استعلام'
                })
              )
            }
          })
          return
        }

        next()
      })
    }
  }
}
