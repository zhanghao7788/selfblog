---
title: Vim 实用技巧
date: 2026-05-05
category: 工具
tags: [Vim, 效率]
excerpt: 记录一些常用的 Vim 操作技巧，提升编辑效率。
---

## 基本移动

不用方向键，养成使用 `hjkl` 的习惯：

- `h` — 左移
- `j` — 下移
- `k` — 上移
- `l` — 右移

## 高效编辑

```vim
" 删除当前行
dd

" 复制当前行
yy

" 粘贴
p

" 撤销
u

" 重做
ctrl-r
```

## 搜索替换

```bash
# 在当前行搜索并替换
:s/old/new/g

# 全文搜索并替换
:%s/old/new/g

# 确认替换（每次替换前询问）
:%s/old/new/gc
```

## 窗口管理

> Vim 的窗口管理非常强大，善用分屏可以事半功倍。

使用 `:split` 或 `:vsplit` 分屏，用 `ctrl-w + hjkl` 在窗口间切换。
