---
title: "好用的 MCP 推荐与配置指南"
description: "面向开发者的 MCP 服务器推荐与配置指南，涵盖 GitHub、Context7、Notion、Markdownify 等实用 MCP，附完整配置示例。"
date: "2026-04-06"
tags: ["技术"]
---

> 本文由 AI (Kiro + Claude Opus 4.6) 生成。

## MCP 是什么

MCP（Model Context Protocol）是 Anthropic 发起的开放标准，2025 年底捐赠给了 Linux 基金会。它让 AI 助手能够连接外部工具和数据源——不只是给建议，而是真正去操作 GitHub、查数据库、读文档、转文件。

可以把它理解为 AI 的"USB-C 接口"：一端是各种工具，另一端是 AI 客户端。一个 MCP 服务器可以同时被 Kiro、Cursor、Claude Desktop 等多个客户端使用。

## 我在用的 MCP

以下是我实际配置并在用的 MCP 服务器，按实用程度排序。

### GitHub MCP

最基础也最常用的一个。让 AI 直接操作 GitHub 仓库：管理 commits、PR、issues、分支，搜索仓库和用户。

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "你的Token"
    }
  }
}
```

Token 在 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) 创建，勾选 `repo` 权限即可。

> ⚠️ 注意：创建 Token 时推荐选择 **Classic Token**，而不是 Fine-grained Token。Fine-grained Token 目前对部分 MCP 操作的权限支持不够完整，可能导致某些 API 调用失败。

### Context7

[Context7](https://github.com/upstash/context7-mcp) 解决 AI 训练数据过时的问题。它实时从官方文档源拉取最新的、版本匹配的文档和代码示例，注入到你的 prompt 中。GitHub 30000+ stars，Upstash 团队维护。

使用时在提问中加 "use context7"：

```
Astro Content Collections 怎么定义 schema？use context7
```

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"],
    "env": {},
    "disabled": false
  }
}
```

不需要 API key，免费公共模式直接可用。

### Notion MCP

[Notion 官方 MCP](https://github.com/makenotion/notion-mcp-server)，支持 22 个工具，覆盖搜索、创建、编辑页面和数据库。如果你用 Notion 管理笔记或项目，这个很实用。

配置前需要：

1. 去 [Notion Integrations](https://www.notion.so/profile/integrations) 创建 Internal Integration，拿到 token
2. 在 Notion 中把目标页面连接到这个 Integration

```json
{
  "notionApi": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "NOTION_TOKEN": "你的token"
    }
  }
}
```

> Notion 也推出了远程版 MCP（通过 OAuth 认证），不需要手动配 token，但本地版目前功能更完整。

### Markdownify

[markdownify-mcp](https://github.com/zcaceres/markdownify-mcp) 是万能格式转 Markdown 工具，支持：

- PDF、DOCX、XLSX、PPTX
- 图片（带元数据）、音频（带转录）
- 网页、YouTube 视频字幕

对于需要把各种文档喂给 AI 处理的场景非常好用。

```json
{
  "markdownify": {
    "command": "npx",
    "args": ["-y", "markdownify-mcp@latest"],
    "env": {}
  }
}
```

## 值得关注的其他 MCP

除了我在用的，以下这些也值得根据需求选装：

| MCP | 用途 | 适合谁 |
|-----|------|--------|
| [Playwright MCP](https://github.com/nichochar/playwright-mcp) | 跨浏览器自动化测试 | 前端开发、QA |
| [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) | 帮 AI 拆解复杂任务 | 架构设计、大规模重构 |
| [Memory Bank](https://github.com/MemoryBankMCP/memory-bank-mcp) | 跨会话记忆系统 | 大型项目开发 |
| [PostgreSQL MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) | 自然语言查询 SQL | 后端开发、数据分析 |
| [Supabase MCP](https://github.com/supabase-community/supabase-mcp) | 操作 Supabase 数据库 | 全栈开发 |
| [DuckDuckGo MCP](https://github.com/nickclyde/duckduckgo-mcp-server) | 无需 API key 的实时搜索 | 通用 |
| [Desktop Commander](https://github.com/nichochar/desktop-commander-mcp) | 安全的本地终端访问 | 本地自动化 |

## 在 Kiro 中配置 MCP

Kiro 的 MCP 配置文件有两个层级：

- **用户级**（全局）：`~/.kiro/settings/mcp.json`
- **工作区级**（项目专属）：`.kiro/settings/mcp.json`

工作区配置会覆盖用户级配置。一般把通用的（Context7、Markdownify）放用户级，项目相关的（GitHub）放工作区级。

修改配置后 Kiro 会自动重连 MCP 服务器，不需要重启。

## 参考

- [Kiro 官方文档 - MCP](https://kiro.dev/docs/mcp/)
- [MCP 官方规范](https://modelcontextprotocol.io/)
- [Awesome MCP Servers](https://mcpservers.org/)
