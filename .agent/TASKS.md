# TASKS.md · 任务队列（Issue 本地镜像）

> **权威规则**：GitHub Issue 可用时以 Issue 为准（本仓库 gh CLI + 网络可用），本文件为规划者每轮从 Issue **整体重写**的只读镜像，Executor 改状态时两边同步（先 Issue 后本文件）。冲突时以 Issue 为准。
> 状态值：`ready` · `in-progress` · `in-review` · `blocked` · `needs-info` · `done`。本仓库 label 约定：无 `blocked` label 即可执行；无显式状态 label，状态以 Issue 开合 + 评论为准。

## 今日队列（2026-10-15 · 规划者定，全部通过 4.2 ready 门禁）

| 顺序 | Issue | 标题 | 优先级 | 里程碑 | 状态 |
|---|---|---|---|---|---|
| 1 | #14 | giscus App 未安装期间评论区优雅降级 | P1 | M6 | ready |
| 2 | #15 | /blog/ 空集合空态提示 | P2 | M6 | ready |
| 3 | #16 | 建立 .agent/DIARY/ 日报体系并回填历史 | P3 | M6 | ready |

## 任务全量清单（2026-10-15 自 Issue 重写）

### ready（可执行）

- **#14** · fix: giscus App 未安装期间，项目页评论区向访客渲染报错框
  - 优先级 P1 · 里程碑 M6 · 来源 auto-discovered（第四轮）→ 2026-10-15 规划者 triage 接纳
  - 验收标准与实现范围见 Issue #14 规划者裁决留言（2026-10-15）
  - 今日复测证据：giscus API 403；线上 /projects/ros1-lts-final/ 含 giscus 锚点

- **#15** · fix: /blog/ 空集合页面无空态提示，导航「笔记」指向空白页
  - 优先级 P2 · 里程碑 M6 · 来源 auto-discovered（本轮规划者巡查发现）
  - 验收标准见 Issue 正文；参照 /links/ 既有 .empty 模式

- **#16** · chore(agent): 建立 .agent/DIARY/ 日报体系并回填 2026-10-02 四轮历史
  - 优先级 P3 · 里程碑 M6 · 来源 auto-discovered（本轮规划者巡查发现）
  - 验收标准见 Issue 正文；.agent/ 变更单独 chore(agent) 提交

### blocked（外部阻塞，等站主输入）

- **#7** · 简历：真实身份信息补齐 + 中英 PDF 落地（P0 · M1）
  - 阻塞事实（2026-10-15 复测）：`src/data/resume.ts` 仍有 2 处 `TODO-RESUME`；`public/assets/resume/` 仅 README.txt
- **#8** · 首页签名交互：接入真实激光雷达点云（P1 · M4）
  - 阻塞：等站主提供数据；方向已按 D6 定（保留，等真实数据）
- **#9** · 友链：填充 src/data/links.ts LINKS 数组（P2 · M5）
  - 阻塞事实（2026-10-15 复测）：`LINKS` 仍为空数组；/links/ 已有空态兜底
- **#10** · GoatCounter 注册与域名配置（P1 · M5 · user-action）
  - 阻塞事实（2026-10-15 复测）：`zhangjszs.goatcounter.com` 非已注册站点（HTTP 400，无计数器）
- **#11** · Giscus GitHub App 安装（P1 · M5 · user-action）
  - 阻塞事实（2026-10-15 复测）：`giscus.app/api/discussions` 仍 403
- **#13** · 评估升级 Astro 6 → 7（P2 · 红线）
  - 阻塞：契约 1.10 高风险（核心框架 major 升级），未经站主批准不进 ready
  - 证据未过期：package.json/package-lock.json 自 #12（30343cd）后无变动，剩余 4 条告警（astro critical / esbuild / sharp）仍成立

### done（已验收关闭）

- **#2** · .gitignore 补 AI 工具目录 + docs 入库（2026-10-02 验收关闭）
- **#3** · PENDING.md 与仓库实际进度同步（2026-10-02 验收关闭）
- **#4** · /resume PDF 下载按钮缺失时降级（2026-10-02 验收关闭）
- **#5** · 暖纸改版后全站质量体检（2026-10-02 验收关闭：线上 perf 91–98 / a11y 100 / 死链 0）
- **#6** · 全站死链与静态资源引用审计（2026-10-02 验收关闭）
- **#12** · npm audit fix 清理 undici 告警（2026-10-02 验收关闭，sharp 残项移交 #13）

## 验收记录（规划者写）

- **2026-10-15 · 第四轮（2026-10-02）验收：通过**
  - 声称「无可执行 issue、无代码提交」：git log 核实 22cbbaf 仅 .agent/ 变更，一致
  - #10/#11 依赖核查留言存在；今日复测 giscus 403、GoatCounter 未注册，阻塞事实成立
  - #14 auto-discovered 记录完整；今日复测问题仍属实 → 已 triage 为 P1 ready（M6）
  - 备注：执行 Agent 四轮历史写在 HANDOFF.md 而非 .agent/DIARY/（契约 1.8 偏差）→ 已建 #16 纠正
