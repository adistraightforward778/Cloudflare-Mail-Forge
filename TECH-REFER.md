# TECH-REFER

## 技术架构图描述
- 本地脚本（PowerShell）读取配置与输入 → 生成地址列表 → 逐条调用 Cloudflare Email Routing API → 输出结果。

## 模块关系
- 配置读取模块：读取环境变量与输入文件路径。
- 地址生成模块：基于文件/前缀生成完整邮箱地址。
- 规则组装模块：构造 matchers + actions 的请求体。
- API 调用模块：向 Cloudflare API 发送 POST 请求。
- 结果输出模块：打印成功/失败与错误信息。

## 数据结构（对象/DTO）
- RuleRequest
  - name: string
  - enabled: boolean
  - matchers: Matcher[]
  - actions: Action[]
- Matcher
  - type: "literal"
  - field: "to"
  - value: string（完整邮箱）
- Action
  - type: "forward"
  - value: string[]（目标邮箱列表）

## 调用链路
- 读取配置 → 生成地址列表 → 循环每个地址 → 组装 RuleRequest → POST /zones/{zone_id}/email/routing/rules → 输出结果。

## 算法设计
- 顺序迭代创建规则（单线程）。
- 可选延迟（delay_ms）降低触发限流风险。
- 单条失败不影响后续条目。

## 性能边界
- 线性时间复杂度 O(n)，n 为地址数量。
- 单线程请求，吞吐受 API 限流与网络延迟影响。

## 抽象层级划分
- 配置层：读取并校验环境变量。
- 领域层：地址生成与规则模型构建。
- 基础设施层：HTTP 调用 Cloudflare API。
- 展示层：终端输出结果。

## 2026-03-09 Web 架构补充
- 运行方式：Node 本地 HTTP 服务 + 原生 HTML/CSS/JS 单页前端。
- 服务端职责：
  - 配置持久化（`data/app-config.json`）
  - Zone 列表查询
  - Email Routing 规则查询 / 创建 / 删除 / 启停
  - 静态资源托管
- 前端职责：
  - Token 与默认邮箱配置
  - 域名选择与筛选
  - 手动地址 / 前缀批量创建
  - 规则查询、搜索、批量删除、启停
- 安全策略：
  - 服务默认仅监听 `127.0.0.1`
  - 本地配置文件不进入版本控制
