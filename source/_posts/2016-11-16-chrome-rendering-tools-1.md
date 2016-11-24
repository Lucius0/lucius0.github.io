---
layout: post
title:  "Chrome渲染分析之Rendering工具使用(1)"
date:   2016-11-16
categories: tools
permalink: /archivers/chrome-rendering-tools-1
tags: chrome
---

页面的绘制时间（paint time）是每一个前端开发都需要关注的的重要指标，它决定了你的页面流畅程度。而如何去观察页面的绘制时间，找到性能瓶颈，可以借助Chrome的开发者工具。

本文主要介绍Chrome渲染分析工具 Rendering。

![](/images/tools/tools-01.png)

如上图，按F12调出开发者工具，然后按“ESC”调出Rendering界面。

以上5个选项的意思如下：

1、Show paint rectangles 显示绘制矩形

2、Show composited layer borders 显示层的组合边界（注：蓝色的栅格表示的是分块）

3、Show FPS meter 显示FPS帧频

4、Enable continuous page repainting 开启持续绘制模式 并 检测页面绘制时间

5、Show potential scroll bottlenecks 显示潜在的滚动瓶颈。

OK，简单的翻译了下，估计这样看也不清楚是啥意思。下面来逐个讲解：

由于时间及篇幅关系，本文分为几篇文章进行讲解。

## 1、Show paint rectangles

开启 显示绘制矩形 这个选项，可以看到绿色的框（之前的版本都是红色的框，现在改绿色了，呵呵），这个绿色的框，表示页面正在绘制的区域，即是页面正在渲染，发生绘制操作的区域。 这是用来了解滚动时页面表现的第一个指示器。

鼠标移到图片上，可以发现css3动画的位移，而css3动画的位移导致页面重绘，重绘的区域即是绿色框住的部分。细心的朋友可能会发现，这个绿色框住的部分，并不仅仅就是刚好那个div所在的区域，而涉及到周边的位置。发生这种情况的原因，是页面的重绘是个连带反应，会影响周边元素。

![](/images/tools/tools-02.png)

开启这个选项之后，可以做一些常规的页面交互操作，如Slider切换，拍拍网左侧导航mouse over时效果，可以看到页面效果所影响的范围。

再比如滚动页面，拍拍首页会出现一个返回顶部的按钮，**滚动的时候，会发现返回顶部这个区域在不停的进行重绘，而返回顶部是`position:fixed`定位的。这也解释了为什么fixed定位是最耗性能的属性之一。**

![](/images/tools/tools-03.png)

如果这个时候，我们给头部的再加个`position:fixed`，然后滚动页面时，会发现整个页面都几乎是绿色框住了，**这主要是所有具有fixed定位的元素，在页面绘制时会处于同一个渲染层级上**，一头一尾的fixed无疑会导致整个页面进行重绘，性能非常差。

![](/images/tools/tools-04.png)

这里提到一个**渲染层级**的概念，webkit内核的浏览器在进行页面绘制、渲染并最终展示在浏览器窗口上，实际上就像是Photoshop上的图层，不同的图层进行叠加最后生成一个图片的过程。

这个层的详细介绍，我下一篇文章会详细介绍，这里先卖个关子。

回到之前的话题，既然绿色框住的部分表示页面重绘，那哪些操作会导致重绘呢？

### 影响页面重绘的因素

主要有2大类：

1、页面滚动

2、互动操作

  1).Dom节点被Javascript改变，导致Chrome重新计算页面的layout。

  2).动画不定期更新。

  3).用户交互，如hover导致页面某些元素页面样式的变化。

  4).调整窗口大小 和 改变字体

  5).内容变化，比如用户在input框中输入文字

  6).激活 CSS 伪类，比如 :hover

  7).计算 offsetWidth 和 offsetHeight 属性

  8).增加或者移除样式表

### 总结

影响重绘的因素很多，这里列举了部分常见的操作，在前端开发的过程中。

**1、应该尽量避免重绘，并且尽可能的使绘制区域最小，以提升页面性能。**

就上面拍拍网的例子，一头一尾加上fixed定位导致整个页面重绘，是不可取的。也许你分析完后以后都不敢用fixed，但是可能在实际工作中这种情况无法避免（设计师或产品经理要求）。何东西都有它适用的地方，**重要的是作为前端人员，你应该能够测量并知道你写的代码所带来的性能损耗及所造成的影响。**

**2、同时避免组合触发**

如滚动的时候同时执行hover效果操作，一个例子([Expensive Scrolls](https://dl.dropboxusercontent.com/u/2272348/codez/expensivescroll/demo.html))，在滚动的时候同时也有可能触发页面模块的hover效果，而hover效果用了`box-shadow`、`border-radius`等耗性能大的样式。从而可能导致丢帧现象。

如何去优化：技巧在于滚动时，关闭模块的hover效果，然后设定一个计时器，时间到了再把hover打开。意思是我们保证在滚动时不去执行昂贵的互动事件重绘。当你停止动作一段时间后，我们再将动画开启。

具体可参看这篇文章[《Avoiding Unnecessary Paints》](http://www.html5rocks.com/en/tutorials/speed/unnecessary-paints/)

[原文链接：Chrome渲染分析之Rendering工具使用(1)](http://www.ghugo.com/chrome-rendering-tools-1/)