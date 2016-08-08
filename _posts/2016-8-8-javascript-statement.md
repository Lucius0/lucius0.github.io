---
layout: post
title:  "JavaScript之三 - 语法"
date:   2016-08-08
categories: javascript
permalink: /archivers/javascript-statement
tags: javascript
publish: false
---
## 1、block ##

一般就是{}包括起来的代码块，注意的是，js没有块作用域，但是有函数作用域，全局作用域。

## 2、var ##

```javascript
var a = b = 1; // 相当于创建了b为全局作用域，解决方法：var a = 1, b = 1
```

如：

```javascript
function foo() {
	var a = b = 1;
}
foo();
console.log(typeof a); // "undefined"
console.log(typeof b); // "number" b为全局变量
```

## 3、try catch ##

```javascript
try {
	throw "test";
} catch(ex) {
	console.log(ex); // "test"
} finally {
	console.log("finally"); // finally
}
```

## 4、function ##

```function fd() { // do something }; // 函数声明```

```var fe = function { // do something }; // 函数表达式```

区别：函数声明可以在声明前调用，且无报错；而函数表达式不可以在声明前调用，有TypeError 

## 5、for...in ##

```javascript
var p;
var obj = {x:1, y:2};
for(p in obj) {
	// 获取obj的key值
}
```

有几点需要注意：

- 顺序不确定
- enumerable为false时不显示
- for...in 对象属性受到原型链的影响

## 6、严格模式 ##
严格模式是一种特殊的执行模式，它修复了部分语言上的不足，提供更强的错误检查，并增强安全性

```javascript
// 1.
function  func() {
	// ps：ie 不认该模式，会自动忽略严格模式
	// 方法func按照严格模式执行
	"use strict";
}

// 2.
"use strict" // 按照严格模式来
function func() {
	
}
```

严格模式：

- 不允许使用with(SyntaxError);
- 不允许给未声明的变量赋值(RefrenceError);
- arguments变为参数的静态变量

```javascript
// 正常状态下
!function(a) {
	arguments[0] = 100;
	console.log(a);
}(1);
// ps: 若有传参的话，则arguments[0]可以改变a的值，即a的值为100，
//     若不传参，即!function(a){}();则无论是否有arguments的赋值，a都是为undefined
```