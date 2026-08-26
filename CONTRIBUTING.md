# 贡献指南

## 环境要求

* Node.js >= 18（CI 使用 Node 24，推荐 18 LTS 或更高）
* npm（随 Node.js 安装）

## 快速开始

```bash
npm install
```

## 本地开发（可视化调试）

页面源码是 `box/chavy.boxjs.html`（Vue 2 + Vuetify 2 单页应用）。它依赖代理工具
（Surge / QuanX / Loon 等）注入的后端 API（`/query/boxdata`、`/api/save` 等），
**直接用浏览器打开 HTML 文件是空白页**。测试页面有两种方式：

### 默认行为：连接真实后端

前端默认把 axios baseURL 设为 `https://boxjs.com`（无需任何参数），由本机代理工具
（Surge / Loon / QuanX 等）的 BoxJS 模块把该域名重写到本地后端。因此：

* 浏览器直接打开 http://localhost:8090 即连接**真实后端**，适合日常联调与验收新 UI
* 需要代理环境已安装 BoxJS 模块且 HTTPS 解密证书已信任（浏览器能正常打开
  https://boxjs.com 即说明就绪）
* 保存类操作会写入真实代理环境的数据，联调时注意先备份

后端已开启 CORS（`Access-Control-Allow-Origin: *`），跨域调用无需额外配置。
快速验证环境（`-k` 用于信任代理工具的自签证书）：

```bash
curl -k https://boxjs.com/query/boxdata -o /dev/null -w "%{http_code} %{size_download}\n"
```

返回 `200` 和较大的 `size_download` 即说明真实后端可达。

### 方案 A：本地模拟后端（不依赖代理环境）

仓库内置了一个本地模拟后端（`scripts/dev-server.mjs`），不依赖 Surge / Loon 等代理工具：

```bash
npm run dev
```

* 浏览器访问（**注意：空 `baseURL=` 表示同源模拟**）：

  ```
  http://localhost:8090/?baseURL=
  ```

* 页面带有一套固定演示数据：
  * 首页收藏图标（长按拖拽排序、编辑模式）
  * 「应用」页：收藏 / 订阅 / 内置三个分组，演示应用包含 slider、boolean、
    textarea、radios、checkboxes、colorpicker、number、selects 等全部设置控件
  * 「订阅」页：一条演示订阅（可增删、排序、复制、分享）
  * 「我的」页：个人资料、数据统计、全局备份
* 端口被占用时启动命令会提示，可用 `PORT=xxxx npm run dev` 换端口
* 数据保存在内存中：
  * 修改偏好、应用设置、会话、订阅、备份都会实时生效
  * **刷新或重启服务后重置为初始演示数据**（不会写真实代理环境）

模拟后端覆盖的接口：

| 接口 | 说明 |
| --- | --- |
| `GET /` | 返回页面（`box/chavy.boxjs.html`） |
| `GET /query/boxdata` | 演示数据（syscfgs / usercfgs / sysapps / appSubCaches / datas…） |
| `GET /query/versions` | 空版本列表（避免触发更新弹窗） |
| `GET /query/data/:key` | 查询数据 |
| `GET /query/baks/:id` | 备份详情 |
| `POST /api/save` | 保存用户偏好 / 会话 / 应用数据 |
| `POST /api/saveData` | 保存数据查看器的键值 |
| `POST /api/addAppSub` | 添加订阅 |
| `POST /api/reloadAppSub` | 刷新订阅 |
| `POST /api/saveGlobalBak` 等备份接口 | 全局备份的增删改、导入导出、恢复 |

**本地模拟不实现**（依赖真实代理环境，测试时请跳过）：

* `/api/runScript`：只返回占位结果，不执行脚本
* Gist 同步（`/api/gistBackup`、`/api/gistRestore`）：返回失败提示
* Surge HTTP-API、真实订阅抓取
* 真实代理环境的通知（`$.msg`）

### 方案 B：指定真实后端（等价于默认行为）

需要本机代理工具（Surge / Loon / QuanX 等）已安装 BoxJS 模块并运行，使
`https://boxjs.com` 被重写到本地后端（HTTPS 解密证书需已安装并信任，浏览器可正常
打开 https://boxjs.com 即说明环境就绪）。

```bash
npm run dev
```

然后浏览器访问（**关键：加 `baseURL` 参数**）：

```
http://localhost:8090/?baseURL=https://boxjs.com
```

与默认行为完全等价（不加参数也是连这个后端），只是显式声明了后端地址。
页面本身由本地提供（走最新 UI 代码），所有数据接口（`/query/boxdata`、`/api/save`、
`/api/runScript`、订阅刷新、Gist 同步等）都请求真实后端：

* 真实代理环境的所有能力都可用：脚本执行、通知、HTTP-API、订阅抓取
* 原理：页面 `created()` 读取 `?baseURL=` 并设为 axios baseURL；**无参数时默认
  `https://boxjs.com`**，`?baseURL=`（空值）则回落为同源请求（即本地模拟后端）

### 手动测试清单（改 UI 后建议逐项验收）

* [ ] 深浅色切换：侧栏 → 外观 → 主题（自动 / 暗黑 / 明亮），切换后顶栏、底栏、
      抽屉、卡片均为毛玻璃 / 分层背景，无刺眼跳变
* [ ] 字体：系统字体栈（iOS 为 SF Pro + PingFang SC，macOS 为系统默认），无 Roboto
* [ ] 主题色：默认浅色 `#007AFF`、深色 `#0A84FF`；在「我的」数据里改
      `color_light_primary` / `color_dark_primary` 后仍可自定义
* [ ] 悬浮球：只剩「刷新」和「搜索」两个按钮，双击悬浮球仍可刷新
* [ ] 侧栏分组：外观 / 主页 / 导航 / 通知 / 显示 / 工具 / 关于，条目清晰可读
* [ ] 首页：收藏图标拖拽排序、编辑模式删除、搜索跳转
* [ ] 应用详情：设置项保存、会话复制 / 使用 / 关联、脚本运行入口（工具 → 脚本编辑器）
* [ ] 壁纸模式与安全区：切换背景图后顶栏 / 底栏仍可读，刘海屏无遮挡

## 构建与校验

```bash
npm run build          # 重建 Env.min.js、同步 box/chavy.boxjs.js 与 chavy.box.js、注入 SRI 哈希
npm run check          # 一致性校验（Env 三副本 + SRI 哈希）
npm run check:release  # 版本与发布清单校验
npm test               # 单元测试（node --test tests/*.test.mjs）
```

### 构建产物说明

* `box/chavy.boxjs.js` 是应用源码（含底部内嵌 Env），`chavy.box.js` 是它生成的镜像，
  **不要直接编辑 `chavy.box.js`**。
* `Env.js` 是 Env 的可读源码，`Env.min.js` 与两处内嵌副本由 `npm run build` 生成，
  **不要手工改压缩产物**。
* 改动页面源码 `box/chavy.boxjs.html` 后**必须重新执行 `npm run build`**，
  否则 SRI 哈希与 CI 的一致性校验会失败。

## 测试

```bash
npm test
```

测试文件（`tests/*.test.mjs`，Node 内置 test runner，无需额外框架）：

| 文件 | 覆盖内容 |
| --- | --- |
| `env-smoke.test.mjs` | Env 在 Node 模式下的基础读写、JSON 存取、时间格式化 |
| `env-keycapture.test.mjs` | 持久化 key 自动登记（Gist 同步的数据收集） |
| `sha256.test.mjs` | SRI 使用的 SHA-256 工具 |
| `build-consistency.test.mjs` | `npm run check` 与 `npm run check:release` 构建一致性 |

提交前请完整跑一遍：

```bash
npm run build
npm run check
npm run check:release
npm test
```

## 提交规范

* 代码风格遵循仓库内 `.prettierrc`（提交前可用 `npx prettier --write` 格式化）。
* 新增 / 修改页面文案时，需同时更新 `zh-CN` 与 `en-US` 两套 i18n。
* 提交信息使用 `feat:` / `fix:` / `docs:` / `chore:` 等 Conventional Commits 前缀。

## 发布流程

正式版与测试版使用独立的版本清单文件，按 `$.versionType` 区分：

- 测试版（`$.versionType = 'beta'`）：`box/release/box.release.beta.json`，模块始终从 `master` 拉取最新代码，推送到 master 即生效。
- 正式版（`$.versionType = 'release'`）：`box/release/box.release.json`，随 tag 发布锁定版模块（rewrite 模板固定到 `@版本号`）。

1. 修改 `box/chavy.boxjs.js` 的 `$.version`（如 `0.99.99`），按当前通道在对应清单文件顶部新增条目（`version`、`tags`、`msg`、`notes`）。
2. 改正式版时同步锁定 rewrite 模板：`node scripts/build-pinned-modules.mjs --lock <版本号>`。
3. 执行 `npm run build`，确认 `npm run check` 与 `npm run check:release` 通过。
4. 提交并推送；正式版再打 tag：`git tag 0.99.99 && git push origin 0.99.99`。
5. [Release](https://github.com/fmz200/BoxJS/actions/workflows/release.yml) 工作流会自动校验、
   生成锁定版模块与 Release notes 并发布（Release notes 按通道读取对应清单文件）。

## 注意事项

* 不要在脚本或提交中写入任何密钥/口令；CI 会运行 gitleaks 扫描。
* 历史中的大文件（视频、依赖缓存等）会被拒绝，请勿提交超过 2MB 的二进制文件。
* 本地模拟服务（`scripts/dev-server.mjs`）仅用于开发调试，不要把它当作真实后端部署。
