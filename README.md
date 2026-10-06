# dsh-plugin-family-cards

<div align="center">

**给家族 11 个工具的 web UI 工具卡片渲染器** —— 官方内置 Web Client 不消费 `presentCall`/`presentResult`（adding-a-tool cookbook 原话），本插件按工具名在 `tool.call.toolview` slot 注册渲染器补上这一层

[![GitHub stars](https://img.shields.io/github/stars/121212165/dsh-plugin-family-cards?style=social)](https://github.com/121212165/dsh-plugin-family-cards/stargazers) [![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**60 秒上手**：`dsh plugin --profile web add github:121212165/dsh-plugin-family-cards` → 重启 dsh → 在 web 里让模型调用任一家族工具，看到统一格式的卡片

</div>

> 🧩 **dsh 插件家族**（22 件）：总目录 **[dsh-plugin-family](https://github.com/121212165/dsh-plugin-family)** ｜ 明星插件：**[ide-hub](https://github.com/121212165/dsh-plugin-ide-hub)** 跨 IDE 统一管理 · **[task-forge](https://github.com/121212165/dsh-plugin-task-forge)** 跨窗口无损交接 · **[quota](https://github.com/121212165/dsh-plugin-quota)** 实时用量仪表

## 它做什么

dsh 的工具卡片有官方 presentation hooks（`presentCall`/`presentResult`），但**内置 Web Client 不消费它们**——Client 插件要在 `tool.call.toolview` slot 按工具名注册渲染器。本插件就是这个渲染器：

- 覆盖 11 个家族工具：`quota_meter` / `pin_add` / `fact_search` / `fact_find` / `ledger_query` / `cache_status` / `quota_check` / `session_search` / `deep_scan` / `eco_scan` / `forge_write`；
- 每张卡：标题 + 状态（running / ok / error）+ 参数预览 + 可滚动结果文本；
- 样式只用 `--dsw-alias-*` tokens，不 require 任何 client 包。

## 结构

- `client.js`：ModuleLoader，`ctx.slots.inject("tool.call.toolview", ...)` 按工具名 keyed 注册；
- host 侧 `apply()` 为空（纯 Client 插件），manifest 声明 `dsh.client {platform: web, immediately: true}`。

## 借鉴来源与差异（不盲目抄）

| 来源 | 借鉴 | 我们的差异 |
|---|---|---|
| dsh-client-ui-cordis（官方 client 内置渲染器，lib/client.js 1441-1490 行） | `tool.call.toolview` keyed slot 注册模式与组件收到的 block 片段契约 | 官方渲染器只覆盖自家工具；我们把同机制变成家族工具的统一卡片层 |

## 验证状态

挂载进 web profile 后工具卡片渲染**待人工目验**（需要真实 web 会话触发工具调用）。host 侧零逻辑，风险面在 client 渲染层。

## License

MIT
