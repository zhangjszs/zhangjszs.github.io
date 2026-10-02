# HANDOFF.md · 交接与建议

> 执行 Agent 每轮收尾在此留下一步建议 / 阻塞项；规划者审阅后纳入 PLAN 或回复。双方追加写入，不删对方内容。

（暂无条目。2026-10-02 由规划者初始化。）

## 2026-10-02 · 执行 Agent（本轮：#2 #3 #4 #12 #6 + #5 静态部分）

**做了什么**（均只本地 commit，未 push、未关 issue；各 issue 下已留言）：

- #2 `0dc0f4c`：`.gitignore` 补 `.kilo/`、`.qoder/`；`docs/github-profile-readme.md` 入库（内容未改，仅 Prettier 表格空白对齐以满足 format:check）
- #4 `77c54db`：`/resume` PDF 下载按钮构建期存在性检查（`process.cwd()` 解析 `public/`），缺失不渲染、就位自动恢复；正反向 build 验证通过。**踩坑记录：`import.meta.url` 在 Astro 静态构建里指向 dist 产物 chunk 而非源码，不能用来定位 `public/`**（代码内已注释）
- #3 `5e2ed14`：`PENDING.md` 重写为「用户原料 / 一次性账号操作 / 改版收尾与体检」三组，口径对齐 `.agent/PLAN.md`
- #12 `30343cd`：`npm audit fix` 非破坏性修复，生产告警 7 → 4（undici 11 条 advisory 全清、devalue/dompurify/fast-uri 修复）；剩余 4 条（astro critical / esbuild / sharp）**均需 Astro 7 major 升级（--force），未执行**，建议规划者评估升级窗口后单独开任务。另 `95c9c31` style commit：`src/data/resume.ts`、`src/utils/paths.ts` 此前带超长行入库未过 Prettier，已补格式化（CI format:write 本也会改写）
- #6：新增 `scripts/audit-links.mjs`（纯 Node 零依赖，扫 dist HTML href/src，负向验证过）；**发现并修复真死链**：MainHead.astro 的 `BASE_URL`（默认 `/`）模板拼接产生 `//og-image.png` 协议相对 URL，全站 17 页 og:image/twitter:image 指向无效地址——已改 `withBase` + `new URL(…, Astro.site)`。外链抽检 27 条仅站点自身 `/404/` 按设计返回 404
- #5 静态部分 `62dcd70`：global.css 补全局 `prefers-reduced-motion: reduce` 兜底（原先无），覆盖 `html{scroll-behavior:smooth}`、技能条填充、各 hover 过渡；JS 侧网关确认无遗漏。回归结论已留言；**Lighthouse 数值体检待规划者执行，#5 暂不关闭**

**剩余用户侧输入**（执行 Agent 无法推进）：

- #7 简历原料：真实身份信息（`src/data/resume.ts` 搜 `TODO-RESUME`）+ 中英 PDF 放 `public/assets/resume/`（按钮自动出现，无需改代码）
- #8 点云数据：真实 LiDAR 扫描文件 → `scripts/convert-pointcloud.mjs` 转换（需 Q1 方向确认是否保留签名交互）
- #9 友链：`src/data/links.ts` 的 `LINKS` 数组
- #10 / #11：GoatCounter 注册与 Giscus App 安装（纯账号操作，步骤见 `docs/SETUP-GOATCOUNTER-GISCUS.md`）

**给规划者**：#5 的 Lighthouse（首页 / 项目详情 / 简历）与移动端体检待执行；#12 的 Astro 6→7 major 升级是清零 critical 的唯一路径，建议单独立项。最终验收 `npm run ci` 全绿。

## 2026-10-02 · 执行 Agent（第二轮：#5 遗留项 a11y + LCP + 审计脚本）

**做了什么**（均只本地 commit，未 push、未关 issue；#5 下已留言）：

- `d5daa81` fix: 无障碍修复（aria 角色与标题层级）(#5)
  - `/resume` 语言切换：`tablist` 下的按钮补 `role="tab"` → 修 `aria-allowed-attr`（`aria-selected` 不允许在 button role 上）与 `aria-required-children`（tablist 需要 tab 子元素），功能与样式不变
  - 全站标题层级：页脚栏目标题 `h4`→`h2`（`.link-group` 作用域选择器同步改名，样式零变化；选 h2 而非 h3 是因为 /links、/404 只有 h1，h1→h3 仍跳级）；项目卡片标题 `h3`→`h2`（修 /projects/ 的 h1→h3 跳级，`.work-title` 类样式不变）
  - `/404` 装饰大字 `color+opacity` → `background-clip:text` 填色：修 `color-contrast`（1.32:1，纯装饰文本无法满足 3:1），渲染结果像素级不变
- `bd33fb3` perf: 首屏 LCP 优化（样式内联 + 关键字体 preload）(#5)
  - `astro.config.mjs`：`build.inlineStylesheets: 'always'`——两个 render-blocking CSS（8KB+2KB）内联进 HTML，线上各省一个高 TTFB RTT
  - `MainHead.astro`：三个 latin 可变字体经 Vite `?url` 拿哈希地址输出 preload（crossorigin）；线上字体请求从 CSS 解析完（888ms）提前到 head 解析（~0ms）
- `c41d453` chore(scripts): 死链审计覆盖 og/twitter meta 图片 (#5)
  - `audit-links.mjs` 校验 og:image / twitter:image content（`/` 开头路径 + 本站域名绝对 URL 剥 origin），负向注入验证：34 处全抓到 exit 1，还原后 0 死链

**Lighthouse 指标对比**（本地 Lighthouse 移动端节流；线上「before」为规划者体检值，「after」待推送后复测）：

| 页面       | a11y before(线上)    | a11y after(本地)                       | perf before(线上) | perf after(本地)                          | 备注                                        |
| ---------- | -------------------- | -------------------------------------- | ----------------- | ----------------------------------------- | ------------------------------------------- |
| /          | 98（heading-order）  | **100**                                | 83（LCP 3.6s）    | **98**（FCP 1.3s / LCP 2.3s / CLS 0.017） | 本地基线 96：FCP 2.0s→1.3s、CLS 0.067→0.017 |
| /projects/ | 98（heading-order）  | **100**                                | 85（LCP 3.5s）    | **98**（FCP 1.3s / LCP 2.3s / CLS 0.005） | 本地基线 96：CLS 0.054→0.005                |
| /resume/   | 87（aria×2+heading） | **100**                                | 91（LCP 3.0s）    | **99**（FCP 1.0s / LCP 2.0s / CLS 0）     |                                             |
| 其余路由   | 未测                 | **100**（/blog/ /about/ /links/ /404） | 未测              | —                                         | 页脚改动影响全站，故全量复测                |

本地 perf 未达 ≥90 的情况：无（/ 与 /projects/ 均 98）。线上预期收益：省 2 个 CSS RTT（Lighthouse 线上 render-blocking 估算 ~560ms）+ 字体起点提前 ~440ms，线上 LCP 预计 3.6s→约 2.6–2.8s，**需规划者推送后线上复测确认 ≥90**。

**剩余差距与证据**（本地 LCP 2.3s 的构成）：LCP 元素为首屏文字（非图片），render delay ~200–230ms 即 webfont swap 重绘的下限——字体现已从 t≈0 开始请求，无更早手段；server-response-time 线上 ~300ms 为 GitHub Pages 固有，客户端无解（唯一 >50ms 的线上 opportunity，与规划者结论一致）。unused-javascript（gsap 包 34KB 未用部分，weight 0）不动，避免动 motion 网关。

**给规划者**：推送后对线上三页复测 Lighthouse（a11y 应全 100、perf 预期 ≥90）；确认后可关 #5。临时产物 `lh-a11y-*.json`/`lh-perf-*.json`/`_iss5full.json` 已清理，`lh-report-*.json` 仍在 .gitignore 内。

## 2026-10-02 · 执行 Agent（第三轮：#5 追加——data-reveal 首屏遮蔽 LCP）

**背景**：第二轮提交推送后规划者线上复测——/ 98、/resume/ 92 已达标，但 /projects/ 仍 83、LCP 3.9s（render delay 2.1s），LCP 元素为页头描述文字（`PageHeader` 的 `p.ph-desc`，带 `data-reveal`）。

**根因**：`core.ts` 的 reveal 用 `gsap.fromTo({opacity:0, y:28}, …)` + ScrollTrigger，fromTo 的初始隐藏状态在模块加载、tween 创建时立即生效——时序为「内容首绘可见 → GSAP 加载完把首屏藏起 → 滚动触发淡入」，这次重绘把 LCP 拖到动画结束。与首页历史上 9218a8e 修过的问题同类（首页/简历首屏现已不带 data-reveal，故两页已恢复；projects/about/blog/links 的页头仍带）。

**修法**（`27822ab`）：`initMotion` 对每个 `[data-reveal]` 先测 `getBoundingClientRect().top`，位于首屏视口内（top < innerHeight）的不创建动画、保持立即可见；折叠线以下照旧 reveal。判断在创建 fromTo **之前**（fromTo 初始状态创建即生效，先藏再放会闪烁）；reduced-motion 网关提前返回路径不受影响；无 JS 路径 CSS 本就不藏 `[data-reveal]`。

**本地指标**（移动端节流）：/projects/ **98**（目标 ≥93 达成；FCP 1.3s / LCP 2.3s / CLS 0.005，render delay 201→184ms——本地 GSAP 加载快，收益主要体现线上）；/ **98**、/resume/ **99** 无回退。

**视觉回归**（Playwright 实测本地构建）：首屏 page-header opacity 恒为 1、无闪烁；折叠线以下 work-grid 初始 opacity 0，滚动入视口后 0.9s 淡入上移至 1，reveal 完整保留。

**给规划者**：推送后复测线上 /projects/（预期 ≥93）与 /（≥98）、/resume/（≥99），确认后可关 #5。本轮唯一改动文件 `src/scripts/motion/core.ts`。
