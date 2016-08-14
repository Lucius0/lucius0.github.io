---
layout: post
title:  "JavaScript之七 - 函数与作用域(2)"
date:   2016-08-13
categories: javascript
permalink: /archivers/javascript-function-02
tags: javascript
publish: false
---

## 1、闭包 ##

是指一个函数或函数的引用，与一个引用环境绑定在一起。这个引用环境是一个存储该函数每个非局部变量的表，它不同于一般的函数，它允许一个函数在立即词法作用域外调用时，仍可访问非本地变量。

**缺点：** 容易造成空间浪费，内存泄漏，性能消耗

```javascript
// CASE 1
function outer() {
	var localVal = 30;
	return localVal;
}
outer(); // 30

// CASE 2
function outer() {
	var localVal = 30;
	return function() {
		return localVal;
	};
}
var func = outer();
func(); // 30
```

**循环闭包：**

```javascript
document.body.innerHTML = "<div id='div1'>aaa</div><div id='div2'>bbb</div><div id='div3'>ccc</div>"
for(var i = 1; i < 4; i++) {
	document.getElementById("div" + i).addEventListener("click", function(e) {
		alert(i); // 都是4
	});
}

// 解决
for(var i = 1; i < 4; i++) {
	(function(i) {
		document.getElementById("div" + i).addEventListener("click", function(e) {
			alert(i); // 1, 2, 3
		});
	})(i);
}
```

## 2、封装 ##

```javascript
(function() {
	var _userId = 123;
	var _typeId = "item";
	var _export = {};

	function converter(userId) {
		return _userId;
	}

	_export.getUserId = function() {
		return converter(_userId);
	}

	_export.getTypeId = function() {
		return _typeId;
	}

	window._export = _export;
}());

_export.getUserId(); // 123
_export.getTypeId(); // item
_export._userId; // undefined
_export._typeId; // undefined
_export.converter; // undefined
```

## 3、全局/函数/eval ##

```javascript
var a = 10; // 全局
(function(){
	var b = 20; // 局部
})();
console.log(a); // 10
console.log(b); // error

for(var item in {a:1, b:2}) {
	console.log(item); // a b
}
console.log(item); // b

eval("var c = 1;"); 
console.log(c); // 1
```

*解析：* 由于没有块作用域，所以```var item ```相当于```var a ```是一个全局变量。b则是一个函数变量，只能在函数内有效，eval则在严格模式下外部是取不到eval作用域下的变量的。

## 5、作用域链 ##

```javascript
function outer2() {
	var local2 = 2;
	function outer1() {
		var local1 = 1;
		console.log(local1 + "---" + local2 + "---" + global3); // 1 2 3
	}
	outer1();
}
var global3 = 3;
outer2();

function outer() {
	var i = 1;
	var func = new Function("console.log(typeof i);");
	func(); // undefined
}
outer();
```

## 6、作用域封装 ##

```javascript
// 函数表达式
(function() {
	var a, b;
})();

// 函数表达式
!function() {
	var a, b;
}();
```
总结：这样的好处就是将变量作用域封装为函数内部作用域，防止跟全局变量发生冲突