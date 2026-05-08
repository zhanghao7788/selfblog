---
title: CSS Grid 布局入门
date: 2026-05-08
category: 前端
tags: [CSS, 布局]
excerpt: CSS Grid 是现代 Web 布局的利器，这篇文章带你快速上手。
---

## 什么是 CSS Grid

CSS Grid Layout 是一个二维布局系统，可以同时控制行和列，非常适合构建复杂的页面布局。

## 基础用法

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.item {
  background: #eef;
  padding: 1rem;
  border-radius: 8px;
}
```

```html
<div class="container">
  <div class="item">A</div>
  <div class="item">B</div>
  <div class="item">C</div>
</div>
```

## Grid vs Flexbox

| 特性 | Grid | Flexbox |
|------|------|---------|
| 维度 | 二维（行+列） | 一维（行或列） |
| 用途 | 页面布局 | 组件排列 |
| 对齐 | 两个方向 | 主轴 + 交叉轴 |

## 常用属性速查

- `grid-template-columns` — 定义列
- `grid-template-rows` — 定义行
- `gap` — 间距
- `grid-area` — 放置元素到指定区域

CSS Grid 和 Flexbox 配合使用可以解决几乎所有的布局问题。
