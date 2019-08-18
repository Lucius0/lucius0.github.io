---
layout: post
title:  "HTTP X-Frame-Options"
date:   2019-08-10
categories: [http]
permalink: /archivers/http-x-frame-options
tags: [http]
---

在阅读该文章之前，建议对 HTTP 有所了解，可以看[HTTP 入门体检](https://lucius0.github.io/2019/06/30/archivers/http-introduction/)，会对以下的内容有所帮助。

`X-Frame-Options` 响应首部字段是用来告诉浏览器该网页是否能被 `frame`，`iframe`，`embed`，`object` 元素嵌入。`X-Frame-Option` 可以确保站点不被这些元素嵌入，免得遭受[点击劫持](https://zh.wikipedia.org/wiki/%E7%82%B9%E5%87%BB%E5%8A%AB%E6%8C%81)的攻击。

在说 `X-Frame-Options` 之前，当然要先简单的介绍下那几个嵌入元素。

## 嵌入元素

### frame
已废弃。因为存在一些性能问题，以及使用屏幕阅读器的用户缺少可访问性。

### embed
将外部内容嵌入站点，比如插件，Flash `<embed src=“test.swf” />`、视频 `<embed type=“video/quicktime” src=“movie.mov” width=“640” height=“480”>`。

### object
嵌入对象元素，表示引入一个外部资源，这个资源可能是一张图片，一个嵌入的浏览上下文，亦或是一个插件所使用的资源。

先在这里停住，乍看之下，`object` 和 `embed` 的作用是一模一样的，都是表示引入一个外部资源。但是实际上，可以说是相同作用的。**但是，** `object` 标签只支持 IE 系列的浏览器或者其他支持 **ActiveX** 控件的浏览器，而 `embed` 则可以被大多数浏览器识别。因此在嵌入 flash 时，为了让大多数浏览器能够正常显示 flash，需要把 `embed` 标签嵌套放在 `object` 标签内。

简单来说，就是 IE 可以识别 `embed`，但是为了让其他浏览器也能识别，建议加上 `object`

```js
<object width="200" height="200" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">
  <param name="src" value="test.swf" />
  <param name="quality" value="high" />
  <embed src="test.swf" type="application/x-shockwave-flash" width="200" height="200" quality="high"></embed>
</object>
```

### iframe

`iframe` 可以讲一大篇文章，但是不配合着讲 `iframe` 的来龙去脉，对`X-Frame-Option` 的理解可能会打折扣。`iframe` 出生在乱世(插件技术，也就是Flash、Java Applet)，现在也不建议使用，因为存在安全隐患。为什么会存在安全隐患呢？因为在没有加任何限制的情况下，`iframe` 嵌入的网站是可以被修改的。

```js
// html
<iframe src="http://www.test.com" name="test"></iframe>

// js
const iwindow = window.frames['test'].window;
// 或 iwindow = document.getElementById("test").contentWindow
const idoc = iwindow.document;
const ibody = idoc.body;

// 因此我们可以修改 iframe 里面的样式
ibody.style.backgroundColor='red'
```

![](/images/http/x-frame-options.png)

因此可见，假如在我们没有做任何的防御措施的情况下，肯定是会存在安全问题，例如广告劫持，点击劫持等等。那就让我们来学习一下，遇到这类问题如何处理。

## 防范
### sandbox
`sandbox` 是 `iframe` 的一个属性值，该属性对呈现在 `iframe` 框架中的内容启用一些额外的限制条件。属性值可以为空字符串（这种情况下会启用所有限制），也可以是用空格分隔的一系列指定的字符串。**IE 9及其以下版本不支持。**

| 值   | 描述  |
|-----------------------------------------  |-------------------------------------------------------------------------------------------------------------------------------------------------------  |
| allow-downloads-without-user-activation   | 允许在没有征求用户同意的情况下下载文件   |
| allow-forms   | 允许嵌入的浏览上下文提交表单。如果该关键字未使用，该操作将不可用  |
| allow-modals  | 允许内嵌浏览环境打开模态窗口  |
| allow-orientation-lock  | 允许内嵌浏览环境禁用屏幕朝向锁定（手机、平台垂直或水平转向）  |
| allow-pointer-lock  | 允许内嵌浏览环境使用[鼠标锁定](https://developer.mozilla.org/zh-CN/docs/API/Pointer_Lock_API#iframe_.E7.9A.84.E9.99.90.E5.88.B6)  |
| allow-popups  | 允许弹窗 (类似window.open, target="_blank", showModalDialog)，默认失效   |
| allow-popups-to-escape-sandbox  | 允许沙箱文档打开新窗口，并且不强制要求新窗口设置沙箱标记。 例如，这将允许一个第三方的沙箱环境运行广告开启一个登陆页面，新页面不强制受到沙箱相关限制。   |
| allow-same-origin   | 允许同源访问。   |
| allow-scripts   | 允许嵌入的浏览上下文运行脚本（但不能创建弹窗）。  |
| allow-top-navigation  | 允许嵌入的页面的上下文导航（加载）内容到顶级的浏览上下文环境（browsing context）。   |
| allow-top-navigation-by-user-activation   | 允许嵌入的页面的上下文在经过用户允许后导航（加载）内容到顶级的浏览上下文环境  |
 
`sandbox` 的属性实在是太多了。但是我们用来防御 `iframe` 攻击的常用的属性有 `allow-scripts/allow-forms/allow-same-origin`，而其他的属性值视情况而定。
```js
<iframe sandbox=”allow-forms allow-same-origin allow-scripts” src="http://www.test.com" name="test"></iframe>
```

### window.top.location
因为在上面说过 `sandbox` 有浏览器兼容的问题，但是有时候我们需要在低版本浏览器运行程序，而且往往低版本浏览器存在的问题会相对比较多。因此除了 `sandbox` 之外，我们还可以通过原生JavaScript 代码来防止被嵌套。

正常的网页`window.top === window`，但是一旦正常的网站被嵌套了之后，`window` 指向的是 `iframe`，也就是上面所说的 `iwindow`，而`window.top` 则是指嵌套网站的容器，因此我们可以利用`window.top === window` 来防止正常网站被嵌套。

```js
try {
  // 检测是否同域，假如不同域名的情况下访问则会报错
  top.location.hostname;
  // 判断是否被嵌套，假如被嵌套则强制跳转到正常网站地址
  if (top.location.hostname !== window.location.hostname) {
    top.location.href = window.location.href;
  }
} catch (e) {
  top.location.href = window.location.href;
}
```

### X-Frame-Options
这是我们本期的主角，但是它可以讲的内容其实并不多，只是因为归类在 HTTP 响应首部字段。它有三个值，`DENY/SAMEORIGIN/ALLOW-FROM xxx`。

- `DENY`：禁止任何形式的嵌套；
- `SAMEORIGIN`：只允许嵌入页和被嵌入页在同一个域名下，即受同源策略所限制；
- `ALLOW-FROM xxx`：只允许指定的站点嵌入网页，如`ALLOW-FROM http://test.com`；

`X-Frame-Options` 只是把拦截 `iframe` 控制权交给了服务端，本质上跟我们之前通过 `window.top.location` 的效果一样的，它相当于 `SAMEORIGIN`，因此我们可以通过 JavaScript 也可以达到一样的作用。

```js
// DENY
if (window !== window.top){
    window.top.location.href = window.location.href;
}

// SAMEORIGIN
try {
  // 检测是否同域，假如不同域名的情况下访问则会报错
  top.location.hostname;
  // 判断是否被嵌套，假如被嵌套则强制跳转到正常网站地址
  if (top.location.hostname !== window.location.hostname) {
    top.location.href = window.location.href;
  }
} catch (e) {
  top.location.href = window.location.href;
}

// ALLOW-FROM http://test.com
// 只是在上面的基础上加个白名单过滤判断一下就可以了。
```

## 总结
`iframe` 虽然可以做很多事情，也因为历史的车轮逐渐慢慢淘汰，但是不代表点击劫持我们就可以无视，除了 HTTP `X-FRAME-OPTIONS` 之外，还有 [CSP](http://www.ruanyifeng.com/blog/2016/09/csp.html) 可以帮助我们拦截点击劫持，这个我们下一次再说。总而言之，能不用`iframe`  就不用 `iframe`，同时也要考虑自己的站点允不允许被嵌入防止攻击。