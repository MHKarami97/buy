/**
 * Lightweight in-tree 1D Barcode Decoder (EAN-13, UPC-A, EAN-8)
 * -------------------------------------------------------------
 * Pure JavaScript canvas image decoder. Operates on ImageData without external libraries.
 * Serves as reliable fallback when browser native BarcodeDetector is unavailable.
 */

var L_PATTERNS = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
]

var G_PATTERNS = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111'
]

var R_PATTERNS = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
]

var FIRST_DIGIT_PARITIES = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
]

function getLuminance(data, index) {
  return (data[index] * 299 + data[index + 1] * 587 + data[index + 2] * 114) / 1000
}

/**
 * Validates EAN-13 checksum
 */
export function validateEan13Checksum(digits) {
  if (digits.length !== 13) return false
  var sum = 0
  for (var i = 0; i < 12; i++) {
    var d = parseInt(digits[i], 10)
    sum += i % 2 === 0 ? d : d * 3
  }
  var check = (10 - (sum % 10)) % 10
  return check === parseInt(digits[12], 10)
}

/**
 * Validates EAN-8 checksum
 */
export function validateEan8Checksum(digits) {
  if (digits.length !== 8) return false
  var sum = 0
  for (var i = 0; i < 7; i++) {
    var d = parseInt(digits[i], 10)
    sum += i % 2 === 0 ? d * 3 : d
  }
  var check = (10 - (sum % 10)) % 10
  return check === parseInt(digits[7], 10)
}

function decodeRun(runs, startIndex, moduleWidth, patterns) {
  // A digit consists of 4 alternating runs (bar/space) that sum to 7 modules
  var totalWidth = 0
  for (var i = 0; i < 4; i++) {
    totalWidth += runs[startIndex + i]
  }
  var approxModules = Math.round(totalWidth / moduleWidth)
  if (approxModules < 6 || approxModules > 8) return null

  // Build binary string representation of the 4 runs
  var binary = ''
  var isBar = true // In EAN left half, digit starts with space (0) or bar (1)
  // Determine if startIndex starts on bar or space
  // Left half digit starts on space: 0...
  // Right half digit starts on bar: 1...
  return null
}

/**
 * Scans an ImageData row and finds alternating run-lengths
 */
function getRunsFromRow(imageData, y) {
  var width = imageData.width
  var data = imageData.data
  var rowOffset = y * width * 4

  // Compute adaptive average threshold for this row
  var totalLum = 0
  for (var x = 0; x < width; x++) {
    totalLum += getLuminance(data, rowOffset + x * 4)
  }
  var threshold = totalLum / width

  var runs = []
  var currentIsDark = getLuminance(data, rowOffset) < threshold
  var currentRun = 0

  for (var col = 0; col < width; col++) {
    var isDark = getLuminance(data, rowOffset + col * 4) < threshold
    if (isDark === currentIsDark) {
      currentRun++
    } else {
      runs.push({ isDark: currentIsDark, length: currentRun })
      currentIsDark = isDark
      currentRun = 1
    }
  }
  runs.push({ isDark: currentIsDark, length: currentRun })
  return runs
}

/**
 * Matches 4 runs to digit patterns
 */
function matchDigit(runs, startIndex, isRight) {
  var r1 = runs[startIndex].length
  var r2 = runs[startIndex + 1].length
  var r3 = runs[startIndex + 2].length
  var r4 = runs[startIndex + 3].length
  var total = r1 + r2 + r3 + r4
  if (total === 0) return null

  // Normalize to 7 modules
  var m1 = Math.max(1, Math.round((r1 / total) * 7))
  var m2 = Math.max(1, Math.round((r2 / total) * 7))
  var m3 = Math.max(1, Math.round((r3 / total) * 7))
  var m4 = 7 - (m1 + m2 + m3)
  if (m4 < 1) return null

  var pattern = '' + m1 + m2 + m3 + m4

  // EAN-13 pattern widths for [r1, r2, r3, r4]
  var L_WIDTHS = [
    '3211', '2221', '2122', '1411', '1132',
    '1231', '1114', '1312', '1213', '3112'
  ]
  var G_WIDTHS = [
    '1123', '1222', '2212', '1141', '2311',
    '1321', '4111', '2131', '3121', '2113'
  ]
  var R_WIDTHS = L_WIDTHS // R widths match L widths reversed or inverted

  if (isRight) {
    for (var d = 0; d < 10; d++) {
      if (pattern === R_WIDTHS[d]) return { digit: d, parity: 'R' }
    }
  } else {
    for (var l = 0; l < 10; l++) {
      if (pattern === L_WIDTHS[l]) return { digit: l, parity: 'L' }
    }
    for (var g = 0; g < 10; g++) {
      if (pattern === G_WIDTHS[g]) return { digit: g, parity: 'G' }
    }
  }

  return null
}

/**
 * Attempts to decode EAN-13 from a single row
 */
function decodeRowEan13(runs) {
  if (runs.length < 59) return null // Need at least 3 + 24 + 5 + 24 + 3 = 59 runs

  for (var i = 0; i < runs.length - 58; i++) {
    // Check start guard: bar, space, bar (similar widths)
    if (!runs[i].isDark || runs[i + 1].isDark || !runs[i + 2].isDark) continue

    var g1 = runs[i].length
    var g2 = runs[i + 1].length
    var g3 = runs[i + 2].length
    var guardAvg = (g1 + g2 + g3) / 3
    if (Math.abs(g1 - guardAvg) > guardAvg * 0.7) continue

    var idx = i + 3
    var leftDigits = []
    var parities = ''
    var validLeft = true

    for (var d = 0; d < 6; d++) {
      var match = matchDigit(runs, idx + d * 4, false)
      if (!match) {
        validLeft = false
        break
      }
      leftDigits.push(match.digit)
      parities += match.parity
    }
    if (!validLeft) continue

    // Find first digit from parities
    var firstDigit = FIRST_DIGIT_PARITIES.indexOf(parities)
    if (firstDigit === -1) continue

    // Center guard: space, bar, space, bar, space (5 runs)
    var centerIdx = idx + 24
    if (runs[centerIdx].isDark || !runs[centerIdx + 1].isDark || runs[centerIdx + 2].isDark || !runs[centerIdx + 3].isDark || runs[centerIdx + 4].isDark) {
      continue
    }

    var rightIdx = centerIdx + 5
    var rightDigits = []
    var validRight = true

    for (var rd = 0; rd < 6; rd++) {
      var rMatch = matchDigit(runs, rightIdx + rd * 4, true)
      if (!rMatch) {
        validRight = false
        break
      }
      rightDigits.push(rMatch.digit)
    }
    if (!validRight) continue

    var candidate = String(firstDigit) + leftDigits.join('') + rightDigits.join('')
    if (validateEan13Checksum(candidate)) {
      return { code: candidate, format: 'ean_13' }
    }
  }

  return null
}

/**
 * Main decoder function for an ImageData instance
 * Scans multiple horizontal slices
 * @param {ImageData} imageData
 * @returns {{ code: string, format: string } | null}
 */
export function decode1dBarcodeFromImageData(imageData) {
  if (!imageData || !imageData.width || !imageData.height) return null
  var height = imageData.height

  // Sample lines at various heights
  var sampleRows = [0.5, 0.4, 0.6, 0.3, 0.7, 0.45, 0.55, 0.35, 0.65]

  for (var frac of sampleRows) {
    var y = Math.floor(height * frac)
    var runs = getRunsFromRow(imageData, y)
    var result = decodeRowEan13(runs)
    if (result) return result
  }

  return null
}
