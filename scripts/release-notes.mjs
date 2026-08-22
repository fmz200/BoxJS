#!/usr/bin/env node
// 从 box/release/box.release.json 生成指定版本的 Markdown Release notes → dist/release-body.md
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const version = process.argv[2]

if (!version) {
  console.error('用法: node scripts/release-notes.mjs <版本号>')
  process.exit(1)
}

const releases = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'box', 'release', 'box.release.json'), 'utf8')
)
const entry = releases.releases.find((r) => r.version === version)
if (!entry) {
  console.error(`box.release.json 中没有版本 ${version}`)
  process.exit(1)
}

const lines = [
  `## v${entry.version}${entry.tags && entry.tags.length ? ` (${entry.tags.join('/')})` : ''}`
]
if (entry.author) {
  lines.push('', entry.author.startsWith('@') ? `> ${entry.author}` : `> @${entry.author}`)
}
if (entry.msg) lines.push('', entry.msg)
for (const note of entry.notes || []) {
  lines.push('', `### ${note.name}`)
  for (const d of note.descs || []) lines.push(`- ${d}`)
}

const body = lines.join('\n') + '\n'
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true })
fs.writeFileSync(path.join(ROOT, 'dist', 'release-body.md'), body)
console.log(`已生成 dist/release-body.md (v${version})`)
