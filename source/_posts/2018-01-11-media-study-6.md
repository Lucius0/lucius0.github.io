---
layout: post
title:  "音视频学习-flv之VideoTag(2)"
date:   2018-01-11
categories: media
permalink: /archivers/media-study-06
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

在上一篇讲解了关于H.264的基本概念，可以很好的理解H.264是什么。接下来就讲解下Flv格式下的VideoData。

在第一篇文章[FLV解析-初步认识](https://lucius0.github.io/2017/12/25/archivers/media-study-01/)我们可以知道，**Tag Header**中的Type为`0x09`时表示VideoData，而**Video Tag Data**如下图：
```js
-----------------------------------------------------------------------------------
|                    视频参数(8bit)                 |            视频数据           |
-----------------------------------------------------------------------------------
|     标识帧类型(4bit)     |    标识视频编码(4bit)     |             数据             |
------------------------------------------------------------------------------------
```
而视频参数也在之前的文章提到，在这里重温一下：
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

关于标识视频编码，我们只说AVC，也就是标识视频编码为7这个编码。
```js
let frameType = (spec & 240) >>> 4; // 标识帧类型
let codecId = spec & 15; // 标识视频编码
// 0x17 => frameType: 1; codecId: 7
```

**视频数据(VideoData)**
- codecId=2：H263VideoPacket；
- codecId=3：ScreenVideopacket；
- codecId=4，为VP6FLVVideoPacket；
- codecId=5，为VP6FLVAlphaVideoPacket；
- codecId=6，为ScreenV2VideoPacket；
- codecId=7，为AVCVideoPacket（这里我们只针对这个做分析）。

## AVCVIDEOPACKET
- AVCPacketType：1个字节。
  - 0x00：AVCSequence Header，序列头。
  - 0x01：AVC NALU
  - 0x02：AVC end ofsequence，序列结束。
- CTS(CompostionTimes)：~SI24，有符号24位整数~。如果AVCPacketType为AVC NALU， 为相对时间戳；否则为0。
	**解释：**在**Tag Header**里拿到过一个 `timestamp`，这个在视频里对应于DTS(decoder timestamps)，就是解码时间戳，而CTS实际上是一个offset，表示 PTS相对于DTS的偏移量，就是 PTS和DTS的差值。当带有B帧的Nalus流封装后，再次解码显示，此时PTS 和 DTS 不能一一对应，因为B帧的时间戳小于P帧，此时CTS 可以记录这个偏差，用以回复解码的时间戳。[ISO 14496-12 8.15.3](http://l.web.umkc.edu/lizhu/teaching/2016sp.video-communication/ref/mp4.pdf)
- Data：n个字节。为负载数据。
  - AVCPacketType=0x00：Data为AVCDecorderConfigurationRecord(在 ISO/IEC 14496-15 中定义)，即解码器配置，SPS，PPS。
  - AVCPacketType=0x01：NALUs
  - AVCPacketType=0x02：空

代码如下。
```js
let packetType = v.getUint8(0);
let cts = v.getUint32(0, !le) & 0x00FFFFFF; // 这里为什么是getUint32，在官方文档中，不是SI24吗？@1

@1: 这里在后来的v1.3.4版本作者改了，做了以下处理。
let cts_unsigned = v.getUint32(0, !le) & 0x00FFFFFF;
let cts = (cts_unsigned << 8) >> 8;  // convert to 24-bit signed int
```

**注意：** 
> FLV 文件中第一个 **Video Tag** 的**Video Data** 的**AVCVIDEOPACKET** 的 Data 总是 **AVCDecoderConfigurationRecord**，跟**Audio Tag**的 **AAC sequence header** 如出一辙，前者是VideoMeta，后者则是AudioMeta。因此第一个**Video Tag**的二进制文件你可以看到是这样的。

```js
// 示例二进制片段
0900002A 00000000 00000017 00000000 014D401F FFE10016 674D401F 
DA014016 E8400000 03004000 000C83C6 0CA80100 0468EF3C 80

// 0x17: 视频参数
// 0x00: 序列头
// 0x0000 00: CTS
// ...: Data
```

### AVCDecorderConfigurationRecord
H.264的视频信息头，包含了SPS(SequenceParameterSets)以及PPS(PictureParameterSets)，该信息为H.264的标准。下面是数据结构代码：
```c++
aligned(8) class AVCDecoderConfigurationRecord {
  // 版本号
  unsigned int(8) configurationVersion = 1;
  // SPS[1]
  unsigned int(8) AVCProfileIndication;
  // SPS[2]
  unsigned int(8) profile_compatibility;
  // SPS[3]
  unsigned int(8) AVCLevelIndication;
  bit(6) reserved = ‘111111’b;
  // H.264 视频中 NALU 的长度，计算方法是 1 + (lengthSizeMinusOne & 3)
  unsigned int(2) lengthSizeMinusOne;
  bit(3) reserved = ‘111’b;
  // SPS 的长度，计算方法是 numOfSequenceParameterSets & 0x1F
  unsigned int(5) numOfSequenceParameterSets;
  for (i = 0; i < numOfSequenceParameterSets; i++) {
    unsigned int(16) sequenceParameterSetLength;
    bit(8 * sequenceParameterSetLength) sequenceParameterSetNALUnit;
  }

  unsigned int(8) numOfPictureParameterSets;
  for (i = 0; i < numOfPictureParameterSets; i++) {
    unsigned int(16) pictureParameterSetLength;
    bit(8 * pictureParameterSetLength) pictureParameterSetNALUnit;
  }
}
```

因此上面的示例代码中的Data部分应为：

```js
// 示例二进制片段
0900002A 00000000 00000017 00000000 014D401F FFE10016 674D401F 
DA014016 E8400000 03004000 000C83C6 0CA80100 0468EF3C 80

// 0x01: configurationVersion
// 0x4D: AVCProfileIndication
//       enum profile_e { // AVCProfileIndication
//          PROFILE_BASELINE = 66,
//          PROFILE_MAIN     = 77,
//          PROFILE_HIGH    = 100,
//          PROFILE_HIGH10  = 110,
//          PROFILE_HIGH422 = 122,
//          PROFILE_HIGH444_PREDICTIVE = 244,
//      };
// 0x40: profile_compatibility
// 0x1F: AVCLevelIndication
// 用于声明H.264的level。level决定了解码器的解码能力，即最大多大的分辨率、帧率、码率。实际设置时，就是level值乘以10，例如level 1.0，设置值就是0x0A。level 3.0，设置值就是0x1E。比较例外的是level 1b，设置值是0x09

// 0xFF: 6bits(111111) reserved & lengthSizeMinusOne=4
// 0xE1: 3bits(111) reserved & numOfSequenceParameterSets=1
// 0x0016: sequenceParameterSetLength=22
// 0x674D ~ 0CA8: sequenceParameterSetNALUnit
// 0x01: numOfPictureParameterSets=1
// 0x0004: pictureParameterSetLength=4
// 0x68EF3C 80: pictureParameterSetNALUnit
```

## SPS & PPS

SPS：包含了初始化H.264解码器所需要的信息参数，包括编码所用的profile，level，视频分辨率，帧率，图像采样方式等。

PPS：一般没什么用，没有任何可以取用的视频信息。
关于SPSParser这一块，可以参考雷教主的[FFmpeg的H.264解码器源代码简单分析：解析器（Parser）](http://blog.csdn.net/leixiaohua1020/article/details/45001033)中的`ff_h264_decode_seq_parameter_set`

## AVCVideoData
由上文的，`lengthSizeMinusOne`可知，NAL包长度为4，所以前面4个字节是长度。第5个字节的前五位为NAL包的类型，如下：
- NALU_TYPE_SLICE 1
- NALU_TYPE_DPA 2
- NALU_TYPE_DPB 3
- NALU_TYPE_DPC 4
- NALU_TYPE_IDR 5
- NALU_TYPE_SEI 6
- NALU_TYPE_SPS 7
- NALU_TYPE_PPS 8
- NALU_TYPE_AUD 9 // 访问分隔符
- NALU_TYPE_EOSEQ 10
- NALU_TYPE_EOSTREAM 11
- NALU_TYPE_FILL 12
因此前面解析的时候，SPS头字节为67，`0x67 & 0x1F`为7；PPS头字节为68，`0x68 & 0x1F`为8。`0x6F & 0x1F`为5，I帧；`0x41 & 0x1F`为1，P帧。
```js
// 示例二进制片段
// Video Tag Data
17010000 0000023E 66658882 02BFF89C F12749F8 097290A6 
F881DD1A 8E65A5B4 89922C82 B31F13D4 1E6F996B DCCC7828 ...

// 0x17010000 00: 上文有介绍，Video Tag参数之类的
// 0x00023E 66: NAL length=147046
// 0x65: 0x6F & 0x1F=5，I帧
```
目前为止，flv的格式分析已经结束。

## 参考资料
- [H.264/MPEG-4 AVC - Wikipedia](https://en.wikipedia.org/wiki/H.264/MPEG-4_AVC)
- [video_file_format_spec_v10](https://www.adobe.com/content/dam/acom/en/devnet/flv/video_file_format_spec_v10.pdf)；
- [Exponential-Golomb coding – 夏天人字拖](http://guoh.org/lifelog/2013/10/exp-golomb-coding/)