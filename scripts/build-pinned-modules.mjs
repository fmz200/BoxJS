#!/usr/bin/env node
// 生成锁定到指定版本的 rewrite 模块（master → @<version>），输出到 dist/，
// 并生成 SHA256SUMS.txt。用于 GitHub Release 资产。
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2]

if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
  console.error('用法: node scripts/build-pinned-modules.mjs <版本号>')
  process.exit(1)
}

const app = fs.readFileSync(path.join(ROOT, 'box', 'chavy.boxjs.js'), 'utf8')
const m = app.match(/^\$\.version = '([^']+)'$/m)
if (!m || m[1] !== version) {
  console.error(`版本不一致: 入参 ${version}, $.version=${m && m[1]}`)
  process.exit(1)
}

const files = [
  'boxjs.rewrite.surge.sgmodule',
  'boxjs.rewrite.surge.tf.sgmodule',
  'boxjs.rewrite.loon.plugin',
  'boxjs.rewrite.loon.tf.plugin',
  'boxjs.rewrite.quanx.conf',
  'boxjs.rewrite.quanx.tf.conf',
  'boxjs.rewrite.stash.stoverride',
  'boxjs.rewrite.stash.tf.stoverride'
]

const dist = path.join(ROOT, 'dist')
fs.mkdirSync(dist, { recursive: true })

const sums = []
for (const f of files) {
  const srcPath = path.join(ROOT, 'box', 'rewrite', f)
  const src = fs.readFileSync(srcPath, 'utf8')
  if (!src.includes('fmz200/BoxJS/master/')) {
    console.error(`${f} 中未找到 fmz200/BoxJS/master/ 引用`)
    process.exit(1)
  }
  const pinned = src.split('fmz200/BoxJS/master/').join(`fmz200/BoxJS/@${version}/`)
  const outPath = path.join(dist, f)
  fs.writeFileSync(outPath, pinned)
  const hash = createHash('sha256').update(pinned).digest('hex')
  sums.push(`${hash}  ${f}`)
  console.log(`已生成 ${f} (sha256=${hash.slice(0, 12)}...)`)
}

fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), sums.join('\n') + '\n')
console.log(`已生成 dist/SHA256SUMS.txt (${files.length} 个模块)`)
