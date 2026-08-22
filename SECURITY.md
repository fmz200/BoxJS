# 安全策略

## 报告漏洞

请通过 [GitHub Security Advisories](https://github.com/fmz200/BoxJS/security/advisories/new)
报告安全问题，或发送邮件到仓库维护者（Telegram: [Chavy Scripts Group](https://t.me/chavyscripts)）。
请勿在公开 issue 中披露可利用的漏洞细节。

## 已采取的安全措施

* **SRI 完整性校验**：`box/chavy.boxjs.js` 内置页面源码的 SHA-256 哈希，
  页面加载后先校验再渲染，防止 CDN/上游被篡改。
* **锁定版发布资产**：每次 Release 提供指向 `@版本号` 的 rewrite 模块与 `SHA256SUMS.txt`，
  可校验下载完整性。
* **CI 一致性校验**：Env 三副本、版本号、release notes、SRI 哈希在 CI 中强制一致。
* **秘密扫描**：CI 运行 gitleaks，防止密钥/口令进入仓库。

## 用户建议

* 优先使用 [版本锁定资产](https://github.com/fmz200/BoxJS/releases/latest)，
  避免 master 移动指针带来的不可预期更新。
* 如发现页面加载失败并提示 SRI 校验告警，请勿继续使用，并立即报告。
