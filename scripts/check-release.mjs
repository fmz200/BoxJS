#!/usr/bin/env node
// 发布版本一致性校验：
//  - 测试版(beta)读取 box/release/box.release.beta.json；正式版读取 box/release/box.release.json
//  - 仅 tag 推送才走正式版发布流水线；测试版(master)不创建任何发布
//  - 当前通道对应清单的最新条目与 $.version 一致
//  - CI 中 tag 触发时, tag 名与 $.version 一致
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const app = fs.readFileSync(path.join(ROOT, 'box', 'chavy.boxjs.js'), 'utf8')
const m = app.match(/^\$\.version = '([^']+)'$/m)
const version = m ? m[1] : null

const isBeta = /^\$\.versionType = 'beta'$/m.test(app)
const isTagRun = process.env.GITHUB_REF_TYPE === 'tag' && !!process.env.GITHUB_REF_NAME
// 正式版只通过 tag 发布: tag 触发时校验正式版清单, 其余场景校验当前通道清单
const primaryFile = isTagRun
  ? 'box.release.json'
  : isBeta
    ? 'box.release.beta.json'
    : 'box.release.json'
const releasesFiles = ['box.release.json', 'box.release.beta.json']

const errors = []
if (!version) errors.push('无法从 box/chavy.boxjs.js 解析 $.version')
for (const f of releasesFiles) {
  const p = path.join(ROOT, 'box', 'release', f)
  if (!fs.existsSync(p)) {
    errors.push(`缺少版本清单文件 ${f}`)
    continue
  }
  const releases = JSON.parse(fs.readFileSync(p, 'utf8'))
  const latest = releases.releases && releases.releases[0]
  if (f === primaryFile && (!latest || latest.version !== version)) {
    errors.push(`${f} 最新版本(${latest && latest.version}) 与 $.version(${version}) 不一致`)
  }
}
if (isTagRun) {
  // tag 流水线只允许发布正式版: 该版本在正式版清单中必须标记为 release
  const stable = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'box', 'release', 'box.release.json'), 'utf8')
  )
  const entry = stable.releases && stable.releases.find((r) => r.version === version)
  if (!entry || !Array.isArray(entry.tags) || !entry.tags.includes('release')) {
    errors.push(`tag ${version} 在 box.release.json 中未标记为正式版(release)，拒绝发布（测试版不创建发布）`)
  }
}
if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME) {
  if (process.env.GITHUB_REF_NAME !== version) {
    errors.push(
      `git tag(${process.env.GITHUB_REF_NAME}) 与 $.version(${version}) 不一致`
    )
  }
}

// 校验正式版 rewrite 模板已锁定到 $.version
const rewriteDir = path.join(ROOT, 'box', 'rewrite')
const stableModules = [
  'boxjs.rewrite.surge.sgmodule',
  'boxjs.rewrite.loon.plugin',
  'boxjs.rewrite.quanx.conf',
  'boxjs.rewrite.stash.stoverride'
]
const betaModules = [
  'boxjs.rewrite.surge.beta.sgmodule',
  'boxjs.rewrite.loon.beta.plugin',
  'boxjs.rewrite.quanx.beta.conf',
  'boxjs.rewrite.stash.beta.stoverride'
]
const refRe = /fmz200\/BoxJS\/([^/]+)\//g

for (const f of stableModules) {
  const p = path.join(rewriteDir, f)
  const src = fs.readFileSync(p, 'utf8')
  const refs = [...src.matchAll(refRe)].map((x) => x[1])
  const bad = refs.filter((r) => r !== `@${version}`)
  if (!refs.length) errors.push(`${f} 中未找到 fmz200/BoxJS 引用`)
  else if (bad.length) errors.push(`${f} 引用 ${bad.join(',')}，应与 $.version(@${version}) 一致`)
}

for (const f of betaModules) {
  const p = path.join(rewriteDir, f)
  if (!fs.existsSync(p)) {
    errors.push(`缺少测试版模块 ${f}`)
    continue
  }
  const src = fs.readFileSync(p, 'utf8')
  const refs = [...src.matchAll(refRe)].map((x) => x[1])
  const bad = refs.filter((r) => r !== 'master')
  if (!refs.length) errors.push(`${f} 中未找到 fmz200/BoxJS 引用`)
  else if (bad.length) errors.push(`${f} 引用 ${bad.join(',')}，测试版模块应指向 master`)
}

if (errors.length) {
  console.error('check-release 失败:\n' + errors.join('\n'))
  process.exit(1)
}
console.log(
  `OK: $.version=${version}（${isTagRun ? '正式版(tag)' : isBeta ? '测试版' : '正式版'}，主清单 ${primaryFile}），正式模板已锁定，测试版模块指向 master`
)
