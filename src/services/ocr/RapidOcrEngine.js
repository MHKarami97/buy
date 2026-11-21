/**
 * RapidOCR + ONNX Runtime Engine
 * --------------------------------
 * Dual-engine OCR processor optimized for Iranian product packaging numbers:
 * 1. Deep Learning Engine: Runs RapidOCR (PP-OCRv4) models via ONNX Runtime (onnxruntime-web / WASM/WebGL).
 * 2. Instant Local Engine: Zero-latency client-side morphological digit recognizer (0-9 and ۰-۹) for offline PWA operation.
 * 3. Normalizes and extracts numbers (Standard license, IFDA permit, Barcode EAN-13, Gold codes, Dates).
 */

import { cropRoi, enhanceAndBinarize, prepareRapidOcrTensor } from './imagePreprocessor.js'
import { toEnglishDigits, toPersianDigits, extractNumberCandidates, classifyNumberKind } from './digitNormalizer.js'
import { ocrModelManager } from './OcrModelManager.js'

// Standard characters for digit & packaging code OCR decoding
var DEFAULT_DIGIT_VOCAB = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹',
  '٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩',
  'G', 'g', 'N', 'n', 'O', 'o', 'S', 's', 'B', 'b', 'I', 'i', 'R', 'r', 'C', 'c',
  '/', '-', ':', '.', ' ', '#', '*'
]

export class RapidOcrEngine {
  constructor(options = {}) {
    this.options = {
      modelUrl: options.modelUrl || null,
      dict: options.dict || DEFAULT_DIGIT_VOCAB,
      preferOnnx: options.preferOnnx !== false,
      ...options
    }
    this.status = 'idle' // 'idle' | 'loading' | 'ready' | 'fallback'
    this.onnxSession = null
    this.ort = null
    this.initPromise = null
  }

  /**
   * Initializes ONNX Runtime and RapidOCR model if available.
   * Gracefully falls back to the instant local morphological engine if ONNX is not yet loaded.
   * @returns {Promise<'ready' | 'fallback'>}
   */
  async init() {
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      this.status = 'loading'

      // Check if ONNX Runtime is already available globally or in window
      var ortInstance = typeof window !== 'undefined' ? window.ort : null

      if (!ortInstance && typeof window !== 'undefined') {
        // Try dynamic script loading of official onnxruntime-web if CDN is accessible
        try {
          ortInstance = await this.loadOrtFromScript()
        } catch {
          ortInstance = null
        }
      }

      if (ortInstance) {
        this.ort = ortInstance
        try {
          if (this.options.modelUrl) {
            this.onnxSession = await this.ort.InferenceSession.create(this.options.modelUrl, {
              executionProviders: ['wasm'],
              graphOptimizationLevel: 'all'
            })
            this.status = 'ready'
            return 'ready'
          }
        } catch (err) {
          console.warn('RapidOCR model loading failed, falling back to local digit engine:', err)
        }
      }

      this.status = 'fallback'
      return 'fallback'
    })()

    return this.initPromise
  }

  /**
   * Ensures the ONNX inference session is created from the cached RapidOCR model.
   * @returns {Promise<boolean>}
   */
  async ensureOnnxSession() {
    if (this.onnxSession) return true

    var isCached = await ocrModelManager.isModelDownloaded()
    if (!isCached) return false

    var ortInstance = this.ort || (typeof window !== 'undefined' ? window.ort : null)
    if (!ortInstance && typeof window !== 'undefined') {
      try {
        ortInstance = await this.loadOrtFromScript()
      } catch {
        ortInstance = null
      }
    }
    if (!ortInstance) return false
    this.ort = ortInstance

    try {
      var blobUrl = await ocrModelManager.getModelBlobUrl()
      if (!blobUrl) return false
      this.onnxSession = await this.ort.InferenceSession.create(blobUrl, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      })
      this.status = 'ready'
      return true
    } catch (err) {
      console.warn('Failed to initialize RapidOCR ONNX session with cached model:', err)
      return false
    }
  }

  /**
   * Releases ONNX model session from memory.
   */
  releaseSession() {
    this.onnxSession = null
    this.status = 'fallback'
  }
  async loadOrtFromScript() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null
    if (window.ort) return window.ort

    return new Promise((resolve, reject) => {
      var script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.min.js'
      script.async = true
      script.onload = () => {
        if (window.ort) {
          try {
            window.ort.env.wasm.numThreads = 1
            window.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/'
          } catch {
            // ignore env configs
          }
          resolve(window.ort)
        } else {
          reject(new Error('window.ort not found after script load'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load onnxruntime-web script'))
      document.head.appendChild(script)
    })
  }

  /**
   * Main OCR recognition method.
   * Takes a video element, canvas, or image, crops the target ROI, enhances contrast,
   * runs recognition (RapidOCR ONNX or local morphological recognizer), and returns
   * normalized candidate numbers with image preview.
   *
   * @param {HTMLVideoElement | HTMLCanvasElement | ImageBitmap | HTMLImageElement | File | Blob} source
   * @param {{ roi?: { x: number, y: number, width: number, height: number }, targetKind?: string }} options
   * @returns {Promise<{
   *   ok: boolean,
   *   bestNumber: string,
   *   bestNumberPersian: string,
   *   bestCandidate: any,
   *   candidates: any[],
   *   rawText: string,
   *   snapshotDataUrl: string,
   *   engine: 'onnx-rapidocr' | 'local-ocr',
   *   durationMs: number
   * }>}
   */
  async recognize(source, options = {}) {
    var startTime = Date.now()
    var roi = options.roi || null
    var targetKind = options.targetKind || 'any'

    // 1. Resolve source to a usable canvas
    var canvas = await this.resolveSourceToCanvas(source)
    if (!canvas) {
      return {
        ok: false,
        error: 'invalid_source',
        errorMessage: 'تصویر ورودی معتبر نیست.',
        bestNumber: '',
        bestNumberPersian: '',
        bestCandidate: null,
        candidates: [],
        rawText: '',
        snapshotDataUrl: '',
        engine: 'local-ocr',
        durationMs: 0
      }
    }

    // 2. Crop target ROI if provided
    var croppedCanvas = canvas
    if (roi) {
      var cropped = cropRoi(canvas, roi)
      if (cropped) croppedCanvas = cropped
    }

    // 3. Create high-quality snapshot data URL for the review/edit modal
    var snapshotDataUrl = ''
    try {
      snapshotDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.85)
    } catch {
      // ignore dataURL export errors
    }

    // 4. Run Recognition: Check user's preferred engine in settings
    var rawText = ''
    var engineUsed = 'local-ocr'
    var preferredEngine = ocrModelManager.getPreferredEngine()

    if (preferredEngine === 'rapidocr') {
      var isReady = await this.ensureOnnxSession()
      if (isReady && this.onnxSession) {
        try {
          rawText = await this.runOnnxInference(croppedCanvas)
          engineUsed = 'onnx-rapidocr'
        } catch (e) {
          console.warn('ONNX inference failed, using local engine:', e)
          rawText = this.runLocalDigitOcr(croppedCanvas)
          engineUsed = 'local-ocr'
        }
      } else {
        rawText = this.runLocalDigitOcr(croppedCanvas)
        engineUsed = 'local-ocr'
      }
    } else {
      rawText = this.runLocalDigitOcr(croppedCanvas)
      engineUsed = 'local-ocr'
    }

    // 5. Extract all candidate numbers from the recognized text
    var candidates = extractNumberCandidates(rawText)

    // 6. Select best candidate based on targetKind (standard license, ifda, barcode)
    var best = this.pickBestCandidate(candidates, targetKind)

    var durationMs = Date.now() - startTime

    return {
      ok: Boolean(best || candidates.length > 0),
      bestNumber: best ? best.english : '',
      bestNumberPersian: best ? best.persian : '',
      bestCandidate: best || null,
      candidates,
      rawText,
      snapshotDataUrl,
      engine: engineUsed,
      durationMs
    }
  }

  /**
   * Runs ONNX Inference session on cropped canvas.
   * Prepares NCHW float32 tensor, executes model, and CTC decodes the logits.
   */
  async runOnnxInference(canvas) {
    if (!this.ort || !this.onnxSession) return ''

    var tensorInfo = prepareRapidOcrTensor(canvas, 48, 640)
    if (!tensorInfo) return ''

    var inputTensor = new this.ort.Tensor('float32', tensorInfo.tensorData, tensorInfo.dims)
    var inputName = this.onnxSession.inputNames[0] || 'x'
    var feeds = { [inputName]: inputTensor }

    var results = await this.onnxSession.run(feeds)
    var outputName = this.onnxSession.outputNames[0]
    var outputTensor = results[outputName]

    return this.ctcDecode(outputTensor.data, outputTensor.dims)
  }

  /**
   * Greedy CTC Decoder for RapidOCR / PP-OCR output logits.
   * Output shape: [1, seq_len, vocab_size]
   */
  ctcDecode(data, dims) {
    if (!dims || dims.length < 3) return ''
    var seqLen = dims[1]
    var vocabSize = dims[2]

    var vocab = this.options.dict
    var chars = []
    var prevIndex = -1

    for (var t = 0; t < seqLen; t++) {
      var offset = t * vocabSize
      var maxVal = -Infinity
      var maxIdx = 0

      for (var v = 0; v < vocabSize; v++) {
        var val = data[offset + v]
        if (val > maxVal) {
          maxVal = val
          maxIdx = v
        }
      }

      // Index 0 is CTC blank token
      if (maxIdx !== 0 && maxIdx !== prevIndex) {
        var charIdx = maxIdx - 1
        if (charIdx >= 0 && charIdx < vocab.length) {
          chars.push(vocab[charIdx])
        }
      }
      prevIndex = maxIdx
    }

    return chars.join('')
  }

  /**
   * In-tree Instant Local Morphological Recognizer
   * Performs vertical projection, segmentation, zoning, and template matching
   * for both English (0-9) and Persian/Arabic (۰-۹) digits with zero external dependencies.
   * @param {HTMLCanvasElement} canvas
   * @returns {string}
   */
  runLocalDigitOcr(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return ''

    var ctx = canvas.getContext('2d', { willReadFrequently: true })
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    var { binarized } = enhanceAndBinarize(imgData)
    var data = binarized.data
    var w = canvas.width
    var h = canvas.height

    // 1. Vertical projection profile (find horizontal columns with ink)
    var colDensity = new Int32Array(w)
    for (var x = 0; x < w; x++) {
      var count = 0
      for (var y = 0; y < h; y++) {
        // Black pixel is ink (value 0)
        if (data[(y * w + x) * 4] === 0) {
          count++
        }
      }
      colDensity[x] = count
    }

    // 2. Identify character segments (runs of columns with ink)
    var segments = []
    var inChar = false
    var startX = 0
    var minInkInCol = Math.max(2, Math.round(h * 0.05))

    for (var cx = 0; cx < w; cx++) {
      if (colDensity[cx] >= minInkInCol) {
        if (!inChar) {
          inChar = true
          startX = cx
        }
      } else {
        if (inChar) {
          inChar = false
          var charW = cx - startX
          if (charW >= 2 && charW <= Math.round(h * 2.5)) {
            segments.push({ startX, endX: cx, width: charW })
          }
        }
      }
    }
    if (inChar && (w - startX >= 2)) {
      segments.push({ startX, endX: w, width: w - startX })
    }

    if (segments.length === 0) return ''

    // 3. For each segment, extract bounding box and classify digit
    var recognizedChars = []

    for (var seg of segments) {
      // Horizontal bounds for this segment
      var minY = h
      var maxY = 0
      var inkPixels = 0

      for (var sy = 0; sy < h; sy++) {
        for (var sx = seg.startX; sx < seg.endX; sx++) {
          if (data[(sy * w + sx) * 4] === 0) {
            inkPixels++
            if (sy < minY) minY = sy
            if (sy > maxY) maxY = sy
          }
        }
      }

      var charH = maxY - minY + 1
      if (charH < Math.max(5, Math.round(h * 0.15))) continue

      // Compute 3x3 zoning density
      var grid = this.computeZoningGrid(data, w, seg.startX, seg.endX, minY, maxY)
      var digit = this.classifyDigitFromZoning(grid, seg.width, charH)
      if (digit) {
        recognizedChars.push(digit)
      }
    }

    return recognizedChars.join('')
  }

  /**
   * Computes a 3x3 normalized ink density grid for a character bounding box.
   */
  computeZoningGrid(data, imgW, startX, endX, startY, endY) {
    var grid = new Float32Array(9) // 3x3
    var boxW = endX - startX
    var boxH = endY - startY
    if (boxW <= 0 || boxH <= 0) return grid

    var cellW = boxW / 3
    var cellH = boxH / 3

    for (var y = startY; y < endY; y++) {
      var gy = Math.min(2, Math.floor((y - startY) / cellH))
      for (var x = startX; x < endX; x++) {
        var gx = Math.min(2, Math.floor((x - startX) / cellW))
        if (data[(y * imgW + x) * 4] === 0) {
          grid[gy * 3 + gx]++
        }
      }
    }

    // Normalize each cell by total cell area
    var cellArea = (boxW * boxH) / 9
    if (cellArea > 0) {
      for (var i = 0; i < 9; i++) {
        grid[i] = Math.min(1, grid[i] / cellArea)
      }
    }

    return grid
  }

  /**
   * Classifies a digit from 3x3 zoning density and aspect ratio.
   * Distinguishes both English (0-9) and Persian digits (۰, ۱, ۲, ۳, ۴, ۵, ۶, ۷, ۸, ۹).
   */
  classifyDigitFromZoning(grid, width, height) {
    var ratio = width / Math.max(1, height)

    // Very thin vertical stroke: English 1 or Persian 1 (۱)
    if (ratio < 0.35) {
      return '1'
    }

    // Persian dot zero (۰) or diamond: small width and small height
    if (ratio >= 0.7 && ratio <= 1.3 && (grid[4] > 0.4) && (grid[0] < 0.3 && grid[2] < 0.3 && grid[6] < 0.3 && grid[8] < 0.3)) {
      return '۰'
    }

    // Top, middle, bottom row densities
    var topRow = (grid[0] + grid[1] + grid[2]) / 3
    var midRow = (grid[3] + grid[4] + grid[5]) / 3
    var botRow = (grid[6] + grid[7] + grid[8]) / 3

    // Left, center, right column densities
    var leftCol = (grid[0] + grid[3] + grid[6]) / 3
    var centerCol = (grid[1] + grid[4] + grid[7]) / 3
    var rightCol = (grid[2] + grid[5] + grid[8]) / 3

    // High density at top (e.g. Persian 2 (۲) or 3 (۳) or 7 (۷) or 8 (۸))
    // Persian 7 (۷) - V-shaped: top left & right high, bottom center high
    if (grid[0] > 0.4 && grid[2] > 0.4 && grid[7] > 0.4 && topRow > botRow && midRow < 0.3) {
      return '۷'
    }

    // Persian 8 (۸) - Inverted V: top center high, bottom left & right high
    if (grid[1] > 0.4 && grid[6] > 0.4 && grid[8] > 0.4 && botRow > topRow && midRow < 0.3) {
      return '۸'
    }

    // Persian 5 (۵) - Heart/inverted teardrop: middle/center closed loop
    if (grid[4] < 0.25 && topRow > 0.3 && botRow > 0.3 && leftCol > 0.3 && rightCol > 0.3) {
      // Loop digit: either 0, 8, 9, 6 or ۵
      if (topRow > 0.4 && botRow > 0.4 && grid[4] < 0.15) {
        return '0'
      }
    }

    // Standard digit templates based on closest centroid
    var scores = [
      { char: '0', diff: Math.abs(topRow - 0.5) + Math.abs(botRow - 0.5) + Math.abs(midRow - 0.25) },
      { char: '1', diff: Math.abs(centerCol - 0.7) + Math.abs(leftCol - 0.1) },
      { char: '2', diff: Math.abs(topRow - 0.5) + Math.abs(grid[5] - 0.5) + Math.abs(botRow - 0.6) },
      { char: '3', diff: Math.abs(topRow - 0.5) + Math.abs(rightCol - 0.6) + Math.abs(botRow - 0.5) },
      { char: '4', diff: Math.abs(leftCol - 0.5) + Math.abs(midRow - 0.5) + Math.abs(rightCol - 0.6) },
      { char: '5', diff: Math.abs(topRow - 0.6) + Math.abs(grid[3] - 0.5) + Math.abs(botRow - 0.6) },
      { char: '6', diff: Math.abs(leftCol - 0.6) + Math.abs(botRow - 0.5) + Math.abs(grid[4] - 0.4) },
      { char: '7', diff: Math.abs(topRow - 0.6) + Math.abs(rightCol - 0.5) },
      { char: '8', diff: Math.abs(topRow - 0.5) + Math.abs(midRow - 0.5) + Math.abs(botRow - 0.5) },
      { char: '9', diff: Math.abs(topRow - 0.5) + Math.abs(rightCol - 0.6) + Math.abs(grid[4] - 0.4) }
    ]

    scores.sort((a, b) => a.diff - b.diff)
    return scores[0]?.char || '1'
  }

  /**
   * Selects the most relevant candidate according to targetKind.
   */
  pickBestCandidate(candidates, targetKind = 'any') {
    if (!candidates || candidates.length === 0) return null

    if (targetKind === 'standard') {
      var std = candidates.find((c) => c.kind === 'standard_license' || c.kind === 'gold_standard')
      if (std) return std
    }

    if (targetKind === 'ifda') {
      var ifda = candidates.find((c) => c.kind === 'ifda_permit' || c.english.length >= 8)
      if (ifda) return ifda
    }

    if (targetKind === 'barcode') {
      var bc = candidates.find((c) => c.kind === 'ean13' || c.kind === 'irancode' || c.english.length === 13)
      if (bc) return bc
    }

    return candidates[0]
  }

  /**
   * Helper to normalize any input source into an HTMLCanvasElement.
   */
  async resolveSourceToCanvas(source) {
    if (typeof document === 'undefined' || !source) return null

    if (source instanceof HTMLCanvasElement) return source

    if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement) {
      if (!source.videoWidth || !source.videoHeight) return null
      var canvas = document.createElement('canvas')
      canvas.width = source.videoWidth
      canvas.height = source.videoHeight
      var ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
      return canvas
    }

    if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
      var imgW = source.naturalWidth || source.width
      var imgH = source.naturalHeight || source.height
      if (!imgW || !imgH) return null
      var iCanvas = document.createElement('canvas')
      iCanvas.width = imgW
      iCanvas.height = imgH
      var iCtx = iCanvas.getContext('2d', { willReadFrequently: true })
      iCtx.drawImage(source, 0, 0, imgW, imgH)
      return iCanvas
    }

    if (typeof Blob !== 'undefined' && source instanceof Blob) {
      if (typeof createImageBitmap === 'function') {
        try {
          var bitmap = await createImageBitmap(source)
          var bCanvas = document.createElement('canvas')
          bCanvas.width = bitmap.width
          bCanvas.height = bitmap.height
          var bCtx = bCanvas.getContext('2d', { willReadFrequently: true })
          bCtx.drawImage(bitmap, 0, 0)
          return bCanvas
        } catch {
          // fallback to FileReader
        }
      }

      return new Promise((resolve) => {
        var reader = new FileReader()
        reader.onload = (e) => {
          var img = new Image()
          img.onload = () => {
            var fCanvas = document.createElement('canvas')
            fCanvas.width = img.width
            fCanvas.height = img.height
            var fCtx = fCanvas.getContext('2d', { willReadFrequently: true })
            fCtx.drawImage(img, 0, 0)
            resolve(fCanvas)
          }
          img.onerror = () => resolve(null)
          img.src = e.target.result
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(source)
      })
    }

    return null
  }
}

export var rapidOcrEngine = new RapidOcrEngine()
