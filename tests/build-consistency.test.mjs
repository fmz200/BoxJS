import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('npm run check: 构建一致性通过', () => {
  const out = execFileSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'build.mjs'), '--check'],
    { cwd: ROOT, encoding: 'utf8' }
  )
  assert.match(out, /一致性校验通过/)
})

test('npm run check:release: 版本一致性通过', () => {
  const out = execFileSync(
    process.execPath,
    [path.join(ROOT, 'scripts', 'check-release.mjs')],
    { cwd: ROOT, encoding: 'utf8' }
  )
  assert.match(out, /OK: \$\.version=/)
})
