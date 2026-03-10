# 无门槛，3s 自建 Cloudflare 无限域名邮箱，附体验网址，已开源，所有数据保存在本地

**🌐 在线体验：** https://cloudflare-mail-forge.vercel.app

**📦 开源地址：** https://github.com/hengfengliya/Cloudflare-Mail-Forge

---

## 起因

我有几个 Cloudflare 托管的域名，经常需要创建一批临时邮箱地址用来注册各种服务——把所有邮件统一转发到一个真实收件箱，随时启停或删除。

Cloudflare 的 Email Routing 功能本身很好用，但控制台只能逐条管理规则，每次要批量操作十几个地址 + 多个域名，纯手点就很痛苦。

于是花了几天做了这个本地工具，分享出来。

---

## 是什么

**Cloudflare Mail Forge** — 一个跑在本地的 Web 操作台，核心功能：

- **批量创建** 邮箱路由规则（前缀自动递增，或手动输入列表）
- **跨域名操作** — 勾选多个域名，一次操作同时写入所有选中域名
- **查询 / 启停 / 删除** 已有规则，支持关键词搜索和批量删除
- **零依赖，本地运行** — Node.js 内置模块，不需要 `npm install`，Token 不离开本机

---

## 体验 / 获取

**三种方式，任选其一：**

**① 在线版（零安装）**
直接打开 https://cloudflare-mail-forge.vercel.app，Token 只存在你的浏览器本地。

**② Docker（推荐自部署）**

```bash
docker run -p 3042:3042 ghcr.io/hengfengliya/cloudflare-mail-forge
```

打开 http://127.0.0.1:3042 即可。

**③ Node.js 直接跑**

```bash
git clone https://github.com/hengfengliya/Cloudflare-Mail-Forge.git
cd Cloudflare-Mail-Forge
node server.js
```

> Node.js 18+，零依赖，不需要 npm install。

---

## 用法（30 秒版）

### 1. 准备 API Token

Cloudflare 控制台 → My Profile → API Tokens → Create Token → Custom token，添加两个权限：

- `Zone` → `Zone` → **Read**
- `Zone` → `Email Routing Rules` → **Edit**

### 2. 填入 Token，拉取域名

启动后在「控制台配置」里粘贴 Token + 填写转发目标邮箱，点保存，域名列表自动加载。

### 3. 选域名 → 批量创建

勾选要操作的域名（可以多选），在「批量新增 Mail」里：

**前缀模式**：设前缀 `tmp`、数量 `5`、起始 `1`，一键生成：

```
tmp001@yourdomain.com  →  yourealmail@gmail.com
tmp002@yourdomain.com  →  yourealmail@gmail.com
tmp003@yourdomain.com  →  yourealmail@gmail.com
...
```

**手动模式**：每行输入一个 local-part，或直接粘贴完整邮箱地址也行。

**如果选了多个域名**，同一组地址会同时写入所有域名，创建 N × M 条规则。

### 4. 查询和管理

「规则查询与管理」里选择域名，按地址 / 目标邮箱 / 规则名搜索，单条启停或勾选批量删除。

---

## 界面截图

> 暗色精密风格，Fraunces 衬线大字 + IBM Plex Mono 日志区，Hero 区域实时展示域名 / 规则统计数字。

（见 GitHub 仓库截图）

---

## 数据安全

- 配置（含 API Token）只存在**浏览器 localStorage**，不上传任何服务器
- 本地部署版服务只绑定 `127.0.0.1`，局域网无法访问
- 代码完全开源，可以自己审查

---

## 技术实现（简单说说）

为了保持「三行启动、零依赖」的目标，后端只用了 Node.js 原生 `http` 模块，前端是原生 HTML / CSS / JS，没有任何构建步骤。

Token 保存在浏览器 localStorage，每次请求通过自定义 Header `X-CF-Token` 传到服务端，不写入任何数据库或文件。本地部署时浏览器只与 `127.0.0.1:3042` 通信；Vercel 版通过 Serverless Functions 中转，Token 同样不落地。

项目还保留了早期的 Python / PowerShell 脚本版本（在 `legacy/` 目录），对命令行更熟悉的朋友也可以直接用脚本。

---

## 适用场景

- 需要大量临时邮箱注册各种平台，用完即删
- 给不同业务线分配独立邮箱地址，统一汇入一个收件箱
- 测试邮件发送功能，快速创建接收地址
- 管理多个域名的邮件路由，不想反复登录 Cloudflare 控制台

---

## 最后

代码在这里，欢迎 Star / Issue / PR：

**https://github.com/hengfengliya/Cloudflare-Mail-Forge**

有问题或者建议可以在这里聊，也欢迎说说你们用 Cloudflare Email Routing 的场景。
