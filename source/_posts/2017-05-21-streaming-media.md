---
layout: post
title:  "streaming media"
date:   2017-05-21
categories: media
permalink: /archivers/streaming-media
tags: media
---

> 所谓流媒体是指采用流式传输的方式在Internet播放的媒体格式。 流媒体又叫流式媒体，它是指商家用一个视频传送服务器把节目当成数据包发出，传送到网络上。用户通过解压设备对这些数据进行解压后，节目就会像发送前那样显示出来。 -- 来自《百度百科》

简单来说，流媒体跟媒体文件的区别就在于，前者是需要服务器支持的，如RTSP、http流媒体服务器，通过解码，然后逐包的发送给播放器进行播放，**边下边放**，而后者则是不依赖网络，也不依赖服务器，只要有对应解码器的播放器就可以了。

## 流式传输

流媒体指在Internet/Intranet中使用流式传输技术的连续时基媒体，如：音频、视频或多媒体文件。流式媒体在播放前并不下载整个文件，只将开始部分内容存入内存，流式媒体的数据流随时传送随时播放，只是在开始时有一些延迟。流媒体实现的关键技术就是流式传输。

## 顺序流式传输

顺序流式传输是顺序下载，在下载文件的同时用户可观看在线媒体，在给定时刻，用户只能观看已下载的那部分，而不能跳到还未下载的前头部分，顺序流式传输不象实时流式传输在传输期间根据用户连接的速度做调整。由于标准的HTTP服务器可发送这种形式的文件，也不需要其他特殊协议，它经常被称为HTTP流式传输。顺序流式传输不适合长片段和有随机访问要求的视频。

## 实时流式传输

实时流式传输指保证媒体信号带宽与网络连接配匹，使媒体可被实时观看到。实时流与HTTP流式传输不同，他需要专用的流媒体服务器与传输协议。实时流式传输总是实时传送，特别适合现场事件，也支持随机访问，用户可快进或后退以观看前面或后面的内容。这样会很依赖网络环境，一旦网络拥挤则会造成画像信息丢失或者图像质量差。实时流式传输还需要特殊网络协议，如：RTSP (Realtime Streaming Protocol)或MMS (Microsoft Media Server)。这些协议在有防火墙时有时会出现问题，导致用户不能看到一些地点的实时内容。

## 原理

首先，多媒体数据进行预处理才能适合流式传输，这是因为目前的网络带宽对多媒体巨大的数据流量来说还显得远远不够。预处理主要包括两方面：一是降低质量；二是采用先进高效的压缩算法。

其次，流式传输的实现需要缓存。这是因为Internet以包传输为基础进行连续的异步传输，对一个实时A/V源或存储的A/V文件，在传输中它们要被分解为许多包，由于网络是动态变化的，每个包选择的路由可能不尽相同，故到达客户端的时间延迟也就不等，甚至先发的数据包还有可能后到。为此，使用缓存系统来弥补延迟和抖动的影响，并保证数据包的顺序正确，从而使媒体数据能连续输出，而不会因为网络暂时阻塞使播放出现停顿。通常高速缓存所需容量并不大。这是因为高速缓存使用环行链表结构来存储数据：通过丢弃已经播放的内容，"流"可以重新利用空出的高速缓存空间来缓存后续尚未播放的内容。

再次，流式传输的实现需要合适的传输协议。WWW技术是以HTTP协议为基础的，而HTTP又建立在TCP协议基础之上。由于TCP需要较多的开销，故不太适合传输实时数据，在流式传输的实现方案中，一般采用HTTP/TCP来传输控制信息，而用RTP/UDP来传输实时声音数据。

## 传输协议

| 名称      | 推出机构        | 传输层协议 | 客户端          |
| -------- | -------------- | --------- | -------------- | 
| RTSP+RTP | IETF           | TCP+UDP   | VLC, WMP       |
| RTMP     | Adobe Inc.     | TCP       | Flash          |
| RTMFP    | Adobe Inc.     | UDP       | Flash          |
| MMS      | Microsoft Inc. | TCP/UDP   | WMP            | 
| HTTP     | WWW+IETF       | TCP       | Flash          |
| HLS      | Apple          | TCP       | IOS/部分Android |


## 执行步骤

- 在网络上观看视频，则需要：解协议，解封装，解码视音频，视音频同步。

- 在本地上观看视频，则需要：解封装，解码视音频，视音频同步。

**参考资料：**

- [百度百科](http://baike.baidu.com/link?url=KmhsT7Th2RZN1I-eCn2at0u71EvDsVbNBe7Xy7uqPzQPJYEJarUsPpd7_N7JT1D3DB5XuPYAXd_PF1k4aprfRGWx6OCDHcRXmRW1JFaTSJSH60pj1pwefMWaCW6-ji4i)

- [http://www.kuqin.com/stream-media/20070904/864.html](http://www.kuqin.com/stream-media/20070904/864.html)

- [RTMP VS HTTP](https://github.com/ossrs/srs/wiki/v1_CN_RTMP.PK.HTTP)

- [关于直播，所有的技术细节都在这里了](http://blog.ucloud.cn/archives/author/usmd)