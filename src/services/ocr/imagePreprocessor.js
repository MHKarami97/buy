/**
 * Image Preprocessor for OCR
 * ---------------------------
 * Provides canvas-based cropping, contrast enhancement, Otsu binarization,
 * and tensor preparation (NCHW float32) for RapidOCR / ONNX models.
 */

/**
 * Crops a region of interest (ROI) from an image, video, or canvas.
 * @param {HTMLVideoElement | HTMLCanvasElement | ImageBitmap | HTMLImageElement} source
 * @param {{ x: number, y: number, width: number, height: number }} roi - In pixels or normalized (0-1)
 * @returns {HTMLCanvasElement | null}
 */
export function cropRoi(source, roi = null) {
  if (typeof document === 'undefined' || !source) return null

  var srcWidth = source.videoWidth || source.naturalWidth || source.width || 0
  var srcHeight = source.videoHeight || source.naturalHeight || source.height || 0
  if (!srcWidth || !srcHeight) return null

  var x = 0
  var y = 0
  var w = srcWidth
  var h = srcHeight

  if (roi) {
    var isNorm = roi.width <= 1 && roi.height <= 1
    x = Math.max(0, isNorm ? Math.round(roi.x * srcWidth) : Math.round(roi.x))
    y = Math.max(0, isNorm ? Math.round(roi.y * srcHeight) : Math.round(roi.y))
    w = Math.min(srcWidth - x, isNorm ? Math.round(roi.width * srcWidth) : Math.round(roi.width))
    h = Math.min(srcHeight - y, isNorm ? Math.round(roi.height * srcHeight) : Math.round(roi.height))
  }

  if (w <= 0 || h <= 0) return null

  var canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  var ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(source, x, y, w, h, 0, 0, w, h)
  return canvas
}

/**
 * Computes Otsu's optimal global threshold for a grayscale image.
 * @param {Uint8ClampedArray} data - RGBA buffer
 * @returns {number} threshold (0-255)
 */
export function computeOtsuThreshold(data) {
  var histogram = new Int32Array(256)
  var total = data.length / 4

  for (var i = 0; i < data.length; i += 4) {
    var gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    histogram[gray]++
  }

  var sumAll = 0
  for (var t = 0; t < 256; t++) {
    sumAll += t * histogram[t]
  }

  var sumB = 0
  var weightB = 0
  var maxVariance = 0
  var bestKStart = 128
  var bestKEnd = 128

  for (var k = 0; k < 256; k++) {
    weightB += histogram[k]
    if (weightB === 0) continue
    var weightF = total - weightB
    if (weightF === 0) break

    sumB += k * histogram[k]
    var meanB = sumB / weightB
    var meanF = (sumAll - sumB) / weightF

    var betweenVariance = weightB * weightF * Math.pow(meanB - meanF, 2)
    if (betweenVariance > maxVariance) {
      maxVariance = betweenVariance
      bestKStart = k
      bestKEnd = k
    } else if (betweenVariance === maxVariance && maxVariance > 0) {
      bestKEnd = k
    }
  }

  return Math.round((bestKStart + bestKEnd) / 2)
}

/**
 * Enhances contrast and binarizes image data.
 * @param {ImageData} imgData
 * @returns {{ binarized: ImageData, isDarkText: boolean }}
 */
export function enhanceAndBinarize(imgData) {
  var data = imgData.data
  var len = data.length
  var threshold = computeOtsuThreshold(data)

  var whiteCount = 0
  var total = len / 4

  // First pass: count white pixels to determine if text is dark on light or light on dark
  for (var i = 0; i < len; i += 4) {
    var gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    if (gray >= threshold) {
      whiteCount++
    }
  }

  // If most pixels are dark, it's light text on dark background -> invert
  var isDarkText = whiteCount > total * 0.5

  for (var j = 0; j < len; j += 4) {
    var g = Math.round(data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114)
    var isInk = isDarkText ? g < threshold : g >= threshold
    var val = isInk ? 0 : 255
    data[j] = val
    data[j + 1] = val
    data[j + 2] = val
    data[j + 3] = 255
  }

  return { binarized: imgData, isDarkText }
}

/**
 * Prepares an NCHW Float32Array tensor for RapidOCR / PP-OCR inference.
 * Resizes the image to targetHeight (e.g. 48 for PP-OCRv4), keeps aspect ratio,
 * and normalizes channels: (pixel / 255 - 0.5) / 0.5
 * @param {HTMLCanvasElement} canvas
 * @param {number} targetHeight
 * @param {number} maxWidth
 * @returns {{ tensorData: Float32Array, dims: number[], width: number, height: number } | null}
 */
export function prepareRapidOcrTensor(canvas, targetHeight = 48, maxWidth = 640) {
  if (typeof document === 'undefined' || !canvas) return null

  var origW = canvas.width
  var origH = canvas.height
  if (!origW || !origH) return null

  var ratio = origW / origH
  var targetW = Math.min(maxWidth, Math.max(targetHeight, Math.round(targetHeight * ratio)))

  var scaleCanvas = document.createElement('canvas')
  scaleCanvas.width = targetW
  scaleCanvas.height = targetHeight
  var ctx = scaleCanvas.getContext('2d', { willReadFrequently: true })

  // Fill white background before drawing
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetHeight)
  ctx.drawImage(canvas, 0, 0, targetW, targetHeight)

  var imgData = ctx.getImageData(0, 0, targetW, targetHeight)
  var data = imgData.data

  // PP-OCR input shape: [1, 3, targetHeight, targetW]
  var tensorSize = 3 * targetHeight * targetW
  var floatData = new Float32Array(tensorSize)

  var channelSize = targetHeight * targetW

  for (var y = 0; y < targetHeight; y++) {
    for (var x = 0; x < targetW; x++) {
      var pixelIdx = (y * targetW + x) * 4
      var r = data[pixelIdx]
      var g = data[pixelIdx + 1]
      var b = data[pixelIdx + 2]

      // Normalization: (v / 255.0 - 0.5) / 0.5
      var normR = (r / 255.0 - 0.5) / 0.5
      var normG = (g / 255.0 - 0.5) / 0.5
      var normB = (b / 255.0 - 0.5) / 0.5

      var idx = y * targetW + x
      floatData[idx] = normR                     // Channel 0 (R)
      floatData[channelSize + idx] = normG      // Channel 1 (G)
      floatData[channelSize * 2 + idx] = normB  // Channel 2 (B)
    }
  }

  return {
    tensorData: floatData,
    dims: [1, 3, targetHeight, targetW],
    width: targetW,
    height: targetHeight
  }
}
