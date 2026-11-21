/**
 * OCR Model & Engine Settings Manager
 * -------------------------------------
 * Manages user preference (local morphological vs RapidOCR ONNX),
 * downloading, caching, and storage status of the RapidOCR PP-OCRv4 model
 * via standard browser CacheStorage (PWA offline persistence).
 */

export const DEFAULT_RAPIDOCR_MODEL_URL =
  'https://huggingface.co/SWHL/RapidOCR/resolve/main/PP-OCRv4/ch_PP-OCRv4_rec_infer.onnx'

export const OCR_CACHE_NAME = 'rapidocr-models-v1'
export const STORAGE_KEY_ENGINE_PREF = 'buy_ocr_preferred_engine'

export class OcrModelManager {
  constructor(storage = null) {
    this.storage = storage || (typeof window !== 'undefined' ? window.localStorage : null)
    this.inMemoryCache = new Map() // Fallback for tests/environments without CacheStorage
  }

  /**
   * Gets preferred OCR engine: 'local' (default) | 'rapidocr'
   * @returns {'local' | 'rapidocr'}
   */
  getPreferredEngine() {
    try {
      var val = this.storage?.getItem(STORAGE_KEY_ENGINE_PREF)
      return val === 'rapidocr' ? 'rapidocr' : 'local'
    } catch {
      return 'local'
    }
  }

  /**
   * Sets preferred engine and dispatches change event.
   * @param {'local' | 'rapidocr'} engine
   */
  setPreferredEngine(engine) {
    var val = engine === 'rapidocr' ? 'rapidocr' : 'local'
    try {
      this.storage?.setItem(STORAGE_KEY_ENGINE_PREF, val)
    } catch {
      // ignore quota errors
    }
    this.notifyChange()
  }

  /**
   * Gets the official model download URL (fixed).
   * @returns {string}
   */
  getModelUrl() {
    return DEFAULT_RAPIDOCR_MODEL_URL
  }

  /**
   * Checks if the RapidOCR model is currently cached and ready offline.
   * @returns {Promise<boolean>}
   */
  async isModelDownloaded() {
    var url = this.getModelUrl()

    // 1. Try browser CacheStorage
    if (typeof caches !== 'undefined') {
      try {
        var cache = await caches.open(OCR_CACHE_NAME)
        var match = await cache.match(url)
        if (match) return true
      } catch {
        // continue to inMemory
      }
    }

    // 2. Check inMemory fallback (for testing)
    return this.inMemoryCache.has(url)
  }

  /**
   * Gets the formatted file size of the cached model, e.g. "10.8 MB".
   * Returns null if not downloaded.
   * @returns {Promise<string | null>}
   */
  async getCachedModelSize() {
    var url = this.getModelUrl()

    if (typeof caches !== 'undefined') {
      try {
        var cache = await caches.open(OCR_CACHE_NAME)
        var match = await cache.match(url)
        if (match) {
          var blob = await match.blob()
          var mb = blob.size / (1024 * 1024)
          return `${mb.toFixed(1)} مگابایت`
        }
      } catch {
        // ignore
      }
    }

    if (this.inMemoryCache.has(url)) {
      var memBlob = this.inMemoryCache.get(url)
      var memMb = memBlob.size / (1024 * 1024)
      return `${memMb.toFixed(1)} مگابایت`
    }

    return null
  }

  /**
   * Downloads the RapidOCR model with progress tracking and caches it.
   * @param {(progress: { loaded: number, total: number, percent: number }) => void} [onProgress]
   * @returns {Promise<{ ok: boolean, sizeMb: string, error?: string }>}
   */
  async downloadModel(onProgress = null) {
    var url = this.getModelUrl()

    try {
      var response = await fetch(url, { mode: 'cors' })
      if (!response.ok) {
        throw new Error(`خطای دانلود از سرور: کد وضعیت ${response.status}`)
      }

      var contentLength = response.headers.get('content-length')
      var total = contentLength ? parseInt(contentLength, 10) : 0
      var loaded = 0

      var reader = response.body ? response.body.getReader() : null
      var chunks = []

      if (reader) {
        while (true) {
          var { done, value } = await reader.read()
          if (done) break
          if (value) {
            chunks.push(value)
            loaded += value.length
            if (onProgress && total > 0) {
              onProgress({
                loaded,
                total,
                percent: Math.min(100, Math.round((loaded / total) * 100))
              })
            }
          }
        }
      } else {
        // Fallback if reader not supported
        var buf = await response.arrayBuffer()
        chunks.push(new Uint8Array(buf))
        loaded = buf.byteLength
      }

      var finalBlob = new Blob(chunks, { type: 'application/octet-stream' })

      // Store in CacheStorage
      if (typeof caches !== 'undefined') {
        var cache = await caches.open(OCR_CACHE_NAME)
        var cacheResp = new Response(finalBlob, {
          headers: {
            'content-type': 'application/octet-stream',
            'content-length': String(finalBlob.size)
          }
        })
        await cache.put(url, cacheResp)
      } else {
        this.inMemoryCache.set(url, finalBlob)
      }

      this.notifyChange()
      var sizeMb = `${(finalBlob.size / (1024 * 1024)).toFixed(1)} مگابایت`
      return { ok: true, sizeMb }
    } catch (err) {
      console.error('RapidOCR model download failed:', err)
      return { ok: false, sizeMb: '0', error: err.message || 'خطا در برقراری ارتباط' }
    }
  }

  /**
   * Deletes the cached model from browser storage.
   * @returns {Promise<boolean>}
   */
  async deleteModel() {
    var url = this.getModelUrl()

    if (typeof caches !== 'undefined') {
      try {
        var cache = await caches.open(OCR_CACHE_NAME)
        await cache.delete(url)
      } catch {
        // ignore
      }
    }

    this.inMemoryCache.delete(url)
    this.notifyChange()
    return true
  }

  /**
   * Returns a local object URL (blob:) to the cached model for ONNX Runtime session,
   * or null if model is not cached.
   * @returns {Promise<string | null>}
   */
  async getModelBlobUrl() {
    var url = this.getModelUrl()

    if (typeof caches !== 'undefined') {
      try {
        var cache = await caches.open(OCR_CACHE_NAME)
        var match = await cache.match(url)
        if (match) {
          var blob = await match.blob()
          return URL.createObjectURL(blob)
        }
      } catch {
        // ignore
      }
    }

    if (this.inMemoryCache.has(url)) {
      var memBlob = this.inMemoryCache.get(url)
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        return URL.createObjectURL(memBlob)
      }
    }

    return null
  }

  /**
   * Dispatches window event so all UI components update reactively.
   */
  notifyChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ocr-model-changed'))
    }
  }
}

export var ocrModelManager = new OcrModelManager()
