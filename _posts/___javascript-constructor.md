---
layout: post
title:  "JavaScript之十三 - 构造函数"
date:   2016-08-25 xx:xx:xx
categories: javascript
permalink: /archivers/javascript-constructor
tags: javascript
publish: false
---

构造函数的作用是创建多个共享特定特性和行为，并具有默认属性和属性方法的对象。 可以查看**[prototype]({{site.baseurl}}/archivers/javascript-prototype)**这一章。

如果说"构造函数只是一个函数"这种说法也是对的，除非使用**new**关键字来调用该函数，例如```new String("test")```。使用**new**的话，javascript则会将该函数的**this**值设置为正在构建的新对象，并且还默认返回新创建的对象**(this)**。因此返回的新对象则被认为是构造该对象的构造函数的实例。

```javascript
// Person 是一个构造函数，可以使用new关键字进行实例化
var Person = function Person(living, age, gender) {
	// this表示即将创建的新对象(即，this = new Object();)
	this.living = living;
	this.age = age;
	this.gender = function() { return this.gender; };
	// 一旦Person函数使用new关键字调用，就返回this，而不是undefined
}

var p = new Person(true, 11, 'male');
console.log(typeof p); // 输出object
console.log(p); // p内部属性和值
console.log(p.constructor); // 输出Person函数
```

未完待续...