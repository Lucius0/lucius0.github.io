---
layout: post
title:  "CSS - relative 和 absolute 小记"
date:   2017-03-02
categories: front-end
permalink: /archivers/relative-absolute-note
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

### absolute与等高布局

[纯CSS实现侧边栏/分栏高度自动相等](http://www.zhangxinxu.com/wordpress/?p=694) 与 [我所知道的几种display:table-cell的应用](http://www.zhangxinxu.com/wordpress/?p=1187) 均可以实现等高布局。

现在是利用 absolute 来实现等高布局，应用了`position: absolute`元素无宽度无高度。[绝对定位与等高布局demo](http://www.zhangxinxu.com/study/201103/absolute-equal-height-layout.html)

核心代码如下：

```html
.equal_height{width:100%; height:999em; position:absolute; left:0; top:0;}
```

同时，满足以下条件：

1. 高度999em的绝对定位层位于侧栏容器内，侧栏`position`为`relative`

2. 该栏实际元素内容用一个与absolute绝对定位层为兄弟关系的标签层包裹，`position`为`relative`，`z-index`值1或其他

3. 左右栏的父标签需设置`overflow:hidden`，同时为了兼容IE6/7，需设置`position`为`relative`

![](/images/css/css-23.png)

**原理：**由于绝对定位元素无高度的特性无宽度的特性，我们可以伪造一个高度足够高的绝对定位层（设置背景色，边框等属性），同时设置父标签溢出隐藏，那么其多出来的高度就不会显示了，也就实现了看上去的等高布局效果了。

## relative

1、定位

relative 与 absolute 不同的是，relative 相对于自身位移，而 absolute 是相对于容器位移，张老师形象的称为“幻影位移“，什么这么说呢？因为 relative 是不会脱离文档流的，即就算你离开了自己本来的位置，那个位置还在，还是属于你的，只是你的”幻影“离开了原来的位置，表现也就变了。[relative属性幻影瞬移技能demo](http://www.zhangxinxu.com/study/201108/css-relative-skill-move.html)

2、z-index

relative 跟 absolute 一样拥有 `z-index` 属性

3、限制 absolute

当 absolute 的父容器的定位是 relative 时，absolute 元素也就只能在 relative 限制下移动了，即 absolute 的`top\left`则是相对于 relative 移动的。

### relative 最小化影响

[未遵循最小化影响原则实现demo](http://www.zhangxinxu.com/study/201108/css-relative-mini-effect-rule-unfollow.html)

```html
.test {width:25em; margin:2em auto;}
.box { padding:2em; border:1px solid #beceeb; border-radius:2px; background-color:#f0f3f9; position:relative; }
.ok { color:green; font-size:6em; position:absolute; right:-11px; bottom:-.5em; }

<div class="test">
    <div class="box">
        CSS relative相对定位的最小化影响原则
        <strong class="ok">√</strong>
    </div>
</div>
```

[遵循最小化影响原则实现demo](http://www.zhangxinxu.com/study/201108/css-relative-mini-effect-rule.html)

```html
.test {width:25em; margin:2em auto;}
.box { padding:2em; border:1px solid #beceeb; border-radius:2px; background-color:#f0f3f9; }
.rel { position:relative; }
.ok { color:green; font-size:6em; position:absolute; right:-10px; top:-1em; }

<div class="test">
    <div class="box">CSS relative相对定位的最小化影响原则</div>
    <div class="rel"><strong class="ok">√</strong></div>
</div>
```

## 总结

`absolute+margin`（左上角元素定位，作用于当前元素）、`float+relative`（右上角元素定位，作用于当前元素）和`relative+absolute`（右下角元素定位，直接父标签+当前定位元素）。而目前web届大肆使用的外层div层设置relative属性，里面一些absolute元素定位的方法是不推荐的。







