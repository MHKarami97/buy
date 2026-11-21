/**
 * Digit Normalizer & OCR Candidate Extractor
 * -------------------------------------------
 * Handles bidirectional Persian <-> English digit conversion,
 * regex extraction of numeric patterns (Standard, IFDA, Barcodes, Dates, Gold codes),
 * and categorization of scanned packaging numbers.
 */

var PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
var ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
var ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Converts Persian and Arabic digits to standard ASCII English digits (0-9).
 * Also cleans directional markers (LRM/RLM).
 * @param {string} str
 * @returns {string}
 */
export function toEnglishDigits(str) {
  if (!str) return ''
  var out = String(str).replace(/[\u200E\u200F\u202A-\u202E]/g, '')
  for (var i = 0; i < 10; i++) {
    out = out.split(PERSIAN_DIGITS[i]).join(ENGLISH_DIGITS[i])
    out = out.split(ARABIC_DIGITS[i]).join(ENGLISH_DIGITS[i])
  }
  return out
}

/**
 * Converts English digits (0-9) to Persian digits (۰-۹).
 * @param {string} str
 * @returns {string}
 */
export function toPersianDigits(str) {
  if (!str) return ''
  var out = String(str)
  for (var i = 0; i < 10; i++) {
    out = out.split(ENGLISH_DIGITS[i]).join(PERSIAN_DIGITS[i])
    out = out.split(ARABIC_DIGITS[i]).join(PERSIAN_DIGITS[i])
  }
  return out
}

/**
 * Classifies a number string into known packaging code kinds:
 * - standard_license (9 or 10 digits)
 * - gold_code (G + digits)
 * - ean13 (13 digits)
 * - irancode (16 digits)
 * - date (YYYY/MM/DD or YY/MM/DD)
 * - general (other numbers)
 * @param {string} cleanNum - English digits (with possible G or slash)
 * @returns {{ kind: string, labelFa: string, confidence: number }}
 */
export function classifyNumberKind(cleanNum) {
  var s = (cleanNum || '').trim()

  if (/^G\d{2,10}$/i.test(s)) {
    return {
      kind: 'gold_standard',
      labelFa: 'کد شناسایی طلا',
      confidence: 0.95
    }
  }

  if (/^(13|14)\d{2}[/-]\d{1,2}[/-]\d{1,2}$/.test(s)) {
    return {
      kind: 'date',
      labelFa: 'تاریخ تولید / انقضا',
      confidence: 0.85
    }
  }

  var digitsOnly = s.replace(/\D/g, '')

  if (digitsOnly.length === 10) {
    return {
      kind: 'standard_license',
      labelFa: 'شماره پروانه استاندارد (۱۰ رقم)',
      confidence: 0.95
    }
  }

  if (digitsOnly.length === 9) {
    return {
      kind: 'standard_license',
      labelFa: 'پروانه استاندارد تشویقی (۹ رقم)',
      confidence: 0.9
    }
  }

  if (digitsOnly.length === 13) {
    var isIran = digitsOnly.startsWith('626')
    return {
      kind: 'ean13',
      labelFa: isIran ? 'بارکد کالا (ایران ۶۲۶)' : 'بارکد استاندارد EAN-13',
      confidence: 0.92
    }
  }

  if (digitsOnly.length === 16) {
    return {
      kind: 'irancode',
      labelFa: 'ایران‌کد ملی (۱۶ رقم)',
      confidence: 0.9
    }
  }

  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return {
      kind: 'ifda_permit',
      labelFa: 'شماره پروانه بهداشتی / سیب سلامت',
      confidence: 0.8
    }
  }

  return {
    kind: 'generic',
    labelFa: 'عدد کالا',
    confidence: 0.6
  }
}

/**
 * Extracts and classifies all candidate numbers from raw OCR text.
 * Finds English and Persian digit blocks, dates, and gold codes.
 * Returns sorted by relevance/length.
 * @param {string} text
 * @returns {Array<{ raw: string, english: string, persian: string, kind: string, labelFa: string, confidence: number }>}
 */
export function extractNumberCandidates(text) {
  if (!text) return []

  var rawStr = String(text)
  var normalized = toEnglishDigits(rawStr)

  var patterns = [
    /\b[Gg]\s*\d{2,12}\b/g,
    /\b(13|14)\d{2}[/-]\d{1,2}[/-]\d{1,2}\b/g,
    /\b\d{1,4}[/-]\d{1,4}[/-]\d{1,4}\b/g,
    /\b\d{2,8}[/-]\d{2,8}\b/g,
    /\b\d{3,20}\b/g
  ]

  var found = new Map()

  for (var pattern of patterns) {
    var matches = normalized.match(pattern) || []
    for (var m of matches) {
      var englishVal = m.trim().replace(/\s+/g, '')
      if (englishVal.toUpperCase().startsWith('G')) {
        englishVal = 'G' + englishVal.slice(1).replace(/\D/g, '')
      }

      var digitsCount = englishVal.replace(/\D/g, '').length
      if (digitsCount < 3) continue // skip trivial numbers

      if (!found.has(englishVal)) {
        var info = classifyNumberKind(englishVal)
        found.set(englishVal, {
          raw: m.trim(),
          english: englishVal,
          persian: toPersianDigits(englishVal),
          kind: info.kind,
          labelFa: info.labelFa,
          confidence: info.confidence
        })
      }
    }
  }

  var candidates = Array.from(found.values())

  var priorityOrder = {
    standard_license: 1,
    gold_standard: 2,
    ean13: 3,
    irancode: 4,
    ifda_permit: 5,
    generic: 6,
    date: 7
  }

  candidates.sort((a, b) => {
    var pA = priorityOrder[a.kind] || 10
    var pB = priorityOrder[b.kind] || 10
    if (pA !== pB) return pA - pB
    return b.english.length - a.english.length
  })

  return candidates
}
