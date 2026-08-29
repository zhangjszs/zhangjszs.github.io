# 个人展示网站

基于 [Astro](https://astro.build) 的静态个人主页：**个人简介、作品/项目集、博客文章、联系方式**四大板块，中文为主，支持中英切换与明暗主题，移动端适配。原项目结构与技术栈完全沿用，未引入额外的重型依赖。

## 快速开始

要求：**Node.js ≥ 22.12.0**（`package.json` 的 `engines` 已锁定）。

```bash
npm ci          # 安装依赖
npm run dev     # 开发服务器 http://localhost:4321
npm run build   # 生产构建 → dist/
npm run preview # 本地预览构建产物
npm run ci      # 格式检查 + astro check + 构建三连
```

## 目录结构

```
src/
├── components/        # 可复用 .astro 组件（导航、页脚、卡片、筛选器等）
├── content/
│   ├── projects/      # 作品：personal-* 为个人项目示例，其余为课程实验
│   └── blog/          # 博客文章（MDX）
├── content.config.ts  # 内容集合 schema（Zod 校验）
├── i18n/              # 中英文字典（data-i18n 模式，默认中文）
├── layouts/           # BaseLayout（背景、主题、滚动进度等全局能力）
├── pages/             # 路由：/ /projects/ /blog/ /about/ /404
└── styles/            # global.css（配色变量在此修改）
```

## 如何添加内容

- **新作品**：在 `src/content/projects/` 新建 `.mdx`。frontmatter 里 `category: 'personal'` 为个人项目、`'labwork'` 为课程实验（默认），`featured: true` 会出现在首页精选区。
- **新文章**：在 `src/content/blog/` 新建 `.mdx`（`title` / `description` / `date` / `tags`）。

## 待替换的占位符清单（全局搜索 `TODO` 即可定位）

| 位置                                        | 占位内容                                     |
| ------------------------------------------- | -------------------------------------------- |
| `astro.config.mjs`                          | `site` 域名（影响 sitemap 与社交分享图地址） |
| `src/components/MainHead.astro`             | 站点名、站点描述                             |
| `src/components/Nav.astro` / `Footer.astro` | 品牌名、社交链接                             |
| `src/i18n/dictionary.ts`                    | `about.background.p1` 等简介文案             |
| `src/pages/index.astro` / `about.astro`     | Hero 名字、个人简介、时间线                  |
| `public/robots.txt`                         | sitemap 地址                                 |
| `public/favicon.svg`、`og-image.png`        | 图标与分享图                                 |

## 部署

任意静态托管均可（构建命令 `npm run build`，产物目录 `dist/`）：

- **GitHub Pages**：把 `astro.config.mjs` 的 `site` 改为 `https://<用户名>.github.io` 后用官方 Action 部署
- **Cloudflare Pages**：本仓库附带 `wrangler.toml`，导入仓库即可，构建环境变量 `NODE_VERSION` 设为 `22`

## 致谢

站点基于 [Astro Portfolio 模板](https://github.com/withastro/astro/tree/main/examples/portfolio) 深度定制；背景图沿用模板资源；课程实验板块源自 HUAT-kerwin-labwork 的展示层。
