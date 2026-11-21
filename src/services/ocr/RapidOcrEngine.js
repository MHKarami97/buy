/**
 * RapidOCR + ONNX Runtime Engine
 * --------------------------------
 * Dual-engine OCR processor optimized for Iranian product packaging numbers:
 * 1. Deep Learning Engine: Runs RapidOCR (PP-OCRv4) models via ONNX Runtime (onnxruntime-web / WASM/WebGL).
 * 2. Instant Local Engine: Zero-latency client-side morphological digit recognizer (0-9 and ۰-۹) for offline PWA operation.
 * 3. Normalizes and extracts numbers (Standard license, IFDA permit, Barcode EAN-13, Gold codes, Dates).
 */

import { cropRoi, computeOtsuThreshold, enhanceAndBinarize, prepareRapidOcrTensor } from './imagePreprocessor.js'
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
   * Scales a large canvas down to maxDim if needed to ensure rapid, memory-safe execution on mobile photos.
   * @param {HTMLCanvasElement} canvas
   * @param {number} maxDim
   * @returns {HTMLCanvasElement}
   */
  scaleCanvasIfNeeded(canvas, maxDim = 1280) {
    if (typeof document === 'undefined' || !canvas || !canvas.width || !canvas.height) return canvas
    if (canvas.width <= maxDim && canvas.height <= maxDim) return canvas

    var scale = maxDim / Math.max(canvas.width, canvas.height)
    var nw = Math.round(canvas.width * scale)
    var nh = Math.round(canvas.height * scale)

    var scaled = document.createElement('canvas')
    scaled.width = nw
    scaled.height = nh
    var ctx = scaled.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(canvas, 0, 0, nw, nh)
    return scaled
  }

  /**
   * Main OCR recognition method.
   * Takes a video element, canvas, or image, crops the target ROI if present,
   * extracts candidate number lines via multi-threshold connected-components,
   * classifies digits (Persian ۰-۹, English 0-9, slashes /), and returns
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

    canvas = this.scaleCanvasIfNeeded(canvas, 1280)

    var result = null
    var snapshotDataUrl = ''

    // 2. If ROI is specified (e.g. camera viewfinder), attempt scanning inside ROI first
    if (roi) {
      var croppedCanvas = cropRoi(canvas, roi)
      if (croppedCanvas) {
        result = await this.recognizeCanvas(croppedCanvas, targetKind)
        try {
          snapshotDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.85)
        } catch {
          // ignore
        }
      }
    }

    // 3. Fallback to full frame if no ROI was specified or if ROI scan returned no candidates
    if (!result || !result.candidates || result.candidates.length === 0) {
      var fullResult = await this.recognizeCanvas(canvas, targetKind)
      if (fullResult && fullResult.candidates && fullResult.candidates.length > 0) {
        result = fullResult
        try {
          snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        } catch {
          // ignore
        }
      } else if (!result) {
        result = fullResult
      }
    }

    var candidates = result?.candidates || []
    var best = this.pickBestCandidate(candidates, targetKind)
    var durationMs = Date.now() - startTime

    return {
      ok: Boolean(best || candidates.length > 0),
      bestNumber: best ? best.english : (candidates[0]?.english || ''),
      bestNumberPersian: best ? best.persian : (candidates[0]?.persian || ''),
      bestCandidate: best || candidates[0] || null,
      candidates,
      rawText: result?.rawText || '',
      snapshotDataUrl: snapshotDataUrl || '',
      engine: result?.engine || 'local-ocr',
      durationMs
    }
  }

  /**
   * Processes an image canvas to extract all text lines, number sequences, and candidates.
   * Supports dual engine: fast local Connected Component OCR + optional RapidOCR ONNX model.
   * @param {HTMLCanvasElement} canvas
   * @param {string} targetKind
   * @returns {Promise<{ candidates: any[], rawText: string, engine: 'onnx-rapidocr' | 'local-ocr' }>}
   */
  async recognizeCanvas(canvas, targetKind = 'any') {
    var rawText = ''
    var engineUsed = 'local-ocr'
    var preferredEngine = ocrModelManager.getPreferredEngine()

    // 1. Run local Connected-Component line & number OCR
    var localLines = this.runLocalLineOcr(canvas)
    rawText = localLines.map((l) => l.text).join('\n')

    // 2. If RapidOCR ONNX model is chosen and ready, also run line inferences
    if (preferredEngine === 'rapidocr') {
      var isReady = await this.ensureOnnxSession()
      if (isReady && this.onnxSession) {
        try {
          var onnxTexts = []
          for (var line of localLines) {
            if (line.box && typeof document !== 'undefined') {
              var lineCrop = cropRoi(canvas, {
                x: Math.max(0, line.box.minX - 4),
                y: Math.max(0, line.box.minY - 2),
                width: line.box.maxX - line.box.minX + 8,
                height: line.box.maxY - line.box.minY + 4
              })
              if (lineCrop) {
                var oTxt = await this.runOnnxInference(lineCrop)
                if (oTxt && oTxt.trim()) onnxTexts.push(oTxt.trim())
              }
            }
          }
          if (onnxTexts.length > 0) {
            rawText = rawText ? rawText + '\n' + onnxTexts.join('\n') : onnxTexts.join('\n')
            engineUsed = 'onnx-rapidocr'
          }
        } catch (e) {
          console.warn('ONNX inference failed, using local engine output:', e)
        }
      }
    }

    // 3. Extract candidate numbers from text
    var candidates = extractNumberCandidates(rawText)

    // 4. Also add any detected digit sequences directly from lines
    for (var l of localLines) {
      var clean = toEnglishDigits(l.text).replace(/[^\d/Gg-]/g, '').trim()
      if (clean && clean.length >= 4) {
        var existing = candidates.some((c) => c.english === clean)
        if (!existing) {
          var info = classifyNumberKind(clean)
          candidates.push({
            raw: l.text,
            english: clean,
            persian: toPersianDigits(clean),
            kind: info.kind,
            labelFa: info.labelFa,
            confidence: info.confidence
          })
        }
      }
    }

    var filteredCandidates = this.cleanAndFilterCandidates(candidates, targetKind)

    return {
      candidates: filteredCandidates,
      rawText,
      engine: engineUsed
    }
  }

  /**
   * Cleans, deduplicates, and ranks candidate numbers by target context.
   * @param {Array<any>} candidates
   * @param {string} targetKind
   * @returns {Array<any>}
   */
  cleanAndFilterCandidates(candidates, targetKind = 'any') {
    var cleanedMap = new Map()

    for (var c of candidates) {
      var raw = (c.english || c.raw || '').trim()
      var s = raw.replace(/^[^\dGg]+|[^\d]+$/g, '')

      if (s.includes('//') || (s.match(/\//g) || []).length > 2) continue
      if (s.length < 4 || s.length > 18) continue

      var info = classifyNumberKind(s)
      var eng = toEnglishDigits(s)
      var per = toPersianDigits(s)

      if (!cleanedMap.has(eng)) {
        cleanedMap.set(eng, {
          raw: s,
          english: eng,
          persian: per,
          kind: info.kind,
          labelFa: info.labelFa,
          confidence: info.confidence
        })
      }
    }

    var list = Array.from(cleanedMap.values())

    list.sort((a, b) => {
      if (targetKind === 'standard') {
        var aStd = (a.kind === 'standard_license' || a.kind === 'gold_standard') && !a.english.includes('/')
        var bStd = (b.kind === 'standard_license' || b.kind === 'gold_standard') && !b.english.includes('/')
        if (aStd && !bStd) return -1
        if (!aStd && bStd) return 1
      } else if (targetKind === 'ifda') {
        var aIfda = (a.kind === 'ifda_permit' || a.english.includes('/')) && a.english.length >= 6
        var bIfda = (b.kind === 'ifda_permit' || b.english.includes('/')) && b.english.length >= 6
        if (aIfda && !bIfda) return -1
        if (!aIfda && bIfda) return 1
      } else if (targetKind === 'barcode') {
        var aBc = a.kind === 'ean13' || a.kind === 'irancode' || a.english.length === 13
        var bBc = b.kind === 'ean13' || b.kind === 'irancode' || b.english.length === 13
        if (aBc && !bBc) return -1
        if (!aBc && bBc) return 1
      }
      return (b.confidence || 0) - (a.confidence || 0)
    })

    return list.slice(0, 10)
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
   * Instant Local Morphological Recognizer
   * Extracts text lines using Connected Component Clustering across multi-level thresholds,
   * segmenting and classifying both Persian (۰-۹) and English (0-9) packaging numbers.
   * @param {HTMLCanvasElement | { data: Uint8ClampedArray | Uint8Array, width: number, height: number }} canvas
   * @returns {Array<{ text: string, minX: number, maxX: number, minY: number, maxY: number, box: any }>}
   */
  runLocalLineOcr(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return []

    var imgData
    if (canvas.data && canvas.width && canvas.height) {
      imgData = canvas
    } else {
      var ctx = canvas.getContext('2d', { willReadFrequently: true })
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    var w = canvas.width
    var h = canvas.height
    var data = imgData.data

    // Convert RGBA to Grayscale
    var gray = new Uint8Array(w * h)
    for (var i = 0; i < w * h; i++) {
      var idx = i * 4
      gray[i] = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114)
    }

    // Compute Otsu threshold and test dual levels (Otsu & Otsu + 15)
    var threshOtsu = computeOtsuThreshold(data)
    var thresholds = [threshOtsu]
    if (threshOtsu + 15 <= 230) thresholds.push(threshOtsu + 15)

    var detectedLines = []
    var seenRegions = []

    for (var thresh of thresholds) {
      var lines = this.extractTextLinesFromBinary(gray, w, h, thresh)
      for (var line of lines) {
        var already = seenRegions.some((r) => {
          return Math.abs(r.minY - line.minY) <= 4 &&
            Math.abs(r.minX - line.minX) <= 12 &&
            Math.abs(r.maxX - line.maxX) <= 12
        })
        if (!already) {
          seenRegions.push({ minX: line.minX, maxX: line.maxX, minY: line.minY, maxY: line.maxY })
          detectedLines.push(line)
        }
      }
    }

    return detectedLines
  }

  /**
   * Backwards-compatible alias for runLocalLineOcr that returns plain text.
   * @param {HTMLCanvasElement} canvas
   * @returns {string}
   */
  runLocalDigitOcr(canvas) {
    var lines = this.runLocalLineOcr(canvas)
    return lines.map((l) => l.text).join(' ')
  }

  /**
   * Extracts text lines from a binarized grayscale image using Connected Component Labeling.
   */
  extractTextLinesFromBinary(gray, w, h, thresh) {
    var binary = new Uint8Array(w * h)
    for (var i = 0; i < w * h; i++) binary[i] = gray[i] < thresh ? 1 : 0

    // Two-pass CCL with union-find
    var labels = new Int32Array(w * h)
    var parent = [0]
    function find(i) {
      var root = i
      while (parent[root] > 0) root = parent[root]
      var curr = i
      while (curr !== root) {
        var nxt = parent[curr]
        if (nxt <= 0) break
        parent[curr] = root
        curr = nxt
      }
      return root
    }
    function union(i, j) {
      var rootI = find(i)
      var rootJ = find(j)
      if (rootI !== rootJ) parent[rootI] = rootJ
    }

    var nextLabel = 1
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var idx = y * w + x
        if (binary[idx] === 0) continue
        var top = y > 0 ? labels[(y - 1) * w + x] : 0
        var left = x > 0 ? labels[y * w + (x - 1)] : 0
        if (top === 0 && left === 0) {
          labels[idx] = nextLabel
          parent.push(0)
          nextLabel++
        } else if (top > 0 && left === 0) {
          labels[idx] = top
        } else if (top === 0 && left > 0) {
          labels[idx] = left
        } else {
          labels[idx] = top
          if (top !== left) union(top, left)
        }
      }
    }

    var boxes = new Map()
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var idx = y * w + x
        var l = labels[idx]
        if (l === 0) continue
        var root = find(l)
        var b = boxes.get(root)
        if (!b) {
          b = { minX: x, maxX: x, minY: y, maxY: y, count: 0 }
          boxes.set(root, b)
        } else {
          if (x < b.minX) b.minX = x
          if (x > b.maxX) b.maxX = x
          if (y < b.minY) b.minY = y
          if (y > b.maxY) b.maxY = y
          b.count++
        }
      }
    }

    // Filter character-sized blobs
    var charBlobs = []
    for (var [id, b] of boxes) {
      var bw = b.maxX - b.minX + 1
      var bh = b.maxY - b.minY + 1
      if (bh >= 6 && bh <= 60 && bw >= 2 && bw <= 55 && b.count >= 6 && (bw / bh) <= 3.0) {
        charBlobs.push({ ...b, w: bw, h: bh, cx: (b.minX + b.maxX) / 2, cy: (b.minY + b.maxY) / 2 })
      }
    }

    // Cluster into horizontal text lines
    charBlobs.sort((a, b) => a.minX - b.minX)
    var lines = []
    var visited = new Set()

    for (var i = 0; i < charBlobs.length; i++) {
      if (visited.has(i)) continue
      var cluster = [charBlobs[i]]
      visited.add(i)

      var queue = [charBlobs[i]]
      while (queue.length > 0) {
        var cur = queue.shift()
        for (var j = 0; j < charBlobs.length; j++) {
          if (visited.has(j)) continue
          var other = charBlobs[j]
          var maxH = Math.max(cur.h, other.h)
          var yDist = Math.abs(cur.cy - other.cy)
          var hRatio = Math.min(cur.h, other.h) / maxH

          if (yDist <= Math.max(3, maxH * 0.45) && hRatio >= 0.45) {
            var xDist = Math.max(0, Math.max(cur.minX, other.minX) - Math.min(cur.maxX, other.maxX))
            if (xDist <= maxH * 1.8) {
              visited.add(j)
              cluster.push(other)
              queue.push(other)
            }
          }
        }
      }

      if (cluster.length >= 3) {
        cluster.sort((a, b) => a.minX - b.minX)
        var minX = cluster[0].minX
        var maxX = cluster[cluster.length - 1].maxX
        var minY = Math.min(...cluster.map((c) => c.minY))
        var maxY = Math.max(...cluster.map((c) => c.maxY))
        var lineH = cluster.reduce((acc, c) => acc + c.h, 0) / cluster.length

        // Recognize characters in this line
        var chars = []
        for (var k = 0; k < cluster.length; k++) {
          var cb = cluster[k]
          if (k > 0) {
            var prev = cluster[k - 1]
            if (cb.minX - prev.maxX > lineH * 1.5) {
              chars.push(' ')
            }
          }
          var ch = this.classifyDigitFromSegment(binary, w, cb.minX, cb.maxX, cb.minY, cb.maxY)
          if (ch) chars.push(ch)
        }

        var lineText = chars.join('').trim()
        if (lineText) {
          lines.push({
            text: lineText,
            minX,
            maxX,
            minY,
            maxY,
            box: { minX, maxX, minY, maxY }
          })
        }
      }
    }

    return lines
  }

  /**
   * Resamples an ink bounding box to a canonical 10x14 density grid.
   */
  resampleGrid(binary, imgW, minX, maxX, minY, maxY, gw = 10, gh = 14) {
    var grid = new Float32Array(gw * gh)
    var bw = maxX - minX + 1
    var bh = maxY - minY + 1
    if (bw <= 0 || bh <= 0) return grid

    for (var gy = 0; gy < gh; gy++) {
      var y0 = minY + (gy * bh) / gh
      var y1 = minY + ((gy + 1) * bh) / gh
      for (var gx = 0; gx < gw; gx++) {
        var x0 = minX + (gx * bw) / gw
        var x1 = minX + ((gx + 1) * bw) / gw
        var tot = 0, ink = 0
        for (var y = Math.floor(y0); y <= Math.min(maxY, Math.ceil(y1)); y++) {
          for (var x = Math.floor(x0); x <= Math.min(maxX, Math.ceil(x1)); x++) {
            tot++
            if (binary[y * imgW + x]) ink++
          }
        }
        grid[gy * gw + gx] = tot > 0 ? ink / tot : 0
      }
    }
    return grid
  }

  /**
   * Classifies a character segment into a digit (0-9, ۰-۹) or separator (/ -).
   */
  classifyDigitFromSegment(binary, imgW, minX, maxX, minY, maxY) {
    var actualMinY = maxY, actualMaxY = minY, actualMinX = maxX, actualMaxX = minX
    var count = 0
    for (var y = minY; y <= maxY; y++) {
      for (var x = minX; x <= maxX; x++) {
        if (binary[y * imgW + x]) {
          count++
          if (y < actualMinY) actualMinY = y
          if (y > actualMaxY) actualMaxY = y
          if (x < actualMinX) actualMinX = x
          if (x > actualMaxX) actualMaxX = x
        }
      }
    }
    if (count === 0) return ''
    minX = actualMinX; maxX = actualMaxX; minY = actualMinY; maxY = actualMaxY
    var bw = maxX - minX + 1
    var bh = maxY - minY + 1
    var ratio = bw / bh

    // 1. Dash / Hyphen
    if (ratio >= 1.8 && bh <= 5) return '-'

    // 2. Persian Dot Zero (۰)
    if (ratio >= 0.55 && ratio <= 1.4 && bh <= 6 && bw <= 6 && count >= bw * bh * 0.45) {
      return '0'
    }

    // 3. Tilted slash (/) vs 1 / ۱
    var topX = 0, topC = 0, botX = 0, botC = 0
    for (var y = minY; y <= maxY; y++) {
      for (var x = minX; x <= maxX; x++) {
        if (binary[y * imgW + x]) {
          if (y - minY < bh * 0.3) { topX += (x - minX); topC++ }
          if (maxY - y < bh * 0.3) { botX += (x - minX); botC++ }
        }
      }
    }
    var avgTopX = topC ? topX / topC : bw / 2
    var avgBotX = botC ? botX / botC : bw / 2
    if (avgTopX - avgBotX >= 1.0 && bh >= 6 && ratio <= 0.65) {
      return '/'
    }

    // 4. Vertical stroke: 1 or ۱
    if (bw <= 4 && bh >= 6 && ratio < 0.45) {
      return '1'
    }

    var gw = 10, gh = 14
    var g = this.resampleGrid(binary, imgW, minX, maxX, minY, maxY, gw, gh)

    // Quadrant densities
    var tLeft = 0, tRight = 0, bLeft = 0, bRight = 0
    for (var gy = 0; gy < 7; gy++) {
      for (var gx = 0; gx < 5; gx++) tLeft += g[gy * gw + gx]
      for (var gx = 5; gx < 10; gx++) tRight += g[gy * gw + gx]
    }
    for (var gy = 7; gy < 14; gy++) {
      for (var gx = 0; gx < 5; gx++) bLeft += g[gy * gw + gx]
      for (var gx = 5; gx < 10; gx++) bRight += g[gy * gw + gx]
    }

    // 5. Persian 7 (۷): V shape
    var topCenterEmpty = (g[0 * gw + 4] + g[0 * gw + 5] + g[1 * gw + 4] + g[1 * gw + 5]) < 0.5
    var topLeftInk = (g[0 * gw + 0] + g[0 * gw + 1] + g[0 * gw + 2] + g[1 * gw + 1]) > 0.4
    var topRightInk = (g[0 * gw + 7] + g[0 * gw + 8] + g[0 * gw + 9] + g[1 * gw + 8]) > 0.4
    var botCenterInk = (g[9 * gw + 4] + g[9 * gw + 5] + g[10 * gw + 4] + g[10 * gw + 5]) > 0.4
    var botSidesEmpty = (g[10 * gw + 0] + g[10 * gw + 1] + g[10 * gw + 8] + g[10 * gw + 9]) < 0.4

    if (topCenterEmpty && (topLeftInk || topRightInk) && (botCenterInk || botSidesEmpty)) {
      return '7'
    }

    // 6. Persian 8 (۸): Inverted V shape
    var topCenterInk = (g[0 * gw + 4] + g[0 * gw + 5] + g[1 * gw + 4] + g[1 * gw + 5]) > 0.6
    var botCenterEmpty = (g[10 * gw + 4] + g[10 * gw + 5] + g[11 * gw + 4] + g[11 * gw + 5]) < 0.4
    if (topCenterInk && botCenterEmpty && (bLeft > 0.8 || bRight > 0.8)) {
      return '8'
    }

    // 7. Persian 9 (۹):
    // Top half: closed loop or mass on both sides; Bottom half: stem is on right
    if (tLeft > 0.8 && tRight > 0.8 && bLeft < 0.6 && bRight > 0.6) {
      return '9'
    }

    // 8. Persian 6 (۶):
    // Hook in top right, NO top left, stem on left
    if (tRight > 0.8 && tLeft < 0.5 && bLeft > 0.8) {
      return '6'
    }

    // 9. Persian 5 (۵) / English 0:
    // Closed loop with hollow center
    var cInk = 0
    for (var gy = 4; gy <= 8; gy++) {
      for (var gx = 3; gx <= 6; gx++) cInk += g[gy * gw + gx]
    }
    if (cInk < 0.8 && tLeft > 0.5 && tRight > 0.5 && bLeft > 0.5 && bRight > 0.5) {
      return '5'
    }

    // 10. Persian 3 (۳) vs 2 (۲):
    var topPeaks = 0
    var inP = false
    for (var gx = 0; gx < gw; gx++) {
      var v = (g[0 * gw + gx] + g[1 * gw + gx]) / 2
      if (v > 0.35) {
        if (!inP) { inP = true; topPeaks++ }
      } else {
        inP = false
      }
    }

    if (topPeaks >= 3 || ratio >= 0.78) {
      return '3'
    }
    if (topPeaks === 2 || ratio >= 0.52) {
      return '2'
    }

    return ratio > 0.7 ? '3' : '2'
  }

  /**
   * Selects the most relevant candidate according to targetKind.
   */
  pickBestCandidate(candidates, targetKind = 'any') {
    if (!candidates || candidates.length === 0) return null

    if (targetKind === 'standard') {
      var std = candidates.find((c) => (c.kind === 'standard_license' || c.kind === 'gold_standard') && !c.english.includes('/'))
      if (std) return std
    }

    if (targetKind === 'ifda') {
      var ifda = candidates.find((c) => c.kind === 'ifda_permit' || c.english.includes('/'))
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
