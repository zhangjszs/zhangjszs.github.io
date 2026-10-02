# ENV.md · 环境约定（接力双方共用）

> 本文件记录与"代码长什么样"无关、但环境相关的事实。改动需谨慎，双方都可读，规划者维护。

- 仓库：`zhangjszs/zhangjszs.github.io`（GitHub 用户页根路径部署），本地目录名 `huat-showcase`。
- Node ≥ 22.12.0，本机由 mise 管理：一次性脚本用 `mise x -- node scripts/...`，或在已激活 node 22.12+ 的 shell 直接 `node`。
- 装依赖只用 `npm ci`（CI 严格比对 lockfile），不要 `npm install`。
- 验证顺序（改完代码必跑）：`npm run format:check && npm run check && npm run build`（即 `npm run ci`）；CI 的 Prettier 步骤是 `format:write` 自动修复。
- 本地开发：`npm run dev` → <http://localhost:4321>；纯构建调试用 `npm run build:no-search`（跳过 Pagefind）。
- 站内绝对路径必须走 `src/utils/paths.ts` 的 `withBase()`；`public/.nojekyll` 不可删除。
- 一次性运维脚本在 `scripts/`（Node 环境，禁止 import 浏览器 API）；运行前确认 node 版本。
- git / gh 可用性以当前 shell 为准：若 `gh` 不可用，执行 Agent 把 issue 草稿写进 `.agent/ISSUE_DRAFTS/`，由规划者代建。
