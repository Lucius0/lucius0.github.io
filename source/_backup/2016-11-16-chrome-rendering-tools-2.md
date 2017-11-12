---
layout: post
title:  "Chrome渲染分析之Rendering工具使用(2)"
date:   2016-11-16 05:08
categories: tools
permalink: /archivers/chrome-rendering-tools-2
tags: chrome
---

## 2.show composited layer borders

![](/images/tools/tools-05.png)

中文可翻译为：显示层的组合边界。

我们知道，在页面最终是由多个“图层”渲染而成。勾上这个选项，页面上的“layer(层)”会加上一个黄色的边框显示出来，如下图的天猫首页头部所示：

![](/images/tools/tools-06.png)

其中：

- 黄色边框：用于显示页面上的layer

- 蓝色栅格线：表示的是分块，这些分块可以看作是比层更低一级的单位

当然，还有其他颜色的边框线，比如图片如果单独有个layer的话，边框线是蓝色的。

**使用这个工具，可以查看当前页面的layer情况，更好的发现页面不需要的layer将之清除。**

### layer存在的意义

在弄明白这个问题之前，我们需要先了解一个dom元素最终是如何转变为我们屏幕上可视的图像。在概念上讲，可简单的分为四个步骤：

获取 DOM 并将其分割为多个层
将每个层独立的绘制进位图中
将层作为纹理上传至 GPU
复合多个层来生成最终的屏幕图像。
可以将这个过程理解为设计师的Photoshop文件。在ps源文件里，一个图像是由若干个图层相互叠加而展示出来的。分成多个图层的好处就是每个图层相对独立，修改方便，对单个图层的修改不会影响到页面上的其他图层。

基于photoshop的图层理念来理解web端的层，那么就很容易理解了。layer存在的意义在于：**用最小的代价来改变某个页面元素。**

我们可以将某个css动画或某个js交互效果把它抽离到一个单独的渲染层，这样可以加快渲染的效率。

### 如何创建layer

- 3D 或透视变换(perspective transform) CSS 属性

- 使用加速视频解码的` <video> `元素

- 拥有 3D (WebGL) 上下文或加速的 2D 上下文的` <canvas> `元素

- 混合插件(如 Flash)

- 对自己的 opacity 做 CSS 动画或使用一个动画 webkit 变换的元素

- 拥有加速 CSS 过滤器的元素

- 元素有一个包含复合层的后代节点(换句话说，就是一个元素拥有一个子元素，该子元素在自己的层里)

- 元素有一个 z-index 较低且包含一个复合层的兄弟元素(换句话说就是该元素在复合层上面渲染)，关于这点，更详细的实践可查看该[文章](http://mp.weixin.qq.com/s?__biz=MzA5NTM2MTEzNw==&mid=379618526&idx=1&sn=bd7bc6f95f3344c3154a0e6868e7c100&scene=1&srcid=0922ACIoEGRX8TGvMlXLXi3I&from=groupmessage&isappinstalled=0#rd)

在webkit内核的浏览器中，如果有上述情况，则会创建一个独立的layer。

其中第一点是最常用的手段，比如我们有时候给一个css效果加上`transform: translateZ(0);`，目的就是为了创建一个独立的layer。

另外还有另外一个css属性：`will-change`也能实现同样的效果。

### layer 过多带来的问题

还是拿photoshop来做比喻，一个ps文件如果有非常多的图层，那么这个文件肯定是非常大的。那对于web端也是一样，创建一个新的渲染层，它得消耗额外的内存和管理资源。当在内存资源有限的设备，比如手机上，由于过多的渲染层来带的开销而对页面渲染性能产生的影响，甚至远远超过了它在性能改善上带来的好处。

举个栗子，我们在天猫首页上加入css：`* {-webkit-transform: translateZ(0);}`。 然后使用timeline可以看到，天猫的渲染耗时非常严重。

![](/images/tools/tools-07.png)

其影响的是页面渲染的最后一个环节：`Composite Layers`。

那么，一个合理的策略是：**当且仅当需要的时候才为元素创建渲染层。**

### 更直观的查看页面layer

除了rendering 里提供的`show composited layer borders`选项外，还有一个更为直观的3d图像展示：

先选中`timeline`的某一帧，然后选择下面的`layer`标签tab，在右侧的区域就可以看到整个页面的3d图层了。

![](/images/tools/tools-08.png)

在这个视图中，你可以对这一帧中的所有渲染层进行扫描、缩放等操作，同时还能看到每个渲染层被创建的原因。

### 扩展阅读

- [https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count)

- [http://www.html5rocks.com/en/tutorials/speed/layers/](http://www.html5rocks.com/en/tutorials/speed/layers/)

- [https://developer.chrome.com/devtools/docs/rendering-settings](https://developer.chrome.com/devtools/docs/rendering-settings)

## show FPS meter

**show fps meter**可以理解为显示FPS帧频/帧数。开启这个选项后，右上角会实时显示当前页面的FPS。

先简单科普一下啥是FPS。FPS全称叫 Frames Per Second (每秒帧数)。帧数越高，动画显示的越流畅。一般的液晶显示器的刷新频率也就是 60HZ。也就是说，**要想页面上的交互效果及动画流畅。那么FPS稳定在60左右，是最佳的体验**。。据悉 ios上的交互效果都是60FPS呢。

记得以前做Flash游戏的时候，FPS帧数是游戏流畅度的一个重要指标。在web端，道理也是一样。

还记得我之前的文章提到[《web移动端性能调优及16ms优化》](http://www.ghugo.com/gone-in-60-frames-per-second/) 这里的16毫秒，实际就是 1000ms/60FPS = 16.6ms。 也就是一帧所花费的时间约是16毫秒。

科普完毕，回到正题。chrome提供的**show FPS meter**选项，在我们制作测试页面交互及动画性能时非常有用。同时它也提供了当前页面的GPU占有率给我们。

![](/images/tools/tools-09.jpg)

[原文链接](http://www.ghugo.com/chrome-rendering-tools-2/)