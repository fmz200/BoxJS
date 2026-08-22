#!/usr/bin/env node
// 发布版本一致性校验：
//  - box/chavy.boxjs.js 的 $.version 与 box/release/box.release.json 最新条目一致
//  - CI 中 tag 触发时, tag 名与 $.version 一致
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const app = fs.readFileSync(path.join(ROOT, 'box', 'chavy.boxjs.js'), 'utf8')
const m = app.match(/^\$\.version = '([^']+)'$/m)
const version = m ? m[1] : null

const releases = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'box', 'release', 'box.release.json'), 'utf8')
)
const latest = releases.releases && releases.releases[0]

const errors = []
if (!version) errors.push('无法从 box/chavy.boxjs.js 解析 $.version')
if (!latest || latest.version !== version) {
  errors.push(
    `box.release.json 最新版本(${latest && latest.version}) 与 $.version(${version}) 不一致`
  )
}
if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME) {
  if (process.env.GITHUB_REF_NAME !== version) {
    errors.push(
      `git tag(${process.env.GITHUB_REF_NAME}) 与 $.version(${version}) 不一致`
    )
  }
}

if (errors.length) {
  console.error('check-release 失败:\n' + errors.join('\n'))
  process.exit(1)
}
console.log(`OK: $.version=${version} 与 release.json 一致`)
