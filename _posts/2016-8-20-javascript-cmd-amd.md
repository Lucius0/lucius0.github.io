---
layout: post
title:  "JavaScript之十二 - CMD与AMD异同"
date:   2016-08-20 04:41:00
categories: javascript
permalink: /archivers/javascript-cmd-amd
tags: javascript
publish: false
---

- 异步模块定义：[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)
- 通用模块定义：[CMD](https://github.com/seajs/seajs/issues/242)

AMD是RequireJs推广过程中产出，而CMD则是SeaJs。跟上一篇文章一样都是为了js的模块化开发，特别是在浏览器端，都能达到浏览器模块化开发的目的。

区别：

1. 对于依赖的模块，AMD是**提前执行**，CMD是**延迟执行**。不过在RequireJs 2.0开始也可以改为延迟执行。

2. CMD推崇**依赖就近**，AMD推崇**依赖前置**

// CMD

```javascript
define(function(require, exports, module){
	var a = require('./a');
	a.doSomething();
	//...
	var b = require('./b');
	b.doSomething();
});
```

// AMD

```javascript
define(['./a', './b'], function(a, b) {
	a.doSomething();
	//...
	b.doSomething();
});
```

参考**[知乎大神玉伯的回答](https://www.zhihu.com/question/20351507/answer/14859415)**