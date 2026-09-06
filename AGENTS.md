# AGENTS.md · huat-showcase

Astro 6 static personal showcase (`personal-showcase`)，Node ≥ 22.12.0，中文为主 + 中英双语 + RSS/sitemap。中等体量但有几个非显而易见的陷阱，列在这里。

## Commands

- `npm ci` — 装依赖；**不要用 `npm install`**，CI 严格比对 lockfile。
- `npm run dev` — Astro dev server at <http://localhost:4321>。
- `npm run build` — `astro build && pagefind --site dist`，产物 `dist/`。Pagefind 索引在此生成，搜索功能依赖它。
- `npm run build:no-search` — 跳过 Pagefind，仅做纯构建（调试静态输出时用）。
- `npm run preview` — 本地预览 `dist/`。
- `npm run check` — `astro check`（TypeScript + Astro 模板校验）。
- `npm run format:check` / `format:write` — Prettier（含 `prettier-plugin-astro`）。
- `npm run ci` — `format:check → check → build` 三连，等价于 CI 流水线。

`tsconfig.json` 继承 `astro/tsconfigs/strict`；`.astro/types.d.ts` 每次构建重新生成，不要手编。

## Layout (where things live)

- `src/pages/` — 路由：`/`、`/projects/`、`/blog/`、`/about/`、`/links/`、`/resume/`、`/rss.xml`、`/404`。
- `src/content/{projects,blog}/` — MDX 内容集合；schema 在 `src/content.config.ts`（Zod）。
- `src/components/hero/PointCloudHero.astro` — 首页 Three.js 点云签名交互。
- `src/scripts/motion/core.ts` — GSAP / Lenis 动效客户端入口。
- `src/layouts/BaseLayout.astro` — 全局壳（Nav/Footer/滚动进度/搜索/code-copy 等增强脚本）。
- `src/data/{site,resume,updates,links}.ts` — 站点元信息与内容数据。
- `src/utils/paths.ts` — `withBase()`：所有站内绝对路径**必须**用它拼 base，否则切子路径部署会 404。
- `src/i18n/` — 中英文字典（`data-i18n` 模式，默认中文）。
- `src/styles/global.css` — 莫兰迪配色变量在此修改。
- `scripts/` — 一次性运维脚本（见下）。
- `public/.nojekyll` — **必须保留**，否则 GitHub Pages 会跑 Jekyll 管线破坏输出。

## Adding content

- **新作品**：在 `src/content/projects/` 新建 `.mdx`。`category: 'personal'` 排前面、`'labwork'`（默认）靠后；`featured: true` 进首页精选（其余聚合数据：技能雷达 / 标签云 / 时间线 / 数据概览**只看 `category: 'personal'`**，会自动更新，不要手维护）。
- **新博客**：`src/content/blog/` 新建 `.mdx`，必填 `title/description/date/tags`；RSS feed 自动同步（按日期倒序，仅含 `date` 已设置的文章）。

## Deployment

- 站点 `site` = `https://zhangjszs.github.io`（用户页根路径），`astro.config.mjs` 已配。
- `wrangler.toml` 仅作 Cloudflare Pages 备选；当前生产部署走 `.github/workflows/deploy.yml` → GitHub Pages。
- **GitHub Pages 首次启用**：仓库 Settings → Pages → Source 必须先切到 "GitHub Actions"，否则 `actions/configure-pages@v5` 会以 "Not Found" 失败（见 `CICD_TROUBLESHOOTING.md`）。
- 若部署到自定义域名：改 `astro.config.mjs` 的 `site`，并删除 `base` 配置（`withBase()` 在 base 为空时自动退化为根路径）。
- 部署前 commit 必须同时包含 `package.json` 和 `package-lock.json`，否则 `npm ci` 在 CI 上 EUSAGE 失败。

## Conventions / gotchas

- **tabs + 单引号 + `printWidth: 120` + LF**（见 `.prettierrc`）。CI 的 Prettier 步骤是 `format:write`（自动修复），不要把格式问题当 build 错误来改。
- **站内链接全部走 `withBase('/...')`**，不要写裸 `/projects/`。
- 中文站点 `<html lang="zh-CN">`。
- `src/scripts/motion/` 是浏览器端脚本（Astro 自动打包），不是 Node 脚本。
- `scripts/convert-pointcloud.mjs` 与 `scripts/seed-projects.mjs` 都注释了 `mise x --` 前缀——本机 Node 由 mise 管理，运行脚本时记得用 `mise x -- node scripts/...`（或在已激活 node 22.12+ 的 shell 直接 `node`）。
- `scripts/seed-projects.mjs` 起草 MDX 时若文件已存在则**跳过**，从不覆盖人工内容——可放心重复跑。
- `scripts/convert-pointcloud.mjs` 输出的点云写到 `public/assets/pointcloud/{hero.bin,meta.json}`，尺寸≤25 万点，超过会自动体素抽稀。
- GoatCounter 与 Giscus 的外部账号步骤在 `docs/SETUP-GOATCOUNTER-GISCUS.md`；仓库 ID `R_kgDOUHOyDA` / 分类 `DIC_kwDOUHOyDM4DEmPH` 已在 `Giscus.astro` 硬编码，不要改。
- `PENDING.md` 是产品待办（真实点云数据、双语简历 PDF、友链、项目草稿校订），不是开发待办——阅读时按上下文判断。

## Verification order

改完代码至少跑：`npm run format:check && npm run check && npm run build`（即 `npm run ci`）。若只改内容可省 `check`，但 commit 前 `npm run format:write` 一遍避免 CI 自动改写。

## Don'ts

- 不要新增 `base` 到 `astro.config.mjs` 后忘记把现有站内路径过一遍——`withBase()` 已处理，但任何直接 `<a href="/...">` 或硬编码字符串会断。
- 不要删除 `public/.nojekyll`。
- 不要在 `scripts/` 里 import `astro:content` 之类的浏览器 API——这些是 Node 脚本。
- 不要把合成点云（`public/assets/pointcloud/hero.bin` 由 `gen-synth-pointcloud.mjs` 生成）当作真实数据提交。