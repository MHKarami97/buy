import { decode1dBarcodeFromImageData } from './Ean1dDecoder.js'

/**
 * Universal Barcode & QR Code Scanner Engine
 * -------------------------------------------
 * - Uses native hardware-accelerated BarcodeDetector (Chrome/Android/Samsung Internet/Edge)
 * - Fallbacks to in-tree 1D canvas image decoder when BarcodeDetector is absent
 * - Audio & haptic vibration feedback
 */
export class BarcodeScannerEngine {
  constructor() {
    this.detector = null
    this.audioCtx = null
    this.initNativeDetector()
  }

  static isNativeSupported() {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window
  }

  async initNativeDetector() {
    if (BarcodeScannerEngine.isNativeSupported()) {
      try {
        var supported = await window.BarcodeDetector.getSupportedFormats?.() || []
        var desiredFormats = [
          'qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e',
          'code_128', 'code_39', 'code_93', 'data_matrix', 'itf'
        ]
        var formats = desiredFormats.filter((fmt) => supported.length === 0 || supported.includes(fmt))
        this.detector = new window.BarcodeDetector({ formats: formats.length > 0 ? formats : undefined })
      } catch {
        this.detector = null
      }
    }
  }

  /**
   * Scans a frame from an HTMLVideoElement or Canvas
   * @param {HTMLVideoElement | HTMLCanvasElement | ImageBitmap} source
   * @returns {Promise<{ rawValue: string, format: string } | null>}
   */
  async detect(source) {
    if (!source) return null

    // 1. Try native BarcodeDetector first
    if (this.detector) {
      try {
        var barcodes = await this.detector.detect(source)
        if (barcodes && barcodes.length > 0) {
          var best = barcodes[0]
          return {
            rawValue: best.rawValue || '',
            format: best.format || 'unknown'
          }
        }
      } catch {
        // continue to fallback
      }
    }

    // 2. In-tree canvas fallback
    try {
      var canvas = source
      if (source instanceof HTMLVideoElement) {
        if (!source.videoWidth || !source.videoHeight) return null
        canvas = document.createElement('canvas')
        canvas.width = Math.min(640, source.videoWidth)
        canvas.height = Math.min(480, source.videoHeight)
        var ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
      }

      if (canvas instanceof HTMLCanvasElement) {
        var cCtx = canvas.getContext('2d', { willReadFrequently: true })
        var imgData = cCtx.getImageData(0, 0, canvas.width, canvas.height)
        var decoded = decode1dBarcodeFromImageData(imgData)
        if (decoded) {
          return {
            rawValue: decoded.code,
            format: decoded.format
          }
        }
      }
    } catch {
      // ignore frame read errors
    }

    return null
  }

  /**
   * Scans an image File or Blob
   * @param {File | Blob} file
   * @returns {Promise<{ rawValue: string, format: string } | null>}
   */
  async detectFromFile(file) {
    if (!file) return null

    // If native createImageBitmap is supported
    if (typeof createImageBitmap === 'function') {
      try {
        var bitmap = await createImageBitmap(file)
        var result = await this.detect(bitmap)
        bitmap.close?.()
        if (result) return result
      } catch {
        // fallback to Image element
      }
    }

    // Fallback via Image element and canvas
    return new Promise((resolve) => {
      var img = new Image()
      var url = URL.createObjectURL(file)
      img.onload = async () => {
        URL.revokeObjectURL(url)
        var canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        var ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        var res = await this.detect(canvas)
        resolve(res)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      img.src = url
    })
  }

  /**
   * Sound & Haptic Feedback on successful scan
   */
  playSuccessFeedback() {
    // Vibration
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([40, 30, 60])
      }
    } catch {
      // ignore vibration errors
    }

    // Audio chirp using Web Audio API
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      if (!this.audioCtx) this.audioCtx = new AudioContextClass()
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      var now = this.audioCtx.currentTime
      var osc = this.audioCtx.createOscillator()
      var gain = this.audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1760, now) // A6
      osc.frequency.exponentialRampToValueAtTime(2349.32, now + 0.08) // D7
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.connect(gain)
      gain.connect(this.audioCtx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // ignore audio errors
    }
  }
}

export var barcodeScannerEngine = new BarcodeScannerEngine()
