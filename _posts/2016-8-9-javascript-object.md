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


