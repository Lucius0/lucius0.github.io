---
layout: post
title:  "用shadowsocks加速git clone"
date:   2017-01-07 22:00:00
categories: tools
permalink: /archivers/shadowsocks-and-git
tags: git
---

在中国，有时候就算翻墙，在使用git上还是存在速度很慢。那么我们可以利用shadowsocks的sock5代理，为我们的git操作加速。

```
git config --global http.proxy 'socks5://127.0.0.1:1080' 
git config --global https.proxy 'socks5://127.0.0.1:1080'
```

shadowsocks的默认端口就是1080，上面的设置只是开启了`https`协议的代理，git协议开启代理可以查看[这里](http://segmentfault.com/q/1010000000118837)