---
layout: post
title:  "音视频学习-FMP4结构之MP4"
date:   2018-01-14
categories: media
permalink: /archivers/media-study-07
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

## 概述

MP4(MPEG-4 Part 14)是一种常见的多媒体容器格式，它是在“ISO/IEC 14496-14”标准文件中定义的，属于MPEG-4的一部分，是“ISO/IEC 14496-12(MPEG-4 Part 12 ISO base media file format)”标准中所定义的媒体格式的一种实现，后者定义了一种通用的媒体文件结构标准。MP4是一种描述较为全面的容器格式，被认为可以在其中嵌入任何形式的数据，各种编码的视频、音频等都不在话下，不过我们常见的大部分的MP4文件存放的AVC(H.264)或MPEG-4(Part 2)编码的视频和AAC编码的音频。MP4格式的官方文件后缀名是“.mp4”，还有其他的以mp4为基础进行的扩展或者是缩水版本的格式，包括：M4V,  3GP, F4V等。

在HTML5播放器中，目前仅支持**WebM**和**MPEG H.264 AAC**的编码格式，而WebM的在浏览器的支持度没有mp4的支持度好。而fmp4区别于mp4，主要是因为可以通过fmp4的`moof+mdat`的格式结构，很好的在不同质量的码流做码率切换。

MP4是由一个个的Box组成的，也就是可以说Box是MP4的最小单元。官方文档可以查看：[ISO_IEC_14496-12](http://l.web.umkc.edu/lizhu/teaching/2016sp.video-communication/ref/mp4.pdf)。而Box的类型有太多太多了，可以自行查看文档中的**Table 1 — Box types, structure, and cross-reference**部分，这里我就不贴出来了。

## BOX
以下是fmp4跟mp4的结构图，可以很清楚的看到两者的区别。
![](/images/qiniu/180114225134.png)

从官方文档看，可以知道，除了Box，还有一种Full Box。Box的结构图如下：
![](/images/qiniu/180114225303.png)

Box的官方示例代码如下：
```c++
// Box
// Box只会给Header(size、type)
aligned(8) class Box (unsigned int(32) boxtype, optional unsigned int(8)[16] extended_type) {
   // Box大小，包括Header，所以上面的ftyp中size为8+24
   unsigned int(32) size;
   // ftyp，就是type，一般都是4个字母，所以通过charCodeAt获取即可。
   // flv.js中的代码片段实现如下。
   // MP4.types[name] = [
   //   name.charCodeAt(0),
   //   name.charCodeAt(1),
   //   name.charCodeAt(2),
   //   name.charCodeAt(3)
   // ];
   unsigned int(32) type = boxtype;
   if (size==1) {
      unsigned int(64) largesize;
   } else if (size==0) {
      // box extends to end of file
   }
  // 用户扩展使用扩展类型，在这种情况下，类型字段设置为“uuid”，不过几乎没遇过
  if (boxtype==‘uuid’) {
    unsigned int(8)[16] usertype = extended_type;
  } 
}

// FullBox，增加了version以及flags，不难理解，是Box的扩展。FullBox是没有子box的。
aligned(8) class FullBox(unsigned int(32) boxtype, unsigned int(8) v, bit(24) f) extends Box(boxtype) {
  unsigned int(8) version = v; //
  bit(24) flags = f;
}
```

在`mp4-generator.js`中，生成box的代码如下：
```js
// Generate a box
static box(type) {
  let size = 8;
  let result = null;
  let datas = Array.prototype.slice.call(arguments, 1);
  let arrayCount = datas.length;

  for (let i = 0; i < arrayCount; i++) {
    size += datas[i].byteLength;
  }

  result = new Uint8Array(size);
  result[0] = (size >>> 24) & 0xFF;  // size
  result[1] = (size >>> 16) & 0xFF;
  result[2] = (size >>>  8) & 0xFF;
  result[3] = (size) & 0xFF;

  result.set(type, 4);  // type

  let offset = 8;
  for (let i = 0; i < arrayCount; i++) {  // data body
    result.set(datas[i], offset);
    offset += datas[i].byteLength;
  }

  return result;
}

// 生成 ftyp box
let ftyp = MP4.box(MP4.types.ftyp, MP4.constants.FTYP);
```

## FTYP
File Type Box
```c++
// 官方文档代码
aligned(8) class FileTypeBox extends Box(‘ftyp’) {
  // 主要推荐版本
  unsigned int(32) major_brand;
  // 最低兼容版本
  unsigned int(32) minor_version;
  // 兼容版本
  unsigned int(32) compatible_brands[]; // to end of the box
}

// 示例格式
[ftyp] size=8+16
  major_brand = qt  
  minor_version = 0
  compatible_brand = qt  
  compatible_brand = iso5
```

## MOOV
Movie Box，继承box，那么就可以知道有4个字节，这4个字节是子box的长度。可以在上图看到，moov主要是为了存放trak、mvhd，fmp4还会存放mvex box。
```js
// 官方文档代码
aligned(8) class MovieBox extends Box(‘moov’){ }
```

### MOOV::MVHD
Movie Header Box，该box有且只有一个，主要是记录整个容器的各种信息。
```c++
// 官方文档代码
aligned(8) class MovieHeaderBox extends FullBox(‘mvhd’, version, 0) { 
  // MVHD 的版本号，默认 0
  if (version==1) {
      unsigned int(64)  creation_time;
      unsigned int(64)  modification_time;
      unsigned int(32)  timescale;
      unsigned int(64)  duration;
  } else { // version==0
    // 创建时间，从1904开始，整数，单位s
    unsigned int(32)  creation_time;
    // 最近修改时间，同样从1904开始，整数，单位s
    unsigned int(32)  modification_time;
    // 文件媒体在 1s 时间内的刻度值，可以理解为 1s 长度的时间单元数，一般情况下视频都是1000
    unsigned int(32)  timescale;
    // 持续时间，一般来说电影时间 = duration / timescale
    unsigned int(32)  duration;
  }
// 播放速率，一般为 1，高16和低16分别表示小数点前后整数部分和小数部分
template int(32) rate = 0x00010000; // typically 1.0
// 音量，最大为100，高8位和低8位分别表示小数点前后整数和小数部分
template int(16) volume = 0x0100; // typically, full volume
// 保留字
const bit(16) reserved = 0; 
const unsigned int(32)[2] reserved = 0;
// 视频变化矩阵 Unity matrix
template int(32)[9] matrix = { 
  0x00010000,0,0,
  0,0x00010000,0,
  0,0,0x40000000
};
bit(32)[6]  pre_defined = 0;
// 下一个 track 使用的id 号
unsigned int(32)  next_track_ID;
}

// 示例格式
[mvhd] size=12+96
  timescale = 1000
  duration = 51952
  duration(ms) = 51952
```

### MOOV::TRAK
Track Box，主要是存一个或多个media box的。
```c++
aligned(8) class TrackBox extends Box(‘trak’) { }
```

### MOOV::TRAK::TKHD
Track Header Box，trak box 的第一个box，主要是记录以下信息（一开始我还以为与上面的冲突了）。
```c++
// 官方文档代码
aligned(8) class TrackHeaderBox extends FullBox(‘tkhd’, version, flags) {
  if (version==1) {
    unsigned int(64) creation_time;
    unsigned int(64) modification_time;
    unsigned int(32) track_ID;
    const unsigned int(32) reserved = 0;
    unsigned int(64) duration;
  } else { // version==0
    unsigned int(32) creation_time;
    unsigned int(32) modification_time;
    unsigned int(32) track_ID; // 当前track的ID
    const unsigned int(32) reserved = 0;
    unsigned int(32) duration;
  }
  const unsigned int(32)[2] reserved = 0;
  // 视频track的前后排序，类似photoshop中图层的概念，数值小的在播放时更贴近用户，0为默认值
  template int(16) layer = 0; 
  // 备用分组ID，0表示无备用。否则该 track 可能会有零到多个备份track。当播放时相同group ID的track只选择一个进行播放。
  template int(16) alternate_group = 0;
  // 音量
  template int(16) volume = {if track_is_audio 0x0100 else 0};
  const unsigned int(16) reserved = 0;
  template int(32)[9] matrix={ 
    0x00010000,0,0,
    0,0x00010000,0,
    0,0,0x40000000 
  };
  // unity matrix
  unsigned int(32) width;  // 宽
  unsigned int(32) height; // 高
}

// 示例格式
[tkhd] size=12+80, flags=7
  enabled = 1
  id = 1
  duration = 51952
  width = 856.000000
  height = 720.000000
```

### MOOV::TRAK::EDTS
Edit Box，不是必要的，主要是将时间线映射到media时间线上，是Edit List Box的容器。
```c++
// 官方文档代码
aligned(8) class EditBox extends Box(‘edts’) { }
```

### MOOV::TRAK::EDTS::ELST
Edit List Box，不是必要的，主要是保存切确的时间表，使得某个track的时间戳产生偏移，能达到延迟播放的作用。[mp4文件elst研究](http://blog.jianchihu.net/mp4-elst-box.html)
```c++
// 官方文档代码
aligned(8) class EditListBox extends FullBox(‘elst’, version, 0) { 
  unsigned int(32) entry_count;
  for (i=1; i <= entry_count; i++) {
    if (version==1) {
       unsigned int(64) segment_duration;
       int(64) media_time;
    } else { // version==0
       // 表该box的时长，以Movie Header Box中的timescale为单位。
       unsigned int(32) segment_duration;
       // 该box的起始时间，以 track 中Media Header Box中的timescale 为单位。如果值为-1，表示是空edit box，一个 track 中最后一个 edit 不能为空。
       int(32)  media_time;
    }
    // 速率。为0的话，相当于'dwell'，即画面停止。
    int(16) media_rate_integer;
    int(16) media_rate_fraction = 0;
  } 
}
```

### MOOV::TRAK::MDIA
Media Box，保存媒体信息的容器。
```c++
// 官方文档代码
aligned(8) class MediaBox extends Box(‘mdia’) { } 
```

### MOOV::TRAK::MDIA::MDHD
Media Header Box，存放媒体信息。
```c++
// 官方文档代码
aligned(8) class MediaHeaderBox extends FullBox(‘mdhd’, version, 0) { 
  if (version==1) {
      unsigned int(64)  creation_time;
      unsigned int(64)  modification_time;
      unsigned int(32)  timescale;
      unsigned int(64)  duration;
   } else { // version==0
      unsigned int(32)  creation_time;
      unsigned int(32)  modification_time;
      unsigned int(32)  timescale;
      unsigned int(32)  duration;
}
  bit(1) pad = 0;
  unsigned int(5)[3] language; // ISO-639-2/T language code
  unsigned int(16) pre_defined = 0;
}

// 示例格式
[mdia] size=8+415
  [mdhd] size=12+20
    timescale = 600
    duration = 0
    duration(ms) = 0
    language = und
```

### MOOV::TRAK::MDIA::HDLR
Handler Reference Box，主要是用来跟踪中媒体数据被呈现的过程。例如，video track将由video handler box处理。
```c++
// 官方文档代码
aligned(8) class HandlerBox extends FullBox(‘hdlr’, version = 0, 0) { 
  unsigned int(32) pre_defined = 0;
  // hanler type有以下几种格式：
  // ‘vide’ Video track
  // ‘soun’ Audio track
  // ‘hint’ Hint track
  // ‘meta’ Timed Metadata track
  // ‘auxv’ Auxiliary Video track
  unsigned int(32) handler_type;
  const unsigned int(32)[3] reserved = 0;
  string name;
}

// 示例格式
[hdlr] size=12+41
  handler_type = vide
  handler_name = Bento4 Video Handler
```

### MOOV::TRAK::MDIA::MINF
Media Information Box。
```c++
aligned(8) class MediaInformationBox extends Box(‘minf’) { }
```

### MOOV::TRAK::MDIA::VMHD/SMHD/HMHD/NMHD
Media Information Header Boxes。每种音轨类型都有不同的媒体信息头（对应media handler-type）; 匹配的头文件应该存在，可以是这里定义的头文件之一，或者派生的规范中定义的头文件之一。
```c++
// 官方文档代码
aligned(8) class VideoMediaHeaderBox
extends FullBox(‘vmhd’, version = 0, 1) {
  template unsigned int(16) graphicsmode = 0; // copy, see below 
  template unsigned int(16)[3] opcolor = {0, 0, 0};
}

aligned(8) class SoundMediaHeaderBox
   extends FullBox(‘smhd’, version = 0, 0) {
   template int(16) balance = 0;
   const unsigned int(16)  reserved = 0;
}

// 示例格式
[vmhd] size=12+8, flags=1
  graphics_mode = 0
  op_color = 0000,0000,0000
```

### MOOV::TRAK::MDIA::MINF::DINF
Data Information Box。
```c++
// 官方文档代码
aligned(8) class DataInformationBox extends Box(‘dinf’) { }
```

### MOOV::TRAK::MDIA::MINF::DINF::DREF
Data Reference Box。有三种子box类型，‘url ‘, ‘urn ‘, ‘dref’。
```c++
// 官方文档代码
aligned(8) class DataReferenceBox
   extends FullBox(‘dref’, version = 0, 0) {
   unsigned int(32)  entry_count;
   for (i=1; i <= entry_count; i++) {
    // URL box / URN box
    // entry_version：声明entry box格式的版本
    // entry_flags：标识，其中0x000001表示media box与包含此数据的引用的media box(moof)相同。
    DataEntryBox(entry_version, entry_flags) data_entry; 
   }
}

// 示例格式
[dinf] size=8+28
  [dref] size=12+16
    [url] size=12+0, flags=1
      location = [local to file]
```

### MOOV::TRAK::MDIA::MINF::DINF::DREF::URL/URN
```c++
// 官方文档代码
aligned(8) class DataEntryUrlBox (bit(24) flags) extends FullBox(‘url ’, version = 0, flags) { 
  string location;
}
aligned(8) class DataEntryUrnBox (bit(24) flags) extends FullBox(‘urn ’, version = 0, flags) { 
  string name;
  string location;
}
```

### MOOV::TRAK::MDIA::MINF::STBL
Sample Table Box。由图可以看出，是作为一个容器存在。
```c++
aligned(8) class SampleTableBox extends Box(‘stbl’) { }
```

### MOOV::TRAK::MDIA::MINF::STBL::STSD
Sample Description Box。 box header和version字段后会有一个entry count字段，根据entry的个数，每个entry会有type信息，如“vide”、“sund”等，根据type不同sample description会提供不同的信息，例如对于video track，会有“VisualSampleEntry”类型信息，对于audio track会有“AudioSampleEntry”类型信息。
视频的编码类型、宽高、长度，音频的声道、采样等信息都会出现在这个box中。
```c++
// 官方文档代码
aligned(8) class SampleDescriptionBox (unsigned int(32) handler_type) extends FullBox('stsd', 0, 0) {
  int i ;
  unsigned int(32) entry_count;
  for (i = 1 ; i <= entry_count ; i++) {
    switch (handler_type) {
      case ‘soun’: // for audio tracks
        AudioSampleEntry();
      break;
      case ‘vide’: // for video tracks
        VisualSampleEntry();
      break;
      case ‘hint’: // Hint track
              HintSampleEntry();
            break;
          case ‘meta’: // Metadata track
              MetadataSampleEntry();
              break;
       } 
  }
}

// 示例格式
[stbl] size=8+258
  [stsd] size=12+178
    entry-count = 1
    [avc1] size=8+166
      data_reference_index = 1
      width = 856
      height = 720
      compressor = H.264
      [avcC] size=8+46
        Configuration Version = 1
        Profile = Main
        Profile Compatibility = 0
        Level = 31
        NALU Length Size = 4
        Sequence Parameter = [27 4d 00 1f 89 8b 60 6c 0b 7c be 02 d4 04 04 04 c0 c0 01 77 00 00 5d c1 7b df 07 c2 21 1b 80]
        Picture Parameter = [28 ee 1f 20]
      [colr] size=8+10
      [pasp] size=8+8
```

### MOOV::TRAK::MDIA::MINF::STBL::STTS
Decoding Time to Sample Box。存储了sample的duration，描述了sample时序的映射方法，我们通过它可以找到任何时间的sample。“stts”可以包含一个压缩的表来映射时间和sample序号，用其他的表来提供每个sample的长度和指针。表中每个条目提供了在同一个时间偏移量里面连续的sample序号，以及samples的偏移量。递增这些偏移量，就可以建立一个完整的time to sample表。
每个sample的显示时间可以通过如下的公式得到：
```js
D(n+1) = D(n) + STTS(n)
```
其中，STTS(n)是sample n的时间间隔，包含在表格中；D(n)是sample n的显示时间。
![](/images/qiniu/180114231843.png)
因此有DT(2) = DT(1) + STTS(1)，其中STTS就是Decode delta(1)=10。那么sample_count跟sample_delta的关系就是如下表：
![](/images/qiniu/180114231904.png)
那么entry_count是什么？假如这个媒体流存在9个samples，这里的entry和chunk不是对应的。sample 4、5和6在同一个chunk中，但是，由于他们的时长不一样，sample 4的时长为3，而sample 5和6的时长为1，因此，通过不同的entry来描述。
![](/images/qiniu/180114231922.png)
```c++
// 官方文档代码
aligned(8) class TimeToSampleBox
   extends FullBox(’stts’, version = 0, 0) {
   unsigned int(32)  entry_count;
   int i;
   for (i=0; i < entry_count; i++) {
      unsigned int(32)  sample_count;
      unsigned int(32)  sample_delta;
   }
}
```

### MOOV::TRAK::MDIA::MINF::STBL::CTTS
Composition Time to Sample Box。每一个视频sample都有一个解码顺序和一个显示顺序。对于一个sample来说，解码顺序和显示顺序可能不一致，比如H.264格式，因此，CTTS就是在这种情况下被使用的。
  1. 如果解码顺序和显示顺序是一致的，CTTS就不会出现。STTS既提供了解码顺序也提供了显示顺序，并能够计算出每个sample的开始时间和结束时间。
  2. 如果解码顺序和显示顺序不一致，那么STTS既提供解码顺序，CTTS则通过差值的形式来提供显示时间。
依旧看**Table 2**，那么sample_count跟sample_offset的关系如下：
![](/images/qiniu/180114232102.png)
```c++
// 官方文档代码
aligned(8) class CompositionOffsetBox extends FullBox(‘ctts’, version = 0, 0) { 
  unsigned int(32) entry_count;
  int i;
  if (version==0) {
    for (i=0; i < entry_count; i++) {
      unsigned int(32)  sample_count;
      unsigned int(32)  sample_offset;
    } 
  } else if (version == 1) {
    for (i=0; i < entry_count; i++) {
      unsigned int(32)  sample_count;
      signed   int(32)  sample_offset;
    } 
  }
}
```

### MOOV::TRAK::MDIA::MINF::STBL::STCO
Chunk Offset Box。Chunk的偏移量表，指定了每个chunk在文件中的位置。如下图：
![](/images/qiniu/180114232325.png)
需要注意的是，box中只是给出了每个chunk的偏移量，并没有给出每个sample的偏移量。因此，如果要获得每个sample的偏移量，还需要用到Sample Size Box和Sample-To-Chunk Box。

stco 有两种形式，如果你的视频过大的话，就有可能造成 chunkoffset 超过 32bit 的限制。所以，这里针对大 Video 额外创建了一个 co64 的 Box。它的功效等价于 stco，也是用来表示 sample 在 mdat box 中的位置。只是，里面 chunk_offset 是 64bit 的。基本格式为：
```c++
// 官方文档代码
// 32位
aligned(8) class ChunkOffsetBox
extends FullBox(‘stco’, version = 0, 0) { 
unsigned int(32) entry_count;
for (i=1; i u entry_count; i++) {
      unsigned int(32)  chunk_offset;
   }
}

// 64位
aligned(8) class ChunkLargeOffsetBox extends FullBox(‘co64’, version = 0, 0) { 
unsigned int(32) entry_count;
for (i=1; i u entry_count; i++) {
      unsigned int(64)  chunk_offset;
   }
}
```

### MOOV::TRAK::MDIA::MINF::STBL::STSC
Sample To Chunk Box。用chunk组织sample可以方便优化数据获取，一个chunk包含一个或多个sample。“stsc”中用一个表描述了sample与chunk的映射关系，查看这张表就可以找到包含指定sample的thunk，从而找到这个sample，当然每个table entry可能包含一个或者多个chunk。以下是table entry布局。
![](/images/qiniu/180114232505.png)
每个table entry包含一组chunk，enrty中的每个chunk包含相同数目的sample。而且，这些chunk中的每个sample都必须使用相同的sample description。任何时候，如果chunk中的sample数目或者sample description改变，必须创建一个新的table entry。如果所有的chunk包含的sample数目相同，那么该table只有一个entry。
一个简单的例子，如图所示。图中看不出来总共有多少个chunk，因为entry中只包含第一个chunk号，因此，对于最后一个entry，在某些情况下需要特殊的处理，因为无法判断什么时候结束。
![](/images/qiniu/180114232522.png)
```c++
// 官方文档代码
aligned(8) class SampleToChunkBox
   extends FullBox(‘stsc’, version = 0, 0) {
   unsigned int(32)  entry_count;
   for (i=1; i <= entry_count; i++) {
    // 每一个 entry 开始的 chunk 位置。
        unsigned int(32) first_chunk;
    // 每一个 chunk 里面包含多少的 sample
      unsigned int(32) samples_per_chunk; 
    // 每一个 sample 的描述。一般可以默认设置为 1。
      unsigned int(32) sample_description_index;
  } 
}
```
这 3 个字段实际上决定了一个 MP4 中有多少个 chunks，每个 chunks 有多少个 samples。这里顺便普及一下 chunk 和 sample 的相关概念。在 MP4 文件中，最小的基本单位是 Chunk 而不是 Sample。
  - sample: 包含最小单元数据的 slice。里面有实际的 NAL 数据。
  - chunk: 里面包含的是一个一个的 sample。为了是优化数据的读取，让 I/O 更有效率。
前面说了，在 MP4 中最小的单位是 chunks，那么通过 stco 中定义的 chunk_offsets 字段，它描述的就是 chunks 在 mdat 中的位置。每一个 stco chunk_offset 就对应于某一个 index 的 chunks。那么，first_chunk 就是用来定义该 chunk entry 开始的位置。那这样的话，stsc 需要对每一个 chunk 进行定义吗？不需要，因为 stsc 是定义一整个 entry，即，如果他们的samples_per_chunk，sample_description_index 不变的话，那么后续的 chunks 都是用一样的模式。
即，如果你的 stsc 只有：
```js
first_chunk: 1
samples_per_chunk: 4
sample_description_index: 1
```
也就是说，从第一个 chunk 开始，每通过切分 4 个 sample 划分为一个 chunk，并且每个 sample 的表述信息都是 1。它会按照这样划分方法一直持续到最后。当然，如果你的 sample 最后不能被 4 整除，最后的几段 sample 就会当做特例进行处理。
通常情况下，stsc 的值是不一样的：
![](/images/qiniu/180114232618.png)
按照上面的情况就是，第 1 个 chunk 包含 2 个 samples。第 2-4 个 chunk 包含 1 个 sample，第 5 个 chunk 包含两个 chunk，第 6 个到最后一个 chunk 包含一个 sample。

### MOOV::TRAK::MDIA::MINF::STBL::STSZ
Sample Size Boxes。指定了每个sample的size。
```c++
// 官方文档代码
aligned(8) class SampleSizeBox extends FullBox(‘stsz’, version = 0, 0) { 
  unsigned int(32) sample_size;
  unsigned int(32) sample_count;
  if (sample_size==0) {
    for (i=1; i <= sample_count; i++) {
     unsigned int(32)  entry_size;
    } 
  }
}
```

这里就是mp4的一个大致的结构，下一篇我会给出剩下的，也就是FMP4区别于MP4的结构部分。

## 参考资料

- [MOV及MP4文件格式中几个重要的Table](http://blog.csdn.net/yu_yuan_1314/article/details/9078287)
