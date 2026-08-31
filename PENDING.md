# 还差什么 · 站点上线后的待办清单

站点本体已完成并重设计上线（暗色技术风 / 点云首页 / 搜索 / 统计 / 评论位 / 双语简历页）。
下面是让它"完全体"所需的事项，按优先级排列。所有命令在仓库根目录执行（本机 node 由 mise 管理，前缀 `mise x --`）。

## 1. 原料交付（只有你能提供）

### ① 真实激光雷达数据（首页签名交互）

现在首页渲染的是合成占位点云。提供任意一段真实扫描（1 帧或短序列，几 MB 内）：

- 支持 `.pcd`（ASCII/binary）、`.ply`（ASCII/binary）、`.bin`（Velodyne 16 字节格式）
- 转换命令（自动抽稀到 ≤25 万点、压缩成网页格式）：

```bash
mise x -- node scripts/convert-pointcloud.mjs 你的文件.pcd
```

- 产物写入 `public/assets/pointcloud/`，提交推送即生效
- LIDAR_YE 仓库里如有现成数据可直接用

### ② 简历中英文 PDF

- 放到 `public/assets/resume/resume-zh.pdf` 和 `resume-en.pdf`
- 建议直接从你现有的 LaTeX 源编译导出
- 网页版正文在 `src/data/resume.ts`，搜 `TODO-RESUME` 补齐：中文姓名、专业、入学年份、GPA/核心课程、2-3 个项目条目

### ③ 友链列表

- 格式：名称 / 链接 / 一句话描述
- 填到 `src/data/links.ts` 的 `LINKS` 数组即可

### ④ 项目草稿校订

`src/content/projects/` 下有 5 个自动起草的草稿（LIDAR_YE、SatelliteOverpass、The-Gold-Miner、weibo 舆情分析、占位示例）：

- 把正文 `> TODO` 部分替换成正式内容（背景 / 技术方案 / 成果数据）
- 最想展示的项目在 frontmatter 里 `featured: true`（首页"精选作品"位）
- 占位示例 `personal-example-tool.mdx` 可删

## 2. 一次性账号操作（各约 5 分钟）

### ① GoatCounter（访客统计 + 阅读计数）

1. 打开 [goatcounter.com](https://www.goatcounter.com) 注册，站点代码填 `zhangjszs`（对应 `zhangjszs.goatcounter.com`）
2. 设置 → 域名里添加 `zhangjszs.github.io`
3. 设置 → 勾选"允许通过 API 公开访问计数器"（文章页"× 次阅读"依赖这项）

完成前统计脚本会静默空转，不影响站点。

### ② Giscus（评论区）

仓库改名后需要一次性授权：

1. 打开 [giscus.app](https://giscus.app/zh-CN)，仓库选 `zhangjszs/zhangjszs.github.io`
2. 评论映射选"页面路径"，特性按需，主题选"透明暗色"
3. 按页面提示安装 giscus GitHub App 到该仓库
4. 页面底部生成的 `data-repo-id` 与 `data-category-id` 两个值，填入 `src/components/Giscus.astro` 顶部常量（替换两处 `TODO_`），推送后评论自动启用

## 3. 可选优化

- **内容持续补充**：博客文章、新项目按现有 frontmatter 模板追加，搜索/统计/时间线都会自动跟进
- **移动端性能复核**：真机上跑一次首页，确认 3 秒内可交互（合成点云 11.8 万点，真实数据接入后如超 25 万点会自动抽稀）
- **Lighthouse 体检**：`npx lighthouse https://zhangjszs.github.io --only-categories=performance,accessibility,best-practices,seo`

## 已自动维护、无需操心

- 搜索索引（构建时自动生成）
- sitemap / RSS / OG 图（站点元信息已统一到根域名）
- GitHub 贡献热力图（ghchart 服务自动跟随）
- 部署（push main 自动发布；旧地址 `/huat-showcase/*` 自动跳转到新地址对应页面）
