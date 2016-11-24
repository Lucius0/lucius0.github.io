---
layout: post
title:  "JavaScript之五 - 数组"
date:   2016-08-11
categories: front-end
permalink: /archivers/javascript-array
tags: javascript
---

有序，弱类型(多类型)集合。数组是有长度限制的，即0~2^23 - 1

数组的原型链：`[] -> Array.prototype`; 对象的原型链：`{} -> Object.prototype`

**常用方法**

```javascript
Array.prototype.join
Array.prototype.reverse
Array.prototype.sort
Array.prototype.concat
Array.prototype.slice
Array.prototype.splice
Array.prototype.foreach(ES5)
Array.prototype.map(ES5)
Array.prototype.filter(ES5)
Array.prototype.every(ES5)
Array.prototype.some(ES5)
Array.prototype.reduce/reduceRight(ES5)
Array.prototype.indexOf/Array.prototype.lastIndexOf(ES5)
Array.isArray(ES5)
```

- reduce

```javascript
var arr = [1,2,3];
var sum = arr.reduce(function(x,y) { return x + y}, 0); // 6
```

*解析：* reduce接受两个参数，第一个参数则是逻辑函数，第二个参数表明是否要跟首次传入逻辑函数的参数进行逻辑处理，例如上文例子，会先进行 0 + 1 = 1，1 + 2 = 3，3 + 3 = 6

- isArray

```javascript
Array.isArray([]); // true
[] instanceof Array; // true
({}).toString.apply([]) === ["object Array"]; // true
[].constructor === Array; // true
```