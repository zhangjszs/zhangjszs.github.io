# 还差什么 · 站点上线后的待办清单

站点已全站改版为**暖纸编辑风**并上线（搜索 / 统计与评论位 / RSS / sitemap / 双语简历页均在），开发路线与决策记录见 `.agent/PLAN.md`（进度以 GitHub issue 为准）。

当前状态说明：首页 Three.js 点云签名交互**暂未挂载**——改版后不再使用合成点云撑门面，组件（`src/components/hero/PointCloudHero.astro`）与转换脚本保留，等真实 LiDAR 数据到位后按暖纸风适配再接入。

## 1. 用户原料（只有站主能提供）

### ① 真实激光雷达数据（首页签名交互，issue #8）

提供任意一段真实扫描（1 帧或短序列，几 MB 内）：

- 支持 `.pcd`（ASCII/binary）、`.ply`（ASCII/binary）、`.bin`（Velodyne 16 字节格式）
- 转换命令（自动抽稀到 ≤25 万点、压缩成网页格式）：

```bash
mise x -- node scripts/convert-pointcloud.mjs 你的文件.pcd
```

- 产物写入 `public/assets/pointcloud/`，提交推送即生效
- LIDAR_YE 仓库里如有现成数据可直接用

### ② 简历信息与中英 PDF（issue #7）

- PDF 放到 `public/assets/resume/resume-zh.pdf` 和 `resume-en.pdf`——页面已做构建期存在性检查（issue #4），PDF 就位后下载按钮自动出现，无需改代码
- 建议直接从现有 LaTeX 源编译导出
- 网页版正文在 `src/data/resume.ts`，搜 `TODO-RESUME` 补齐：中文姓名、专业、入学年份、GPA/核心课程、2-3 个项目条目

### ③ 友链列表（issue #9）

- 格式：名称 / 链接 / 一句话描述
- 填到 `src/data/links.ts` 的 `LINKS` 数组即可

## 2. 一次性账号操作（各约 5 分钟，纯站主操作）

### ① GoatCounter（访客统计 + 阅读计数，issue #10）

1. 打开 [goatcounter.com](https://www.goatcounter.com) 注册，站点代码填 `zhangjszs`（对应 `zhangjszs.goatcounter.com`）
2. 设置 → 域名里添加 `zhangjszs.github.io`
3. 设置 → 勾选"允许通过 API 公开访问计数器"（文章页"× 次阅读"依赖这项）

完成前统计脚本会静默空转，不影响站点。

### ② Giscus（评论区，issue #11）

仓库 ID 与讨论分类已自动配置完成，只差一步授权：

1. 打开 [giscus.app](https://giscus.app/zh-CN)，仓库选 `zhangjszs/zhangjszs.github.io`
2. 按页面提示把 giscus GitHub App 安装到该仓库（评论区"读取"已可用，"发表"依赖此步）

## 3. 改版收尾与体检（执行 Agent 跟进，进度见对应 issue）

- **质量体检**（issue #5）：Lighthouse 四项指标 + 移动端 + `prefers-reduced-motion` 降级回归
- **死链审计**（issue #6）：全站产物 `href`/`src` 站内引用扫描（`scripts/audit-links.mjs`）
- **依赖健康**（issue #12）：`npm audit` 生产依赖无 critical/high
- 外部账号步骤的详细指引见 `docs/SETUP-GOATCOUNTER-GISCUS.md`

## 内容持续补充（日常运营）

- 博客文章、新项目按现有 frontmatter 模板追加到 `src/content/{blog,projects}/`，搜索 / RSS / 时间线 / 聚合数据自动跟进
- GitHub 个人主页 README 成品在 `docs/github-profile-readme.md`，粘贴到同名仓库 `zhangjszs/zhangjszs` 即用

## 已自动维护、无需操心

- 搜索索引（构建时自动生成）
- sitemap / RSS / OG 图（站点元信息已统一到根域名）
- GitHub 贡献热力图（ghchart 服务自动跟随）
- 部署（push main 自动发布，走 `.github/workflows/deploy.yml` → GitHub Pages）
