---
title: "用 Kiro + Astro 重建我的个人博客"
description: "记录从 Hexo 迁移到 Astro Nano 的完整过程，包括 GitHub MCP 配置、主题选择、文章迁移和个性化改造。"
date: "2026-04-06T02:13:00"
tags: ["技术"]
---

## 起因

我有一个运行了几年的个人博客 lycgg.xyz，用的是 Hexo + Butterfly 主题，部署在 Vercel 上。但 Hexo 的源文件不在手边，加上想换个更现代简洁的风格，于是决定趁机重建。

这次我用了 Kiro（一个 AI IDE）来辅助完成整个过程，体验相当顺畅。

## 技术选型

对比了几个方案后选择了 **Astro Nano**：

- 极简设计，Lighthouse 性能满分
- 支持博客 + 项目展示
- Markdown / MDX 写作
- 亮色/暗色主题切换
- Tailwind CSS 样式
- 自动生成 Sitemap 和 RSS

## 配置 GitHub MCP

在 Kiro 中配置了 GitHub MCP Server，这样 AI 可以直接操作 GitHub 仓库。

配置文件位于 `.kiro/settings/mcp.json`：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "你的Token"
      }
    }
  }
}
```

需要一个 GitHub Personal Access Token（Classic），勾选 `repo` 权限即可。

## 搭建过程

### 1. 克隆模板

```bash
git clone https://github.com/markhorn-dev/astro-nano.git blog-new
cd blog-new
npm install
```

### 2. 个性化配置

修改 `astro.config.mjs` 中的站点地址：

```js
site: "https://lycgg.xyz"
```

修改 `src/consts.ts` 中的个人信息：

```typescript
export const SITE: Site = {
  NAME: "lyc.log",
  EMAIL: "lycmmm@outlook.com",
  // ...
};
```

### 3. 文章迁移

由于旧仓库里只有 Hexo 编译后的静态 HTML，需要从 HTML 中提取正文内容，转换为 Markdown 格式放入 `src/content/blog/` 目录。

每篇文章是一个文件夹，包含一个 `index.md`，格式如下：

```markdown
---
title: "文章标题"
description: "文章描述"
date: "2025-05-06"
tags: ["技术"]
draft: false
---

正文内容...
```

### 4. 草稿功能

不想展示但又不想删除的文章，在 frontmatter 中加上 `draft: true` 即可隐藏。

### 5. 中文化

把导航栏和首页的英文文案改成了中文，让整体风格更统一。

## 总结

整个重建过程大约一个小时，Kiro 帮我完成了大部分工作：配置 MCP、克隆模板、迁移文章、修改配置、调整样式。我只需要做决策和确认效果。

新博客相比旧版更简洁、更快、更容易维护。以后写文章只需要在 `src/content/blog/` 下新建一个 Markdown 文件，推送到 GitHub，Vercel 就会自动部署。
