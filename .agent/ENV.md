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
- **分支策略：`WORKFLOW=trunk`**——执行 Agent 直接在主分支小步提交（2026-10-02 各轮即此模式，历史线性），按契约 1.9 的 ENV 覆盖条款记录在案；push 前 `git pull --rebase`，有未暂存的 `.agent/` 改动时先 stash 再 pull/pop。
- **内容缓存坑**：删除 `src/content/**` 下的文件后，若构建报 `UnknownContentCollectionError` 或仍渲染已删除的路由，删 `node_modules/.astro/data-store.json` 再构建（Astro 内容层缓存残留；2026-10-15 #15 实测，清 `.astro/` 不够）。
- **Playwright 产物**：MCP 浏览器会话会在仓库根生成 `.playwright-mcp/`（快照/截图），未被 .gitignore 覆盖，且会让 `format:check` 失败——每轮结束务必删除。
- **shell 是 cmd.exe**（本机 Windows）：无 `ls/grep/head`，用 `dir/findstr`；`&&` 串联多条命令时个别命令含 `;` 会报语法错，需拆开执行；`curl` 默认走代理，访问 localhost 要加 `--noproxy *`。
