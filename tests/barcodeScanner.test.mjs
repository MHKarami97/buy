import test from 'node:test'
import assert from 'node:assert/strict'
import {
  lookupGs1Country,
  lookupIranianCompany,
  parseTtacCode,
  normalizeBarcode
} from '../src/services/barcode/gs1CountryPrefixes.js'
import { BarcodeLookupService } from '../src/services/barcode/BarcodeLookupService.js'
import { BarcodeHistoryRepository } from '../src/services/barcode/BarcodeHistoryRepository.js'
import { validateEan13Checksum, validateEan8Checksum } from '../src/services/barcode/Ean1dDecoder.js'

test('normalizeBarcode converts Persian and Arabic digits and strips spaces and dashes', () => {
  assert.equal(normalizeBarcode('۶۲۶-۰۱۲۳-۴۵۶۷'), '62601234567')
  assert.equal(normalizeBarcode(' ٠١٢٣٤ ٥٦٧٨٩ '), '0123456789')
  assert.equal(normalizeBarcode(null), '')
})

test('lookupGs1Country identifies Iran code 626 correctly', () => {
  var result = lookupGs1Country('6260123456789')
  assert.ok(result)
  assert.equal(result.countryFa, 'ایران')
  assert.equal(result.flag, '🇮🇷')
  assert.equal(result.prefix, 626)
  assert.equal(result.isIran, true)
})

test('lookupGs1Country identifies international countries correctly', () => {
  // Germany: 400-440
  var germany = lookupGs1Country('4012345678901')
  assert.ok(germany)
  assert.equal(germany.countryFa, 'آلمان')
  assert.equal(germany.flag, '🇩🇪')

  // France: 300-379
  var france = lookupGs1Country('3250000000000')
  assert.ok(france)
  assert.equal(france.countryFa, 'فرانسه')
  assert.equal(france.flag, '🇫🇷')

  // Turkey: 868-869
  var turkey = lookupGs1Country('8690000000000')
  assert.ok(turkey)
  assert.equal(turkey.countryFa, 'ترکیه')
  assert.equal(turkey.flag, '🇹🇷')

  // USA: UPC-A 12 digits
  var usa = lookupGs1Country('012345678905')
  assert.ok(usa)
  assert.equal(usa.countryFa, 'ایالات متحده و کانادا')
})

test('lookupIranianCompany recognizes well-known Iranian brands', () => {
  var kaleh = lookupIranianCompany('6260129999999')
  assert.ok(kaleh)
  assert.ok(kaleh.name.includes('کاله'))

  var zar = lookupIranianCompany('6260481234567')
  assert.ok(zar)
  assert.ok(zar.name.includes('زر ماکارون'))

  var cheetoz = lookupIranianCompany('6260881112223')
  assert.ok(cheetoz)
  assert.ok(cheetoz.name.includes('چی‌توز'))

  assert.equal(lookupIranianCompany('4001234567890'), null)
})

test('parseTtacCode extracts pharma track and trace fields', () => {
  var raw = '(01)06260123456789(21)1234567890123456(10)LOT987(17)261230'
  var ttac = parseTtacCode(raw)
  assert.ok(ttac)
  assert.equal(ttac.isTtac, true)
  assert.equal(ttac.gtin, '06260123456789')
  assert.equal(ttac.uid, '1234567890123456')
  assert.equal(ttac.lot, 'LOT987')
  assert.equal(ttac.exp, '261230')
})

test('BarcodeLookupService inspects barcodes and URLs correctly', () => {
  var urlResult = BarcodeLookupService.inspect('https://google.com', 'qr_code')
  assert.equal(urlResult.type, 'url')

  var barcodeResult = BarcodeLookupService.inspect('6260123456789', 'ean_13')
  assert.equal(barcodeResult.type, 'barcode')
  assert.equal(barcodeResult.country.isIran, true)
  assert.ok(barcodeResult.iranianCompany)
})

test('BarcodeHistoryRepository adds, filters and removes scans', () => {
  var fakeStorage = {
    data: {},
    get(k, fallback) { return this.data[k] ?? fallback },
    set(k, v) { this.data[k] = v; return true }
  }

  var repo = new BarcodeHistoryRepository(fakeStorage)
  assert.equal(repo.getAll().length, 0)

  repo.add({
    code: '6260123456789',
    format: 'ean_13',
    type: 'barcode',
    title: 'شیر کاله',
    countryFa: 'ایران'
  })
  repo.add({
    code: '4001234567890',
    format: 'ean_13',
    type: 'barcode',
    title: 'شکلات آلمانی',
    countryFa: 'آلمان'
  })

  assert.equal(repo.getAll().length, 2)

  // Filter by country / query
  var iranOnly = repo.filter('ایران')
  assert.equal(iranOnly.length, 1)
  assert.equal(iranOnly[0].code, '6260123456789')

  // Filter by type
  var iranFilter = repo.filter('', 'iran')
  assert.equal(iranFilter.length, 1)

  // Update record
  var updated = repo.update(repo.getAll()[0].id, { title: 'عنوان بروزرسانی‌شده' })
  assert.ok(updated)
  assert.equal(updated.title, 'عنوان بروزرسانی‌شده')

  // Clear
  repo.clear()
  assert.equal(repo.getAll().length, 0)
})

test('BarcodeLookupService.decodeHtmlEntities handles numeric and named entities', () => {
  var sampleHex = '&#x62A;&#x643;&#x644;&#x627;&#x646; &#x67E;&#x627;&#x643;'
  assert.equal(BarcodeLookupService.decodeHtmlEntities(sampleHex), 'تكلان پاك')

  var sampleNamed = '&quot;کالای نمونه&quot; &amp; &lt;تست&gt;'
  assert.equal(BarcodeLookupService.decodeHtmlEntities(sampleNamed), '"کالای نمونه" & <تست>')
})

test('BarcodeLookupService.parseIranCodeHtml extracts product details from irancode.ir HTML', () => {
  var mockHtml = `
    <div class="card">
      <span class="mb-1 fw-semibold text-muted">عضو: </span>
      <span style="color: black">&#x62A;&#x643;&#x644;&#x627;&#x646; &#x67E;&#x627;&#x643;</span>
      <span class="mb-1 fw-semibold text-muted">شرح برچسب: </span>
      <span style="color: black">دستمال کاغذی، 150 برگ دو لایه، 1 عدد، تکلان پاک</span>
      <span class="mb-1 fw-semibold text-muted">نام برند: </span>
      <span style="color: black">تکلان پاک</span>
      <span class="mb-1 fw-semibold text-muted">ساختار GPC: </span>
      <span style="color: black">کالاهای بهداشتی عمومی شخصی</span>
      <span class="mb-1 fw-semibold text-muted">بریک: </span>
      <span style="color: black">دستمال کاغذی/دستمال نظافت (دور انداختنی)</span>
      <span class="mb-1 fw-semibold text-muted">کد بریک: </span>
      <span style="color: black">10000485</span>
      <span class="mb-1 fw-semibold text-muted">کشور سازنده: </span>
      <span style="color: black">ایران</span>
      <span class="mb-1 fw-semibold text-muted">GTIN Code: </span>
      <span style="color: black">6262637600129</span>
    </div>
  `

  var res = BarcodeLookupService.parseIranCodeHtml(mockHtml, '6262637600129')
  assert.equal(res.ok, true)
  assert.equal(res.data.labelDescription, 'دستمال کاغذی، 150 برگ دو لایه، 1 عدد، تکلان پاک')
  assert.equal(res.data.brand, 'تکلان پاک')
  assert.equal(res.data.member, 'تكلان پاك')
  assert.equal(res.data.breakCode, '10000485')
  assert.equal(res.data.gtin, '6262637600129')
})

test('BarcodeLookupService.parseIranCodeHtml fails gracefully on empty or invalid HTML', () => {
  var emptyRes = BarcodeLookupService.parseIranCodeHtml('<html><body>Page Not Found 404</body></html>')
  assert.equal(emptyRes.ok, false)

  var nullRes = BarcodeLookupService.parseIranCodeHtml(null)
  assert.equal(nullRes.ok, false)
})

test('BarcodeLookupService.fetchIranCodeDetails handles invalid barcode format', async () => {
  var res = await BarcodeLookupService.fetchIranCodeDetails('invalid-123')
  assert.equal(res.ok, false)
  assert.equal(res.status, 'invalid_code')
})

test('validateEan13Checksum checks standard 13-digit EAN-13 barcodes', () => {
  // 626012345678? -> checksum calculation
  // Let's test a known valid EAN-13: 4006381333931 (Stabilo pen)
  assert.equal(validateEan13Checksum('4006381333931'), true)
  assert.equal(validateEan13Checksum('4006381333932'), false) // invalid checksum digit

  // EAN-8: 96385074
  assert.equal(validateEan8Checksum('96385074'), true)
  assert.equal(validateEan8Checksum('96385075'), false)
})
