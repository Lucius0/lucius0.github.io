---
layout: post
title:  "JavaScript之六 - 函数与作用域(1)"
date:   2016-08-11
categories: front-end
permalink: /archivers/javascript-function-01
tags: javascript
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

### 4.4 对象原型链上的this ###

```javascript
var o = {f: function(){
	return this.a + this.b;
}};
var p = Object.create(o); // p 的原型o
p.a = 1;
p.b = 4;
console.log(p.f()); // 调用原型链的f函数，this指向p
```

### 4.5 get/set方法与this ###

```javascript
function modules() {
	return Math.sqrt(this.re * this.re + this.im + this.im);
}

var o = {
	re: 1,
	im:-1,
	get phase() {
		return Math.atan2(this.im, this.re);
	}
};

Object.defineProperty(o, "modules", {get: modules, enumerable: true, configurable: true});
console.log(o.phase, o.modules);
```

### 4.6 构造器中的this ###

```javascript
function MyClass() {
	this.a = 37; // 全局变量a
}
var o = new MyClass(); // this 指向o
console.log(o.a); // 37，o的原型链是MyClass
```

### 4.7 call/apply方法与this ###

```javascript
function add(c, d) {
	return this.a + this.b + c + d;
}
var o = {a: 1, b: 3};
add.call(o, 5, 7);
add.apply(o, [5, 7]);
// call与apply常见使用方法，即想把某个函数指向某个this
function bar() {
	console.log(Object.prototype.toString.call(this));
}
bar.call(7); // [object Number] this 指向 new Number(7)
```

### 4.8 bind方法与this ###

ES5才提供，IE9+才支持的函数

```javascript
function f() {
	return this.a;
}

var g = f.bind({a: "test"}); // f的this指向对象{a:"test"}
console.log(g()); // test
var o = {a: 37, f: f, g: g}; // f中的this指向o，而g的this指向为{a:"test"}
console.log(o.f(), o.g()); // 37, test
```

### 4.9 函数属性 && arguments ###

- **arguments**

```javascript
function foo(x, y, z) {
	arguments.length; // 2
	arguments[0]; // 1
	arguments[0] = 10; // 在use strict模式下，无法赋值，x还是为 1
	x; // 10

	arguments[2] = 100;
	z; // undefined
	arguments.callee === foo; // true，严格模式下则无法使用callee
}

foo(1, 2);
foo.length; // 3
foo.name; // foo
```

- **apply/call**

```javascript
function foo(x, y) {
	console.log(x, y, this);
}
foo.call(100, 1, 2); // 1, 2, Number
foo.apply(true, [1,2]); // 1, 2, Boolean(true)
foo.apply(null); // undefined, undefined, window (严格模式下为null)
foo.apply(undefined); // undefined, undefined, window (严格模式下为undefined)
```

- **bind**

```javascript
this.x = 9;
var module = {
	x: 81, 
	getX: function() {
		return this.x;
	}
};
module.getX(); // 81 this 指向module
var getX = module.getX;
getX(); // 9 this 指向全局变量
var boundGetX = getX.bind(module); 
// 使用call/apply，boundGetX会报未定义的错误.
// 原因是call跟apply没有返回值，但是可以这样，
// getX.call(module)();
// getX.apply(module)();
boundGetX(); // 81 将上文的全局变量指向module
```

- **bind与函数颗粒化**

```javascript
function add(a, b, c) {
	return a + b + c;
}
var func = add.bind(undefined, 100);
func(1, 2); // 103
```

*解析：* `add.bind(undefined, 100)` 先将100传参给add函数的第一个参数，即a；然后`func(1, 2)`则会传参给函数的b跟c

- **bind与new**

```javascript
function foo() {
	this.b = 100;
	return this.a;
}
var func = foo.bind({a: 1});
func(); // 1
new func(); // {b: 100}
```

*解析：* foo函数中返回值除非是**对象**，否则就将**this**作为返回值返回，**this**会被初始化为默认的一个空对象，并且**this**的原型是*foo.prototype*，该空对象的b属性会赋值为100，然后整个对象会被作为返回值返回并且忽略return的返回值。