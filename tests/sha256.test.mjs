import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { sha256hex } from '../scripts/sha256.mjs'

const cases = [
  '',
  'abc',
  'The quick brown fox jumps over the lazy dog',
  '中文测试',
  'emoji 🚀 and 中文 mixed',
  'a'.repeat(1000),
  '盒子 BoxJS 1234567890'.repeat(200),
  '<title>BoxJs</title>\n<script>const a = "😀";</script>'
]

for (const c of cases) {
  test(`sha256(${JSON.stringify(c.slice(0, 24))}...)`, () => {
    const expected = createHash('sha256').update(c, 'utf8').digest('hex')
    assert.equal(sha256hex(c), expected)
  })
}
