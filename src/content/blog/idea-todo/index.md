---
title: "IDEA-TODO功能增强"
description: "IDEA 的 TODO 拓展功能，自定义标签与代码模板配置。"
date: "2023-09-26"
tags: ["技术"]
draft: true
---

## 介绍

今天刚看了个视频介绍IDEA的todo还有一个拓展功能，于是记录下。

## 一般用法

就是用来声明还有哪些工作没做，这样ide也能识别到，并将其标记，而且在正式上线前，避免功能遗漏。

## 拓展用法

自定义todo标签，默认情形下，todo有两个标签可以被识别到:todo和fixme,因此我们也可以添加自定义标签。添加方法在Settings中搜索todo,而后就可以在右侧的展示栏中看到这两个正则表达式。

对应的，我们也可以添加自定义的标签，并设置显示图标，添加过滤器等。

除此之外，还可以使用ide的代码模板功能，为todo标签及其默认值设置快捷代码，例如有些要求todo后跟上author,date,time等。具体方法大致介绍下，~~不然总感觉过一天就会忘记~~，直接在Settings中搜索Live Templete,然后找到todo,它在idea中是放置在AndroidComments中(我也不知道为啥),然后增加配置即可，作者可以设置为user()函数，date默认就是date()函数等。
