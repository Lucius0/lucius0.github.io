---
layout: post
title:  "Web 安全防御战 - 浅谈XSS"
date:   2019-06-30
categories: [http, web-secure]
permalink: /archivers/web-secure-xss
tags: [http, web-secure]
---

在进入 web 安全知识之前，建议对 HTTP 有所了解，可以看[HTTP 入门体检](https://lucius0.github.io/2019/06/30/archivers/http-introduction/)，会对以下的内容有所帮助。

## XSS(Cross Site Scripting)

> XSS，跨站脚本攻击。很常见的一种攻击方式，主要是通过**脚本注入**的方式进行攻击用户。通常有：反射型 XSS 、存储型 XSS和 DOM 型 XSS。——[跨站脚本 - 维基百科](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)

### 反射型XSS

> 反射型 XSS，为非持久型，可以把它想象成反射弧。从发起带有XSS脚本的请求，提交到服务端，服务端解析后响应随之返回浏览器，最后浏览器将其响应解析并执行。简单来说，一般都是由 URI 参数直接注入的攻击。

我们用 Koa2 来模拟一下，以下是简单的示例代码：
```js
const Koa = require('koa');
const app = new Koa();

const template = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Document</title>
  </head>
  <body>
    #{root}
  </body>
  </html>
`;

app.use(async ctx => {
  ctx.body = template.replace('#{root}', `welcome: ` + ctx.query.xss);
});

app.listen(3000);
```

在下面我们可以看到，浏览器会报错，原因是现代浏览器都会有 XSS 拦截的保护机制(这并不代表因为浏览器帮我们做了而我们就可以忽略 XSS 的知识)。

![](/images/http/xss-01.gif)

因此我们需要在服务器设置响应首部`X-XSS-Protection`。由于我们是要模拟 XSS ，所以我们先关闭 XSS 的保护 `ctx.set('X-XSS-Protection', 0)`，然后就可以看到以下结果，弹出 alert 弹窗。

![](/images/http/xss-02.gif)

除了上面直接执行脚本之外，还可以加载非同源的js文件，嵌入 iframe 页面等等。

### 存储型XSS

>  存储型 XSS，为持久型。跟反射型 XSS 的唯一区别在于是否会保存在服务器，如数据库，内存等。而当别人访问该页面时，就会受到 XSS 代码的攻击。危害相比反射型更加严重，也更隐匿。

我们再次用Koa2来模拟一下，以下是简单的示例代码：

```js
const Koa = require('koa');
const app = new Koa();

const template = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Document</title>
  </head>
  <body>
    #{root}
  </body>
  </html>
`;

// 模拟数据库
const database = {
  message: '',
}

app.use(async ctx => {
  let url = ctx.request.url;
  if (url.indexOf('/blog') === 0) {
    database.message = ctx.query.message;
    ctx.body = '发送成功～'
  } else {
    ctx.set('X-XSS-Protection', 0);
    ctx.body = template.replace('#{root}', `来自某某人的消息：` + database.message);
  }
});

app.listen(3000);
```

大概的步骤是模拟类博客那种，黑客利用漏洞向网站发送带有 XSS 攻击脚本到服务器，服务器没有任何的安全校验直接保存到数据库 `database`，当其他用户访问带有该 XSS 脚本的页面时就被攻击了。在这里我们发送一个带用 iframe 劫持的请求到服务器，用户收到响应时就会返回该 iframe 页面。

![](/images/http/xss-03.gif)

### DOM 型 XSS

> DOM 型 XSS，为非持久型，主要是利用前端的代码逻辑漏洞，攻击者植入恶意代码，然后浏览器解析恶意代码后执行造成的 XSS 攻击。

以下是简单的示例代码：

```html
<html>
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  DOM 型 XSS
</body>
<script type="text/javascript">
  setTimeout('alert(1)');
  setInterval('alert(2)');
  eval('alert(3)');
</script>
</html>
```

### 常见 XSS 注入点

- HTML 节点内容，例如动态生成，里面包含用户输入信息，那么有可能会携带脚本；
- HTML 节点属性，例如图片的 onerror、onclick 事件；超链接 href、输入框 value 属性；
- JavaScript 代码，例如 JS 代码中存在后台注入的变量或如 react 的 dangerouslySetInnerHTML；
- 富文本，例如富文本需要过滤需要正常展示的 html 代码之外的脚本；

### 常见危害
- 获取页面数据；
- 盗取 Cookie，获取敏感信息；
- 劫持前端逻辑；
- 伪装身份，利用可信任来进行不允许的操作；
- 进行 DDoS 攻击；
- ……

### 常见防御方法

- 浏览器自带防御，如我们上面提到的，假如在服务器不设置`X-XSS-Protection`，现代浏览器也一样会为我们拦截大部分的 XSS 攻击(**反射型 XSS，而且只会拦截出现在 HTML 内容或属性中，同时也并不是所有浏览器都支持**)；
- 节点内容转义，一般会在入数据库之前转义或者在展示的时候转义，但是入库之前转义需要**注意的是，1、客户端不仅仅只有Web端，也有iOS等终端，所以可能会导致出现乱码；2、转义后的字符串跟长度跟预期的字符串长度发生变化，如’<‘ 转成 ‘&lt;’，由1个字符变成了4个字符**；

```js
// 展示转义简单处理
function escapeHtml (str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#x27;')
           .replace(/\//g, '&#x2F;');
}
```

- JavaScript 内容转义，同理节点内容转义，但是处理方法稍微不同，可以使用`JSON.stringify`来处理；
- Angular / Vue / React，不建议使用 `[innerHTML]/v-html/dangerouslySetInnerHTML` 来插入 html 元素；
- `eval()/setTimeout()/setInterval()`，都是可以直接将字符串当代码段运行；
- 富文本内容转义，相对于节点内容转义跟 JavaScript 内容转义，富文本内容转义比较复杂，但是大多数处理的思路都是相同的，设置转义白名单，对用户输入的内容进行过滤，可以使用 `js-xss` 库；
- CSP(Content-Security-Policy)，可以参考[内容安全策略( CSP ) - HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)，后续会说明下CSP策略；

总体来说，我们能做的只是降低 XSS 攻击的风险，XSS 的攻防战一直存在也十分复杂。最后给一下[XSS过滤绕过速查表](http://www.freebuf.com/articles/web/153055.html)，祝大家看得开心（溜了～

## 参考

- [跨站脚本 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)
- [跨站脚本攻击(Cross-site scripting) - 术语表 | MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Cross-site_scripting)
- [内容安全策略( CSP ) - HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
- [Cross-site Scripting (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS))