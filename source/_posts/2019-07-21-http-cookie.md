---
layout: post
title:  "来一块饼干吗？ - HTTP Cookie"
date:   2019-07-21
categories: [http]
permalink: /archivers/http-cookie
tags: [http]
---

在阅读该文章之前，建议对 HTTP 有所了解，可以看[HTTP 入门体检](https://lucius0.github.io/2019/06/30/archivers/http-introduction/)，会对以下的内容有所帮助。

我们在前面说了那么多关于 Web 安全的问题，多多少少都会跟 Cookies 扯上关系。也就是说无论是 [XSS](https://lucius0.github.io/2019/06/30/archivers/web-secure-xss/) 还是 [CSRF](https://lucius0.github.io/2019/07/01/archivers/web-secure-csrf/)，Cookies 都是我们无法绕过的坎。既然 Cookies 这么重要，那我们来好好的分析一下它。

## 介绍

> Cookies 它是前端数据的**“数据库”**，保存在浏览器，且遵守**同源策略**。它是由服务器通过设置 **HTTP 响应头**来设置 Cookies，然后在请求的时候由浏览器通过 **HTTP 请求头**发送给服务器。一般情况下，**JS 可读写Cookies**。

所谓的同源策略，指的是从同一个源加载的文档或脚本如何与来自另一个源的资源进行交互，这样可以隔离潜在恶意文件。**简单来说，就是协议、端口以及域名(无论一级域名或二级域名)相同构成同源地址。** ——— [同源策略 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy) 

## 属性
其实属性我们在 [网络协议入门体检](https://lucius0.github.io/2019/06/30/archivers/http-introduction/)已经说过了，在这里我们重新梳理一次。之前也讲过在 koa2 的设置方法，koa 2 中操作 Cookies 是使用了[Cookies](https://github.com/pillarjs/cookies)，因此使用方法也简单了不少：

```js
// ctx.cookies.set([cookie_key], [cookie_value], { 属性: 值 };
// 如：
ctx.cookies.set('uid', '123', { httpOnly: false });
```

那么在第一次响应时会返回 `Set-Cookie` 响应首部字段。

![](/images/http/cookie-01.png)

而再次发送该请求时，就会自动带上 `Cookie` 请求首部字段了。

![](/images/http/cookie-02.png)

**注：**

> Cookies 是可以设置多个 key，value 键值对的。假如是同一个key，多个value，则在第二次请求的时候携带的 Cookie 首部字段是后者覆盖前者。
> 
> 我们已经知道了如何如增改查一个 Cookie，但是 Cookie 的删除却是无法直接删除的，什么意思呢？简单的说，你只能设置它的有效时间为过期时间，即 `ctx.cookies.set('uid','',{ maxAge:0 })`。

### max-age/expires 

过期时间，这个不用多解释，跟之前讲的 `Cache-Control` 是一个使用方法以及效果一样。

### Secure

只允许在 HTTPS 协议下请求传输。

### HttpOnly

不允许使用 js 来操作 Cookies，也就是只允许服务器操作，包括增删改查，该属性可以在一定程度上防御 CSRF 攻击，详细可以查看 [CSRF](https://lucius0.github.io/2019/07/01/archivers/web-secure-csrf/)。

### Domain

由于 Cookies 有域名访问权限设定，也就是说该 Cookie 只能在当前域使用，例如在百度的 Cookies 只能在 `baidu.com` 域名下允许访问。那么假如是二级域名呢？如 `test.baidu.com`。其实二级域名是**有办法共享**一级域名的 Cookies 的，就是通过 `domain` 来实现的。
 
`domain` 的默认值为哪个域名访问则为哪个，不管你是几级域名。因此二级域名的访问的 `domain` 就为二级域名，如 `xxx.baidu.com`，既然 `domain` 是二级域名，那么就无法跟一级域名共享 Cookie，而且一级域名的`domain` 也无法设置成二级域名。**所以要实现共享，只需要将一级域名以及二级域名均设置为一级域名.**

```js
// 一级域名设置如下
ctx.cookies.set('uid', '123', { domain: 'baidu.com' });
// 二级域名设置如下
ctx.cookies.set('uid', '123', { domain: 'baidu.com' });
```

### SameSite

禁止第三方网站带 Cookies，即在响应头 `Set-Cookie` 设置 SameSite 属性，表示该 Cookies 问同源网站而非来源第三方网站。如 Koa2 设置如下：

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

**注：**

> Lax 的防范有限，而 Strict 则一棒子打死，所以先对大多数 Cookie 设置为 Lax 作为 CSRF 攻击缓解措施，而针对某部分认为存在危险可能的 Cookie才设置 Strict。另外，SameSite Cookie 在子域不支持共享，也就是说父域登录后在子域还需要重新登录，这显然不够友好，而且还存在**兼容性**问题。

## 常见作用

- 存储用户凭证，典型的有记住用户登录状态以及登录失效时间；
- 存储业务数据，典型的有购物车物品的状态；
- 记录用户习惯，典型的有在搜索物品后，会根据该记录给你精准推送；
- 存储未登录用户的状态，典型的有论坛评论，填写你的邮箱地址然后进行评论，而且你不需要注册；

## 缺点

- Cookies 作为客户端的数据库，那么敏感信息保存在客户端多多少少是不安全的，万一被拦截了呢？上 HTTPS；
- Cookies 的存储容量有限，在不同浏览器都是有不同的限制，但大多数浏览器每个**域**不超过50个 Cookie 且不超过4kb，也有的浏览器则是每个 Cookie 的大小不超过 4kb，详细可以查看 [Browser Cookie Limits](http://browsercookielimits.squawky.net/)；

## Cookies 与安全

### Cookies && XSS

假如 Cookies 在允许 JS 操作的情况下，那么 XSS 可以偷取 Cookie，解决方法也已经在前面提到了，就是使用 `httpOnly`。

### Cookies && CSRF

CSRF 攻击的来源就是利用了 Cookies，当用户向目标网站发起请求的时候，这时候是会带上 Cookies 的。虽然带上了 Cookies，但是 CSRF 攻击网站是无法读写 Cookies 的。当然，我们最好的方法是能禁止不在白名单的第三方网站访问 Cookies，与防御 CSRF 攻击有关的 Cookies 属性是`sameSite`。

## Session

这里作为补充知识点，因为很多时候都会听到 Cookies 以及 Session 一起讲，那 Cookies 是什么我们现在知道了。Session 又是什么呢？它跟 Cookies 的区别又是什么？欢迎走入今日扯淡。

### 背景

> Session 本身就是一个抽象的概念，也就是因为 HTTP 的无状态，为了绕开 Cookies 的限制，借助客户端存储(一般来说是Cookies，因为较为通用)和服务器的存储，来实现客户端与服务器之间的中断和继续等操作的一种更高级的会话实现。

### 实现

流程图如下：

![](/images/http/session-01.png)

简单的实现
```js
const Koa = require('koa');
const Redis = require("ioredis");
const session = require("koa-session2");

const app = new Koa();
const redisCfg = {
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  family: 4, // 4 (IPv4) or 6 (IPv6)
  password: "admin",
  db: 0
};

class RedisStore extends session.Store {
  constructor() {
    super();
    this.redis = new Redis(redisCfg);
  }
 
  async get(sessionId, ctx) {
    let data = await this.redis.get(`SESSION:${sessionId}`);
    return JSON.parse(data);
  }
 
  async set(session, content, ctx) {
    let { sessionId, maxAge } = content;
    const key = `SESSION:${sessionId}`;
    const value = JSON.stringify(session);
    const command = 'EX';
    maxAge = maxAge / 1000;
    await this.redis.set(key, value, command, maxAge);
    return sessionId;
  }
 
  async destroy(sessionId, ctx) {
    return await this.redis.del(`SESSION:${sessionId}`);
  }
}

app.use(session({
  store: new RedisStore(),
  key: "SESSION_ID",
}));
```

### 区别

- Cookies 是存放在客户端的，通常为浏览器，而 Session 则是存在服务器；
- Cookies 作为登录凭证容易遭受到 CSRF 攻击，而 Session 相对来说较为安全；
- Cookies 只能存储 ASCII 字符串，假如是对象，还得通过 `JSON.parse` 转换，而 Session 可以存储对象，读写方便；
- 保管在服务器的 Session 对服务器的压力有影响，一旦并发访问多，则会占用很多资源，因此不敏感的数据可以考虑储存在 Cookies；
- Cookies 可以与子域共享，而 Session 则没有这个说法；

**注：**

> 假如浏览器把 Cookies 禁用了，那么可以通过 Session 来与服务器进行交互，具体的做法就是在请求 URL 后附加相关信息，如`http://test.com?sessionId=abc123xxx`

## 总结

基本上我们讲完了 Cookies 的基本属性、Cookies 与安全的联系以及跟Session 之间的关系。Cookies 能做到安全防御的措施其实是很有限的，也就是那几个属性`httpOnly/Secure/sameSite`，再者可以在 Cookies 上加签名或者密钥，这样可以在一定程度上防止被修改。