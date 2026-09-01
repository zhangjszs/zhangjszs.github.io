# 账号操作步骤：GoatCounter + Giscus

以下两个服务都需要你在浏览器里完成一次账号/授权操作，完成后我来验证效果。

---

## 一、GoatCounter（文章阅读计数）

### 步骤

1. 打开 <https://www.goatcounter.com/signup>，用 GitHub 账号注册（或邮箱注册）。
2. 进入后台后，站点代码（Site slug）应为 `zhangjszs`。若自动生成的 slug 不是这个，在 **Settings → General** 里改成 `zhangjszs`。
3. 进入 **Settings → Domains**，添加域名：
   - `zhangjszs.github.io`
   - （可选）自定义域名
4. 进入 **Settings → API**，勾选 **"Allow public access to the counter API"**（或类似表述）。
   - 这一步必须开启，否则文章页的 "× 次阅读" 组件无法读取数据。
5. 验证：打开任意文章页（如 <https://zhangjszs.github.io/blog/hello-world>），页面右下角应出现 GoatCounter 的计数器图标；刷新后数字应递增。

### 如果验证失败

- 检查浏览器控制台是否有 `fetch https://zhangjszs.goatcounter.com/counter/...` 的报错。
- 确认 **Settings → API** 里的公开访问开关已打开。
- 确认站点代码是 `zhangjszs`，不是自动生成的随机字符串。

---

## 二、Giscus（评论区）

### 步骤

1. 打开 <https://giscus.app>，页面底部有 **"Quick Start"** 引导。
2. 在 **"Repository"** 栏选择 `zhangjszs/zhangjszs.github.io`。
   - 如果下拉列表里没有，说明 giscus GitHub App 尚未安装到该仓库，点击页面上的 **"Install giscus"** 按钮，按提示授权安装到 `zhangjszs/zhangjszs.github.io`。
3. 页面上的以下字段会自动填入，**不要手动修改**（代码里已硬编码）：
   - Repository: `zhangjszs/zhangjszs.github.io`
   - Repository ID: `R_kgDOUHOyDA`
   - Category: `General`
   - Category ID: `DIC_kwDOUHOyDM4DEmPH`
4. 点击 **"Enable giscus"** 或 **"Install"** 完成授权。
5. 验证：打开任意文章页，滚动到页面底部，评论区应显示 **"Sign in with GitHub to comment"** 按钮。点击后用 GitHub 登录即可发表评论。

### 如果验证失败

- 确认 giscus App 已安装到 `zhangjszs/zhangjszs.github.io`（去仓库 **Settings → Apps** 查看）。
- 确认 Discussions 功能已开启（仓库 **Settings → General → Features** 勾选 **Discussions**）。
- 如果评论区显示空白或报错，打开浏览器控制台查看 `giscus.app/client.js` 的报错信息。

---

## 三、完成后

请回复以下信息，我来验证并关闭 TODO：

1. **GoatCounter**：是否能在文章页看到 "× 次阅读"？
2. **Giscus**：是否能在文章页底部看到评论输入框？

如果某一步卡住，把控制台报错截图或文字发给我。
