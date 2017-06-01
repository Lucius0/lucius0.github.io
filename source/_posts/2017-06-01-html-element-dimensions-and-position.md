---
layout: post
title:  "关于html元素的尺寸以及位置的问题"
date:   2017-06-01
categories: front-end
permalink: /archivers/html-element-dimensions-and-position
tags: javascript
---

## Position (pageX/clientX/screenX/offsetX)

### pageX/pageY

鼠标相对于整个页面的X/Y坐标。如页宽1000px，页高10000px，那么pageX最大值则为1000px，pageY则为10000px。

### clientX/clientY

事件发生时鼠标在浏览器内容区域的X/Y坐标（不包含滚动条）。即可视区域。(放大缩小也会改变这个值，而且值得注意的是，IE的最小值不是0而是2）

### screenX/screenY

鼠标在屏幕上的坐标。screenX,screenY的最大值不会超过屏幕分辨率。

### offsetX/offsetY

鼠标相对于事件源元素（srcElement）的X,Y坐标，只有IE事件有这2个属性，标准事件没有对应的属性。

## Dimensions(offsetWidth/clientWidth/scrollWidth)

CSS 盒模型是相当复杂的，特别是在滚动内容的时候。当浏览器使用你给的css样式来绘制盒模型时，那如果你只有css，用js来确定所有的尺寸则不是那么的直截了当。

这就是为什么为了你的使用方便，每个元素都拥有6种DOM属性：`offsetWidth`，`offsetHeight`，`clientWidth`，`clientHeight`，`scrollWidth`，`scrollHeight`。这些表示当前视图布局的属性是不能修改的，即只读，并且还全都是整数（因此	很有可能会受到四舍五入的误差影响）

让我们来详细的了解一下：

- `offsetWidth`，`offsetHeight`：该视图盒子包含了所有的边界大小(border)。假如该元素为`display: block`，我们还可以通过`width/height` + `paddings` + `borders`来计算出该元素的`offsetWidth/offsetHeight`。

- `clientWidth`，`clientHeight`：该盒子的视觉部分，不仅不包括边界(border)，同时也不包括滚动条(scroll)，但是包括内边距(padding)。不能直接的通过CSS来计算，依赖于系统滚动条的尺寸。

- `scrollWidth`，`scrollHeight`：所有盒子的内容尺寸，包括溢出滚动区域的隐藏部分。同样也是不能直接通过CSS计算，依赖于内容部分。

![](/images/javascript/js-29.png)

尝试一下：[jsFiddle](http://jsfiddle.net/y8Y32/25/)

由于`clientWidht`把 scroll bar 的宽度也计算在哪，我们可以通过以下公式计算出滚动条的宽度

`scrollbarWidth = offsetWidth - clientWidth - getComputedStyle().borderLeftWidth - getComputedStyle().borderRightWidth`

不幸的是，我们可能会受到四舍五入的误差影响，因为`offsetWidth`和`clientWidth`总是整数，而实际的大小可能是小数，缩放级别不是1。

注意这个：

`scrollbarWidth = getComputedStyle().width + getComputedStyle().paddingLeft + getComputedStyle().paddingRight - clientWidth`

这个在chrome中无法可靠的运行，因为chrome返回来的`width`已经减去了scrollbar的部分（此外，chrome还会将paddingBottom填充到滚动内容的底部，但是其他的浏览器则不会这样）。	

## 获取页面元素的位置

相对位置：

```js
var X = this.getBoundingClientRect().left;
var Y = this.getBoundingClientRect().top;
```

绝对位置：

```js
var X = this.getBoundingClientRect().left + document.documentElement.scrollLeft;
var Y = this.getBoundingClientRect().top + document.documentElement.scrollTop;
```

参考：

- [http://www.cnblogs.com/xesam/archive/2011/12/08/2280509.html](http://www.cnblogs.com/xesam/archive/2011/12/08/2280509.html)

- [Understanding offsetWidth, clientWidth, scrollWidth and -Height, respectively](https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively)

- [http://www.ruanyifeng.com/blog/2009/09/find_element_s_position_using_javascript.html](http://www.ruanyifeng.com/blog/2009/09/find_element_s_position_using_javascript.html)










