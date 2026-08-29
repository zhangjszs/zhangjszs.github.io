# Kerwin Zhang · 个人主页

Kerwin Zhang 的个人展示站：**个人简介 / 作品 / 博客 / 联系方式** 四大板块。技术栈基于 [Astro](https://astro.build) 静态站点，**中文为主**，支持中英双语与明暗主题，已适配移动端。已开启 RSS 订阅与 SEO 元数据。

- 🏎️ 当前在 [FSAC Team of HUAT](https://github.com/HUAT-FSAC) 做自动驾驶相关工作
- 🛠️ 关注 ROS 2、LiDAR 地面分割、路径规划与感知
- 📫 [zhangjszs@foxmail.com](mailto:zhangjszs@foxmail.com)
- 🌐 站点地址：[zhangjszs.github.io](https://zhangjszs.github.io)（部署后生效）
- 📡 博客 RSS：[zhangjszs.github.io/rss.xml](https://zhangjszs.github.io/rss.xml)

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
│   ├── projects/      # 作品：personal-* 为个人项目；其余 category 字段详见 schema
│   └── blog/          # 博客文章（MDX）
├── content.config.ts  # 内容集合 schema（Zod 校验）
├── i18n/              # 中英文字典（data-i18n 模式，默认中文）
├── layouts/           # BaseLayout（背景、主题、滚动进度等全局能力）
├── pages/             # 路由：/ /projects/ /blog/ /about/ /rss.xml /404
└── styles/            # global.css（莫兰迪配色变量在此修改）
```

## 如何添加内容

- **新作品**：在 `src/content/projects/` 新建 `.mdx`。frontmatter 里 `category: 'personal'` 为个人项目，`'labwork'` 为课程实验（默认）。`featured: true` 会出现在首页精选区。
- **新文章**：在 `src/content/blog/` 新建 `.mdx`（`title` / `description` / `date` / `tags`）。新文章会自动加入 RSS feed。

## RSS 订阅

- 站点根路径提供 RSS 2.0 订阅：[`/rss.xml`](https://zhangjszs.github.io/rss.xml)
- 浏览器的 RSS 自动发现：每个页面 `<head>` 已声明 `<link rel="alternate" type="application/rss+xml">`
- 内容来源：仅同步 `src/content/blog/` 下 `date` 已设置的文章，按日期倒序排列，包含 `tags` 作为 `category`
- 想要替换/扩展：在 `src/pages/rss.xml.js` 修改 `SITE_TITLE` / `SITE_DESC` / `SITE_URL` 或自定义 items

## 配置项（按需调整）

| 位置                            | 作用                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `astro.config.mjs`              | `site` 域名 + `base` 路径（已配为 GitHub Pages 用户页根路径） |
| `public/robots.txt`             | sitemap 地址（部署到其他域名时记得改）                        |
| `src/components/MainHead.astro` | `SITE_NAME` / `SITE_DESCRIPTION`                              |
| `src/components/Nav.astro`      | 顶部导航 + 社交链接数组                                       |
| `src/components/Footer.astro`   | 页脚链接 + 版权 + 社交图标                                    |
| `src/pages/about.astro`         | `ROLE` / `ABOUT_PARAGRAPHS` / `NOW_ITEM` / `contactLinks`     |
| `scripts/generate-og-image.mjs` | 重新生成 `public/og-image.png`（莫兰迪 1200×630 分享卡）      |

> **关于"技能雷达 / 标签 / 时间线 / 数据概览"**：均从 `src/content/projects/` 自动聚合（仅统计 `category: 'personal'` 的项目），**不需要手动维护**——每加一个项目，这些数据自动更新。

## 部署

任意静态托管均可（构建命令 `npm run build`，产物目录 `dist/`）：

- **GitHub Pages**（当前配置）：仓库名 `zhangjszs/zhangjszs.github.io` 即用户/组织页，根路径部署。`.github/workflows/deploy.yml` 走官方 Action 即可。
- **Cloudflare Pages**：本仓库附带 `wrangler.toml`，导入仓库即可，构建环境变量 `NODE_VERSION` 设为 `22`。
- 部署到其他域名时，只需把 `astro.config.mjs` 的 `site` 改为你的域名并删除 `base` 这一行。

## 致谢

站点基于 [Astro Portfolio 模板](https://github.com/withastro/astro/tree/main/examples/portfolio) 深度定制；莫兰迪配色与背景图沿用模板资源。
