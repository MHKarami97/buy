import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeLicenseNumber,
  parseStandardHtml,
  StandardLookupService
} from '../src/services/barcode/StandardLookupService.js'
import { StandardHistoryRepository } from '../src/services/barcode/StandardHistoryRepository.js'

function makeMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    get: (key, fallback) => (store.has(key) ? store.get(key) : fallback),
    set: (key, value) => {
      store.set(key, value)
      return true
    },
    remove: (key) => store.delete(key),
    clear: () => store.clear()
  }
}

test('normalizeLicenseNumber converts Persian and Arabic digits and handles gold prefix', () => {
  assert.equal(normalizeLicenseNumber('۷۳۳۹۹۶۹۹۲۳'), '7339969923')
  assert.equal(normalizeLicenseNumber(' 7339-969-923 '), '7339969923')
  assert.equal(normalizeLicenseNumber('g12345'), 'G12345')
  assert.equal(normalizeLicenseNumber('G ۱۲۳۴۵'), 'G12345')
  assert.equal(normalizeLicenseNumber(''), '')
  assert.equal(normalizeLicenseNumber(null), '')
})

test('parseStandardHtml extracts structured product data from INSO HTML table', () => {
  const sampleHtml = `
    <tr><td class="text">شماره پروانه</td><td class="text">7339969923 اجباری</td></tr>
    <tr><td class="text">استــــــان</td><td class="text">سمنان</td></tr>
    <tr><td class="text">واحد تولیدی</td><td class="text">شركت ‌تكلان پاك</td></tr>
    <tr><td class="text">فــــرآورده</td><td class="text">دستمال كاغذي</td></tr>
    <tr><td class="text">علامت تجاری</td><td class="text">تكلان پاك</td></tr>
    <tr><td class="text">تاریـخ اعتبـار</td><td class="text">1406/09/23</td></tr>
    <tr><td class="text">آخرین وضعیت</td><td class="text">معتبر</td></tr>
    <a href="m_p_report.php?l__n=NzMyODg1NTg3MzM5OTY5OTIxMDY4MzM4">نمایش جزئیات</a>
  `

  const res = parseStandardHtml(sampleHtml)
  assert.equal(res.ok, true)
  assert.equal(res.status, 'valid')
  assert.equal(res.data.licenseNumber, '7339969923')
  assert.equal(res.data.licenseType, 'اجباری')
  assert.equal(res.data.province, 'سمنان')
  assert.equal(res.data.manufacturer, 'شرکت تکلان پاک')
  assert.equal(res.data.product, 'دستمال کاغذی')
  assert.equal(res.data.brand, 'تکلان پاک')
  assert.equal(res.data.expiryDate, '1406/09/23')
  assert.equal(res.data.reportUrl, 'https://isom.inso.gov.ir/parvaneh/m_p_report.php?l__n=NzMyODg1NTg3MzM5OTY5OTIxMDY4MzM4')
})

test('parseStandardHtml detects invalid captcha error', () => {
  const captchaErrorHtml = `<script>alert('کد امنیتی به درستی وارد نشده است');</script>`
  const res = parseStandardHtml(captchaErrorHtml)
  assert.equal(res.ok, false)
  assert.equal(res.error, 'invalid_captcha')
})

test('parseStandardHtml detects not found licenses', () => {
  const notFoundHtml = `<div>اطلاعاتی یافت نشد</div>`
  const res = parseStandardHtml(notFoundHtml)
  assert.equal(res.ok, false)
  assert.equal(res.error, 'not_found')
})

test('parseStandardHtml detects suspended or expired status', () => {
  const expiredHtml = `
    <tr><td>شماره پروانه</td><td>1234567890</td></tr>
    <tr><td>واحد تولیدی</td><td>کارخانه نمونه</td></tr>
    <tr><td>فــــرآورده</td><td>مایع ظرفشویی</td></tr>
    <tr><td>آخرین وضعیت</td><td>منقضی / ابطال شده</td></tr>
  `
  const res = parseStandardHtml(expiredHtml)
  assert.equal(res.ok, true)
  assert.equal(res.status, 'invalid')
})

test('StandardHistoryRepository manages history records correctly', () => {
  const storage = makeMockStorage()
  const repo = new StandardHistoryRepository(storage)

  assert.equal(repo.getAll().length, 0)

  const added = repo.add({
    licenseNumber: '7339969923',
    manufacturer: 'شرکت تکلان پاک',
    product: 'دستمال کاغذی',
    brand: 'تکلان پاک',
    province: 'سمنان',
    status: 'valid'
  })

  assert.ok(added.id)
  assert.equal(repo.getAll().length, 1)

  // Filter search
  const found = repo.filter('تکلان', 'all')
  assert.equal(found.length, 1)
  assert.equal(found[0].licenseNumber, '7339969923')

  // Filter by status
  assert.equal(repo.filter('', 'valid').length, 1)
  assert.equal(repo.filter('', 'invalid').length, 0)

  // Remove
  repo.remove(added.id)
  assert.equal(repo.getAll().length, 0)
})
