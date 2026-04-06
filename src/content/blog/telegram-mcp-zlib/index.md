---
title: "用 Kiro 接入 Telegram MTProto MCP，实现自动搜书"
description: "记录在 Kiro 中接入 Telegram MCP 的完整过程：从 Bot API 的失败尝试，到 MTProto 方案的最终实现，包括登录、代理、sendMessage 工具扩展等踩坑细节。"
date: "2026-04-06"
tags: ["技术"]
---

> 本文由 AI (Kiro + Claude Opus 4.6) 生成。

## 背景

我在 Telegram 上用一个 Z-Library Bot 搜书——发送书名，Bot 返回书籍信息和下载链接。我想把这个流程接入 Kiro，让 AI 帮我搜书。

听起来简单，实际踩了不少坑。

## 第一次尝试：Bot API 方案（失败）

最初找到了 [@xingyuchen/telegram-mcp](https://github.com/guangxiangdebizi/telegram-mcp)，一个基于 Telegram Bot API 的 MCP Server。

### 安装问题

这个包的 `package.json` 没有声明 `bin` 字段，导致 `npx` 无法直接运行：

```
npm error could not determine executable to run
```

解决办法是全局安装后用 `node` 直接指向入口文件：

```json
{
  "telegram-mcp": {
    "command": "node",
    "args": [
      "C:/Users/你的用户名/AppData/Roaming/npm/node_modules/@xingyuchen/telegram-mcp/build/index.js"
    ]
  }
}
```

### 根本问题

连接成功后发现，Bot API 只能让 Bot 发消息给用户，不能模拟用户给 Bot 发消息。也就是说，我没法通过 MCP 以自己的身份给 Z-Library Bot 发书名，再读取 Bot 的回复。

Bot API 方案到此为止。

## 第二次尝试：MTProto 方案（成功）

要以用户身份操作 Telegram，需要用 MTProto 协议。找到了 [tacticlaunch/mcp-telegram](https://github.com/tacticlaunch/mcp-telegram)，基于 GramJS 实现。

### 准备工作

MTProto 需要 Telegram API 凭证：

1. 访问 [my.telegram.org](https://my.telegram.org)
2. 登录后点击 "API development tools"
3. 创建应用，拿到 `API ID` 和 `API Hash`

> 创建应用时如果报 Error，试试在 URL 栏填一个网址（比如 `https://github.com`），Description 也写点东西。my.telegram.org 的表单校验比较迷。

### 从源码构建

npm 上发布的版本太旧，缺少 `sign-in` 命令，需要从 GitHub 源码构建：

```bash
git clone https://github.com/tacticlaunch/mcp-telegram.git
cd mcp-telegram
npm install
npm run build
```

### 登录

在 PowerShell 中设置环境变量并登录：

```powershell
$env:TELEGRAM_API_ID="你的API_ID"
$env:TELEGRAM_API_HASH="你的API_HASH"
node dist/index.js sign-in
```

> 注意：PowerShell 中设置环境变量用 `$env:变量名="值"`，不是 `set`。`set` 是 CMD 的语法，在 PowerShell 中不会生效。

### 代理问题

MTProto 直连 Telegram 服务器（IP `149.154.167.91`），在国内会超时。系统代理（HTTP Proxy）对 TCP 直连无效。

解决办法：在 Clash 中开启 **虚拟网卡**（TUN 模式），让所有 TCP 流量走代理。

### Session 路径问题

登录成功后，MCP Server 启动时报 `AUTH_KEY_UNREGISTERED`。原因是 session 文件保存在登录时的工作目录下，但 Kiro 启动 MCP 时的工作目录不同。

解决办法：在 mcp.json 中加 `cwd` 指向项目目录：

```json
{
  "telegram-mcp": {
    "command": "node",
    "args": ["D:/CodeFolder/mcp-telegram/dist/index.js", "mcp"],
    "cwd": "D:/CodeFolder/mcp-telegram",
    "env": {
      "TELEGRAM_API_ID": "你的API_ID",
      "TELEGRAM_API_HASH": "你的API_HASH"
    }
  }
}
```

### 缺少 sendMessage 工具

连接成功后发现，这个 MCP 只有 `listDialogs` 和 `listMessages` 两个工具，能读不能写。

于是手动给它加了一个 `sendMessage` 工具。在 `src/tools/` 下新建 `sendMessage.ts`：

```typescript
import { Tool } from "fastmcp";
import bigInt from "big-integer";
import { z } from 'zod';
import { createClient } from '../lib/telegram.js';
import { logger } from '../utils/logger.js';

export const SendMessageParamsSchema = z.object({
  dialogId: z.string().describe('ID of the dialog to send message to'),
  message: z.string().describe('Message text to send'),
});

export const sendMessageTool: Tool<undefined, typeof SendMessageParamsSchema> = {
  name: "sendMessage",
  description: "Send a message to a dialog, chat, channel or bot.",
  parameters: SendMessageParamsSchema,
  execute: async (args, { log }) => {
    logger.info("Sending message", args);
    const client = await createClient();
    try {
      const dialogId = bigInt(args.dialogId);
      const result = await client.sendMessage(dialogId, { message: args.message });
      log.debug(`Message sent, id: ${result.id}`);
      return JSON.stringify({ success: true, messageId: result.id });
    } catch (error) {
      log.error('Error sending message:', (error as Error).message);
      throw error;
    }
  }
};
```

然后在 `src/tools/index.ts` 中注册，重新 `npm run build` 即可。

## 最终效果

现在在 Kiro 中可以直接完成整个搜书流程：

1. 告诉 Kiro 书名
2. Kiro 通过 MCP 以我的身份给搜书 Bot 发消息
3. 读取 Bot 的回复，整理出书名、作者、格式、大小和下载链接

整个过程不需要切换到 Telegram，在 IDE 里一句话搞定。

## 踩坑总结

| 问题 | 原因 | 解决 |
|------|------|------|
| npx 无法运行 | npm 包缺少 `bin` 字段 | 全局安装 + node 直接运行 |
| Bot API 无法模拟用户 | Bot API 设计限制 | 改用 MTProto 方案 |
| npm 版本缺少命令 | 发布版本过旧 | 从 GitHub 源码构建 |
| PowerShell 环境变量不生效 | `set` 是 CMD 语法 | 用 `$env:` 语法 |
| MTProto 连接超时 | TCP 直连被墙 | 开启 TUN/虚拟网卡模式 |
| Session 找不到 | 工作目录不一致 | mcp.json 中加 `cwd` |
| 只能读不能写 | MCP 缺少 sendMessage | 手动扩展工具 |

## 参考

- [tacticlaunch/mcp-telegram](https://github.com/tacticlaunch/mcp-telegram) — MTProto MCP Server
- [Telegram API 申请](https://my.telegram.org)
- [MCP 官方规范](https://modelcontextprotocol.io/)
