import test from 'node:test'
import assert from 'node:assert/strict'
import { RapidOcrEngine } from '../src/services/ocr/RapidOcrEngine.js'
import { computeOtsuThreshold } from '../src/services/ocr/imagePreprocessor.js'

test('computeOtsuThreshold finds separating threshold for bimodal image', () => {
  // Create synthetic bimodal histogram: dark pixels (< 50) and bright pixels (> 200)
  var data = new Uint8ClampedArray(400) // 100 pixels
  for (var i = 0; i < 50; i++) {
    var p = i * 4
    data[p] = 20
    data[p + 1] = 20
    data[p + 2] = 20
    data[p + 3] = 255
  }
  for (var j = 50; j < 100; j++) {
    var q = j * 4
    data[q] = 230
    data[q + 1] = 230
    data[q + 2] = 230
    data[q + 3] = 255
  }

  var thresh = computeOtsuThreshold(data)
  assert.ok(thresh > 20 && thresh < 230, `Threshold ${thresh} should be between 20 and 230`)
})

test('RapidOcrEngine ctcDecode correctly decodes greedy logits with blank token', () => {
  var vocab = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'G']
  var engine = new RapidOcrEngine({ dict: vocab })

  // Dimensions: [1, seq_len=4, vocab_size=12] (index 0 is blank, 1..11 are chars)
  var seqLen = 4
  var vocabSize = vocab.length + 1 // 12
  var data = new Float32Array(seqLen * vocabSize)

  // t=0: token 11 ('G')
  data[0 * vocabSize + 11] = 10.0
  // t=1: token 1 ('0')
  data[1 * vocabSize + 1] = 10.0
  // t=2: blank token 0
  data[2 * vocabSize + 0] = 10.0
  // t=3: token 8 ('7')
  data[3 * vocabSize + 8] = 10.0

  var decoded = engine.ctcDecode(data, [1, seqLen, vocabSize])
  assert.equal(decoded, 'G07')
})

test('RapidOcrEngine pickBestCandidate prioritizes targetKind', () => {
  var engine = new RapidOcrEngine()
  var candidates = [
    { kind: 'date', english: '1403/05/10', persian: '۱۴۰۳/۰۵/۱۰' },
    { kind: 'standard_license', english: '7339969923', persian: '۷۳۳۹۹۶۹۹۲۳' },
    { kind: 'ean13', english: '6260123456789', persian: '۶۲۶۰۱۲۳۴۵۶۷۸۹' }
  ]

  var bestStandard = engine.pickBestCandidate(candidates, 'standard')
  assert.equal(bestStandard.english, '7339969923')

  var bestBarcode = engine.pickBestCandidate(candidates, 'barcode')
  assert.equal(bestBarcode.english, '6260123456789')
})

test('RapidOcrEngine runLocalLineOcr extracts text lines and recognizes digits from raw image', () => {
  var engine = new RapidOcrEngine()
  var w = 120
  var h = 40
  var data = new Uint8ClampedArray(w * h * 4)

  // Initialize white background (255)
  for (var i = 0; i < w * h * 4; i += 4) {
    data[i] = 255
    data[i + 1] = 255
    data[i + 2] = 255
    data[i + 3] = 255
  }

  // Draw 5 vertical stroke digits ("1 1 1 1 1") at line Y=15..28
  // Digits at X=10, 20, 30, 40, 50
  for (var k = 0; k < 5; k++) {
    var startX = 15 + k * 15
    for (var y = 15; y <= 28; y++) {
      for (var x = startX; x <= startX + 2; x++) {
        var idx = (y * w + x) * 4
        data[idx] = 10     // R
        data[idx + 1] = 10 // G
        data[idx + 2] = 10 // B
      }
    }
  }

  var lines = engine.runLocalLineOcr({ width: w, height: h, data })
  assert.ok(lines.length > 0, 'Should extract at least one line')
  assert.ok(lines[0].text.length >= 4, `Extracted line text "${lines[0].text}" should contain recognized digits`)
})
