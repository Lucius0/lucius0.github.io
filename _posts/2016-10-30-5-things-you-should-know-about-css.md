---
layout: post
title:  "CSS - 5件你需要知道的css定位"
date:   2016-10-30
categories: CSS
permalink: /archivers/5-things-you-should-know-about-css
tags: CSS
publish: false
---

原文链接[5-things-you-might-not-know-about-the-css-positioning-types](https://scotch.io/bar-talk/5-things-you-might-not-know-about-the-css-positioning-types)。

这些年来前端开发工程师可以利用不同的css方案来搭建出复杂的页面布局。其中有一部分的解决方案已经有些历史了(比如：```float```)，当然也有些是最近才逐渐流行起来的(比如：```flexbox```)。

在这篇文章，我们将会深入一步去探讨一些鲜为人知的关于```CSS POSITION```定位的事情。

在我们开始学习这些事之前，让我们先快速的浏览下可用的定位类型。

## 回顾可用的CSS定位类型

```position```这个css属性允许我们指定元素的定位类型。

### CSS定位选项

```static```是该属性的默认值。在这一点上，我们可以称该元素并没有被定位。为了可以定位该元素，我们需要改变它的预设类型。

为了改变预设类型，我们需要将```position```设置为如下其中一个：

- ```relative```

- ```absolute```

- ```fixed```

- ```sticky```

只有设置之后，我们才可以使用```offset```去指定我们元素的位置：

- ```top```

- ```bottom```

- ```left```

- ```right```

- 默认初始值```auto```

需要注意一点的是，把元素```position```设置为```absolute```或者```fixed```我们都称之为绝对定位元素。同样，注意一个被定位的元素可以用```z-index```来指定他们的层叠关系。

### CSS定位属性的主要差别

现在，让我们来简单的讨论下这些定位类型的主要差别：

- 一个*绝对*定位的元素是会完全脱离正常的流。邻近的兄弟节点会占据它的位置。

- 一个*相对*或者*粘性*定位元素保留他们的空间。邻近的元素不会重定位占据该元素保留的空间。然而，这个元素的偏移量不会占据空间。他们已经完全忽略了其他的元素，因此会造成元素之间发生重叠。

- 一个*固定(fixed)*定位元素(记住：```fixed```定位类型元素是```absolute```定位类型元素的子类)经常相对于```relative```定位类型的视图(除了有```transform```属性的父元素，新版本的桌面浏览器均支持这种行为)。

- 一个*粘性(sticky)*定位元素是相对与最近可滑动的父元素(比如：```overflow: auto```)。假如没有这种父元素，则相对于视图定位。

接下来这些类型会在下面的例子中演示：

<p data-height="499" data-theme-id="0" data-slug-hash="qOqNgm" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/qOqNgm'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

*注意：粘性定位类型还是处于实验性的技术，并且浏览器的支持有限。当然，假如你想要尝试这个效果，可以用polyfill(例如：[stickyfill](https://github.com/wilddeer/stickyfill))加到不支持此类型的浏览器。鉴于支持有限，因此我们在以下的文章将不会对它进行讲解*

## 绝对定位元素

我确定很多人已经知道绝对定位是如何实现的。然而，绝对定位不仅仅需要技巧，更是经常能混淆新手。

基于这个原因，我决定将其列入鲜为人知的列表中(包括相对应的例子)，并在此文章一一讲解。

因此，一个被设置为绝对定位类型的元素是相对于最近的父元素。当然，这仅仅在父元素的定位类型不是```static```时有效。考虑到这一点，假如父元素没有声明任何类型，那么它是相对于视图定位。

<p data-height="499" data-theme-id="0" data-slug-hash="dYOpMm" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/dYOpMm'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

在这个例子中，我们给绿盒子初始```absolute```定位并且将```offset```值设置为```bottom: 0````和```left: 0```。此外，我们并没有指定其上一级父元素的定位类型。

然而，我们使外包围盒相对定位(例如：```jumbotron```元素)。注意一下只要我们修改了绿盒子的父元素的定位类型就会使得绿盒子的位置发生改变。

## 绝对定位元素无视```float```属性的存在

假如一个元素是左浮动或者右浮动并且我们设置它的定位类型为```absolute```或者```fixed```，属性```float```的值则会变成```none```。另一方面，假如我们将该元素的定位类型设置为```relative```，则会保留其浮动属性。

看一下以下的相关例子

<p data-height="499" data-theme-id="0" data-slug-hash="WQovLM" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/WQovLM'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

在这个例子里面，我们定义了两个向右浮动的不同元素。值得注意的是，当我们将红盒子改变为**绝对**定位元素，它会忽略```float```属性，而**相对**定位的绿盒子则保留其属性值。

## 绝对定位的内联元素跟块级元素的表现一样

```absolute```定位或者```fixed```定位的内联元素，跟块级元素具有同样的能力。[这份列表](https://drafts.csswg.org/css-position-3/#dis-pos-flo)总结了什么类型的元素可以转换为块级元素。

这里同样也是一个例子

<p data-height="499" data-theme-id="0" data-slug-hash="xwEymK" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/xwEymK'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

在这个案例里，我们定义了两个不同的元素。第一个就是块级元素(绿盒子，例如:```div```)，第二个就是内联元素(红盒子，例如：```span```)。值得注意的是虽然只有绿盒子显示出来。

红色盒子之所以现在不可见是因为我们赋予它的```width```跟```height```只能作用域块级元素跟内联块级元素。再加上，它是一个空的元素(即：它不包含任何的子元素例如文本节点)。

记住一点的是，假如我们将它的定位类型设置为```absolute```或者```fixed```，则该元素会出现是因为这时候它的表现已经跟块级元素一样了。

## 外边距(margins)无法合并绝对定位元素

默认情况下，当两个垂直外边距互相接触，它们会合并成一个，并且```margin```值指定为较大的那一个。这种表现称之为[外边距合并](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing)。

就像在一个浮动的元素上的外边距一样，绝对定位的外边距不会跟其他元素合并。

思考一下以下的例子：

<p data-height="499" data-theme-id="0" data-slug-hash="jbVrGd" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/jbVrGd'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

在这个例子，初始化该元素的外边距为```20px```。另外，该元素的```top```外边距跟父元素的```top```外边距合并，同样也是```20px```。正如你所见，只有当我们绝对定位其元素，```top```外边距才不会跟父元素相关外边距合并。

但是，如何防止我们的外边距发生合并呢？当然，我们需要放一些东西来分割它们。

也就是说，例如有些许的内边距或者边框(我们应该将这条规则应用在父元素或者子元素)。另外一个选择就是在父元素添加```clearfix```类。

## 通过像素和百分比来定位元素

你是否通过百分比取代像素的方法定义```offset```来定位元素？假如你的回答是有的话，你可能已经注意到计算```offset```的值跟你选择的CSS单位(例如：像素或者百分比)不一样。

这看起来有点让人迷惑，对吧？所以，让我们一起来看一下[规范](https://drafts.csswg.org/css-position-3/#valdef-top-percentage)对于用百分比来声明元素的```offset```值是怎么描述的。

>The offset is a percentage of the containing block’s width (for left or right) or height (for top and bottom). For stickily positioned elements, the offset is a percentage of the flow root’s width (for left or right) or height (for top or bottom). Negative values are allowed.

也就是说，只要我们通过百分比来定义```offset```的值，那么目标元素的位置依赖于父元素的宽(对于左右偏移)和高(对于上下偏移)。

下面的例子演示了这种差异

<p data-height="499" data-theme-id="0" data-slug-hash="PPbGbL" data-user="georgemarts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/georgemarts/pen/PPbGbL'>Timer</a> forked by Georgemarts (<a href='http://codepen.io'>@georgemarts</a>) on <a href='http://codepen.io'>CodePen</a></p>

在这个例子，我们通过了像素跟百分比来移动这个元素。果然，当我们用像素来声明```offset```的值，元素会在按照我们所期望的位置。

相反，当我们选择百分比来设计CSS偏移单位时，其元素的位移依赖于父元素的尺寸。这里有个有用的可视化图展示了新位置是如何计算的(通过百分比)：

![]({{site.baseurl}}/images/css/css-07.png)

*注意：估计你已经知道了，```transform```属性(伴随着不同的```translate```方法)同样也可以改变一个元素的位置。但是，请注意假如我们使用百分比来作为CSS的单位，那么该元素是相对于它的尺寸位移而不是相对于父元素的尺寸位移。*

## 结论

我希望这篇文章能帮你牢固的理解CSS的位置布局方法和突出CSS概念的疑惑点。同样我也很乐意在以下的评论你能分享你的想法，问题或者建议。感谢你的阅读！

<script src="http://codepen.io/assets/embed/ei.js"> </script>