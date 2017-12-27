---
layout: post
title:  "音视频学习-flv之AudioTag(1)"
date:   2017-12-27
categories: media
permalink: /archivers/media-study-03
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

在第一篇[flv初认识](https://lucius0.github.io/2017/12/25/archivers/media-study-01/)，我们可以知道，解析**Tag Header**的其实无论是ScriptTag，AudioTag，还是VideoTag，实际上的规范都是一样的，都是11个字节的**Tag Header**，唯一区分类型的就是。
```js
let tagType = v.getUint8(0); // 0x08表示音频Tag
```
**Audio Tag Body**
```js
let soundSpec = v.getUint8(0); // 第1个字节，音频参数格式
let soundFormat = soundSpec >>> 4; // 前4位，标识音频数据的格式，这里只对AAC跟MP3做处理。
let soundRateIndex = (soundSpec & 12) >>> 2; // 5、6位，音频采样率，flv
if (soundRateIndex >= 0 && soundRateIndex <= 4) {
    soundRate = [5500, 11025, 22050, 44100, 48000][soundRateIndex];
}
let soundSize = (soundSpec & 2) >>> 1; // 第7位，采样精度
let soundType = (soundSpec & 1); // 第8位，音频类型
```

这里我产生疑问了。flv不是只支持5500, 11025, 22050, 44100的采样率吗？为什么作者还多加了一个48000？ 这里可以查到采样率的信息[video_file_format_spec_v10](https://www.adobe.com/content/dam/acom/en/devnet/flv/video_file_format_spec_v10.pdf)，@1。有知道的胖友麻烦告知一下，谢谢。
![](http://ouazw12mz.bkt.clouddn.com/171227220536.png?imageslim)

## AAC

> AAC是高级音频编码（Advanced Audio Coding）的缩写，出现于1997年，最初是基于MPEG-2的音频编码技术。由Fraunhofer IIS、Dolby Laboratories、AT&T、Sony等公司共同开发，目的是取代MP3格式。2000年，MPEG-4标准出台，AAC重新集成了其它技术（PS,SBR），为区别于传统的MPEG-2 AAC(MPEG-2 Part7)，故含有SBR或PS特性的AAC又称为MPEG-4 AAC(MPEG-4 Part3)。
> AAC是新一代的音频有损压缩技术，它通过一些附加的编码技术（比如PS,SBR等），衍生出了LC-AAC,HE-AAC,HE-AACv2三种主要的编码，LC-AAC就是比较传统的AAC。

AAC即为上文提到的`soundFormat`为0xA的音频格式，而AACAudioData是在Flash Player 9以上支持的。
![](http://ouazw12mz.bkt.clouddn.com/171227220925.png?imageslim)
代码如下：
```js
// 减去 soundSpec
parseAACAudioData(arrayBuffer, dataOffset + 1, dataSize - 1); 
// 0: AAC sequence header
// 1: AAC raw
// 一般Sequence Header为第一个Audio Tag，并且全文件只出现一次
result.packetType = array[0];
// 这里只针对了AAC sequence header作了处理，而AAC raw则就是Audio payload。dataOffset+1，跳过了上文提到的AACPacketType，1个字节
// ADTS
parseAACAudioSpecificConfig(arrayBuffer, dataOffset + 1, dataSize - 1); 
```

**AAC sequence header**包含了AudioSpecificConfig，有更详细音频的信息，但这种包只出现一次，而且是第一个Audio Tag，因为后面的音频ES流需要该header的ADST(Audio Data Transport Stream)头。**AAC raw**则包含音频ES流了，也就是audio payload，也就是说ADTS头可以看成AAC的frameheader。[【多媒体封装格式详解】— AAC ADTS格式分析](http://blog.csdn.net/tx3344/article/details/7414543)
```
--------------------------------------------------------------
|                         ADTS AAC                           |
--------------------------------------------------------------
| ADTS_header	| AAC ES |     ...    | ADTS_header | AAC ES |
--------------------------------------------------------------
```

关于Audio Specific Config，可以看[ISO 14496-3](http://read.pudn.com/downloads98/doc/comm/401153/14496/ISO_IEC_14496-3%20Part%203%20Audio/C036083E_SUB1.PDF)，也可以在ffmpeg中找到对应的解析函数，`ff_mpeg4audio_get_config()`
![](http://ouazw12mz.bkt.clouddn.com/171227221451.png?imageslim)
Audio Object Types和Sampling Frequency Index在[MPEG-4_Audio](https://wiki.multimedia.cx/index.php?title=MPEG-4_Audio)文章中有详细描述。

### Audio Object Types
- 0: Null
- 1: AAC Main
- 2: AAC LC (Low Complexity)
- 3: AAC SSR (Scalable Sample Rate)
- 4: AAC LTP (Long Term Prediction)
- 5: HE-AAC / AAC SBR (Spectral Band Replication)
- 6: AAC Scalable
- 7: TwinVQ
- …

### Sampling Frequency Index
- 0: 96000 Hz
- 1: 88200 Hz
- 2: 64000 Hz
- 3: 48000 Hz
- 4: 44100 Hz
- 5: 32000 Hz
- 6: 24000 Hz
- 7: 22050 Hz
- 8: 16000 Hz
- 9: 12000 Hz
- 10: 11025 Hz
- 11: 8000 Hz
- 12: 7350 Hz
- 13: Reserved
- 14: Reserved
- 15: frequency is written explicitly

### Channel Configurations
- 0: Defined in AOT Specifc Config	
- 1: 1 channel: front-center
- 2: 2 channels: front-left, front-right
- 3: 3 channels: front-center, front-left, front-right
- 4: 4 channels: front-center, front-left, front-right, back-center
- 5: 5 channels: front-center, front-left, front-right, back-left, back-right
- 6: 6 channels: front-center, front-left, front-right, back-left, back-right, LFE-channel
- 7: 8 channels: front-center, front-left, front-right, side-left, side-right, back-left, back-right, LFE-channel
- 8-15: Reserved

伪代码为：
```js
5 bits: object type
4 bits: frequency index
if (frequency index == 15)
    24 bits: frequency
4 bits: channel configuration
1 bit: frame length flag
1 bit: dependsOnCoreCoder
1 bit: extensionFlag

5 bits: 2 (00010) // Audio Object Type - AAC LC
4 bits: 4 (0100)  // Sampling Frequency Index - 44kHz
4 bits: 2 (0010)  // Channel - left，right
3 bits: 0 (000)   // Reserved

Byte 1: 00010010
Byte 2: 00010000

// 2 bytes
00010|010 0|0010|000
 [2]   [4]   [2] [0]
```

现在我们再来看看flv.js对于这一块的处理。
```js
// 5 bits Audio Object Type
audioObjectType = originalAudioObjectType = array[0] >>> 3;
// 4 bits Sampling Frequency Index
samplingIndex = ((array[0] & 0x07) << 1) | (array[1] >>> 7);
// 4 bits Channel Config
channelConfig = (array[1] & 0x78) >>> 3;
```

针对各设备的兼容性处理，`audioObjectType`的处理可以参考这里[Media MIME Support](https://cconcolato.github.io/media-mime-support/)。
```js
// firefox - firefox: freq less than 24kHz = AAC SBR (HE-AAC)
// Android: always use AAC
// for other browsers (Chrome/Vivaldi/Opera ...): always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
```

而`extensionSamplingIndex`，这里其实我也很迷糊为什么要这么处理，精力有限也没有深入去找资料了，有知道的朋友请教一下。谢谢了。唯一清楚找到的是在hlsjs中也有相关的代码，作者这一块是参考hlsjs的。 @2

```js
// 音频帧采样时间要跟采样率有关的值一致。否则，浏览器将强制调整播放时间戳以使音频无缝播放，这可能导致A / V异步。
meta.refSampleDuration = 1024 / meta.audioSampleRate * meta.timescale
```
可以参考下图：
![](http://ouazw12mz.bkt.clouddn.com/171227222007.png?imageslim)

## 参考资料
- [video_file_format_spec_v10](https://www.adobe.com/content/dam/acom/en/devnet/flv/video_file_format_spec_v10.pdf)
- [AAC Audio Data](https://xiaozhuanlan.com/topic/6253091478)
- [Understanding_AAC](https://wiki.multimedia.cx/index.php/Understanding_AAC)
- [MPEG-4_Audio](https://wiki.multimedia.cx/index.php?title=MPEG-4_Audio)
- [高级音频编码 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E9%80%B2%E9%9A%8E%E9%9F%B3%E8%A8%8A%E7%B7%A8%E7%A2%BC)
- [html - What are the limitations of HTML5 audio on Android and iOS? - Stack Overflow](https://stackoverflow.com/questions/18603605/what-are-the-limitations-of-html5-audio-on-android-and-ios)