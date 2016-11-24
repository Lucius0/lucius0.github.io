---
layout: post
title:  "JavaScript之九 - OOP"
date:   2016-08-14
categories: front-end
permalink: /archivers/javascript-oop
tags: javascript
---

## 1、基于原型链继承 ##

```javascript
function Foo() { this.y = 2; }
typeof Foo.prototype; // "object"
Foo.prototype.x = 1;
var obj3 = new Foo();
obj3.y; // 2
obj3.x; // 1

Foo.prototype = {
	constructor: Foo,
	__proto__: Object.prototype,
	x: 1
}
```

## 2、js继承的实例 ##

```javascript
function Person(name, age) {
	this.name = name;
	this.age = age;
}

Person.prototype.hi = function() {
	console.log(this.name, this.age);
}

Person.prototype.LEGS_NUM = 2;
Person.prototype.ARMS_NUM = 2;
Person.prototype.walk = function() {
	console.log(this.name + " is walking...");
}

function Student(name, age, className) {
	Person.call(this, name, age);
	this.className = className;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

// override
Student.prototype.hi = function() {
	console.log(this.name, this.age, this.className);
}

Student.prototype.learn = function(subject) {
	console.log(this.name, subject, this.className);
}

var boss = new Student("Boss", 1, "Class one");
boss.hi(); // boss 1 Class one
boss.LEGS_NUM; // 2
boss.walk(); // boss is walking...
boss.learn("math"); // boss math Class one
```

*解析：* `Person.prototype` 是让子类共享父类的方法，若没有prototype，则Student继承的时候，永远调用的都是父类的方法；`Object.create` 主要是重新实例化一个对象，并让Student的prototype指向这个对象，若不重新实例化，则给Student创建新方法的同时也会给Person.prototype创建对应的方法；`Student.prototype.constructor = Student`，会让Student的构造函数指向自身，否则指向父类的constructor

## 3、改变prototype ##

```javascript
Student.prototype.x = 101;
boss.x; // 101
Student.prototype = {y: 2};
boss.y; // undefined
boss.x; // 101
var lucius = new Student("lucius", 22, "Class two");
lucius.x; // undefined
lucius.y; // 2
```

*解析：* 当我们在原型上创建新的属性的时候，影响的是已创建的对象；但当我们将原型指向新的对象，则无法影响已创建的对象，反而会影响新的实例化对象。

## 4、内置构造器的prototype ##

```javascript
Object.prototype.x = 1;
var obj = {};
obj.x = 1;
for(var key in obj) {
	console.log(key); // x, 可以通过defineProperty将enumerable设置为false
}
```

## 5、实现继承方式 ##

```javascript
function Person() {}
function Student() {}
// 改变了Student的方法跟属性，同时也修改了Person的方法跟属性，无法实现重写
Student.prototype = Person.prototype;
// prototype 没有正确的指向
Student.prototype = new Person();
// 比较好的继承方法，但是create只有在ES5才有
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Person;

// 模拟create
if(!Object.create) {
	Object.create = function(proto) {
		function F() {};
		F.prototype = proto;
		return new F;
	}
}
```


## 6、模拟重载 ##

```javascript
function Person() {
	var args = arguments;
	if(typeof args[0] === "object" && args[0]) {
		if(args[0].name) {
			this.name = args[0].name;
		}

		if(args[0].age) {
			this.age = args[0].age;
		}
	} else {
		if(args[0]) {
			this.name = args[0];
		}

		if(args[1]) {
			this.age = args[1];
		}
	}
}

Person.prototype.toString = function() {
	return "name=" + this.name + " , age=" + this.age;
}

var obj = new Person("lucius", 24);
obj.toString(); // "name=lucius , age=24"
var obj2 = new Person({name: lucius0, age: 24});
obj.toString(); // "name=lucius , age=24"
```

## 7、调用基类的方法 ##

```javscript
superClass.prototype.methodName.call(this, arg0, arg1, arg2);
superClass.prototype.methodName.apply(this, args);
```

## 8、链式调用 ##

```javascript
function ClassManager() {
	ClassManager.prototype.addClass = function(str) {
		console.log("Class: " + str + " added.");
		return this; // this 指向ClassManager实例
	}
}

var manager = new ClassManager();
manager.addClass("classA").addClass("classB").addClass("classC");
```

## 9、模块化 ##

```javascript
// CASE 1
var moduleA;
moduleA = function() {
	var prop = 1;
	function func() {};
	return {
		func: func,
		prop: prop
	}
}

// CASE 2
var moduleA;
moduleA = function() {
	var prop = 1;
	function func() {};
	this.func = func;
	this.prop = prop;
}
```