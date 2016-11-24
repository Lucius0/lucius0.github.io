---
layout: post
title:  "JavaScript之十一 - AMD,CommonJs,UMD"
date:   2016-08-20
categories: front-end
permalink: /archivers/javascript-amd-commonjs-umd
tags: javascript
---

模块化是js目前来说是最为常见的开发规范，因为js并没有类的概念，因此才会有以下的规范。在理想状态下，程序员只需要关心业务逻辑就好了。在以往，js的演变也是五花八门，从最为原始的函数写法，到立即执行函数写法，再到传参全局变量写法，可见开发者对模块化编程的迫切需求。

原始写法

```javascript
function f1() {}

function f1() {}
```

立即执行函数写法

```javascript
var o = (function() {
	var _x = 0;
	var _f1 = function() {};
	var _f2 = function() {};

	return {
		f1: _f1,
		f2: _f2
	}
})();
```
传参全局变量写法

```javascript
var o = (function($){
	// ...
})(jQuery);
```

下面就是要介绍常见的模块化规范编程，翻译自**[What Is AMD, CommonJS, and UMD?](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)**

## 介绍 ##

多年来Javascript的生态圈一直在稳步的完善以至于有足够多的组件可供选择，本来大量的组件理应是振奋人心的，但是当多个第三方组件混用时也同样带来了很多麻烦，那就是当开发人员混用时并不能很好的互相兼容。

为了解决这些问题，AMD与CommonJs就出现了，他们要求开发者采用规范化的模式开发以免污染整个生态系统。

## AMD ##

git：[amdjs](https://github.com/amdjs/amdjs-api/wiki/AMD#using-require-and-exports)

异步模块定义(Asynchronous Module Definition)，流行的RequireJS就是用的AMD规范。它采用异步方式加载模块，模块的加载不影响它后面语句的运行，所有需要依赖的逻辑都会定义在回调函数，等到加载完毕之后就会触发回调函数。

这里有一个对jQuery单一依赖模块`foo`，是用AMD规范的。

```javascript
// filename: foo.js
define(['jquery'], function($) {
	// method
	function myFunc() {};

	// exposed public methods
	return myFunc;
});
```

下面是稍复杂多依赖并且暴露公共方法的例子

```javascript
// filename: foo.js
define(['jquery', 'underscore'], function($, _) {
	// methods
	function a() {}; // private because it's not returned (see below)
	function b() {}; // public because it's returned
	function c() {}; // public because it's returned

	// exposed public methods
	return {
		b: b,
		c: c
	}
});
```

第一部分是依赖模块的数组定义，第二部分则是回调函数，但当只有依赖的模块都是可用时才会执行回调函数。

参数顺序跟依赖模块的顺序一致很重要(ex.jQuery -> $, underscore -> _)

当然我们可以将回调函数的参数名改成我们想要的，假如我们在代码中将`$`改成`$$`，那么就应该在函数体里面所有JQuery的引用都用`$$`替换`$`

最后一点，也是重要的一点，就是你不能再函数的声明外部调用`$`跟`_`，因为有函数作用域，只有回调函数内才可以调用。

## CommonJS ##

git: [commonJs](https://github.com/efacilitation/commonjs-require)

假如你有写过nodejs的话，那么你应该会对CommonJs感到非常的亲切，CommonJs是因为Browserify流行起来的。

用一个跟上一个同样的案例，来看看`foo`函数在CommonJs长什么样

```javascript
// filename: foo.js
// dependencies
var $ = require('jquery');

// methods
function myFunc() {};

// exposed public method (single)
module.exports = myFunc;
```

同样用一个比较复杂的例子，也是多依赖

```javascript
// filename: foo.js
var $ = require('jquery');
var _ = require('underscore');

// methods
function a() {}; // private because it's omitted from module.exports
function b() {}; // public because it's defined in module.exports
function c() {}; // public because it's defined in module.exports

// exposed public methods
module.exports = {
	b: b,
	c: c
}
```

## UMD: Universal Module Definition ##

git: [umdjs](https://github.com/umdjs/umd)

虽然CommonJs跟AMD规范都同样受欢迎，但他们似乎还没有达成共识。因此推动了通用模块定义的产生，用以同时支持两种规范。

不得不说UMD模式看起来没有比AMD跟CMD简洁，但是CommonJs不仅同时支持AMD跟CommonJS，还支持老的规范全局变量定义模式("global" variable definition)

```javascript
(function(root, factory) {
	if(typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if(typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory(require('jquery'));
	} else {
		// Browser global (root is window)
		root.returnExports = factory(root, jQuery);
	}
}(this, function($){
	// methods
	function myFunc() {};

	// exposed public method
	return myFunc;
}));
```

老规矩，复杂的例子以及多依赖跟暴露公共方法

```javascript
(function(root, factory){
	if(typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'underscore'], factory);
	} else if(typeof exports === 'object') {
		// Node, CommonJs-like
		module.exports = factory(require('jquery'), require('underscore'));
	} else {
		// Browser global (root is window)
		root.returnExports = factory(root.jQuery, root._);
	}
}(this, function($, _){
	// methods
	function a(){};    //    private because it's not returned (see below)
    function b(){};    //    public because it's returned
    function c(){};    //    public because it's returned

    // exposed public methods
    return {
    	b: b,
    	c: c
    }
}));
```

## CMD ##

还有一种模块化规范，见下一篇<!-- [《CMD与AMD异同》](/archivers/javascript-cmd-amd) -->{% post_link /archivers/javascript-cmd-amd 《CMD与AMD异同》 %}