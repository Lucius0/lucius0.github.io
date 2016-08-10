---
layout: post
title:  "JavaScript之四 - 对象"
date:   2016-08-09
categories: javascript
permalink: /archivers/javascript-object
tags: javascript
publish: false
---

对象中包含一系列属性，这些属性是无序的。每个属性都有一个字符串key和对应的value。(无序，key为字符串)

## 1、对象结构 ##

拥有```[[proto]]、[[class]](属于哪个类)、[[extensible]](是否允许添加新的属性)、writable、enumerable、configurable、value、get/set```

## 2、new/原型链 ##

```javascript
function foo() {}
foo.prototype.z = 3;

var obj = new foo();
obj.y = 2;
obj.x = 1;

obj.x; // 1
obj.y; // 2
obj.z; // 3

typeof obj.toString; // "function"
"z" in obj; // true
obj.hasOwnProperty("z"); //false
```

*解析：*

- ```var obj = new foo();``` obj的[[proto]]则会指向foo.prototype, 而foo的prototype则会指向Object.prototype，Object.prototype则会指向null

- ```foo.prototype.z = 3;``` 在foo.prototype添加一个属性z

- ```obj.z``` 会先从obj查找是否有z这个属性，然后再查找obj的[[proto]]，即foo.prototype

- ```obj.toString``` 该方法是在Object.prototype中，即Object.prototype.toString();

```javascript
obj.z = 5;

obj.hasOwnProperty("z"); // true
foo.prototype.z; // 3
obj.z; // 5

obj.z = undefined;
obj.z; // undefined

delete obj.z; // true
obj.z; // 3

delete obj.z; // true
obj.z; // 3
```

*解析：*

- ```obj.z = 5;``` 赋值不会因为obj没有z属性而继续往prototype找是否有这个属性，从而修改prototype的属性，什么意思呢？就是obj没有z属性，则只会在obj添加新的z属性，反而foo.prototype.z的值不会被修改。

- ```obj.hasOwnProperty("z");	foo.prototype.z;	obj.z;``` z的属性是添加到obj上的，foo.prototype.z是不会受到影响的，依旧保留。

- ```obj.z = undefined;		obj.z;		foo.prototype.z;``` 同理

- ```delete obj.z;		obj.z;		delete obj.z;		obj.z;``` delete 删除的只是obj的属性，而不会影响foo.prototype的属性，但当obj的z被删除后，obj.z查找步骤又跟之前一样会到foo.prototype原型链去查找。

## 3、Object.create ##

```javascript
var obj = Object.create({x: 1});
obj.x; // 1
typeof obj.toString; // "function"
obj.hasOwnProperty("x"); // false

var obj = Object.create(null);
obj.toString; // undefined
```

*解析：*

- ```var obj = Object.create({x:1});``` 利用Object.create，则会创建一个新的对象，其原型链则指向参数。即```obj -> {x:1} -> Object.prototype -> null ```

- ```obj.x; // 1``` 调用原型链上的参数

## 4、属性操作 ##

### 4.1 属性读写 ###

```javascript
var obj = {x:1};
obj.x; // 读
obj.x = 2; // 写
```

### 4.2 异常 ###

```javascript
var obj = {x:1};
obj.y; // undefined
var yx = obj.y.z; // TypeError : Cannot read property "z" of undefined
obj.y.z = 2; // TypeError : Cannot set property "z" of undefined，假如 obj.y = 1; obj.y.z=2; 则不会报错
```

### 4.3 删除 ###

```javascript
delete Object.prototype; // false, 这是因为Object.prototype的configurable为false
var descriptor = Object.getOwnPropertyDescriptor(Object, "prototype");
descriptor.configurable; // false，这样就无法delete Object.prototype
```

总结：

- 是无法删除基本类型的，例如：```var a = 1;		delete a; // false``` 

- 是无法删除函数声明的，例如：```function func(){};		delete func; // false```

- 可以删除隐式的全局变量，例如：```a = 1; 		window.a; // 1		delete a; //true```

- 可以删除eval定义变量，例如：```eval("var x = 1");		delete x; //true

### 4.4 检测 ###

- ```"x" in obj;``` 不仅仅会在该对象找，还会沿原型链上找

- ```obj.hasOwnProperty("x")``` 只会在该对象找，不会到沿原型链上找

- ```obj.propertyIsEnumeratable``` 是否可枚举

- ```Object.defineProperty(obj, propertyName, propertyArgsObject);```

```javascript
Object.defineProperty(obj, "x", {enumeratable: false, value: 1000});
obj.propertyIsEnumerable("x"); // false
obj.hasOwnProperty("x"); // true
```

## 5、getter/setter ##

用法：

```javascript
var obj = {
	_x:1,

	get x() {
		return _x;
	},

	set x(val) {
		_x = val;
	}
};
```

栗子：

```javascript
function foo(){}
Object.defineProperty(foo.prototype, "z", {get: function(){return 1;}});

var obj = new foo();
obj.z; // 1
obj.z = 10;
obj.z; // 1

Object.defineProperty(obj, "z", {value: 100, configurable: true});
obj.z; // 100
delete obj.z; // true
obj.z; // 1
```

*解析：*

- ```Object.defineProperty(foo.prototype, "z", {get: function(){return 1;}});``` 给foo的原型链创建属性z，并给其属性声明get方法

- ```obj.z``` 调用原型链z

- ```obj.z = 10``` 由于原型链有getter方法，表明该属性在原型链上只读不可写，同时也不会给原型链上创建新属性

- ```obj.z``` 依旧调用原型链getter方法

- ```Object.defineProperty(obj, "z", {value: 100, configurable: true});``` 在obj上创建新属性z，并设置configurable为true，值为100

- ```obj.z // 100 ``` 调用obj本身的属性z 

- ```delete obj.z``` 因为configurable为true，因此可以删除

- ```obj.z``` obj上的z被删除了，所以会重新从原型链上查找z属性

```javascript
var o = {};
Object.defineProperty(o, "x", {value: 1}); // writable = false, configurable = false;
var obj = Object.create(o);
```

*解析：* 没啥解释

## 6、属性标签 ##

```javascript
// Object.getOwnPropertyDescriptor(obj, propertyName);

var person = {};
Object.defineProperty(person, "name", {configurable: false, writable: false, enumerable: true, value: "Test"});
Object.keys(person); // ["name"]
person.name; // Test;
person.name = "Test2";
person.name; // Test
delete person.name; // false
```

*解析：*

-```Object.keys(person)``` 获取该对象所有可枚举的属性

- ```Object.getOwnPropertyDescriptor(obj, propertyName)``` 获取对象描述器，第一个参数是获取描述的对象，第二个参数是该对象的属性，若不存在则返回undefined，反之则返回该对象的属性配置

- ```Object.defineProperty(person, "name", {configurable: false, writable: false, enumerable: true, value: "Test"})``` 定义属性的配置，第一个参数是对象，第二个属性是不存在于该对象的属性，第三个则定义该对象的属性描述器对象

![javascript-object-01]({{site.baseurl}}/images/javascript/javascript-object-01.PNG);