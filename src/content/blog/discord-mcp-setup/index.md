---
title: "在 Kiro 中接入 Discord MCP，让 AI 管理你的 Discord 服务器"
description: "记录在 Kiro 中配置 Discord MCP 的完整过程：从创建 Bot、配置权限到最终连接成功，包括 discord-mcp 包 401 认证失败的踩坑和切换 mcp-discord 的解决方案。"
date: "2026-04-06"
tags: ["技术"]
---

> 本文由 AI (Kiro + Claude Opus 4.6) 生成。

## 背景

已经在 Kiro 中接入了 Telegram MCP，可以在 IDE 里直接操作 Telegram。自然想到 Discord 也应该接进来——毕竟作为开发者，Discord 是社区沟通、项目通知的常用平台。

## 选择 MCP 包

npm 上有两个主要的 Discord MCP Server：

| 包名 | 认证方式 | 特点 |
|------|----------|------|
| `discord-mcp` | User Token | 功能全（DM、好友、Presence），但 User Token 违反 Discord ToS |
| `mcp-discord` | Bot Token | 官方推荐方式，覆盖消息、频道、论坛、Webhook 管理 |

最终选了 **mcp-discord**，用 Bot Token 更安全合规。

> 踩坑：最初用了 `discord-mcp`，配置 Bot Token 后一直报 `401: Unauthorized`。这个包实际上需要 User Token（个人账号 Token），而不是 Bot Token。浪费了不少时间排查。

## 创建 Discord Bot

### 1. 创建应用

1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击左侧「APP」，然后右上角「创建」
3. 输入应用名称，创建

> 首页的那些卡片（提高玩家参与度、掌控游戏品牌形象等）都是游戏开发相关的，跟创建 Bot 无关，直接忽略。

### 2. 获取 Bot Token

1. 左侧菜单点击「机器人」（Bot）
2. 点击「重置令牌」生成新 Token
3. 复制保存，Token 只显示一次

### 3. 开启 Privileged Gateway Intent

在 Bot 页面往下滚，打开这三个开关：

- Presence Intent
- Server Members Intent
- Message Content Intent

不开 Message Content Intent 的话，Bot 读取到的消息内容会是空的。

### 4. 配置 Bot 权限

在「安装」页面设置 Bot 权限，需要勾选：

**通用权限：**
- 查看频道

**文本权限：**
- 发送消息
- 管理消息
- 阅读消息历史记录
- 添加反应
- 嵌入链接

### 5. 邀请 Bot 到服务器

在「安装」页面复制邀请链接，浏览器打开，选择目标服务器，确认授权。

## 配置 MCP

在 `~/.kiro/settings/mcp.json` 中添加：

```json
{
  "discord": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-discord",
      "--config",
      "你的Bot_Token"
    ],
    "env": {},
    "disabled": false,
    "autoApprove": []
  }
}
```

注意 `mcp-discord` 的 Token 是通过 `--config` 参数传入的，不是环境变量。

保存后 Kiro 会自动重连 MCP 服务器。

## 验证连接

连接成功后，可以通过以下方式验证：

1. 先调用 `discord_login` 确认 Bot 登录状态
2. 用 `discord_get_server_info` 传入服务器 ID，查看频道列表
3. 用 `discord_send` 往频道发一条测试消息

```
> 获取服务器 ID：Discord 设置 → 高级 → 开启「开发者模式」，然后右键服务器名称 → 复制服务器 ID
```

## 可用功能

mcp-discord 提供的工具：

| 工具 | 功能 |
|------|------|
| `discord_login` | 登录 Bot |
| `discord_get_server_info` | 获取服务器信息和频道列表 |
| `discord_send` | 发送消息 |
| `discord_read_messages` | 读取频道消息 |
| `discord_delete_message` | 删除消息 |
| `discord_add_reaction` | 添加表情反应 |
| `discord_remove_reaction` | 移除表情反应 |
| `discord_create_text_channel` | 创建文字频道 |
| `discord_delete_channel` | 删除频道 |
| `discord_get_forum_channels` | 获取论坛频道列表 |
| `discord_create_forum_post` | 创建论坛帖子 |
| `discord_reply_to_forum` | 回复论坛帖子 |
| `discord_create_webhook` | 创建 Webhook |
| `discord_send_webhook_message` | 通过 Webhook 发消息 |

## 实际用途

- **部署通知**：博客部署成功后自动往 Discord 发通知
- **错误告警**：通过 Webhook 推送构建日志和错误信息
- **项目管理**：创建不同频道组织讨论（bug-report、feature-request）
- **跨平台联动**：配合 Telegram MCP，实现 Telegram ↔ Discord 消息同步

## 踩坑总结

| 问题 | 原因 | 解决 |
|------|------|------|
| `discord-mcp` 报 401 | 该包需要 User Token，不支持 Bot Token | 换用 `mcp-discord` |
| Bot 无法访问服务器 | Bot 未被邀请到目标服务器 | 通过邀请链接添加 Bot |
| 读取消息内容为空 | 未开启 Message Content Intent | 在 Bot 设置中开启 |
| PowerShell ConvertTo-Json 格式乱 | PowerShell 默认缩进风格不同 | 直接写入格式化好的 JSON 字符串 |

## 参考

- [mcp-discord (npm)](https://www.npmjs.com/package/mcp-discord) — Bot Token 方案的 Discord MCP Server
- [Discord Developer Portal](https://discord.com/developers/applications)
- [MCP 官方规范](https://modelcontextprotocol.io/)
