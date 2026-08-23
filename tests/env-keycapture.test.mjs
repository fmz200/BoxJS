import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const req = createRequire(import.meta.url)

function loadEnv() {
  const src = fs.readFileSync(path.join(ROOT, 'Env.js'), 'utf8')
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', src + '\nmodule.exports = Env;')(
    mod,
    mod.exports,
    req
  )
  return mod.exports
}

function freshEnv() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'boxjs-capture-'))
  const prev = process.cwd()
  process.chdir(cwd)
  const Env = loadEnv()
  const $ = new Env('capture-test')
  return { $, cleanup: () => process.chdir(prev) }
}

function registry($) {
  const raw = $.getdata('chavy_boxjs_known_keys')
  const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
  return Array.isArray(arr) ? arr : []
}

test('setdata 自动登记 key 到 chavy_boxjs_known_keys', () => {
  const { $, cleanup } = freshEnv()
  try {
    $.setdata('v1', 'my_token_key')
    assert.ok(registry($).includes('my_token_key'))
  } finally {
    cleanup()
  }
})

test('内部 key 不登记', () => {
  const { $, cleanup } = freshEnv()
  try {
    $.setdata('x', 'chavy_boxjs_internal')
    $.setdata('y', 'gist')
    const keys = registry($)
    assert.ok(!keys.includes('chavy_boxjs_internal'))
    assert.ok(!keys.includes('gist'))
  } finally {
    cleanup()
  }
})

test('chavy_boxjs_key_capture=false 时关闭登记', () => {
  const { $, cleanup } = freshEnv()
  try {
    $.setdata('false', 'chavy_boxjs_key_capture')
    $.setdata('v', 'should_not_register')
    assert.ok(!registry($).includes('should_not_register'))
  } finally {
    cleanup()
  }
})

test('读取也会登记非内部 key', () => {
  const { $, cleanup } = freshEnv()
  try {
    $.getdata('read_only_key')
    assert.ok(registry($).includes('read_only_key'))
  } finally {
    cleanup()
  }
})
