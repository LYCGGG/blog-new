---
title: "用 Kiro 搭建搜书、下载、解析、总结的全自动工作流"
description: "通过 Telegram Bot 搜书下载，自写 MCP 解析大文件为章节，再让 AI 逐章生成摘要——一句话驱动的端到端阅读工作流。"
date: "2026-04-07T00:45:00"
tags: ["技术"]
---

> 本文由 AI (Kiro + Claude Opus 4.6) 生成。

## 想做什么

我想要一个这样的工作流：跟 AI 说一句"帮我找《平凡的世界》"，它就自动搜书、下载、把书拆成章节 markdown 文件，最后还能逐章帮我生成摘要。整个过程不需要我手动操作任何工具。

搜书和下载之前已经通过 Telegram Bot + Z-Library 实现了。但到"解析大文件"这一步卡住了——markitdown MCP 会把整本书的转换结果一次性塞进对话上下文，一本长篇小说动辄上百万字，瞬间撑爆了 LLM 的上下文窗口。

这不是 markitdown 本身的 bug，而是架构上的限制：MCP 工具的返回值会直接注入上下文，大文件天然不适合这种模式。所以我决定自己写一个 MCP 来解决。

## 思路

解决方案其实很直接：不要一次性返回全文，而是先拆分成章节，按需读取。

具体来说：
1. 用 markitdown 做格式转换（epub → HTML → markdown）
2. 利用 epub 内部的 NCX 目录结构做章节拆分（而不是靠猜分隔符）
3. 每章输出为独立的 `.md` 文件
4. 通过 MCP 工具按需读取单章内容

关键洞察是：epub 文件本身就是一个 zip 包，里面每个 HTML 文件通常对应一个章节，NCX 文件记录了完整的目录结构。解析这个结构比用正则猜分隔符靠谱得多。

## 实现

最终写了一个 Python MCP server，提供 5 个工具：

| 工具 | 功能 |
|------|------|
| `convert_to_chapters` | 转换文件并按章节拆分，输出独立 md 文件 |
| `read_chapter` | 按索引读取单个章节（默认限制 8000 字） |
| `search_chapters` | 全文搜索，返回匹配章节和上下文片段 |
| `get_summary_progress` | 查看 AI 摘要生成进度 |
| `save_chapter_summary` | 保存单章摘要（由 AI 调用） |

epub 的处理流程：

```
epub 文件
  → 解析 META-INF/container.xml 找到 OPF
  → 解析 OPF 找到 NCX 目录文件
  → 遍历 NCX 的 navPoint 获取章节标题和对应 HTML
  → 逐章用 markitdown 转换 HTML → markdown
  → 每章写入独立 .md 文件
  → 生成 000_目录.md 索引 + _meta.json 元数据
```

对于 pdf/docx 等没有内置目录结构的格式，回退到按 markdown 标题拆分，再不行就按固定字数切片。

## AI 摘要功能

拆分完章节后，自然想让 AI 帮忙总结每章内容。但一本长篇小说可能有上百个章节，逐章总结单次对话的上下文肯定不够。

解决方案是把摘要做成增量式的：
- `save_chapter_summary` 工具将每章摘要持久化到 `999_summary.md`
- `get_summary_progress` 工具查看哪些章节已总结、哪些还没
- 上下文快满了就开新 Session，进度不会丢

这样 AI 自己就是摘要引擎，不需要额外的 API。每次对话处理 10-15 章，多开几个 Session 就能完成整本书的总结。

## 完整工作流

最终实现的端到端流程：

```
1. 搜书  → Telegram Bot 搜索 Z-Library
2. 下载  → 通过 Telegram MCP 下载到本地
3. 解析  → markitdown-chunked MCP 拆分为章节 md 文件
4. 总结  → AI 逐章阅读 + 生成摘要，持久化到文件
```

整个流程通过 Kiro 的 steering 规则串联，说一句"帮我找《平凡的世界》"就能自动走完搜索和下载，再说"解析一下"就拆分章节，"帮我总结"就开始逐章摘要。

## 踩过的坑

**epub 的章节分隔不能靠猜。** 最初我以为 `----` 横线是章节分隔符，其实那只是 epub 内部 HTML 的 `<hr>` 标签转换来的。不同的书结构完全不同，唯一靠谱的方式是解析 epub 自带的 NCX 目录。

**PowerShell 重定向输出是 UTF-16。** 用 `markitdown xxx.epub > output.md` 在 PowerShell 里跑，输出文件是 UTF-16 LE 编码，后续用 Python 读取会报错。要么用 Python 直接写文件，要么指定编码。

**PowerShell 的 ConvertTo-Json 缩进很离谱。** 用它修改 JSON 配置文件后，格式会变成奇怪的深度对齐。改 JSON 还是用 Python 的 `json.dump` 靠谱。

## 代码

项目已开源：[github.com/LYCGGG/markitdown-chunked-mcp](https://github.com/LYCGGG/markitdown-chunked-mcp)

安装和配置：

```bash
pip install markitdown[pdf] "mcp[cli]>=1.0.0"
```

MCP 配置（加到 `~/.kiro/settings/mcp.json`）：

```json
{
  "mcpServers": {
    "markitdown-chunked": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "autoApprove": [
        "convert_to_chapters",
        "read_chapter",
        "search_chapters",
        "get_summary_progress",
        "save_chapter_summary"
      ]
    }
  }
}
```

写 MCP 其实没那么复杂，`mcp` 这个 Python SDK 用 `FastMCP` 装饰器就能把普通函数变成 MCP 工具。真正花时间的是理解问题本质和设计合理的拆分策略。
