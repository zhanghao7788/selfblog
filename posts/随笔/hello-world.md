---
title: Hello World - 我的第一篇博客
date: 2026-05-08
tags: [随笔]
excerpt: 这是博客的第一篇文章，介绍这个博客的搭建过程和写作计划。
---

## 欢迎

你好！欢迎来到我的个人博客。这里是我记录技术学习、分享想法的地方。

## 为什么要写博客

写博客有很多好处：

- **整理知识**：把学到的东西写下来，帮助自己理解得更深
- **分享交流**：与更多人交流想法，获得反馈
- **积累沉淀**：长期坚持，博客会成为你最好的名片

## 技术栈

这个博客使用了以下技术：

```javascript
// 构建脚本 - 将 Markdown 编译为静态 HTML
const marked = require('marked');
const fm = require('front-matter');

function buildPost(filePath) {
  const content = readFile(filePath);
  const { attributes, body } = fm(content);
  const html = marked.parse(body);
  return { meta: attributes, html };
}
```

```css
/* 简洁的代码块样式 */
pre {
  background: #1e1e2e;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
}
```

```bash
# 构建并预览博客
npm run build
npx serve public
```

## 写给自己

> 种一棵树最好的时间是十年前，其次是现在。

坚持写作，保持好奇。
