---
title: "第一篇文章"
description: "借助 Hexo 博客框架和 Vercel 托管网站搭建网站的过程记录。"
date: "2023-06-11"
tags: ["技术"]
draft: true
---

## 前言

由于本人经济原因(阿里云服务器太贵了)，一段时间内停止了网站的更新，但是如今，我胡汉三又回来了！那么第一篇文章自然就要写借助hexo这一博客框架,vercel这一托管网站搭建网站的过程了。

## 工具介绍

### Hexo

它是一个博客框架，用于搭建快速高效的静态网页。它所需要的环境是Node.js。

> Node.js是一个JavaScript运行时环境，它又可以通过npm这一包管理工具进行下载更新等。

### 下载

```bash
sudo apt install nodejs npm
```

但是这样下载的nodejs版本为10,不满足我们的要求，使用n升级nodejs：

```bash
node -v
npm cache clean -f
npm install -g n
n latest
node -v
```

而后，就可以下载hexo了：

```bash
npm install hexo-cli -g
hexo -v
```

验证成功之后，就可以找个本地目录创建相关文件了：

```bash
hexo init [folder]
cd [folder]
npm i
```

安装主题：

```bash
npm install hexo-theme-redefine@latest
```
