import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeIfdaCode, IfdaLookupService } from '../src/services/barcode/IfdaLookupService.js'
import { IfdaHistoryRepository } from '../src/services/barcode/IfdaHistoryRepository.js'

test('normalizeIfdaCode converts Persian digits, slashes and whitespace', () => {
  var p1 = normalizeIfdaCode('۳۲/۱۱۱۵۹')
  assert.equal(p1.valid, true)
  assert.equal(p1.normalized, '32/11159')
  assert.equal(p1.part1, '32')
  assert.equal(p1.part2, '11159')

  var p2 = normalizeIfdaCode(' 32 - 11159 ')
  assert.equal(p2.valid, true)
  assert.equal(p2.normalized, '32/11159')

  var p3 = normalizeIfdaCode('32\\11159')
  assert.equal(p3.valid, true)
  assert.equal(p3.normalized, '32/11159')

  var invalid = normalizeIfdaCode('invalid-code')
  assert.equal(invalid.valid, false)
})

test('IfdaLookupService.parseCerfoodHtml extracts product data from JSON-LD', () => {
  var mockHtml = `
    <!doctype html>
    <html>
      <head>
        <title>دستمال کاغذی | پروانه 32/11159</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "دستمال کاغذی",
          "brand": { "name": "تکلان پاک" },
          "manufacturer": {
            "name": "تکلان پاک",
            "address": { "streetAddress": "استان سمنان- شهرک صنعتی ایوانکی" },
            "telephone": "09123903952"
          },
          "additionalProperty": [
            { "name": "شماره پروانه ساخت", "value": "32/11159" },
            { "name": "وضعیت پروانه", "value": "عدم اعتبار" },
            { "name": "تاریخ صدور", "value": "۱۳۹۸/۰۲/۱۴" },
            { "name": "تاریخ انقضا", "value": "۱۴۰۱/۰۲/۱۴" }
          ]
        }
        </script>
      </head>
      <body><h1>دستمال کاغذی</h1></body>
    </html>
  `

  var res = IfdaLookupService.parseCerfoodHtml(mockHtml, '32/11159')
  assert.equal(res.ok, true)
  assert.equal(res.data.name, 'دستمال کاغذی')
  assert.equal(res.data.brand, 'تکلان پاک')
  assert.equal(res.data.manufacturer, 'تکلان پاک')
  assert.equal(res.data.licenseStatus, 'عدم اعتبار')
  assert.equal(res.data.issueDate, '۱۳۹۸/۰۲/۱۴')
  assert.equal(res.data.expiryDate, '۱۴۰۱/۰۲/۱۴')
  assert.ok(res.data.address.includes('سمنان'))
})

test('IfdaLookupService.parseCerfoodHtml extracts data from meta description when JSON-LD is missing', () => {
  var mockHtml = `
    <html>
      <head>
        <meta name="description" content="«دستمال کاغذی» · از تکلان پاک · برند تکلان پاک · وضعیت پروانه: دارای اعتبار · شماره پروانه 32/11159">
      </head>
    </html>
  `
  var res = IfdaLookupService.parseCerfoodHtml(mockHtml, '32/11159')
  assert.equal(res.ok, true)
  assert.equal(res.data.name, 'دستمال کاغذی')
  assert.equal(res.data.brand, 'تکلان پاک')
  assert.equal(res.data.licenseStatus, 'دارای اعتبار')
})

test('IfdaHistoryRepository manages inquiry records properly', () => {
  var fakeStorage = {
    data: {},
    get(k, fallback) { return this.data[k] ?? fallback },
    set(k, v) { this.data[k] = v; return true }
  }

  var repo = new IfdaHistoryRepository(fakeStorage)
  assert.equal(repo.getAll().length, 0)

  repo.add({
    code: '32/11159',
    title: 'دستمال کاغذی',
    brand: 'تکلان پاک',
    licenseStatus: 'عدم اعتبار'
  })

  repo.add({
    code: '15/12345',
    title: 'شیر پاستوریزه',
    brand: 'کاله',
    licenseStatus: 'دارای اعتبار'
  })

  assert.equal(repo.getAll().length, 2)

  // Filter by query
  var tissues = repo.filter('دستمال')
  assert.equal(tissues.length, 1)
  assert.equal(tissues[0].code, '32/11159')

  // Filter by status
  var validOnly = repo.filter('', 'valid')
  assert.equal(validOnly.length, 1)
  assert.equal(validOnly[0].brand, 'کاله')

  // Remove
  repo.remove(tissues[0].id)
  assert.equal(repo.getAll().length, 1)

  // Clear
  repo.clear()
  assert.equal(repo.getAll().length, 0)
})
