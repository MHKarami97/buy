import test from 'node:test'
import assert from 'node:assert/strict'
import { groupDigits, parseTomanInput } from '../src/services/currency.js'

test('parseTomanInput converts Persian and Arabic digits and strips noise', () => {
  assert.equal(parseTomanInput('۱۲۰٬۰۰۰ تومان'), '120000')
  assert.equal(parseTomanInput('٣٤٥'), '345')
  assert.equal(parseTomanInput('1,200,000'), '1200000')
  assert.equal(parseTomanInput('abc'), '')
  assert.equal(parseTomanInput('000'), '0')
  assert.equal(parseTomanInput('007500'), '7500')
})

test('groupDigits inserts thousands separators', () => {
  assert.equal(groupDigits('1200000'), '1,200,000')
  assert.equal(groupDigits('999'), '999')
  assert.equal(groupDigits('1000'), '1,000')
  assert.equal(groupDigits(''), '')
})
