#!/usr/bin/env node
// 正式版模块锁定与发布资产生成：
//   --lock <版本>  将 box/rewrite 下正式模板的内部引用更新为 @<版本>（提交到仓库）
//   <版本>         校验模板已锁定到目标版本，复制到 dist/ 并生成 SHA256SUMS.txt
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const LOCK = args[0] === '--lock'
const version = LOCK ? args[1] : args[0]

if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
  console.error('用法: node scripts/build-pinned-modules.mjs [--lock] <版本号>')
  process.exit(1)
}

const app = fs.readFileSync(path.join(ROOT, 'box', 'chavy.boxjs.js'), 'utf8')
const m = app.match(/^\$\.version = '([^']+)'$/m)
if (!m || m[1] !== version) {
  console.error(`版本不一致: 入参 ${version}, $.version=${m && m[1]}`)
  process.exit(1)
}

// 正式版模块（不含测试版 beta 模块）
const files = [
  'boxjs.rewrite.surge.sgmodule',
  'boxjs.rewrite.loon.plugin',
  'boxjs.rewrite.quanx.conf',
  'boxjs.rewrite.stash.stoverride'
]
const REF_RE = /fmz200\/BoxJS\/(?:master|@\d+\.\d+\.\d+)\//g

if (LOCK) {
  for (const f of files) {
    const p = path.join(ROOT, 'box', 'rewrite', f)
    const src = fs.readFileSync(p, 'utf8')
    const refs = [...src.matchAll(/fmz200\/BoxJS\/([^/]+)\//g)].map((x) => x[1])
    if (!refs.length) {
      console.error(`${f} 中未找到 fmz200/BoxJS 引用`)
      process.exit(1)
    }
    const pending = refs.filter((r) => r !== `@${version}`)
    if (!pending.length) {
      console.log(`${f} 已锁定 @${version}，跳过`)
      continue
    }
    const locked = src.replace(REF_RE, `fmz200/BoxJS/@${version}/`)
    fs.writeFileSync(p, locked)
    console.log(`已锁定 ${f} → @${version}`)
  }
  console.log('锁定完成，请运行 npm run check 确认后提交')
  process.exit(0)
}

const dist = path.join(ROOT, 'dist')
fs.mkdirSync(dist, { recursive: true })

const sums = []
for (const f of files) {
  const srcPath = path.join(ROOT, 'box', 'rewrite', f)
  const src = fs.readFileSync(srcPath, 'utf8')
  if (!src.includes(`fmz200/BoxJS/@${version}/`)) {
    console.error(`${f} 未锁定到 @${version}（当前引用与目标版本不一致）`)
    process.exit(1)
  }
  const outPath = path.join(dist, f)
  fs.writeFileSync(outPath, src)
  const hash = createHash('sha256').update(src).digest('hex')
  sums.push(`${hash}  ${f}`)
  console.log(`已生成 ${f} (sha256=${hash.slice(0, 12)}...)`)
}

fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), sums.join('\n') + '\n')
console.log(`已生成 dist/SHA256SUMS.txt (${files.length} 个正式版模块)`)
