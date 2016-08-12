---
layout: post
title:  "JavaScript之六 - 函数与作用域(1)"
date:   2016-08-11
categories: javascript
permalink: /archivers/javascript-function-01
tags: javascript
publish: false
---

## 1、调用方式 ##

- 直接调用：foo();

- 对象方法：o.method();

- 构造器：new Foo();

- call/apply/bind：func.call(o);

## 2、创建函数 ##

- 函数声明

```javascript
function add(a, b) {
	return a + b;
}
```

- 函数表达式

```javascript
// 函数变量
var add = function(a, b) {
	// do something here
}

// 立即执行函数表达式
(function() {
	// do something here
});

// 匿名函数
return function() {
	// do something here
};

// 命名式函数表达式
var add = function foo(a, b) {
	// do something here
}
// 一般来说foo是在add所创建的作用域里，即外部调用一般都是访问不到
console.log(foo); // Uncaught ReferenceError: foo is not defined(…) 
// IE6 ~ IE8则是可以的
```

## 3、函数构造器 ##

```javascript
var func = new Function("a", "b", "console.log(a + b);");
func(1, 2); // 3

var func = Function("a", "b", "console.log(a + b);");
func(1, 2); // 3
```

函数构造器一般很少使用，会出现一些很奇怪的现象

- localValue 仍为局部变量

```javascript
Function("var localVal='local'; console.log(localVal);")(); // local
console.log(typeof localVal); // undefined
```

- local不可访问，全局变量global可以访问

```javascript
var globalVal = "global";
(function() {
	var localVal = "local";
	Function("console.log(typeof localVal, typeof globalVal);")(); // undefined, string
})();
```

总结：

  空白          | 函数声明 | 函数表达式 | 函数构造器
:-------------  | -------- | ---------- | ----------
前置            | √ |   |   
允许匿名        |   | √ | √ 
立即调用        |   | √ | √ 
在定义该函数的作用域通过函数名访问  | √ |   |
没有函数名      |   |   | √ 

## 4、this ##

### 4.1 全局作用域下的this ###

```javascript
this.document === document; // true

this ==== window; // true

this.a = 37;
console.log(window.a); // 37
```

### 4.2 一般函数的this ###

```javascript
function f1() {
	return this;
}

f1() === window; // true
```

### 4.3 作为对象方法的函数this ###

```javascript
// CASE 1
var o = {
	prop: 37,
	f: function() {
		return this.prop;
	}
};
console.log(o.f()); // 37

// CASE 2
var o = {prop: 37};
function f() {
	return this.prop;
}
o.f = f;
console.log(o.f()); // 37
```