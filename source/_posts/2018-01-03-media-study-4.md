---
layout: post
title:  "音视频学习-flv之AudioTag(2)"
date:   2018-01-03
categories: media
permalink: /archivers/media-study-04
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

上一篇讲解了AAC格式的音频格式，这篇就来讲解下MP3，不过现在几乎都是采取H.264 视频 + AAC音频，因为相似的码率来讲，AAC比MP3优秀（低码率下，MP3在高频段会经常发生丢失，而AAC则会有更高的高频延展），MP3的压缩率10：1 - 12：1，而AAC的压缩率18：1 - 20：1。**MP3 文件的最小组成单位是帧。**

## MP3

mp3的**Audio Tag Body**的分析跟aac一样，这里无需多讲。mp3的文件结构图如下：
```
---------------
|  ID3V2 Tag  |
---------------
|  MP3 Header | \
---------------   帧结构(Frame)
|  MP3 Data   | /
---------------
|  ......     |
---------------
|  MP3 Header |
---------------
|  MP3 Data   |
---------------
|  ID3V1 Tag  |
---------------
```
因此要从**ID3V2 Tag**，**Frame**，**ID3V1 Tag**这三方面入手。但是因为**ID3V2**经历了4个版本，而现代浏览器大多支持第3版，所以**ID3V2**一般指**ID3V2.3**。其中**ID3V2**是**ID3V1**的补充，并不是所有的MP3都有**ID3V2**补充，所以不是所有的MP3文件都有**ID3V2**。

示例片段：
```js
49443303 0000000C 462C5453 53450000 000D0000 004C6176 6635362E 
342E3130 3154504F 53000000 05000001 FFFE3100 5452434B 00000007 
000001FF FE320030 00415049 4300031E C5000000 696D6167 652F6A70 
67000000 FFD8FFE0 00104A46 49460001 01010048 00480000 FFDB0043 
00020101 01010102 01010102 02020202 04030202 02020504 04030406 
05060606 05060606 07090806 07090706 06080B08 090A0A0A 0A0A0608 
0B0C0B0A 0C090A0A 0AFFDB00 43010202 02020202 05030305 0A070607 
0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 
0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0A0A0A 0A0AFFC0 00110802 
80028003 01110002 11010311 01FFC400 1E000000 07010101 01000000 
00000000 00000304 05060708 09020100 0AFFC400 4B100002 01020502 
```

### ID3V2 Tag
ID3V2是变长标签，这也给了它很好的扩展性，包含了作者，作曲，专辑等信息，扩展了ID3V1的信息量。大端序排序。

**标签头(10bytes)**
- 标识：3个字节。头部信息，必须为‘ID3’，否则认为标签不存在，十六进制为`494433`。
- 版本号：1个字节。
- 副版本号：1个字节。
- 标志：1个字节。标志，如abc0 0000。
	- a：非同步编码
	- b：扩展标签头（该例子为0，所以没有下面的扩展标签头）
	- c：测试指示为
- 大小：4个字节。长度(包含标签帧)，格式如`0xxxxxxx 0xxxxxxx 0xxxxxxx 0xxxxxxx`。所以size的计算方式：
```js
// 000C462C
total_size = 
    // (0x00 & 0x7F) * 0x200000 = 0
    (Size[0] & 0x7F) * 0x200000 
    // (0x0C & 0x7F) * 0x4000 = 0x30000
　　+(Size[1] & 0x7F) * 0x4000 
    // (0x46 & 0x7F) * 0x80 = 0x2300
　　+(Size[2] & 0x7F) * 0x80 
    // (0x2C & 0x7F) = 0x2C
　　+(Size[3] & 0x7F)
// 0x3232C = 205612
```

**扩展标签头(10bytes)**
- 大小：4个字节。size = byte0 * 0x200000 + byte1 * 0x4000 + byte2 * 0x80 + byte3
- 标志：2个字节。
- 补空大小	：4个字节。你可以在所有的标签帧后面添加补空数据，也可以预留空间存放额外的帧，使得整个标签大小比标签头中的大小要更大，这里记录的就是增加的大小，一般不用。

**标签帧**
- 帧标识：4个字节
    - TIT2=标题 表示内容为这首歌的标题，下同
    - TPE1=作者
    - TALB=专集
    - TRCK=音轨 格式：N/M 其中N为专集中的第N首，M为专集中共M首，N和M为ASCII码表示的数字
    - TYER=年代 是用ASCII码表示的数字
    - TCON=类型 直接用字符串表示
    - COMM=备注 格式："eng\0备注内容"，其中eng表示备注所使用的自然语言
例子片段1为：`5453 5345 // TSSE`；
例子片段2为：`5450 4F53 // TPOS`。
……

- 帧大小：4个字节。
```js
size = size[0] * 0x1000000 + 
    size[1] * 0x10000 + 
    size[2] * 0x100 + 
    size[3]; // 0x0D = 13
```
- 标志：2个字节。如：abc00000ijk00000
	- a：标签保护标志，设置时认为此帧作废
	- b：文件保护标志，设置时认为此帧作废
	- c：只读标志，设置时认为此帧不能修改(但我没有找到一个软件理会这个标志)
	- i：压缩标志，设置时一个字节存放两个BCD 码表示数字
	- j：加密标志(没有见过哪个MP3 文件的标签用了加密)
	- k：组标志，设置时说明此帧和其他的某帧是一组
- 帧数据：帧大小size个字节。(例子片段为：`004C6176 6635362E 342E3130 31`)

### ID3V1 Tag
包含了作者，作曲，专辑等信息，固定长度为128bytes。
- Header：3bytes，为’TAG’
- Title：30bytes
- Artist：30bytes
- Album：30bytes
- Year：4bytes
- Comment：28bytes
- Reserve：1byte，保留
- Track：1byte
- Genre：1byte

### Frame
每个帧都是独立的，它由帧头、附加信息和声音数据组成，其长度随位率的不同而不等，通常每个帧的播放时间为26ms秒，且音频长度为：
```
Length(MAIN_DATA) = ((version == MPEG1) ? 144 : 72) * bitrate / frequency + padding;
```
MP3帧结构如下：
```
-------------------------
| 帧 |    帧头(4bytes)   |
|    | ------------------
| 结 |  CRC,可选(2bytes) |
|    | ------------------
| 构 |      音频数据     |
-------------------------
```
所以帧头（AAAAAAAA  AAABBCCD  EEEEFFGH  IIJJKLMM ）结构如下：
sync：11位。帧同步数据，可以通过查找同步位来确定帧的起始位置，通常情况下全部被设置为1
- version：2位。MPEG音频版本号
	- 00：MPEG 2.5，非官方版本
	- 01：保留
	- 10：MPEG 2
	- 11：MPEG 1
- layer：2位。层
	- 00：保留
	- 01：Layer 3
	- 10：Layer 2
	- 11：Layer 1
- errorProtection：1位。CRC校验位。0则会有2个字节的CRC校验位；1则无
- bitRateIndex：4位。比特率索引值，单位kbps。
![](http://ouazw12mz.bkt.clouddn.com/180103001123.png?imageslim)
- sampleRateIndex：2位。采样率索引，单位Hz。
![](http://ouazw12mz.bkt.clouddn.com/180103001206.png?imageslim)
- padding：1位。补充位。0表示无填充，1则有填充。对于Layer 1，填充位长度为4个字节；Layer2 和Layer3 的填充位长度则有1个字节。
- extension：1位。私有标志位。
- channelMode：2位。声道模式。
	- 00：立体声
	- 01：联合立体声
	- 10：双声道
	- 11：单声道
- modeExtension：2位。模式的扩展，只有声道为联合立体声时才有意义。
- copyright：1位。版权标志。
- original：1位。原版标志。
- emphasis：强调方式。

## 关于flv.js
我在第一篇的时候说过，flv是音频格式只有aac，而f4v的音频格式才有了支持aac跟mp3。然后我在[video_file_format_spec](http://download.macromedia.com/f4v/video_file_format_spec_v10_1.pdf)却没有找到关于mp3的解析，反而通过了分析工具才获知假如音频为mp3，则是不需要解析ID3那部分的，直接解析**Frame**这一部分。所以flv.js代码片段为，而这部分的解释参考上面**Frame**部分：
```js
if (array[0] !== 0xFF) {
	return;
}
let ver = (array[1] >>> 3) & 0x03;
let layer = (array[1] & 0x06) >> 1;
let bitrate_index = (array[2] & 0xF0) >>> 4;
let sampling_freq_index = (array[2] & 0x0C) >>> 2;
let channel_mode = (array[3] >>> 6) & 0x03;
let channel_count = channel_mode !== 3 ? 2 : 1;
let sample_rate = 0;
let bit_rate = 0;
let object_type = 34;  // Layer-3, listed in MPEG-4 Audio Object Types
let codec = 'mp3';

switch(ver) {
	sample_rate = this._mpegAudioV25SampleRateTable[sampling_freq_index];
}

switch(layer) {
	bit_rate = this._mpegAudioL3BitRateTable[bitrate_index];
}
```

## 参考资料
- [ID3_技术百科](http://wiki.gimoo.net/view/10352.html)
- [分析ID3格式 - CSDN博客](http://blog.csdn.net/u014294166/article/details/53153507)
- [MP3文件格式全解 - YellowMax        - CSDN博客](http://blog.csdn.net/u013904227/article/details/52184038)