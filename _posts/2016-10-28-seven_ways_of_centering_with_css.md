---
layout: post
title:  "CSS - 七种元素居中的方法"
date:   2016-10-28
categories: CSS
permalink: /archivers/seven_ways_of_centering_with_css
tags: CSS
publish: false
---

由于工作时间太忙加上大长假很久没有更新了。

接下来更新一下如何用css居中元素，原文链接[《Seven-Ways-of-Centering-With-CSS》](http://thenewcode.com/723/Seven-Ways-of-Centering-With-CSS)。

### 七种元素居中的方法

居中html元素在网页开发似乎看起来挺简单的。但是在某些案例中，复杂的布局会经常消除一些解决方法，使得网页开发人员特别的头痛。

相对垂直居中，水平居中就略显得简单些，但同时要解决两者就有难度了。在这响应式设计的时代，我们很少能准确的知道元素的高度跟宽度，因此导致很多方案失效。据我所知，CSS至少有6种居中元素的方法。我将用以下的基础代码，讲解从最简单最好实现的到复杂的方法：

```javascript
<div class="center">
  <img src="jimmy-choo-shoe.jpg" alt>
</div>
```

鞋子图片会改变，但都会保持在500px X 500px 的大小。[HSL colors](http://thenewcode.com/61/An-Easy-Guide-To-HSL-Color-In-CSS3)会使背景图片保持一致。

### 使用text-align水平居中

![]({{site.baseurl}}/images/css/css-01.png)

有时显而易见的解决方案是最好的选择。

```css
div.center {
  text-align: center;
  background: hsl(0, 100%, 97%);
}
div.center img {
  width: 33%;
  height: auto;
}
```

这个方案并不能使图片垂直居中：你需要在```<div>```添加```padding```或者给内容添加```margin-top```跟```margin-bottom```使得内容与容器有一定的高度。

### 使用margin居中：auto

![]({{site.baseurl}}/images/css/css-02.png)

又一次主要是针对水平居中，跟上面的```text-align```同样具有局限性

```css
div.center {
  background: hsl(60, 100%, 97%);
}
div.center img {
  display: block;
  width: 33%;
  height: auto;
  margin: 0 auto;
}
```

注意一下```display: block```，是其属性使得```margin: 0 auto```生效的。

### table-cell 居中

使用```display: table-cell```，而不是```tabel```标签；可以对水平跟垂直居中同时有效，但是需要添加额外的元素作为容器

```html
<div class="center-aligned">
  <div class="center-core">
    <img src="jimmy-choo-shoe.jpg" alt="">
  </div>
</div>
```

The Css

```css
.center-aligned {
  display: table;
  background: hsl(120, 100%, 97%);
  width: 100%;
}
.center-core {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.center-core img {
  width: 33%;
  height: auto;
}
```

注意宽度```width: 100%```，是为了使其```<div>```不发生折叠，还有外部容器需要添加高度使其内容垂直居中。可以尝试给```html```和```body```设置高度，其内容元素同样也可以在```body```垂直居中。可以正常的运行在IE 8+浏览器。

### 绝对居中(Absolute Centering)

![]({{site.baseurl}}/images/css/css-03.png)

有一种跨浏览器支持的方案，但是唯一的缺点就是需要在外部容器声明其高度```height```

```css
.absolute-aligned {
  position: relative;
  min-height: 500px;
  background: hsl(200, 100%, 97%);
}
.absolute-aligned img {
  width: 50%;
  min-width: 200px;
  height: auto;
  overflow: auto;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  top: 0;
}
```