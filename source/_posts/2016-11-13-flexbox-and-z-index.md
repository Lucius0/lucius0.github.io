---
layout: post
title:  "Flexbox与z-index"
date:   2016-11-13
categories: front-end
permalink: /archivers/flexbox-and-z-index
tags: CSS
---

原文链接： [https://www.sitepoint.com/quick-tip-how-z-index-and-auto-margins-work-in-flexbox/](https://www.sitepoint.com/quick-tip-how-z-index-and-auto-margins-work-in-flexbox/)

[Flexbox](https://www.w3.org/TR/css-flexbox-1/) 是解决例如固定页脚和等高列等的普通布局的一种有效的解决方法。抛开这些，它还提供了一些不太流行的有用特性。让我们来一一探索它们。

## Flexbox 和 z-index

正如你已经知道的那样，`z-index`属性只能在定位的元素有效。默认情况下，所有元素都拥有`position: static`并且无法定位。除非`position`属性的值被设置为`relative`，`absolute`，`fixed`，或者`sticky`。

然而，一个没有定位性质的元素，例如flex项目同样也可以接收`z-index`属性。有关信息，在[CSS弹性盒子布局规范](https://drafts.csswg.org/css-flexbox-1/#painting)有介绍。

> Flex项目在渲染时如同内联块状元素一样，除了命令修改文档流顺序是用来替换未修改文档流顺序，`z-index`和自动边距在创建层叠上下文表现是不一样的，即使值为static。

为了理解这些行为，让我们跟随着以下的例子来思考吧：

<p data-height="499" data-theme-id="0" data-slug-hash="JKYEgj" data-user="SitePoint" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/SitePoint/pen/JKYEgj'>Flexbox and z-index</a> forked by SitePoint(<a href='http://codepen.io'>@SitePoint</a>) on <a href='http://codepen.io'>CodePen</a></p>

这里我们定义两个元素：`.font`元素和`.back`元素。`.font`元素有一内容值为‘1’的子元素，并且`.font`元素为绝对定位元素。特别地，它拥有`position:fixed`属性并且覆盖了整个视图。

至于`.back`元素是一个flex容器，它包含了两个子元素-一个内容为2和一个为3的子元素。基于我们在上面讨论的，我们可以对flex项目设置`z-index`属性，即使它们不是定位元素(即它们有`position:static`)

注意到当我们通过点击上面例子的按钮给flex项目添加`z-index:2`，它们会被定位到`.front`元素的上面。

## Flexbox和自动边距

通过给flex项目设置自动边距，我们可以解决相同的UI样式。一开始，我们先假象我们要构造这种类型的页头布局。

![](/images/css/css-18.png)

为了构造这种样式的页头，我们使用Flexbox，没有浮动，没有固定宽诸如此类的属性。

代码：

```html
<header>
  <nav>
    <h1 class="logo">LOGO</h1>

    <ul class="menu">
      <li>
        <a href="">About</a>
       </li>
      <li>
        <a href="">Projects</a>
      </li>
      <li>
        <a href="">Contact</a>
      </li>
    </ul>

    <ul class="social">
      <li>
        <a href="">Facebook</a>
      </li>
      <li>
        <a href="">Twitter</a>
      </li>
    </ul>
  </nav>
</header>
```

CSS:

```css
header {
  background: #333;
}

nav {
  display: flex;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.menu {
  margin-left: 60px;
  margin-right: auto;
}
```

在这个例子，`nav`元素是flex容器，而logo，主菜单，社交菜单则是flex项目。正如你在上一个代码结果看到的，前两个flex项目是沿着主轴排列在flex容器的左边。相反的，社交菜单则是沿着主轴排列在父容器的右边。

还有一种可以实现排列方式的就是给主菜单添加`margin-right: auto`。只要一行代码，我们就可以重载社交菜单的排列方式并把它始终排列在容器的右边。同样的，我们也可以用`align-self`属性去覆盖flex项目交叉轴的默认排列方式。

除了自动边距，我们还可以有第二种方法去设计我们的布局。首先，我们移除主菜单的`margin-right`属性，然后我们对其添加`flex-grow`属性。

尽管结果看起来两者无异，但却有一个很大的不同点。在第一个解决方法里面，菜单有它计算好的初始宽度。所以举个例子，当视图的宽度为1100px，菜单的宽度看起来则是下面这样的。

![](/images/css/css-19.png)

另一方面，对于第二种解决方案，菜单的宽度值会更大，因为我们指定了`flex-grow: 1`，这是当我们视图宽度为1100px时相对应的宽度。

![](/images/css/css-20.png)

以下是例子：

<p data-height="499" data-theme-id="0" data-slug-hash="ezpgqx" data-user="SitePoint" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/SitePoint/pen/ezpgqx'>Custom Flexbox Alignment With Auto Margins</a> forked by SitePoint(<a href='http://codepen.io'>@SitePoint</a>) on <a href='http://codepen.io'>CodePen</a></p>

现在让我们来假设一下我们想要修改的页头布局，新的设计布局是这样的：

![](/images/css/css-21.png)

HTML部分的代码保持不变，我们只是对CSS做稍微修改：

```css
nav {
  background: #333;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 180px;
  padding: 20px;
  box-sizing: border-box;
}

.menu {
  margin-top: 60px;
  margin-bottom: auto;
}
```

在这个例子，注意下社交菜单排列在父元素的底部。这是因为我们给主菜单添加了`margin-bottom: auto`。当然，我们同样还可以使用`flex-grow: 1`。但是这种方法会增加menu的高度。

同样来看一下codepen的示例代码：

<p data-height="499" data-theme-id="0" data-slug-hash="GqpWKW" data-user="SitePoint" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/SitePoint/pen/GqpWKW'>Custom Flexbox Alignment With flex-grow:1</a> forked by SitePoint(<a href='http://codepen.io'>@SitePoint</a>) on <a href='http://codepen.io'>CodePen</a></p>

有一件事我们需要留意的是我们在所有的例子都定义了`justify-content`属性，我们在视觉上看不出有任何的差异。这是因为我们对flex项目使用了`auto margin`。只有当我们移除了自动边距(auto margin)之后，`justify-content`才会生效。根据以下的规范

> If free space is distributed to auto margins, the alignment properties will have no effect in that dimension because the margins will have stolen all the free space left over after flexing.

> 假如把剩余的空间都分配给自动边距，那么对其属性将会失效。这是因为假如是flex布局之后，margin会占据所剩余的空间。

接下来，让我们来对页头做出新的改造。

毫无疑问，我们可以通过设置`justify-content: space-between`来很简单的实现这样的效果。但是再提一次，我们同样也可以通过设置自动边距来达到同样的效果。我们只要给主菜单设置`margin: 0 auto`。

Codepen 案例：

<p data-height="499" data-theme-id="0" data-slug-hash="beVqax" data-user="SitePoint" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/SitePoint/pen/beVqax'>Custom Flexbox Alignment With Auto Margins</a> forked by SitePoint(<a href='http://codepen.io'>@SitePoint</a>) on <a href='http://codepen.io'>CodePen</a></p>

## 结论

在这篇文章，我们介绍了两种鲜为人知关于Flexbox的小技巧。在结束之前，让我们来概括一下：

- 我们可以对flex项目设置`z-index`，即使他们的定位为`static`，`position: static`。

- 我们可以使用自动边距来实现主轴上的flex项目的自定义排列。

假如你还在你的项目中使用了其他的技巧，欢迎在下面留言。

<script src="http://codepen.io/assets/embed/ei.js"> </script>