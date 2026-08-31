# CI/CD 故障排查笔记

> 适用仓库：`zhangjszs/huat-showcase`（Astro 6 + GitHub Pages 项目页）
> 最近一次整理：2026-08-30

## 1. 当前现状

| Workflow                                                   | 最近 5 次结论 | 当前状态                               |
| ---------------------------------------------------------- | ------------- | -------------------------------------- |
| `CI`（`.github/workflows/ci.yml`）                         | ✅ ×5         | 🟢 green                               |
| `Deploy to GitHub Pages`（`.github/workflows/deploy.yml`） | ❌❌❌✅✅    | 🟢 green（最近 2 次）                  |
| `pages build and deployment`（系统内置）                   | ❌            | ⚪ 与本项目无关，已加 `.nojekyll` 抑制 |

> 如果你看到旧失败通知，绝大多数来自 2026-08-28 ~ 08-29 那一段（见下）。

## 2. 已知历史失败原因

### 2.1 `CI`：`npm ci` 报 `EUSAGE`（`package.json` / `package-lock.json` 失同步）

**触发条件**：

- 修改了 `package.json`（例如 `astro`、`@astrojs/mdx` 升版本）
- 但没有本地运行 `npm install` / `npm i` 来更新 `package-lock.json`
- 直接 `git add package.json && git commit`，CI 严格模式下 `npm ci` 会拒绝

**报错样例**：

```text
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and
package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @astrojs/mdx@5.0.6 from lock file
npm error Missing: astro@6.4.8 from lock file
…
```

**修复方法**（任选其一）：

1. 提交前必跑 `npm install`，把 `package-lock.json` 一并提交。
2. 临时降级 `ci.yml` 的安装步骤为 `npm install --no-audit --no-fund`
   （不推荐，会失去 lockfile 严格保护）。
3. 在 PR 模板/CI 流程加一个 `npm ci --dry-run` 的守门（推荐，
   能更早提示 lockfile 漂移）。

**本次状态**：已自愈。最近一次 `package-lock.json` 提交于 2026-08-30
（commit `9580468`），与 `package.json` 同时间更新。

### 2.2 `Deploy to GitHub Pages`：`actions/configure-pages` 报 `Not Found`

**触发条件**：

- 首次在该仓库启用 GitHub Pages，但 Settings → Pages → Source 仍是 `Deploy from a branch`
- 或 GITHUB_TOKEN 的 `pages: write` 权限不够

**报错样例**：

```text
##[warning]Get Pages site failed. Error: Not Found
##[error]Create Pages site failed.
  Error: Resource not accessible by integration
  https://docs.github.com/rest/pages/pages#create-a-apiname-pages-site
```

**修复方法**：

1. 进入仓库 Settings → Pages
2. Build and deployment → Source 选择 **GitHub Actions**
3. 重新 push 到 main（或在 Actions 页面手动重跑 Deploy 工作流）

**本次状态**：已自愈。最近两次 Deploy 工作流都 `success`。

### 2.3 系统工作流 `pages build and deployment` 失败

**说明**：

- 这是 GitHub 在 Pages 启用 `Deploy from a branch` 模式时自动跑的 Jekyll 工作流
- 我们的项目使用 Astro 独立构建，与 Jekyll 完全无关
- 即使我们走 GitHub Actions 模式，这个工作流有时仍会因
  `gh-pages` 分支或仓库根出现 `_config.yml` 等触发

**修复方法**：

- 在 `public/.nojekyll`（已添加）放一个空文件
  Astro build 时会自动复制到 `dist/.nojekyll`
  GitHub Pages 看到这个标记后会**跳过 Jekyll 管线**
- 避免向 `gh-pages` 分支推送，或在 Settings → Pages → Source
  锁死为 "GitHub Actions"

## 3. 预防清单

- [x] `package.json` / `package-lock.json` 同步提交
- [x] `public/.nojekyll` 抑制 Jekyll
- [x] Pages Source 锁定为 "GitHub Actions"
- [x] `actions/configure-pages@v5` 使用前已注释提示
- [ ] （可选）PR 模板加 "已确认 `npm install` 后再提交 lockfile" 勾选项
- [ ] （可选）加 `npm ci --dry-run` 作为本地 pre-commit 检查

## 4. 快速诊断命令

```bash
# 看 main 最近 10 个 run 的结论
gh run list --repo zhangjszs/huat-showcase --branch main --limit 10 \
  --json databaseId,conclusion,workflowName,headSha,url

# 看某次失败 run 的日志
gh run view <run-id> --repo zhangjszs/huat-showcase --log-failed

# 看当前通知里的 CI 失败
gh api notifications --paginate --jq \
  '.[] | select(.subject.title | test("workflow run failed")) |
   "\(.repository.full_name) | \(.subject.title)"'
```

## 5. 相关文件

- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- [public/.nojekyll](public/.nojekyll)
- [package.json](package.json)
- [package-lock.json](package-lock.json)
