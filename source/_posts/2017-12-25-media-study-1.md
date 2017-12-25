---
layout: post
title:  "音视频学习-flv初认识"
date:   2017-12-25
categories: media
permalink: /archivers/media-study-01
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

## 什么是FLV？

> Flash Video（简称FLV），是一种网络视频格式，用作串流媒体格式，它的出现有效地解决了视频文件导入Flash后，使导出的SWF文件体积庞大，不能在网络上有效使用等缺点。
> 一般FLV文件包在SWF PLAYER的壳里，并且FLV可以很好的保护原始地址，不容易被下载到，从而起到保护版权的作用。但还是有些视频格式转换软件将FLV转成一般的视频格式，如中国的软件格式工厂。随着视频网站的丰富，在2008年时这个格式已经非常普及，包括YouTube、NICONICO动画、Google Video、Yahoo! Video、MySpace，以及中国的优酷、酷6等大部分视频分享网站均采用这个格式。——- wiki百科

## FLV的分类

除了 flv（H264视频格式、AAC音频格式），还有 f4v，主要是为了突破 flv 的限制。 f4v 支持 H.264 视频格式之外，还支持 GIF、PNG 以及 JPEG；音频格式则有 AAC 以及 MP3 。
**PS：** Adobe的规范中，UB 表示Unsigned Bit，UB(2)表示2个bit，UI 表示Unsigned Integer，UI24 表示24位整数，也就是3个Byte。

## FLV的结构

先看一下flv的一小片段，这是一份二进制文件。
```js
464c 5601 0500 0000 0900 0000 0012 0000
3f00 0000 0000 0000 0200 0a6f 6e4d 6574
6144 6174 6108 0000 0002 0008 6475 7261
7469 6f6e 0040 27c8 b439 5810 6200 0c76
6964 656f 636f 6465 6369 6400 4000 0000
0000 0000 0000 0900 0000 4a08 0000 0400
0000 0000 0000 af00 1208 0000 000f 0900
0043 0000 0000 0000 0017 0000 0000 0142
001f 0301 002f 6742 801f 9652 0283 f602
a100 0003 0001 0000 0300 32e0 6003 0d40
0046 30ff 18e3 0300 186a 0002 3187 f8c7
0ed0 a152 4001 0004 68cb 8d48 0000 004e
0900 0d1c 0000 0000 0000 0017 0100 029d
0000 0d13 6588 8040 0db1 185c 0008 2d1f
7893 de24 f789 f785 c2c4 f8a6 d3e2 43fa
f177 85ea f377 a930 f991 ea7c 4f2a f0b9
```
它的结构图是这样的。
![](http://ouazw12mz.bkt.clouddn.com/171225224159.png?imageslim)

FLV Header自然时不用多说，上面的结构图都一目了然。重点讲下Flv Body下的Tag的三种类型。

### Script Tag

**KEY**
1、第1个字节为AMF类型，一般有以下的类型：
- 0 = Number
- 1 = Boolean
- 2 = String
- 3 = Object
- 4 = MovieClip (reserved, not supported)
- 5 = Null
- 6 = Undefined
- 7 = Reference
- 8 = ECMA array
- 9 = Object end marker
- 10 = Strict array
- 11 = Date
- 12 = Long string

因此第一个Tag Data `onMetaData` 的类型为0x02。

2、第2-3个字节表示标识字符串的长度，所以第一个为0x0000A。

3、接着是为key的具体字符串，因此第一个为`onMetaData`。

**Value**
1、紧接着后面则为ScriptTag的value值，第1个字节同样也是AMF类型，一般为0x08，表示ECMA Array。

2、第2-5个字节表示数组元素的个数。

3、后面即为各元素的封装，为一一对应的键值对，常见的MetaData如下：
- duration：时长
- width：视频宽度
- height：视频高度
- videodatarate：视频码率
- framerate：视频帧率
- videocodecid：视频编码方式
- audiosamplerate：音频采样率
- audiosamplesize：音频采样精度
- stereo：是否为立体声
- audiocodecid：音频编码方式
- filesize：文件大小

4、最后用3个字节的固定值0000 09表示value值结束。

### Audio Tag

Audio Tag Data开始的第一个字节包含了音频数据的参数信息，第二个字节开始为音频流数据。

```
--------------------------------------------------------------
|                    音频参数(8bit)                 | 音频数据 |
--------------------------------------------------------------
|音频编码类型(4bit)| 采样率(2bit)|精度(1bit)|类型(1bit)|   数据  |
--------------------------------------------------------------
```

**第1字节：**
1、前4位标识音频数据的格式，如：0x2表示的是MP3数据，当前合法的数值为0，1，2，3，4，5，6，7，8，9，10，11，14，15（7，8，14，15保留为内部使用）
- 0：Linear PCM，platform endian
- 1：ADPCM
- 2：MP3
- 3：Linear PCM，little endian
- 4：Nellymoser 16-kHz mono
- 5：Nellymoser 8-kHz mono
- 6：Nellymoser
- 7：G.711 A-law logarithmic PCM
- 8：G.711 mu-law logarithmic PCM
- 9：reserved
- 10：AAC
- 14：MP3 8-Khz
- 15：Device-specific sound

2、第5，6位bit表示采样率（AAC，总是3）
- 0：5.5kHz
- 1：11KHz
- 2：22 kHz
- 3：44 kHz

3、第7位，采样精度， 0为8bits， 1为16bits

4、第8位，音频类型，mono=0， stereo=1

### Video Tag
和音频一样，其第一个字节包含的是视频参数信息，第二字节开始为视频流数据。
```
--------------------------------------------------------------
|                    视频参数(8bit)                 | 视频数据 |
--------------------------------------------------------------
|     标识帧类型(4bit)     |    标识视频编码(4bit)     |   数据  |
--------------------------------------------------------------
```

**第1字节：**
- 前4位标识帧类型。
	- 1：keyframe (for AVC, a seekable frame)； 
	- 2：inter frame (for AVC, a nonseekable frame)； 
	- 3：disposable inter frame (H.263 only)； 
	- 4：generated keyframe (reserved for server use only)； 
	- 5：video info/command frame
- 后4位标识视频编码。
	- 1：JPEG (currently unused) ；
	- 2：Sorenson H.263； 
	- 3：Screen video； 
	- 4：On2 VP6； 
	- 5：On2 VP6 with alpha channel；
	- 6：Screen video version 2； 
	- 7：AVC


## 参考资料

- [video_file_format_spec](https://www.adobe.com/content/dam/acom/en/devnet/flv/video_file_format_spec_v10.pdf)
