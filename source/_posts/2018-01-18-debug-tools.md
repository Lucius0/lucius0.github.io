---
layout: post
title:  "各种debug工具在此汇总"
date:   2018-01-18
categories: tools
permalink: /archivers/debug-tools
tags: debug
---

## Charles HTTPS 代理

http代理不用说了。没啥问题。这里是以pc端为例。

1. 安装证书。Help ->  SSL Proxying -> Install Charles Root Certificate。并打开keychain进行安全信任。
![](/images/qiniu/180118191654.png)

2. Proxy -> macOS Proxy
![](/images/qiniu/180118191836.png)

3. 注意一点的是。开启shadowsocks会影响Charles。
![](/images/qiniu/180118191953.png)
所以要改成下面，或者关了shadowsocks再重新打开Charles。
![](/images/qiniu/180118192057.png)

4. 其实这时候已经可以用了，右键你要代理的 https 地址。例如我们抓`https://www.google.com`
![](/images/qiniu/180118192154.png)

5. 这时候你就会在 Proxy -> SSL Proxying Settings 看到如下信息。（这里我不喜欢网上说的`*:443`，因为这样会把其他无关的都带进来，出现一些莫名其妙现象，例如样式）
![](/images/qiniu/180118192313.png)

6. 到这里为止，你应该就可以按照http的方式去代理你想要的文件了。**但是，我遇到了一个很奇怪的问题，就是我代理到本地，文件居然是不完整的。这让我很郁闷。当然我最后找到解决方法，就是开启本地服务器，不采取Map Local，而采取Map Remote，将服务器文件代理到我的localhost这里，就可以了**

## whistle 查看 websocket

**wireShark也能做这样的事情，并且功能方面还比这个强大，但是本着折腾的心，权当玩玩看。**

1. 官方文档：[实现原理 · GitBook](https://avwo.github.io/whistle/)

2. 安装whistle `npm install -g whistle`

3. 运行whistle，回出现下面的信息 `w2 start`
![](/images/qiniu/180118192521.png)

4. 代理SwitchyOmega新建情景模式 -> 代理服务器(whistle) -> 
![](/images/qiniu/180118192606.png)

5. 这时候就可以打开`http://local.whistlejs.com/`
![](/images/qiniu/180118223728.png)

6. ws拦截，[WebSocket · GitBook](https://avwo.github.io/whistle/webui/websocket.html)。假如没有执行这一步，会看到ws的协议都是显示`tunnel`。

## weinre

这个跟下面的**m-console**都是在之前调试web 移动播放器的时候使用到的，好在本地有做记录，这次也顺便记录下来。

1. **weinre**：`npm -g install weinre`

2. `weinre --httpPort 8899 --boundHost your-local-host/-all-`

3. 打开浏览器并且输入你的地址 `your-local-host:8899`

4. 然后会出现下面的图
![](/images/qiniu/180118224316.png)

5. 将Example下的地址复制到你要测试的页面去。

6. 接着用你的设备链接你的本地开启的服务器，如我用xampp开启了一个服务器，然后用设备从外访问我的电脑服务器：`http://your-local-host/测试页面的地址`

7. 返回刚才在第3步打开的页面，并点击Access Point下的
`http://192.168.0.101:8899/client/#anonymous`就可以看到有哪些连接了本地服务器。

## m-console

1. **m-console**：`npm -g install m-console`

2. 同样将生成的js文件复制到测试页面去

3. 用手机连接本地服务器，就可以在pc端的网页上的输出了（如手机打开的是`http://192.168.0.101/test.html`，那么pc端上打开的也是同样的。只是那时候已经开始监听移动端的页面输出情况

**总结：**那么这两个debug调试工具有什么不同呢？`weinre`可以看到页面上的元素变化，但是在日志出书没有`m-console`好用。所以我一般都是两个工具混着一起用。据说`whistle`是结合了两者的优点，摒除了缺点，打算之后熟练了自然会记录下来。