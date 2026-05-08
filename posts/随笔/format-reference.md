---
title: Markdown 格式参考
date: 2026-05-08
tags: [Markdown, 参考]
excerpt: 博客中所有可用的 Markdown 格式示范，方便写文章时查阅。
---

## 标题层级

文章标题用 `##` 开始（`#` 留给页面标题），最多到 `####`：

## 二级标题
### 三级标题
#### 四级标题

## 文字样式

- **粗体文字** —— `**文字**`
- *斜体文字* —— `*文字*`
- ~~删除线~~ —— `~~文字~~`
- `行内代码` —— `` `代码` ``

## 链接与图片

[外部链接](https://github.com)

![图片替代文字](https://picsum.photos/600/300)

## 引用

> 这是一段引用文字。
>
> 引用可以包含多个段落。

> 也可以嵌套：
>> 这是嵌套引用。

## 无序列表

- 项目一
- 项目二
  - 嵌套项目
  - 另一个嵌套
- 项目三

## 有序列表

1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

## 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待办

## 代码块

### JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

### Python

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
```

### Bash

```bash
# 列出文件
ls -la

# 搜索文本
grep -r "pattern" .

# 压缩文件夹
tar -czf archive.tar.gz folder/
```

### HTML

```html
<div class="container">
  <h1>Hello World</h1>
  <p>这是一段 HTML 代码示例。</p>
</div>
```

### CSS

```css
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}
```

### 纯文本（无高亮）

```text
这是纯文本代码块，
不会触发语法高亮。
```

## 表格

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 用户名称 |
| `age` | `number` | 用户年龄 |
| `active` | `boolean` | 是否激活 |

对齐方式：

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| A | B | C |
| 长内容 | 中 | 1 |

## 分隔线

三个或更多 `---`：

---

## 内联 HTML

Markdown 中可以直接写 HTML：

<details>
<summary>点击展开详情</summary>

这里是折叠的内容。

- 可以包含列表
- 代码块等

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd>

## 实用技巧

- 段落之间空一行
- 代码块和文字之间也空一行
- 链接文字要有描述性，不要写"点这里"
- 表格前后各空一行，保证兼容性
