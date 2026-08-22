import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const src = fs.readFileSync(path.join(ROOT, 'Env.js'), 'utf8')
  const mod = { exports: {} }
  const req = createRequire(import.meta.url)
  new Function('module', 'exports', 'require', src + '\nmodule.exports = Env;')(
    mod,
    mod.exports,
    req
  )
  return mod.exports
}

test('Env Node 模式基础读写', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'boxjs-smoke-'))
  const prev = process.cwd()
  process.chdir(cwd)
  try {
    const Env = loadEnv()
    const $ = new Env('smoke')
    assert.ok($.isNode())
    $.setdata('hello', 'k')
    assert.equal($.getdata('k'), 'hello')
    $.setjson({ a: [1, 2] }, 'j')
    assert.deepEqual($.getjson('j'), { a: [1, 2] })
    assert.equal($.time('yyyy-MM-dd').length, 10)
  } finally {
    process.chdir(prev)
  }
})
