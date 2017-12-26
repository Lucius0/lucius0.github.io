---
layout: post
title:  "音视频学习-flv之ScriptTag"
date:   2017-12-26
categories: media
permalink: /archivers/media-study-02
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

## 解析FLV-Header(9bytes)

在[上一篇](https://lucius0.github.io/2017/12/25/archivers/media-study-01/)中我们得知，FLV-Header其实很好解析，无非就是读出前面的9个字节。
```js
const data = new Uint8Array(buffer);// buffer为读取的二进制缓冲区
data[0]; // 0x46
data[1]; // 0x4C
data[2]; // 0x56
data[3]; // 0x01
// 以上四个字节就是前文提到的，分别代表类型标志符'F','L','V'及版本号0x01

data[4]; // 0x05表示音视频tag都有，0x04表示只有音频tag，0x01表示只有视频tag
// hasAudio = (data[4] & 0x04 === 4)
// hasVideo = (data[4] & 0x01 === 1)

data.slice(5, 5 + 4); // 0x09，四个字节，HeaderSize
```

## 解析FLV-Body
### Previous Tag Size #0
因为第一个`Previous Tag Size`基本上都是固定的，占用4个字节，可以略过的了。关于大端小端：[网络序？本地序？傻傻分不清楚](http://imweb.io/topic/57fe263b2a25000c315a3d8a)，而flv是采取大端序的。
```js
let v = new DataView(chunk, offset);
let prevTagSize0 = v.getUint32(0, !le); // 4个字节，并且以大端读取
// v.getUint32(0, false); // 也是表示以大端读取
```

### Tag # 1( ScriptTag )
**Tag Header(11bytes)**
```js
// 11bytes
let tagType = v.getUint8(0); // 从第1个字节读取一个8位无符号整数
let dataSize = v.getUint32(0, !le) & 0x00FFFFFF; // 大端读取，截取3个字节
// 获取 timestamp
let ts2 = v.getUint8(4);
let ts1 = v.getUint8(5);
let ts0 = v.getUint8(6);
let ts3 = v.getUint8(7);
let timestamp = ts0 | (ts1 << 8) | (ts2 << 16) | (ts3 << 24);
// 获取streamId
let streamId = v.getUint32(7, !le) & 0x00FFFFFF;
```

**Tag Body**
```js
// 上面的字节总共为11个字节，所以offset + 11，应该为24
let dataOffset = offset + 11;
```
根据上一篇的结构图，这里就是ScriptTag的Tag Data中的key，关于[AMF](https://en.wikipedia.org/wiki/Action_Message_Format)
```js
// AMFParser
let name = AMF.parseValue(arrayBuffer, dataOffset, dataSize);
------------------------ parseValue ------------------------
// 由上一篇知道，第1个字节type为AMF String类型，0x02
let offset = 1; 
let type = v.getUint8(0);
let value;
let amfstr = AMF.parseString(arrayBuffer, dataOffset + 1, dataSize - 1); // 除去type长度
value = amfstr.data;
offset += amfstr.size;
------------------------ parseString ------------------------
let v = new DataView(arrayBuffer, dataOffset, dataSize);
// 长度占据2个字节，0x0000A
// 大于且包括两个字节一般都需要指定存储方式
let length = v.getUint16(0, !le); 
// 读取key值，第一个为onMetaData。
str = decodeUTF8(new Uint8Array(arrayBuffer, dataOffset + 2, length)); 
```
ScriptTag的Tag Data中的value。
```js
let value = AMF.parseValue(arrayBuffer, dataOffset + name.size, dataSize - name.size);
------------------------ parseValue ------------------------
let offset = 1; 
let value = {};
let type = v.getUint8(0); // 0x08，ECMA array
offset += 4;  // ECMAArrayLength(UI32)
let terminal = 0;  // workaround for malformed MixedArrays which has missing ScriptDataObjectEnd（作者已经说明了，这一块是为了解决有些混合数组缺失ScriptDataObjectEnd数据，因此在下面对terminal以及offset作了兼容处理)
// 上一篇已经说了，最后的3个字节固定值0x000009表示value值结束
if ((v.getUint32(dataSize - 4, !le) & 0x00FFFFFF) === 9) {
    terminal = 3;
}
// 8 === type(UI8) + ECMAArrayLength(UI32) + ScriptDataVariableEnd(UI24)
while (offset < dataSize - 8) {  
    let amfvar = AMF.parseVariable(arrayBuffer, dataOffset + offset, dataSize - offset - terminal);
    if (amfvar.objectEnd) break;
    value[amfvar.data.name] = amfvar.data.value;
    offset += amfvar.size;
}
```


后面即为各元素的封装，为一一对应的键值对，常见的MetaData如下：
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

最后用3个字节的固定值0000 09表示value值结束。