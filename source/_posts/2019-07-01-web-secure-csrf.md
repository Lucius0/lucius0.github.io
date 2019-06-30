---
layout: post
title:  "Web 安全防御战 - 浅谈CSRF"
date:   2019-07-01
categories: [http, web-secure]
permalink: /archivers/web-secure-csrf
tags: [http, web-secure]
---

在进入 web 安全知识之前，建议对 HTTP 有所了解，可以看[HTTP 入门体检](https://lucius0.github.io/2019/06/30/archivers/http-introduction/)，会对以下的内容有所帮助。

## CSRF(Cross-site request forgery)

> CSRF，跨站请求伪造。也被称为**one-click attack**或者**session riding**，通常缩写为**CSRF**或者**XSRF**。是一种挟制用户在当前已登录的Web应用程序上执行非本意的操作的攻击方法。

### XSS(Cross Site) 和 CSRF(Cross Site) 区别

XSS 的 **Cross Site**主要是指在本网站运行了来自其他网站的脚本，而 CSRF 的**Cross Site**则相反，指在其他网站对本网站造成了影响。跟 XSS 相比，XSS 利用的是用户对指定网站的信任，CSRF 利用的是网站对用户网页浏览器的信任。

### 简单栗子

我们在本地搭建两个破烂的网站，一个模拟 CSRF 攻击网站，另一个模拟博客网站。我们的博客网站是采取 `GET` 方法来发送评论(偷懒，不要模仿)。

匿名信息的情况下：

```js
// 攻击网站攻击代码
<img src="http://localhost:3000/?message=CSRF 攻击" />
```

![](/images/http/csrf-01.gif)

诱引用户点击进行CSRF攻击的情况如下：

```js
// 攻击网站攻击代码
<img src="http://localhost:3000/?message=<a href=http://www.csrf.com/>点了会有好事发生！</a>" />
```

![](/images/http/csrf-02.gif)

大概的流程如下：

- 在 CSRF 网站，向博客网站发起了攻击评论**CSRF 攻击**(`GET`请求)；
- 然后在博客网站就会发现了一条 **匿名信息：CSRF 攻击** 的评论；
- 假如该 **CSRF攻击** 评论是~超链接~，那么用户点击了就会触发攻击，或者是自行运行的脚本，用户只要打开这个页面就会触发攻击；

### CSRF 攻击原理

- 用户登录存在漏洞的健康网站A；
- 网站A 服务器验证了用户的身份之后，响应该用户的 Cookie 作为身份凭证；
- 攻击网站B 检查到网站A 的漏洞或者引诱用户在 A网站 访问 B网站，这样攻击网站就可以带上用户的身份凭证向 网站A 发起请求(攻击)；

### 常见危害
- 利用用户登录态盗取用户资金；
- 在用户不知情的情况下冒充用户做违法乱纪的事情；
- 私自完成业务请求，导致损坏网站名誉；
- …..

### 常见防御方法

#### Set-Cookie: SameSite

禁止第三方网站带 Cookies，即在响应头 `Set-Cookie` 设置 SameSite 属性，表示该 Cookie 问同源网站而非来源第三方网站。如 Koa2 设置如下：

```js
ctx.cookies.set([cookie_key], [cookie_value], {sameSite: 'strict' | 'lax'};
```

其中 `strict` 与 `lax` 区别如下：
```js
// B网站 API 响应头设置如下：
Set-Cookie: foo=1; Samesite=Strict
Set-Cookie: bar=2; Samesite=Lax
Set-Cookie: baz=3
```
1. 假如在 A网站 请求 B网站 的 API，那么 `foo=1` 这个 Cookie 是不会从 A网站 带到 B网站的；
2. `Lax`，只会在使用危险 HTTP 方法时发送跨域 Cookie 被阻止，如 POST 请求。假如 A 网站 有一个超链接 GET 请求 B网站的 API，那么这时候 Cookie 是可以从 A网站 带到 B网站的；
3. `baz=3` 是可以从 A网站 带到 B网站；

**注意：**
> Lax 的防范有限，而 Strict 则一棒子打死，所以先对大多数 Cookie 设置为 Lax 作为 CSRF 攻击缓解措施，而针对某部分认为存在危险可能的 Cookie才设置 Strict。另外，SameSite Cookie 在子域不支持共享，也就是说父域登录后在子域还需要重新登录，这显然不够友好，而且还存在**兼容性**问题。

#### 验证码校验 或 CSRF Token

无论是验证码还是 CSRF Token，道理都是一样的，就是为了保证只有在本网站才能获得到的**随机验证码**。

**验证码的原理：**
- 用户在请求的地方，会去请求服务器申请一个验证码，一般来说是图片；
- 服务器收到请求后，会随机生成验证码captcha，随后将其文本值以及对应的用户信息缓存下来，并且将图片二进制信息响应回去；
- 用户得到图片验证码之后，将其文本信息跟随者请求一起带过去给服务器；
- 服务器随后根据用户信息取出对应的验证码并且进行校验。

验证码实现虽然简单，但是我们不能让用户请求的时候都提交验证码，这样会影响用户体验。

**CSRF Token的原理：**
- 服务器需要生成一个通过加密算法加密的 Token；
- 将该 Token 保存至Cookie，更安全高效的是应该保存在 Session 或者 Redis；
- 将该 Token 传给客户端，客户端在请求时要将其 Token 一并带上，如 `GET` 请求 `/api/message?token=xxx` 或 `POST` 请求在form表单追加 `<input type="hidden" name="token" value="xxx"/>` 或 `Ajax` 请求在页面添加`<meta name="csrf" content="token" />`，通过 JS 去获取该 meta 值；
- 请求到服务器后，服务器就可以通过解密对比来判断该 Token 的有效性了。

**注：**
> Token 虽然很有效的防御 CSRF，但是实现复杂，不仅需要前端这边的请求都带上 Token，而且后端也需要对每个接口都进行校验，因此工作量比较大。

#### 同源策略

`Origin`、`Referer`，都是用来表示请求源地址。在大多数场景中，会跟随着请求头发送到服务器，然后服务器通过解析头部值，获取请求来源地址。一般来说，我们在服务器设置好**允许请求地址**通过的白名单，然后当服务器拿到请求的来源地址，就可以进行过滤了。

**Origin**
说到 `Origin`，就不得不提 CORS 了。CORS 需要**浏览器**和**服务器**同时支持。目前，所有浏览器都支持该功能，~IE 浏览器不能低于IE10~。一旦请求发生 CORS，那么请求头部信息就会携带 `Origin`，**但是假如发生302重定向，那么Origin也不会跟随着请求头部信息一起发送给服务器。**

**Referer**
`Referer` 的值是由浏览器提供的，每一次的 HTTP 请求首部中都会有该字段，不管是Ajax请求，还是图片。既然由浏览器提供，那么就存在被攻击者刻意隐藏，甚至伪造`Referer`的值。

控制`Referer`的策略如下：

| 旧策略属性值  | 新策略属性值  |
|:-----------------------:  |:--------------------------: |
| never   | no-referrer   |
| default   | no-referrer-when-downgrade  |
| always  | unsafe-url  |
| origin-when-crossorigin   | origin-when-cross-origin  |

通过设置 HTTP 响应头 `Content-Security-Policy` 来指定 `Referrer`策略：`Content-Security-Policy: referrer no-referrer|no-referrer-when-downgrade|unsafe-url|origin-when-cross-origin;`

策略属性值说明：

- `no-referrer`：任何情况都不发送 `Referer`；
- `no-referrer-when-downgrade`：当协议发生降级（如 HTTPS 页面跳转/引入 HTTP 页面）时不发送`Referer`；
- `unsafe-url`：不安全策略，无论什么情况都发送`Referer`；
- `origin-when-crossorigin`：尽在发生**跨域**以及包含**host**的前提下发送`Referer`。

隐藏`Referer`有以下几种情况：

- 整体隐藏：`<meta name=“referrer” content=“never” />` 或 `<meta name=“referrer” content=“no-referrer” />`；
- 特定元素隐藏：`a`、`area`、`link`、`iframe`和 `img` 可以通过 `referrerPolicy` 进行设置隐藏 `referrerPolicy="never"` 或 `referrerPolicy="no-referrer"`。其中 `a` 和 `link` 还可以通过设置`rel="noreferrer"`；
- 低版本IE(6、7)隐藏：`window.location.href=url` 或 `window.open` 时会丢失`Referer`。

总的来说，CSRF 危害很大，而且还跟 XSS 一样很难防范。虽然说我们在上面罗列的接种防御策略可以很大程度上防御 CSRF 攻击，但是并非十全十美。所以我们只有根据自己的实际情况来选择最合适的策略，这样才能降低受到 CSRF 攻击的概率。哦，对了，在防御 CSRF 之前，需要先[防御 XSS](https://lucius0.github.io/2019/06/30/archivers/web-secure-xss/)。

## 参考

- [跨站请求伪造 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)
- [CSRF 攻击的应对之道](https://www.ibm.com/developerworks/cn/web/1102_niugang_csrf/index.html)
- [Cross-Site Request Forgery (CSRF) - OWASP](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF))
- [浅谈CSRF攻击方式 - hyddd - 博客园](https://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html)
