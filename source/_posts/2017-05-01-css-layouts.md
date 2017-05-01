---
layout: post
title:  "css常见的前端布局"
date:   2017-05-01
categories: front-end
permalink: /archivers/css-layouts
tags: CSS
---

## 水平居中

### margin + 定宽

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.child {
  width: 100px;
  margin: 0 auto;
}
</style>
```

- 适用定宽

### table + margin

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.child {
  display: table;
  margin: 0 auto;
}
</style>
```

- `display: table` 表现类似`block`，但是宽度为**内容宽**

- 无需设置父元素样式（支持IE8及其以上版本，IE8以下则需要嵌入`<table>`

### inline-block + text-align

```html
<div class="parent">
  <div class="child">
    Demo
  </div>
</div>

<style>
.child {
  display: inline-block;
}
.parent {
  text-align: center;
}
</style>
```

- 兼容IE6

### absolute + margin-left

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.parent  {
  position: relative;
}

.child {
  position: absolute;
  left: 50%;
  width: 100px;
  margin-left: -50px; /* width/2 */
}
</style>
```

- 固定宽度

- 相比`transform`，兼容性更好

### absolute + transform

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.parent {
  position: relative;
}

.child {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
```

- 绝对定位脱离文档流，不会对后续布局造成影响

- `transform`为CSS3属性，存在兼容问题

### flex + justify-content

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.parent  {
  display: flex;
  justify-content: center;
}
</style>
```

- 只需要设置父节点

- `flex`有兼容问题

## 垂直居中

### table-cell + vertical-align

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
.parent {
  display: table-cell;
  vertical-align: middle;
}
</style>
```

- 兼容性好，IE8以下版本需要调整页面结构`table`

### absolute + transform

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
  .parent {
    position: relative;
  }
  .child {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
```

- 绝对定位脱离文档流，但**绝对定位元素师唯一的元素则父元素会失去高度**

- `transform`有兼容问题

- 同水平居中也可以使用`margin-top实现`

### flex + align-items

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
  .parent {
    display: flex;
    align-items: center;
  }
</style>
```

- `flex`有兼容问题

## 水平垂直居中

### absolute + transform

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
  .parent {
    position: relative;
  }
  .child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
```

- 绝对定位脱离文档流

- `transform`有兼容问题

### inline-block + text-align + table-cell + vertical-align

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
  .parent {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }
  .child {
    display: inline-block;
  }
</style>
```

- 兼容好

### flex + justify-content + align-items

```html
<div class="parent">
  <div class="child">Demo</div>
</div>

<style>
  .parent {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center; /*垂直居中*/
  }
</style>
```

- 只需要设置父节点

- `flex`有兼容问题

## 一列定宽，一列自适应

### float + margin

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.left {
  float: left;
  width: 100px;
}

.right {
  margin-left: 100px;
}
</style>
```

- IE 6 有3像素的BUG，解决**可以在`.left`加入`margin-left:-3px`**，当然也有其他的解决方法，如下：

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right-fix">
    <div class="right">
      <p>right</p>
      <p>right</p>
    </div>
  </div>
</div>

<style>
.left {
  float: left;
  width: 100px;
}

.right-fix {
  float: right;
  width: 100%;
  margin-left: -100px;
}

.right {
  margin-left: 100px;
}
</style>
```

**此方法不会存在IE 6中3像素的问题，但`.left`不可选择，需要设置`.left {position: relation}`**来提高层级。

### float + overflow

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.left {
  float: left;
  width: 100px;
}

.right {
  overflow: hidden;
}
</style>
```

**设置`overflow: hidden`会触发BFC块级格式上下文，就是无论在BFC里面做什么操作，外面都不会受影响。但是此方法不被IE 6支持。**

### table

```html
<div class="paren">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.parent {
  display: table;
  width: 100%;
  table-layout: fixed;
}
.left {
  display: table-cell;
  width: 100px;
}
.right {
  display: table-cell;
  /*宽度为剩余宽度*/
}
</style>
```

**`table` 的显示特性为每列的单元格宽度和一定等与表格宽度。 `table-layout: fixed` 可加速渲染，也是设定布局优先。`table-cell` 中不可以设置 `margin` 但是可以通过 `padding` 来设置间距**

### flex

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.parent {
  display: flex;
}

.left {
  width: 100px;
  margin-left: 20px;
}

.right {
  flex: 1;
}
</style>
```

- 兼容问题

## 等分布局

### float

```html
<div class="parent">
  <div class="column">
    <p>1</p>
  </div>
  <div class="column">
    <p>2</p>
  </div>
  <div class="column">
    <p>3</p>
  </div>
  <div class="column">
    <p>4</p>
  </div>
</div>

<style>
.parent {
  margin-left: -20px;
}

.column {
  float: left;
  width: 25%;
  padding-left: 20px;
  box-sizing: border-box;
}
</style>
```

- 兼容IE 8 以上版本

### flex

```html
<div class="parent">
  <div class="column">
    <p>1</p>
  </div>
  <div class="column">
    <p>2</p>
  </div>
  <div class="column">
    <p>3</p>
  </div>
  <div class="column">
    <p>4</p>
  </div>
</div>

<style>
.parent {
  display: flex;
}
.column {
  flex: 1;
}
.column + .column { /* 相邻兄弟 */
  margin-left: 20px;
}
</style>
```

### table 

```html
<div class="parent-fix">
  <div class="parent">
    <div class="column">
      <p>1</p>
    </div>
    <div class="column">
      <p>2</p>
    </div>
  	<div class="column">
			<p>3</p>
		</div>
		<div class="column">
			<p>4</p>
		</div>
	</div>
</div>

<style>
.parent-fix	{
	margin-left: -20px;
}
.parent {
	display: table;
	width: 100%;
    /*可以布局优先，也可以单元格宽度平分在没有设置的情况下*/
	table-layout: fixed;
}
.column {
	display: table-cell;
	padding-left: 20px;
}
</style>
```

## 等高布局

### table

```html
<div class="parent">
	<div class="left">
		<p>left</p>
	</div>
	<div class="right">
		<p>right</p>
		<p>right</p>
	</div>
</div>

<style>
.parent {
	display: table;
	width: 100%;
	table-layout: fixed;
}
.left {
	display: table-cell;
	width: 100px;
}
.right {
	display: table-cell;
}
</style>
```

- `table` 的特性为每列等宽，每行等高可以用于解决此需求

### flex 

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.parent {
	display: flex;
}
.left {
	width: 100px;
	margin-left: 20px;
}
.right {
  flex: 1;
}
</style>
```

**注意这里实际上使用了`align-items: stretch`，flex 默认的 `align-items`的值为 `stretch` **

### float 

```html
<div class="parent">
  <div class="left">
    <p>left</p>
  </div>
  <div class="right">
    <p>right</p>
    <p>right</p>
  </div>
</div>

<style>
.parent {
  overflow: hidden;
}
.left,
.right {
  padding-bottom: 9999px;
  margin-bottom: -9999px;
}
.left {
  float: left;
  width: 100px;
  margin-right: 20px;
}
.right {
  overflow: hidden;
}
</style>
```

- 此方法只有背景显示高度相等，左右真实高度其实不想等，但兼容性较好。

参考资料：

- [http://www.xingxin.me/posts/590058affd9e613545f2d1f3](http://www.xingxin.me/posts/590058affd9e613545f2d1f3)











