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
