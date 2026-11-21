import test from 'node:test'
import assert from 'node:assert/strict'
import { OcrModelManager, DEFAULT_RAPIDOCR_MODEL_URL } from '../src/services/ocr/OcrModelManager.js'

// Simple mock storage for Node environment
class MockStorage {
  constructor() {
    this.map = new Map()
  }
  getItem(k) { return this.map.get(k) || null }
  setItem(k, v) { this.map.set(k, String(v)) }
  removeItem(k) { this.map.delete(k) }
}

test('OcrModelManager defaults to local engine and default model url', () => {
  var storage = new MockStorage()
  var manager = new OcrModelManager(storage)

  assert.equal(manager.getPreferredEngine(), 'local')
  assert.equal(manager.getModelUrl(), DEFAULT_RAPIDOCR_MODEL_URL)
})

test('OcrModelManager updates preferred engine and custom url', () => {
  var storage = new MockStorage()
  var manager = new OcrModelManager(storage)

  manager.setPreferredEngine('rapidocr')
  assert.equal(manager.getPreferredEngine(), 'rapidocr')

  manager.setModelUrl('https://example.com/custom.onnx')
  assert.equal(manager.getModelUrl(), 'https://example.com/custom.onnx')

  manager.setModelUrl('')
  assert.equal(manager.getModelUrl(), DEFAULT_RAPIDOCR_MODEL_URL)
})

test('OcrModelManager caches in-memory and deletes model', async () => {
  var storage = new MockStorage()
  var manager = new OcrModelManager(storage)

  assert.equal(await manager.isModelDownloaded(), false)
  assert.equal(await manager.getCachedModelSize(), null)

  // Simulate cached blob in inMemoryCache
  var fakeBlob = new Blob([new Uint8Array(1024 * 1024 * 10)], { type: 'application/octet-stream' })
  manager.inMemoryCache.set(manager.getModelUrl(), fakeBlob)

  assert.equal(await manager.isModelDownloaded(), true)
  var size = await manager.getCachedModelSize()
  assert.ok(size && size.includes('10.0 مگابایت'))

  await manager.deleteModel()
  assert.equal(await manager.isModelDownloaded(), false)
})
