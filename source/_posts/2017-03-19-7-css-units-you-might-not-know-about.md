---
layout: post
title:  "七个你可能不了解的CSS单位"
date:   2017-03-19
categories: front-end
permalink: /archivers/7-css-units-you-might-not-know-about
tags: CSS
---


我们很容易无法摆脱的使用我们所熟悉的CSS技术，当新的问题出现，这样会使我们处于不利的地位。

随着Web继续的发展，对新的解决方案的需求也会继续增大。因此，作为网页设计师和前端开发人员，我们别无选择，只有去了解我们的工具集并且熟悉它。

这意味着我们还要了解一些特殊的工具-那些不经常使用的，但是当需要它们的时候，它们恰恰是最正确的工具。

今天，我将要向你介绍一些你以前可能不知道的CSS工具。这些工具都是计量单位，就像像素或者相对单位,但是很可能你从来没听说过它们！让我们一探究竟吧。

## rem

我们将从你已经熟悉的东西开始。`em`单位被定义为当前字体大小。例如，如果你在`body`元素上设置一个字体大小，那么在`body`元素内的任何子元素的`em`值都等于这个字体大小。

```html
<body> 
    <div class="test">Test</div> 
</body> 

body { font-size: 14px; } 
div { font-size: 1.2em; // calculated at 14px * 1.2, or 16.8px }
```

在这里，我们说这个`div`将有一个`1.2em`的`font-size`。它是所继承的字体大小的`1.2`倍，在这个例子中为`14px`。结果为`16.8px`.

但是，当你在每个元素内都级联`em`定义的字体大小将会发生什么？在下面的代码片段中我们应用和上面一模一样的CSS.每个`div`从它们的父节点继承字体大小，带给我们逐渐增加的字体大小。

```html
<body> 
    <div> 
        Test <!-- 14 * 1.2 = 16.8px --> 
        <div> 
            Test <!-- 16.8 * 1.2 = 20.16px --> 
            <div> 
                Test <!-- 20.16 * 1.2 = 24.192px --> 
            </div> 
        </div> 
    </div> 
</body>
```

<p data-height="300" data-theme-id="0" data-slug-hash="xbZQRQ" data-user="Envato Tuts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/tutsplus/pen/xbZQRQ'>Custom Flexbox Alignment With Auto Margins</a> forked by Envato Tuts(<a href='http://codepen.io'>@Envato Tuts</a>) on <a href='http://codepen.io'>CodePen</a></p>

虽然在某些情况下可能需要这个，但是通常你可能想基于一个唯一的度量标准来按比例缩放。在这种情况下，你应该用`rem`。`rem`中的"`r`"代表"`root`"；这等同于`font-size`基于根元素进行设置；在大多数情况下根元素为`html`元素。

```html
html { font-size: 14px; } 
div { font-size: 1.2rem; }
```

在上一个示例中三个嵌套的`div`的字体大小计算结果都为`16.8px`。

### 对网格布局的好处

`rem`不是只对定义字体大小有用。比如，你可以使用`rem`把整个网格系统或者UI样式库基于HTML根元素的字体大小上,然后在特定的地方使用`em`比例缩放。这将带给你更加可预测的字体大小和比例缩放。

```html
.container { 
    width: 70rem; // 70 * 14px = 980px 
}
```

从概念上讲，像这样一个策略背后的想法是为了允许你的界面随着你的内容按比例缩放。然而，这可能不一定对每个案例都有意义。

"[rem(root em)单位](http://caniuse.com/#feat=rem)"的兼容性列表。

## vh和vw

响应式网页设计技术很大程度上依赖于比例规则。然而，CSS比例不总是每个问题的最佳解决方案。CSS宽度是相对于最近的包含父元素。如果你想使用显示窗口的宽度或高度而不是父元素的宽度将会怎么样？这正是`vh`和`vw`单位所提供的。

`vh`等于viewport高度的`1/100`.例如，如果浏览器的高是`900px`,`1vh`求得的值为`9px`。同理，如果显示窗口宽度为`750px`,`1vw`求得的值为`7.5px`。

这些规则表面上看起来有无尽的用途。例如，做一个占满高度的或者接近占满高度的幻灯片，可以用一个非常简单的方法实现，只要用一行CSS：

```html
.slide {
    height: 100vh;
}
```

设想你想要一个占满屏幕宽度的标题。为做到这一点，你将会用`vw`来设置一个字体大小。这个大小将会随着浏览器的宽度按比例缩放。

<p data-height="300" data-theme-id="0" data-slug-hash="gbPQga" data-user="Envato Tuts" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/tutsplus/pen/gbPQga'>Custom Flexbox Alignment With Auto Margins</a> forked by Envato Tuts(<a href='http://codepen.io'>@Envato Tuts</a>) on <a href='http://codepen.io'>CodePen</a></p>

[视窗单位: vw, vh](http://caniuse.com/#feat=viewport-units)的兼容性列表。

## vmin 和 vmax

`vh`和`vm`总是与视口的高度和宽度有关，与之不同的，`vmin`和`vmax`是与这次宽度和高度的最大值或最小值有关，取决于哪个更大和更小。例如，如果浏览器设置为`1100px`宽、`700px`高，`1vmin`会是`7px`,`1vmax`为`11px`。然而，如果宽度设置为`800px`，高度设置为`1080px`，`1vmin`将会等于`8px`而`1vmax`将会是`10.8px`。

所以你什么时候可能用到这些值？

设想你需要一个总是在屏幕上可见的元素。使用高度和宽度设置为低于`100`的`vmin`值将可以实现这个效果。例如，一个正方形的元素总是至少接触屏幕的两条边可能是这样定义的：

```html
.box { 
    height: 100vmin; width: 100vmin; 
}
```

![](/images/css/css-24.png)

如果你需要一个总是覆盖可视窗口的正方形(一直接触屏幕的四条边),使用相同的规则只是把单位换成`vmax`。

```html
.box { 
    height: 100vmax; width: 100vmax; 
}
```

![](/images/css/css-25.png)

这些规则的组合提供了一个非常灵活的方式，用新的、令人兴奋的方式利用你的可视窗口的大小。

[Viewport units: vmin, vmax](http://caniuse.com/#feat=viewport-units) "兼容列表。

## ex和ch

`ex`和`ch`单位，与`em`和`rem`相似，依赖于当前字体和字体大小。然而，与`em`和`rem`不同的是，这两个单位只也依赖于`font-family`，因为它们被定为基于特殊字体的法案。

`ch`单位，或者字符单位被定义为0字符的宽度的“先进的尺寸”。在"Eric Meyer's的博客"中可以找到一些非常有趣的讨论关于这意味着什么，但是基本的概念是，给定一个等宽字体的字体，一个N个字符单位宽的盒子，比如`width：40ch;`,可以一直容纳一个有40个字符的应用那个特定字体的字符串。虽然这个特殊规则的传统用途与列出盲文有关，但是这里创造性的可行性一定会超越这些简单的用途。

`ex`单位被定义为"当前字体的x-height或者一个`em`的一半"。给定的字体的`x-height`是指那个字体的小写x的高度。通常，这是这个字体的中间的标志。

![](/images/css/css-26.png)

对于这种单位有很多的用途，大多数是用于排版的微调。例如，`sup`元素,代表上标，可以用相对定位和一个`1ex`的底部值在行内被推高。类似地，你可以拉低一个下标元素。浏览器默认支持这些利用上标和下标特性的`vertical-align`规则，但是如果你想要更精细的控制，你可以像这样更明确的处理样式：

```html
sup { 
    position: relative; bottom: 1ex; 
} 

sub { 
    position: relative; bottom: -1ex; 
}
```

`ex`单位在[CSS1](http://www.w3.org/TR/REC-CSS1/#length-units)中已经存在，但是你不会找到对`ch`单位有像这样坚实的支持。具体支持，在Eric Meyer’s 的博客中查看[CSS单位和值](http://www.quirksmode.org/css/units-values/)。

## 结论

密切关注CSS的持续发展和扩张是非常重要的，一边在你的工具集里知道所有的工具。也许你会遇到一个特殊的问题需要一个意想不到的解决方案，利用这些更隐蔽的计量单位之一。花时间去阅读新规范，记录来自好的资源的新闻资讯！

## 扩展阅读

- [Taking the “Erm..” Out of Ems](https://webdesign.tutsplus.com/articles/taking-the-erm-out-of-ems--webdesign-12321)
- [Taking Ems Even Further](https://webdesign.tutsplus.com/articles/taking-ems-even-further--webdesign-12543)
- [Caniuse Viewport units](http://caniuse.com/#feat=viewport-units)
- [CSS的font-size属性](http://www.w3cplus.com/css/css-font-sizing.html)
- [Rem VS Px](http://www.w3cplus.com/css/r-i-p-rem-viva-css-reference-pixel.html)
- [CSS的长度单位](http://www.w3cplus.com/css/the-lengths-of-css.html)
- [CSS3的REM设置字体大小](http://www.w3cplus.com/css3/define-font-size-with-css3-rem)
- [CSS中强大的EM](http://www.w3cplus.com/css/px-to-em)


<script src="http://codepen.io/assets/embed/ei.js"> </script>

转自：[https://www.w3cplus.com/css/7-css-units-you-might-not-know-about.html](https://www.w3cplus.com/css/7-css-units-you-might-not-know-about.html)



