---
layout: post
title:  "CSS - relative 和 absolute 小记"
date:   2017-03-02
categories: front-end
permalink: /archivers/relative-absolute
tags: CSS
---

我在之前翻译过有关于css定位的文章 {% post_link /archivers/5-things-you-should-know-about-css 《5件你需要知道的css定位》 %}。那么这次是看了张鑫旭老师的[相对定位和绝对定位](http://www.zhangxinxu.com/wordpress/2010/12/css-%E7%9B%B8%E5%AF%B9%E7%BB%9D%E5%AF%B9%E5%AE%9A%E4%BD%8D%E7%B3%BB%E5%88%97%EF%BC%88%E4%B8%80%EF%BC%89/)之后的小记，巩固下基础知识。


## absolute

### 包裹性

`position: absolute`跟`float: left`一样具有包裹性，即让元素`inline-block`化，例如div标签默认宽度100%显示，一旦有了包裹性，即100%默认宽度就会成了自适应内部元素的宽度。[absolute的inline-block化demo](http://www.zhangxinxu.com/study/201012/position-absolute-inline-block.html)

```html
.div { padding:20px; margin-bottom:10px; background-color:#f0f3f9; }
.abs { position:absolute; }

<div class="div">
    <img data-src="http://image.zhangxinxu.com/image/study/s/s256/mm1.jpg" />
    <p>无absolute</p>
</div>
<div class="div abs">
    <img data-src="http://image.zhangxinxu.com/image/study/s/s256/mm1.jpg" />
    <p>absolute后</p>
</div>
```

float 也是 `inline-block`元素，可以利用 float 使得一些内联元素如 span 支持 width 属性。

```html
<!-- 以下目的都是一样的 -->
span { display:block; width:100px; }
span { float:left; width:100px; }
span { position:absolute; width:100px; }
```

### 破坏性

float 会使**高度**失效，之所以**宽度**还在，是因为还在DOM tree，位置还是；而 absolute 因为脱离文档流，所以宽高都失效。[absolute的破坏性demo](http://www.zhangxinxu.com/study/201012/position-absolute-destroy.html)

```html
.div { padding:20px; margin:10px 0 0 10px; background-color:#f0f3f9; float:left; }
.abs { position:absolute; }

<div class="div">
    <img data-src="http://image.zhangxinxu.com/image/study/s/s256/mm1.jpg" />
    <p>图片无absolute</p>
</div>
<div class="div">
    <img class="abs" data-src="http://image.zhangxinxu.com/image/study/s/s256/mm1.jpg" />
    <p>图片absolute后</p>
</div>
```

### 常见absolute布局的替代实现方案

**margin替换**

margin 可以代替 absolute 对其元素定位，如B相对于A元素右下角定位，常见的就是用B元素 absolute 定位并且使用 bottom 跟 right 属性定位。这样会存在问题，一是当父容器为 static 时候，B会定位错乱，二是当父容器的宽度改变，那么B的定位也随之改变。而利用 margin 的做法是怎样的呢？A跟B不在同一个 inline-block 里，可以让A表现为 block 属性，并且使B裹上一个表现为 inline-block 的容器，这样B元素就可以使用 margin 来灵活定位到右下角了。[absolute/margin定位布局对比demo](http://www.zhangxinxu.com/study/201012/position-absolute-replace-method-2.html)

### absolute正业之元素隐藏

除了使用`display: none`和`display:block/inline`来控制DOM元素显隐，还可以利用 absolute ，且有三个好处：**页面可用性，回流与渲染，配合JavaScript的控制。**

```html
.hidden{
    position:absolute;
    top:-9999em;
}

.hidden{
    position:absolute;
    visibility:hidden;
}

.hidden{
    position:absolute;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
}
```

**1、可用性隐藏：**“选项卡内容”，“更多收起展开”这些会不利于盲人这类需要借助屏幕阅读器的用户，但是可用性隐藏也存在一个问题，就是响应键盘焦点Tab切换的时候，假如你用的是 absolute 隐藏的时候，是可以被响应焦点的。

**2、回流与渲染：**使用`display:none`会造成重绘跟回流，详细可以看“[最小化浏览器中的回流(reflow)](http://www.zhangxinxu.com/wordpress/?p=311)”和“[回流与重绘：CSS性能让JavaScript变慢？](http://www.zhangxinxu.com/wordpress/?p=600)”

**3、配合JavaScript的控制：** 隐藏可以看上面的，但是显示我们只需要`dom.style.position = "static";
`，就无需担心原本标签的是inline水平还是block水平。

