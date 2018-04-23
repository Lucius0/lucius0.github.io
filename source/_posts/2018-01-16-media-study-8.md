---
layout: post
title:  "音视频学习-FMP4结构之FMP4"
date:   2018-01-16
categories: media
permalink: /archivers/media-study-08
tags: media
---

初次学习有关音视频这一块的开发，主要是基于 **[flv.js](https://github.com/Bilibili/flv.js)** 的学习。这一块的知识概念实在是太多太深了，所以本人是先在本地做记录，后面会整理慢慢地上传与各位分享，假如有地方说错，请勘误。谢谢指点。

接上篇[音视频学习-FMP4结构之MP4](https://lucius0.github.io/2018/01/14/archivers/media-study-07/)，这篇来说下FMP4的格式。在上篇文章中，有列举过FMP4与MP4之间的差异，其实就可以通过图片看出主要的差异性，FMP4主要是有`moof + mdat`来作为媒体流数据源。从图片上看，FMP4比MP4多了MVEX Box, MOOF Box以及MDAT Box。

## MOOV::MVEX
Movie Extends box，该box可能有moof(Movie Fragment Boxes)，并且是按顺序读取。
```c++
aligned(8) class MovieExtendsBox extends Box(‘mvex’){ }
```

### MOOV::MVEX::MEHD
Movie extends header box。可有可无，主要是是Movie头扩展用的。
```c++
// 官方文档代码
aligned(8) class MovieExtendsHeaderBox extends FullBox(‘mehd’, version, 0) { 
  if (version==1) {
      unsigned int(64)  fragment_duration;
   } else { // version==0
      unsigned int(32)  fragment_duration;
   }
}
```

### MOOV::MVEX::TREX
Track Extends Box。设置了movie fragment的默认值，可以保存每个track中的空间复杂度。
```c++
// 官方文档代码
aligned(8) class TrackExtendsBox extends FullBox(‘trex’, 0, 0){ 
    unsigned int(32) track_ID;
    unsigned int(32) default_sample_description_index;
    unsigned int(32) default_sample_duration;
    unsigned int(32) default_sample_size;
    unsigned int(32) default_sample_flags 
}
```

## MOOF

### MOOF::TRAF
Track Fragment Box。存放tfhd，tfdt，sdtp，trun的容器。
```c++
// 官方文档代码
aligned(8) class TrackFragmentBox extends Box(‘traf’){ }
```

### MOOF::TRAF::TFHD
Track Fragment Header Box。主要是对指定的 trak 进行相关的默认设置。例如：sample 的时长，大小，偏移量等。不过，这些都可以忽略不设，只要你在其它 box 里面设置完整即可：
```c++
// 官方文档代码
aligned(8) class TrackFragmentHeaderBox extends FullBox(‘tfhd’, 0, tf_flags){
  unsigned int(32) track_ID;
  // all the following are optional fields
  unsigned int(64) base_data_offset;
  unsigned int(32) sample_description_index;
  unsigned int(32) default_sample_duration;
  unsigned int(32) default_sample_size;
  unsigned int(32) default_sample_flags
}
```

### MOOF::TRAF::TFDT
Track fragment decode time。主要是用来存放相关 sample 编码的绝对时间的。因为 FMP4 是流式的格式，所以，不像 MP4 一样可以直接根据 sample 直接 seek 到具体位置。这里就需要一个标准时间参考，来快速定位都某个具体的 fragment。
```c++
// 官方文档代码
aligned(8) class TrackFragmentBaseMediaDecodeTimeBox extends FullBox(‘tfdt’, version, 0) {
  if (version==1) {
    unsigned int(64) baseMediaDecodeTime; 
  } else { // version==0
    unsigned int(32) baseMediaDecodeTime;
  }
}
```

### MOOF::TRAF::TRUN
Track Fragment Run Box。存储该 moof 里面相关的 sample 内容。例如，每个 sample 的 size，duration，offset 等。
```c++
// 官方文档代码
aligned(8) class TrackRunBox extends FullBox(‘trun’, version, tr_flags) {
  unsigned int(32) sample_count;
  // the following are optional fields
  signed int(32) data_offset;
  unsigned int(32) first_sample_flags;
  // all fields in the following array are optional 
  {
      unsigned int(32)  sample_duration;
      unsigned int(32)  sample_size;
      unsigned int(32)  sample_flags
      if (version == 0) { 
      unsigned int(32) sample_composition_time_offset;
      } else { 
      signed int(32) sample_composition_time_offset;
    }
   }[ sample_count ]
}
```
可以说，trun 上面的字段是 traf 里面最重要的标识字段：
tr_flags 是用来表示下列 sample 相关的标识符是否应用到每个字段中：
- 0x000001: data-offset-present，只应用 data-offset
- 0x000004: 只对第一个 sample 应用对应的 flags。剩余 sample flags 就不管了。
- 0x000100: 这个比较重要，表示每个 sample 都有自己的 duration，否则使用默认的
- 0x000200: 每个 sample 有自己的 sample_size，否则使用默认的。
- 0x000400: 对每个 sample 使用自己的 flags。否则，使用默认的。
- 0x000800: 每个 sample 都有自己的 cts 值
后面字段，我们这简单介绍一下。
- data_offset: 用来表示和该 moof 配套的 mdat 中实际数据内容距 moof 开头有多少 byte。相当于就是 moof.byteLength + mdat.headerSize。
- sample_count: 一共有多少个 sample
- first_sample_flags: 主要针对第一个 sample。一般来说，都可以默认设为 0。
后面的几个字段，我就不赘述了，对了，里面的 sample_flags 是一个非常重要的东西，常常用它来表示，到底哪一个 sample 是对应的 keyFrame。

### MOOF::TRAF::SDTP
Independent and Disposable Samples Box。主要是用来描述具体某个 sample 是否是 I 帧，是否是 leading frame 等相关属性值，主要用来作为当进行点播回放时的同步参考信息。
```c++
// 官方文档代码
aligned(8) class SampleDependencyTypeBox extends FullBox(‘sdtp’, version = 0, 0) { 
  for (i=0; i < sample_count; i++){
    // 是否是开头部分
    // - 0: 当前 sample 的 leading 属性未知（经常用到）
    // - 1: 当前 sample 是 leading sample，并且不能被 decoded
    // - 2: 当前 sample 并不是 leading sample
    // - 3: 当前 sample 是 leading sample，并且能被 decoded
    unsigned int(2) is_leading;
    // 是否是 I 帧
    // - 0: 该 sample 不知道是否依赖其他帧
    // - 1: 该 sample 是 B/P 帧
    // - 2: 该 sample 是 I 帧
    // - 3: 保留字
    unsigned int(2) sample_depends_on; 
    // 该帧是否被依赖
    // - 0: 不知道是否被依赖，特指（B/P）
    // - 1: 被依赖，特指 I 帧
    // - 2: 保留字
    unsigned int(2) sample_is_depended_on; 
    // 是否有冗余编码
    // - 0: 不知道是否有冗余
    // - 1: 有冗余编码
    // - 2: 没有冗余编码
    // - 3: 保留字
    unsigned int(2) sample_has_redundancy;
  } 
}
```
sdtp 对于 video 来说很重要，因为，其内容字段主要就是给 video 相关的帧设计的。而 audio，一般直接采用默认值：
```c++
isLeading: 0,
dependsOn: 1, 
isDepended: 0,
hasRedundancy: 0
```

## MDAT
Media Data Box。该box包含媒体数据。对于h264，aac编码的媒体来说，其视频mdat中内容是nal，对于音频来说，其内容为aac的一帧。mdat中的帧依次存放，每个帧的位置、时间、长度都由moov中的信息指定。
```c++
// 官方文档代码
aligned(8) class MediaDataBox extends Box(‘mdat’) { 
  bit(8) data[];
}
```

## 参考资料

-  [学好 MP4，让直播更给力](https://www.villainhr.com/page/2017/08/21/%E5%AD%A6%E5%A5%BD%20MP4%EF%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%9B%B4%E7%BB%99%E5%8A%9B#fragmented MP4)