#!/usr/bin/env node
// 本地开发模拟后端:
//  - 提供 box/chavy.boxjs.html 页面与静态资源
//  - 模拟 /query/boxdata、/api/save 等接口, 数据保存在内存中, 重启后重置
//  - 仅用于开发调试, 不实现脚本执行 / Gist 同步等依赖真实代理环境的能力
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.PORT || 8090)
const HTML = path.join(ROOT, 'box', 'chavy.boxjs.html')

const ICONS = ['/box/icons/BoxJs.light.png', '/box/icons/BoxJs.png']
const ENV_ICONS = ['/box/icons/BoxJs.light.png', '/box/icons/BoxJs.png']

function createDemoSettings() {
  return [
    { id: 'demo_slider', name: '演示滑块', desc: '范围 0-100, 步长 5', type: 'slider', val: 30, min: 0, max: 100, step: 5 },
    { id: 'demo_boolean', name: '演示开关', desc: '布尔类型设置', type: 'boolean', val: true },
    { id: 'demo_text', name: '演示文本', desc: '普通文本框', type: 'text', val: 'hello boxjs' },
    { id: 'demo_textarea', name: '演示多行文本', desc: 'textarea 类型', type: 'textarea', val: '第一行\n第二行' },
    {
      id: 'demo_radios',
      name: '演示单选',
      desc: 'radios 类型',
      type: 'radios',
      val: 'a',
      items: [
        { label: '选项 A', key: 'a' },
        { label: '选项 B', key: 'b' },
        { label: '选项 C', key: 'c' }
      ]
    },
    {
      id: 'demo_checkboxes',
      name: '演示多选',
      desc: 'checkboxes 类型',
      type: 'checkboxes',
      val: ['x'],
      items: [
        { label: 'X', key: 'x' },
        { label: 'Y', key: 'y' },
        { label: 'Z', key: 'z' }
      ]
    },
    { id: 'demo_color', name: '演示颜色', desc: 'colorpicker 类型', type: 'colorpicker', val: '#007AFFFF', canvas: true },
    { id: 'demo_number', name: '演示数字', desc: 'number 类型', type: 'number', val: 42 },
    {
      id: 'demo_selects',
      name: '演示下拉',
      desc: 'selects 类型',
      type: 'selects',
      val: 'one',
      items: [
        { label: '一', key: 'one' },
        { label: '二', key: 'two' },
        { label: '三', key: 'three' }
      ]
    }
  ]
}

function createDemoBox() {
  return {
    syscfgs: {
      version: '0.99.99',
      versionType: 'dev',
      env: 'NodeJs',
      isDebugMode: false,
      envs: [
        { id: 'Surge', icons: ENV_ICONS },
        { id: 'QuanX', icons: ENV_ICONS },
        { id: 'Loon', icons: ENV_ICONS },
        { id: 'Stash', icons: ENV_ICONS },
        { id: 'NodeJs', icons: ENV_ICONS }
      ],
      boxjs: { repo: 'https://github.com/fmz200/BoxJS', icon: ICONS[1], icons: ICONS },
      orz3: { repo: 'https://github.com/Orz-3/mini', icon: ICONS[1] }
    },
    usercfgs: {
      lang: 'zh-CN',
      theme: 'auto',
      bgimgs: '',
      bgimg: '',
      isTransparentIcons: false,
      isWallpaperMode: false,
      isHidedSearchBar: false,
      isAutoSearchBar: false,
      isHidedNaviBottom: false,
      isAutoNaviBottom: false,
      isMute: false,
      isMuteQueryAlert: false,
      isHideHelp: false,
      isHideBoxIcon: false,
      isHideMyTitle: false,
      isHideCoding: false,
      isHideRefresh: false,
      isHidedSearch: false,
      isEditFavApp: false,
      isLeftBoxIcon: false,
      recentapps: [],
      isHidedAppIcons: false,
      isDebugWeb: false,
      debugger_web: '',
      debugger_webs: '',
      favapps: ['DemoApp', 'EnvTest'],
      appsubs: [{ id: 'demo-sub-1', url: 'https://example.com/boxjs-demo.json', enable: true }],
      favapppanel: [],
      subapppanel: [],
      sysapppanel: [],
      httpapi: '',
      httpapis: '',
      name: '本地测试',
      icon: '',
      viewkeys: [],
      gist_cache_key: [],
      gist_exclude_keys: [],
      color_light_primary: '',
      color_dark_primary: '',
      changeBgImgEnterDefault: '',
      changeBgImgOutDefault: ''
    },
    sysapps: [
      {
        id: 'DemoApp',
        name: '演示应用',
        author: '@local',
        repo: 'https://github.com/fmz200/BoxJS',
        icons: ICONS,
        desc: '这是本地模拟的演示应用，覆盖全部设置控件类型。',
        descs: ['支持 descs 多段描述。', '修改设置后点击「保存」即可写入内存数据。'],
        keys: ['boxjs_host', 'boxjs_demo_key'],
        script: '',
        script_timeout: 10,
        scripts: [
          { name: '演示脚本 (本地不执行)', script: 'https://example.com/demo.js', script_timeout: 10 }
        ],
        settings: createDemoSettings()
      },
      {
        id: 'EnvTest',
        name: '环境测试',
        author: '@local',
        repo: 'https://github.com/fmz200/BoxJS',
        icons: ICONS,
        desc: '无设置项的极简应用，用于验证应用详情页的空态。',
        keys: ['boxjs_host'],
        script: '',
        script_timeout: 10,
        scripts: [],
        settings: []
      }
    ],
    appSubCaches: {
      'https://example.com/boxjs-demo.json': {
        id: 'demo-sub-1',
        name: '演示订阅',
        author: '@demo',
        repo: 'https://github.com/fmz200/BoxJS',
        icon: ICONS[1],
        updateTime: Date.now() - 5 * 60 * 1000,
        apps: [
          {
            id: 'SubApp',
            name: '订阅应用',
            author: '@demo',
            repo: 'https://github.com/fmz200/BoxJS',
            icons: ICONS,
            desc: '来自演示订阅的应用。',
            keys: ['boxjs_host'],
            settings: [{ id: 'sub_setting', name: '订阅设置', desc: '布尔类型', type: 'boolean', val: false }]
          }
        ]
      }
    },
    datas: { boxjs_host: 'localhost:8090', boxjs_demo_key: '演示数据' },
    sessions: [],
    curSessions: {},
    globalbaks: [],
    versions: { releases: [] },
    knownKeys: [],
    extraDatas: {}
  }
}

let box = createDemoBox()

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2'
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

function sendBox(res) {
  sendJson(res, 200, JSON.parse(JSON.stringify(box)))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

async function serveStatic(res, urlPath) {
  let filePath
  if (urlPath === '/' || urlPath === '/boxjs.html' || urlPath === '/box/chavy.boxjs.html') {
    filePath = HTML
  } else {
    filePath = path.join(ROOT, decodeURIComponent(urlPath.replace(/^\/+/, '')))
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }
  }
  try {
    const data = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const { pathname } = url
  const method = req.method || 'GET'

  try {
    // ---- 查询接口 ----
    if (method === 'GET' && pathname === '/query/boxdata') return sendBox(res)
    if (method === 'GET' && pathname === '/query/versions') return sendJson(res, 200, { releases: [] })
    if (method === 'GET' && pathname.startsWith('/query/data/')) {
      const key = decodeURIComponent(pathname.slice('/query/data/'.length))
      return sendJson(res, 200, { val: box.datas[key] ?? '' })
    }
    if (method === 'GET' && pathname.startsWith('/query/baks/')) {
      const id = decodeURIComponent(pathname.slice('/query/baks/'.length))
      const bak = box.globalbaks.find((b) => b.id === id)
      return sendJson(res, 200, bak ? bak.bak : {})
    }

    // ---- 写入接口 ----
    if (method === 'POST' && pathname === '/api/save') {
      const body = await readBody(req)
      if (Array.isArray(body)) {
        for (const { key, val } of body) {
          if (key === 'chavy_boxjs_userCfgs') {
            box.usercfgs = JSON.parse(val)
          } else if (key === 'chavy_boxjs_sessions') {
            box.sessions = JSON.parse(val)
          } else {
            box.datas[key] = val
          }
        }
      }
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/saveData') {
      const body = await readBody(req)
      box.datas[body.key] = body.val
      return sendJson(res, 200, { val: body.val })
    }
    if (method === 'POST' && pathname === '/api/addAppSub') {
      const body = await readBody(req)
      if (body && body.url) box.usercfgs.appsubs.push({ id: body.id, url: body.url, enable: true })
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/reloadAppSub') return sendBox(res)
    if (method === 'POST' && pathname === '/api/saveGlobalBak') {
      const body = await readBody(req)
      box.globalbaks.push({ ...body, createTime: body.createTime || new Date().toISOString() })
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/impGlobalBak') {
      const body = await readBody(req)
      box.globalbaks.push(body)
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/updateGlobalBak') {
      const body = await readBody(req)
      const bak = box.globalbaks.find((b) => b.id === body.id)
      if (bak) bak.name = body.name
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/delGlobalBak') {
      const body = await readBody(req)
      box.globalbaks = box.globalbaks.filter((b) => b.id !== body.id)
      return sendBox(res)
    }
    if (method === 'POST' && pathname === '/api/revertGlobalBak') return sendBox(res)
    if (method === 'POST' && pathname === '/api/runScript') {
      return sendJson(res, 200, { output: '[本地模拟] 未连接真实代理后端, 无法执行脚本。' })
    }
    if (method === 'POST' && pathname === '/api/gistBackup') {
      return sendJson(res, 200, { code: 1, message: '本地模拟不支持 Gist 同步' })
    }
    if (method === 'POST' && pathname === '/api/gistRestore') {
      return sendJson(res, 200, { code: 1, message: '本地模拟不支持 Gist 同步' })
    }

    // ---- 静态资源 ----
    if (method === 'GET') return serveStatic(res, pathname)

    res.writeHead(405)
    res.end('Method Not Allowed')
  } catch (err) {
    console.error('[dev-server]', err)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
  }
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用, 请先释放该端口或改用其他端口: PORT=xxxx npm run dev`)
  } else {
    console.error(err)
  }
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`BoxJS 本地模拟后端已启动:`)
  console.log(`  页面: http://localhost:${PORT}`)
  console.log(`  数据保存在内存中, 重启后重置; Ctrl+C 停止`)
})
