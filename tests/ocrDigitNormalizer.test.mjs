import test from 'node:test'
import assert from 'node:assert/strict'
import {
  toEnglishDigits,
  toPersianDigits,
  classifyNumberKind,
  extractNumberCandidates
} from '../src/services/ocr/digitNormalizer.js'

test('toEnglishDigits converts Persian and Arabic digits to standard ASCII', () => {
  assert.equal(toEnglishDigits('۷۳۳۹۹۶۹۹۲۳'), '7339969923')
  assert.equal(toEnglishDigits('٧٣٣٩٩٦٩٩٢٣'), '7339969923')
  assert.equal(toEnglishDigits('G ۱۲۳۴'), 'G 1234')
  assert.equal(toEnglishDigits('۱۴۰۶/۰۹/۲۳'), '1406/09/23')
  assert.equal(toEnglishDigits(''), '')
  assert.equal(toEnglishDigits(null), '')
})

test('toPersianDigits converts English digits to Persian digits', () => {
  assert.equal(toPersianDigits('7339969923'), '۷۳۳۹۹۶۹۹۲۳')
  assert.equal(toPersianDigits('6260123456789'), '۶۲۶۰۱۲۳۴۵۶۷۸۹')
  assert.equal(toPersianDigits('G1234'), 'G۱۲۳۴')
  assert.equal(toPersianDigits(''), '')
})

test('classifyNumberKind recognizes standard 10-digit, 9-digit, gold, and barcode formats', () => {
  assert.equal(classifyNumberKind('7339969923').kind, 'standard_license')
  assert.equal(classifyNumberKind('123456789').kind, 'standard_license')
  assert.equal(classifyNumberKind('G1234').kind, 'gold_standard')
  assert.equal(classifyNumberKind('6260123456789').kind, 'ean13')
  assert.equal(classifyNumberKind('1406/09/23').kind, 'date')
  assert.equal(classifyNumberKind('12345').kind, 'generic')
})

test('extractNumberCandidates extracts Persian digits from mixed packaging text', () => {
  var sampleText = `
    پروانه استاندارد: ۷۳۳۹۹۶۹۹۲۳
    تاريخ انقضا: ۱۴۰۶/۰۹/۲۳
    شماره سري: ۱۲۴۵۸
  `
  var candidates = extractNumberCandidates(sampleText)
  assert.ok(candidates.length >= 2)

  // First candidate should be standard license 10-digit
  var standard = candidates.find((c) => c.kind === 'standard_license')
  assert.ok(standard, 'Should find standard license candidate')
  assert.equal(standard.english, '7339969923')
  assert.equal(standard.persian, '۷۳۳۹۹۶۹۹۲۳')

  // Date candidate
  var dateCandidate = candidates.find((c) => c.kind === 'date')
  assert.ok(dateCandidate, 'Should find date candidate')
  assert.equal(dateCandidate.english, '1406/09/23')
})

test('extractNumberCandidates extracts English digits and gold codes correctly', () => {
  var text = 'Gold item code G789, barcode 6261234567890, batch 9901'
  var candidates = extractNumberCandidates(text)

  var gold = candidates.find((c) => c.kind === 'gold_standard')
  assert.ok(gold)
  assert.equal(gold.english, 'G789')

  var barcode = candidates.find((c) => c.kind === 'ean13')
  assert.ok(barcode)
  assert.equal(barcode.english, '6261234567890')
})
