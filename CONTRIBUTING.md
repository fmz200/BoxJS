# 贡献指南

## 开发

```bash
npm install
npm run build   # 重建 Env.min.js、同步 box/chavy.boxjs.js 与 chavy.box.js、注入 SRI 哈希
npm run check   # 一致性校验（Env 三副本 + SRI 哈希）
npm test        # 单元测试
```

## 提交规范

* `box/chavy.boxjs.js` 是应用源码（含底部内嵌 Env），`chavy.box.js` 是它生成的镜像，**不要直接编辑 `chavy.box.js`**。
* `Env.js` 是 Env 的可读源码，`Env.min.js` 与两处内嵌副本由 `npm run build` 生成，**不要手工改压缩产物**。
* 改动页面源码 `box/chavy.boxjs.html` 后必须重新执行 `npm run build`，否则 CI 的 SRI 哈希校验会失败。
* 提交前本地跑一遍 `npm run check` 与 `npm test`。

## 发布流程

1. 修改 `box/chavy.boxjs.js` 的 `$.version`（如 `0.19.31`）。
2. 在 `box/release/box.release.json` 顶部新增对应版本条目（`version`、`tags`、`msg`、`notes`）。
3. 执行 `npm run build`，确认 `npm run check` 与 `npm run check:release` 通过。
4. 提交并推送，然后打 tag：`git tag 0.19.31 && git push origin 0.19.31`。
5. [Release](https://github.com/fmz200/BoxJS/actions/workflows/release.yml) 工作流会自动校验、
   生成锁定版模块与 Release notes 并发布。

## 注意事项

* 不要在脚本或提交中写入任何密钥/口令；CI 会运行 gitleaks 扫描。
* 历史中的大文件（视频、依赖缓存等）会被拒绝，请勿提交超过 2MB 的二进制文件。
