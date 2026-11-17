import test from 'node:test'
import assert from 'node:assert/strict'
import { PACKAGING_LOGOS, LOGO_CATEGORIES } from '../src/data/packagingLogos.js'

test('packagingLogos database integrity', () => {
  assert.ok(Array.isArray(PACKAGING_LOGOS))
  assert.ok(PACKAGING_LOGOS.length >= 15, `Expected at least 15 logos, got ${PACKAGING_LOGOS.length}`)

  var validCategoryIds = LOGO_CATEGORIES.map((c) => c.id).filter((id) => id !== 'all')
  var seenIds = new Set()

  for (var logo of PACKAGING_LOGOS) {
    // Unique ID
    assert.ok(logo.id, 'Logo should have an id')
    assert.ok(!seenIds.has(logo.id), `Duplicate logo id detected: ${logo.id}`)
    seenIds.add(logo.id)

    // Required fields
    assert.ok(logo.titleFa && logo.titleFa.trim().length > 0, `Logo ${logo.id} missing titleFa`)
    assert.ok(logo.authorityFa && logo.authorityFa.trim().length > 0, `Logo ${logo.id} missing authorityFa`)
    assert.ok(logo.summaryFa && logo.summaryFa.trim().length > 0, `Logo ${logo.id} missing summaryFa`)
    assert.ok(logo.descriptionFa && logo.descriptionFa.trim().length > 0, `Logo ${logo.id} missing descriptionFa`)
    assert.ok(logo.verificationFa && logo.verificationFa.trim().length > 0, `Logo ${logo.id} missing verificationFa`)

    // Valid category
    assert.ok(
      validCategoryIds.includes(logo.category),
      `Logo ${logo.id} has invalid category: ${logo.category}. Expected one of ${validCategoryIds.join(', ')}`
    )

    // SVG string valid and safe
    assert.ok(logo.svg && logo.svg.includes('<svg') && logo.svg.includes('</svg>'), `Logo ${logo.id} missing valid SVG markup`)
  }
})

test('packagingLogos includes essential Iranian regulatory marks', () => {
  var isiri = PACKAGING_LOGOS.find((l) => l.id === 'isiri-standard')
  assert.ok(isiri, 'Standard ISIRI mark must exist')
  assert.ok(isiri.verificationFa.includes('۱۰۰۰۱۵۱۷'), 'ISIRI must mention inquiry SMS 10001517')

  var ifda = PACKAGING_LOGOS.find((l) => l.id === 'ifda-apple')
  assert.ok(ifda, 'IFDA Apple mark must exist')
  assert.ok(ifda.verificationFa.includes('پروانه'), 'IFDA must mention license verification')

  var ttac = PACKAGING_LOGOS.find((l) => l.id === 'ttac-authenticity')
  assert.ok(ttac, 'TTAC mark must exist')
  assert.ok(ttac.verificationFa.includes('۲۰۰۰۸۸۲۲') || ttac.verificationFa.includes('ttac.ir'), 'TTAC must include inquiry SMS or website')

  var halal = PACKAGING_LOGOS.find((l) => l.id === 'halal-mark')
  assert.ok(halal, 'Halal mark must exist')
})

test('packagingLogos category filtering works properly', () => {
  var healthGov = PACKAGING_LOGOS.filter((l) => l.category === 'health_gov')
  assert.ok(healthGov.length >= 4, 'Health & Gov category should contain official Iranian logos')

  var recycle = PACKAGING_LOGOS.filter((l) => l.category === 'recycle')
  assert.ok(recycle.length >= 3, 'Recycle category should contain recycling codes and symbols')

  var usage = PACKAGING_LOGOS.filter((l) => l.category === 'usage')
  assert.ok(usage.length >= 4, 'Usage category should contain kitchen and storage symbols')
})
