---
layout: post
title:  "深入浅出Flexbox"
date:   2016-11-09
categories: front-end
permalink: /archivers/dive-into-flexbox
tags: CSS
---

先给大家介绍一个可以边学边玩的Flexbox网站。

- [FLEXBOX FROGGY](http://flexboxfroggy.com/#zh-cn)

- [镜像网页](http://www.css88.com/tool/flexboxfroggy/#zh-cn)

Flexible boxes layout是W3C为了更好的在网页中排版和布局而设计出来的一个模块。它用来可以处理更加复杂的布局。它本质是盒模型的延伸，它可以进一步去规范容器中子元素盒模型之间的相对关系。

## 基础知识点

![](/images/css/css-09.png)

Flexible boxes盒子按照宽和高分出了`main axis`(主轴)和`cross axis`(和主轴交叉的轴)，盒子的上边称为`cross start`,下边称为`cross end`,左边称为`main start`,右边称为`main end`。

## Flexible boxes可以解决什么问题

**完全居中**

在前端中实现居中是一件很头疼的事情，尤其是实现垂直居中，之前翻译了一篇{% post_link /archivers/seven_ways_of_centering_with_css 实现置中的七种方法 %}，其中提到一种最简单的方法就是使用`transform`，需要5行代码可以实现完全置中。

下面看一下`Flexible boxes`实现置中:

```css
.flex-container{
  display:flex;
  justify-content: center;
  align-items: center;
}
```

Flexible boxes只要3行代码就可以实现置中。

**等高的卡片式布局**

在没有用Flexible boxes之前很多卡片设计的网站都有这样一个问题，由于卡片里面的内容多少不同，而产生的不等高问题。

Flexible boxes简单的实现等高列：

```css
.flex-container{
  display:flex;
  align-items: stretch;
}
```

## Flexible boxes能用在哪里

**兼容性**

![](/images/css/css-10.png)

可以看出Flexible boxes从提出到现在也已经有了8个草案。Flexible boxes更新了三种写法。

![](/images/css/css-11.png)

caniuse上各个浏览器支持的情况

![](/images/css/css-12.jpg)

稍微整理一下(这里借用gitcafe的JaychSu的图用一下)

从这里可以看出现代浏览器都支持最新的那个版本,只有`IE10`支持中间那个版本。

**使用CSS预处理器定义的@mixin解决Flexible boxes版本兼容**

在github上有大神把Flexible boxes三个版本搞成一个Sass的`@mixin`,这样可以在需要的地方直接`@include`进来就可以轻松解决三个版本的兼容问题。

[sass关于Flexible boxes的mixin的github项目地址](https://github.com/mastastealth/sass-flex-mixin)

## Flexible boxes实现的原理逻辑

**display（定义容器里面为flex文档流）**

- `dislpay:flex`使父容器表现为块盒子

- `display:inline-flex`使容器表现为行盒子

**flex**

flex是`flex-grow,flex-shrink,flex-basis`的缩写形式。默认值是`0 1 auto`。

**flex-basis**

flex-basis:flex-basis可以理解为我们给子元素设置的宽度。默认值是auto,宽度设置为auto时，盒子的宽度取决你们元素的宽度。

![](/images/css/css-13.png)

**flex-grow和flex-shrink**

grow和shrink是一对双胞胎，grow表示伸张因子，shrink表示是收缩因子。

grow在flex容器下的子元素的宽度和比容器和小的时候起作用。 grow定义了子元素的宽度增长因子，容器中除去子元素之和剩下的宽度会按照各个子元素的gorw值进行平分加大各个子元素上。

**公式：**

计算容器还剩空间

`available_space(容器还剩的空间）=container_size(容器宽度)-flex_item_total(子元素宽度之和)`

计算增长单位

`grow_unit(增长单位)=available_space/flex_grow_total(子元素增长因子之和)`

得到子元素的宽度

`flex-item-width(子元素计算得到的宽度)=flex-basis+grow-unit*flex-grow`

![](/images/css/css-14.png)

上面例子的计算

`container-size=480px;
flex-item-total=100*3=300px;
flex-grow-total=3+2+1=6;
available_space=480-300=180px;
grow_unit=180/6=30px;`

子元素1的宽度为：

`flex_item_width1=100+3*30=190px;`

子元素2的宽度为：

`flex_item_width1=100+2*30=160px; `

子元素3的宽度为：

`flex_item_width1=100+30=130px;`

<p data-height="499" data-theme-id="0" data-slug-hash="pvQZoy" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/pvQZoy'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

shrink则是在宽度和比容器宽度大时候，才有用。按照shrink的值减去相应大小得到子元素的值。

**公式：**

overflow_space(溢出的宽度)

**计算溢出的宽度**

`overflow-space=flex-item-total(子元素basis宽度之和)-container_width(容器宽度)`

**得到计算的子元素的宽度**

`item-basis:子元素设置的flex-basis；
item-shrink:子元素的flex-shrink；
item-shrink-sum:所有子元素flex_shrink的和。     
flex_item_width(计算的子元素的宽度)=item-basis 
--(overflow-space*(item-shrink/item-shrink-sum))`

![](/images/css/css-15.png)

`container-width=480px; item-shrink分别为3，2，1.item-basis=200px;  overflow-space=120px;`

则：

`flex_item1_width=200-(120*(3/6))=140px;
flex_item2_width=200-(120*(2/6))=160px; 
flex_item3_width=200-(120*(1/6))=180px;`

<p data-height="499" data-theme-id="0" data-slug-hash="GgPOJw" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/GgPOJw'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**align-content**

对单行和单列不起作用，多行时才有效，需设置`flex-direction:row;flex-wrap:wrap;`或者`flex-flow:row-wrap`,对`flex container`中的行进行布局排版。

- `flex-start`:行填充到容器的开始。

- `flex-bottom`:行填充到容器的结束。

- `center`:行居中分布。

- `space-between`:行平均分布，第一行在容器开始，最后一行在容器结束。

- `space-around`:行平均分布，但行与行之间有空隙。

**实例效果**

<p data-height="499" data-theme-id="0" data-slug-hash="wBRebG" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/wBRebG'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**align-items**

用于当前行中的子元素进行对齐布局。

- `flex-start`: 子元素的上边缘对齐到行的上边缘。

- `flex-end`: 子元素的上边缘对齐到行的下边缘。

- `center`: 以中轴线居中。

- `baseline`: 子元素的基线对齐。

- `stretch`:子元素拉伸至充满容器。

<p data-height="499" data-theme-id="0" data-slug-hash="ZYVJeR" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/ZYVJeR'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**align-self**

应用在子元素上，可以覆盖`align-item`来获得特殊的元素对齐。

- `flex-start`: 子元素的上边缘对齐到行的上边缘。

- `flex-end`: 子元素的上边缘对齐到行的下边缘。

- `center`: 以中轴线居中。

- `baseline`: 子元素的基线对齐。

- `stretch`:子元素拉伸至充满容器。

**实例效果**

<p data-height="499" data-theme-id="0" data-slug-hash="gbZxRM" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/gbZxRM'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

一个利用`align-self`来改变默认`align-items`排版的例子

<p data-height="499" data-theme-id="0" data-slug-hash="MYZvoX" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/MYZvoX'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**justify-content**

- `flex-start`: 子元素靠容器的左边线对齐

- `flex-end`: 子元素靠容器的右边线对齐

- `center`: 以中轴线居中。

- `space-between`: 子元素被平均分布,第一子元素在容器最左边，最后一个子元素在最右边

- `space-around`:子元素平均分布，但子元素与子元素之间有空隙

**实例效果**

<p data-height="499" data-theme-id="0" data-slug-hash="KwbRJe" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/KwbRJe'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**order**

用来改变子元素之间的排列循序，默认值是0，值越小，越往前排。

![](/images/css/css-16.png)

## Flexible boxes解决的一些问题。

**优雅的实现响应式布局。**

![](/images/css/css-17.gif)

<p data-height="499" data-theme-id="0" data-slug-hash="EaGrOy" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/EaGrOy'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

**最简洁的实现媒体对象效果。（不需要浮动和创建BFC哦！）**

<p data-height="499" data-theme-id="0" data-slug-hash="ZYVwVY" data-user="luxiaojijan" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/luxiaojijan/pen/ZYVwVY'>Timer</a> forked by luxiaojijan (<a href='http://codepen.io'>@luxiaojijan</a>) on <a href='http://codepen.io'>CodePen</a></p>

## 关于Flexible boxes的一些文章

- [Solved by Flexible boxes](http://philipwalton.github.io/solved-by-Flexible boxes/)
- [A Complete Guide to Flexible boxes](https://css-tricks.com/snippets/css/a-guide-to-Flexible boxes/)
- [Flexible boxes adventures](http://chriswrightdesign.com/experiments/Flexible boxes-adventures/)

<script src="http://codepen.io/assets/embed/ei.js"> </script>

出处来自：[Flexible boxes更加优雅的Web布局](http://www.w3cplus.com/css3/flexboxgeng-jia-you-ya-de-webbu-ju.html)