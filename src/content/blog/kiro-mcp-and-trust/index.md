---
title: "别再点 Trust 了——Kiro 命令自动执行配置指南"
description: "通过配置 Kiro 的 Trusted Commands 和 Command Denylist，实现命令自动执行，同时用黑名单机制兜底系统安全。"
date: "2026-04-06"
tags: ["技术"]
---

> 本文由 AI (Kiro + Claude Opus 4.6) 生成。

## 问题

Kiro 即使开启了 Autopilot 模式，每次执行终端命令时仍然会弹出确认框，要求你选择 Run、Run and Trust、Modify 或 Reject。

这是 Kiro 的安全设计——但如果你已经明确指示 AI 去做某件事，频繁的确认会严重打断工作流。

## 解决方案

Kiro 提供了两套互补的机制：

- **Trusted Commands**：自动放行匹配的命令
- **Command Denylist**：拦截危险命令，优先级高于信任列表

两者配合使用，就能做到"默认放行，危险拦截"。

## 配置 Trusted Commands

打开 `Settings`，搜索 `kiroAgent.trustedCommands`。

支持三种匹配模式：

| 模式 | 配置示例 | 效果 |
|------|----------|------|
| 精确匹配 | `npm install` | 只自动执行这一条 |
| 前缀通配 | `npm *` | 自动执行所有 npm 开头的命令 |
| 全局通配 | `*` | 自动执行所有命令 |

如果你信任自己的使用场景，直接加一条 `*` 最省事。

> ⚠️ 注意：通配符 `*` 只检查命令开头。`npm *` 会信任 `npm install && rm -rf /` 这种链式命令，因为它以 `npm` 开头。所以全局通配必须搭配黑名单使用。

## 配置 Command Denylist

打开 `Settings`，搜索 `kiroAgent.commandDenylist`。

黑名单使用**子串匹配**——只要命令中任何位置包含黑名单中的字符串，就会被拦截，必须手动确认。

推荐的黑名单配置：

```json
[
  "rm -rf /",
  "sudo",
  "chmod 777",
  "eval",
  "mkfs",
  "dd if=",
  "> /dev/"
]
```

这些覆盖了常见的高危操作：强制删除根目录、提权执行、开放全部权限、任意代码执行、格式化磁盘、覆写设备文件。

## 执行优先级

Kiro 审批命令的顺序：

1. **黑名单检查**（最高优先级）→ 命中则必须手动确认
2. **信任列表检查** → 命中则自动执行
3. **都不命中** → 手动确认

举个例子，假设配置了 `trustedCommands: ["*"]` 和上面的黑名单：

| 命令 | 结果 |
|------|------|
| `npm install` | ✅ 自动执行 |
| `git push origin main` | ✅ 自动执行 |
| `npm install && rm -rf /` | ⚠️ 需确认（命中 `rm -rf /`） |
| `sudo apt update` | ⚠️ 需确认（命中 `sudo`） |
| `chmod 777 ./dist` | ⚠️ 需确认（命中 `chmod 777`） |

## 我的最终配置

```json
{
  "kiroAgent.agentAutonomy": "Autopilot",
  "kiroAgent.trustedCommands": ["*"],
  "kiroAgent.commandDenylist": [
    "rm -rf /",
    "sudo",
    "chmod 777",
    "eval",
    "mkfs",
    "dd if=",
    "> /dev/"
  ]
}
```

日常使用完全无感，危险操作自动拦截。这是目前体验和安全之间最好的平衡点。

## 参考

- [Kiro 官方文档 - Terminal Integration](https://kiro.dev/docs/chat/terminal/)
