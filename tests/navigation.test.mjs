import test from 'node:test'
import assert from 'node:assert/strict'
import { FEATURES, PRIMARY_FEATURES, MORE_FEATURES, DASHBOARD_FEATURES, TONES, isFeatureActive } from '../src/data/appFeatures.js'
import { ICON_PATHS } from '../src/data/iconPaths.js'

test('feature ids and routes are unique', () => {
  assert.equal(new Set(FEATURES.map((f) => f.id)).size, FEATURES.length)
  assert.equal(new Set(FEATURES.map((f) => f.to)).size, FEATURES.length)
})

test('bottom navigation keeps exactly four primary destinations', () => {
  assert.equal(PRIMARY_FEATURES.length, 4)
  assert.equal(PRIMARY_FEATURES[0].id, 'home')
  assert.ok(MORE_FEATURES.length > 0)
})

test('every feature has an existing icon, a known tone and a description', () => {
  FEATURES.forEach((feature) => {
    assert.ok(ICON_PATHS[feature.icon], `missing icon ${feature.icon}`)
    assert.ok(TONES[feature.tone], `missing tone ${feature.tone}`)
    assert.ok(feature.desc.length > 0)
  })
})

test('dashboard excludes home, lists and settings, and covers all remaining features', () => {
  var ids = DASHBOARD_FEATURES.map((f) => f.id)
  ;['home', 'lists', 'settings'].forEach((id) => assert.ok(!ids.includes(id)))
  assert.equal(ids.length, FEATURES.filter((f) => !['home', 'lists', 'settings'].includes(f.id)).length)
})

test('active matching handles nested routes and does not leak from home', () => {
  var byId = Object.fromEntries(FEATURES.map((f) => [f.id, f]))
  assert.equal(isFeatureActive(byId.home, '/'), true)
  assert.equal(isFeatureActive(byId.home, '/lists'), false)
  assert.equal(isFeatureActive(byId.lists, '/checklist/abc'), true)
  assert.equal(isFeatureActive(byId.occasions, '/occasions/shopping'), true)
  assert.equal(isFeatureActive(byId.reports, '/history/a/b/c'), true)
  assert.equal(isFeatureActive(byId.guide, '/guidebook'), false)
})
