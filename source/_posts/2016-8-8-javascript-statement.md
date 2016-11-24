---
layout: post
title:  "JavaScript之三 - 语法"
date:   2016-08-08
categories: front-end
permalink: /archivers/javascript-statement
tags: javascript
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

`function fd() { // do something }; // 函数声明`

`var fe = function { // do something }; // 函数表达式`

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
- arguments变为参数的静态变量；

```javascript
// 正常状态下
!function(a) {
	// "use strict";
	arguments[0] = 100;
	console.log(a);
}(1);
// ps: 若有传参的话，则arguments[0]可以改变a的值，即a的值为100，
//     若不传参，即!function(a){}();则无论是否有arguments的赋值，a都是为undefined
// 严格模式：
// 		1) 值传递：传参则1，无传参则undefined
//		2) 址传递：若在无传参的情况下赋值则会报错
```

- 严格模式下删除形参会报错(1.configurable为true则报SyntaxError；2.configurable为false则报TypeError)；
- 对象字面量属性重复报错。`var obj = {x:1, x:2}; // SyntaxError`
- 禁止八进制字面量 `console.log(0123); //SyntaxError`
- eval, arguments变为关键字，不能作为变量、函数名，若违反则报SyntaxError 
- eval独立作用域

```javascript
!function() {
	eval("val evalValue = 2;");
	console.log(typeof evalValue);//number
}();

!function() {
	"use strict";
	eval("var evalValue = 2;");
	console.log(typeof evalValue);//undefined，原因是eval独立作用域
}
```

**严格模式总结：**

1. 不允许使用with；
2. 所有变量必须声明，赋值给未声明的变量报错，而不是隐式创建全局变量；
3. eval中的代码不能创建eval所在的作用域变量、函数，而是为eval单独创建一个单独的作用域，并在eval返回时废弃；
4. 函数中的特殊对象arguments是静态副本，而不像非严格模式那样，修改arguments或修改形参会相互影响；
5. 删除configurable为false会报错，而不是选择忽略；
6. 禁止八进制字面量；
7. eval、arguments为关键字，不能作为变量名或函数名；
8. 一般函数的调用(不是对象方法的调用，也不是用apply/call/bind等修改this指向)，this指向null而不是全局对象；
9. 若使用apply/call，当传入null或者undefined时，this指向null或undefined而不是全局对象；
10. 试图修改不可写属性(writable=false)，在不可扩展的对象上添加属性时报TypeError，而不是忽略；
11. arguments.caller、arguments.callee被禁用