---
layout: post
title:  "JavaScript之八 - 执行上下文"
date:   2016-08-13 08:00:00
categories: front-end
permalink: /archivers/javascript-execution-context
tags: javascript
---

作用域：全局、函数、eval。可参考{% post_link /archivers/javascript-function-01 《函数与作用域01》 %}和{% post_link /archivers/javascript-function-02 《函数与作用域02》 %}。

## 1、概念 ##

执行上下文类似于栈的结构，可参考[《深入理解Javascript之执行上下文》](http://blogread.cn/it/article/6178)

```javascript
console.log("EC0");

function funcEC1() {
	console.log("EC1");
	var funcEC2 = function() {
		console.log("EC2");
		var funcEC3 = function() {
			console.log("EC3");
		};
		funcEC3();
	}
	funcEC2();
}
funcEC1();

// EC0 -> EC1 -> EC2 -> EC3
```

*解析：* 变量对象(VO)是一个抽象概念的“对象”，它用于存储执行上下文中的变量、函数声明、函数参数

可以将上下文看成一个对象

```javascript
activeExecutionContext = {
	VO: {
		data_var,
		data_func_declaration,
		data_func_arguments
	}
}

var a = 10;
function test(x) {
	var b = 20;
}
test(30);

VO(globalContext) = {
	a = 10,
	test: < ref to function >
};

VO(test function) = {
	x: 30,
	b: 20
}
```

## 2、全局执行上下文(浏览器) ##

```javascript
VO(globalContext) === [[global]];
// 全局初始化
[[global]] = {
	Math: <...>,
	String: <...>,
	isNaN: <...>,
	...
	window: global // 依赖浏览器	
};

String(10); // [[global]].string(10)
window.a = 10; // [[global]].window.a = 10
this.b = 10; // [[global]].b = 10
```

## 3、函数激活对象(AO) ##

```javascript
// 函数初始化
VO(functionContext) === AO;
AO = {
	arguments: < Arg0 >
};
arguments = {
	callee,
	length,
	properties-indexes
};
```

### 3.1 变量初始化阶段 ###

```javascript
function test(a, b) {
	var c = 10;
	function d() {}
	var e = function _e() {};
	(function x() {});
	b = 20;
}
test(10);

AO(test) = {
	a: 10,
	b: undefined,
	c: undefined,
	d: < ref to func "d" >,
	e: undefined
}
```

**VO按照如下顺序填充：**

1. 函数参数(若未传入，初始化该参数值为undefined)

2. 函数声明(若发生命名冲突，会覆盖)

3. 变量声明(初始化变量值为undefined，若发生命名冲突，忽略)

```javascript
function foo(x, y, z) {
	function x() {};
	console.log(x);
}
foo(100); // function x() {}
```

*解析：* 函数参数传进去之后，因为函数声明跟参数命名发生冲突，即x直接覆盖函数参数变量

```javascript
function foo(x, y, z) {
	function func(){};
	var func;
	console.log(func);
}
foo(100); // function x() {}
```

*解析：* 变量声明跟函数声明的命名发生冲突，根据VO的顺序，变量声明发生冲突，则会被忽略

```javascript
function foo(x, y, z) {
	function func(){};
	var func = 1;
	console.log(func);
}
foo(100); // 1
```

*解析：* 初始化阶段变量声明因为命名冲突会被忽略，但是在第二个阶段，即执行阶段`func = 1`会被赋值为1，则就是为什么结果1的原因了。

**注意：** 函数表达式不会影响VO。上文的`var e = function _e(){}`中的_e匿名函数，e的变量声明会被放在右边的AO里面，执行阶段的时候才有把匿名函数_e赋值给变量e。这就是为什么我们没办法通过_e来访问函数对象。

### 3.2 代码执行阶段 ###

该阶段会对上一阶段初始化的变量进行赋值

```javascript
AO(test) = {
	a: 10,
	b: undefined,
	c: undefined,
	d: < ref to func "d" >,
	e: undefined
}

/** ↓ **/
VO["c"] = 10;
VO["e"] = function _e() {};
VO["b"] = 20;

/** ↓ **/
AO(test) = {
	a: 10,
	b: 20,
	c: 10,
	d: < reference to FunctionDeclaration "d" >
	e: function _e() {}
}
```

**栗子：**

```javascript
console.log(x); // function x() {}
var x = 10;
console.log(x); // 10
x = 20;
function x() {};
console.log(x); // 20
if(true) {
	var a = 1;
} else {
	var b = true;
}
console.log(a); // 1
console.log(b); // undefined
```

*解析：*

1. 初始化阶段

	- 函数参数：上下文测试不存在函数参数问题

	- 函数声明：`function x() {}`

	- 变量声明：`var x` 命名冲突，忽略；`var a; var b` undefined

2. 执行阶段

```javascript
console.log(x); // function x() {}
x = 10; // x 被赋值
console.log(x); // 10
x = 20; // x 再次被赋值
console.log(x); // 20
a = 1; // a 被赋值
console.log(a); // 1
console.log(b); // undefined
```