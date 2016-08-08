---
layout: post
title:  "JavaScript之一 - 数据类型"
date:   2016-08-07
categories: javascript
permalink: /archivers/javascript-data-types
tags: javascript
publish: false
---

javascript 因为是弱类型，所以声明类型可以省略

## 1. **六种基本类型** ##

   基础类型：number、string、boolean、null、undefined

   对象类型：object(Function、Array、Date)
	
## 2. **隐式转换** ##

   ("num" - 0) -> number; (num + "") -> string

 - 等于(会发生隐式转换)

      true："1.23" == 1.23；0 == false；null == undefined；new Object() == new Object()；[1,2] == [1,2]；new String("hi") == "hi"

 - 严格等于(会判断两边的类型，类型不同则为false，反之判断值是否相同)

      true：null === null；undefined === undefined；

      false：NaN === NaN；NaN == NaN；null === undefined；new Object() === new Object()

## 3. **包装对象** ##

   ```console.log("string")```跟```console.log(new String("string"))```是不同的。

   ```var a = "string"; console.log(a.length); // 6 ```即表明在访问属性的时候会将a临时封装成对象，但访问完之后，临时对象也会被销毁。```a.t = 10;```封装a的临时包装对象，赋值结束后，临时对象会被销毁。```console.log(a.t);//undefined```临时对象被销毁了。

## 4. **类型检测** ##
	
	typeof、instanceof、Object.prototype.toString

 - typeof

      typeof 100 "number"、typeof true "boolean"、typeof function "function"、typeof undefined "undefined"

      typeof new Object() "object"、typeof[1,2] "object"、typeof NaN "number"、typeof null "object"(注意不是null，而是object)

 - instanceof(基于原型链判断的操作符，可以判断是否为具体的类型)

      **原理**：```object instanceof Object```左边的操作数的对象的原型链上是否有右边构造函数的prototype属性

      ```[1,2] instanceof Array "true"```、```new Object() instanceof Array "false"```

      **注意**：不同window或iframe间的对象类型检测不能使用instanceof

{% highlight javascript %}
function Person() {}
function Student() {}
Student.prototype = new Person(); // Person
Student.prototype.construtor = Student; // function Student(){}
var o = new Student();
o instanceof Student; // true
o instanceof Person; // true
var oo = new Person();
oo instanceof Person; // true
oo instanceof Student; // false
{% endhighlight %}

 - Object.prototype.toString

{% highlight javascript %}
Object.prototype.toString.apply([]); // [object Array]
Object.prototype.toString.apply(function(){}); // [object Function]
Object.prototype.toString.apply(null); // [object Null]
Object.prototype.toString.apply(undefined); // [object Undefined]
{% endhighlight %}

 **注意**：IE/6/7/8 ``` Object.prototype.toString.apply(null); // [object Object] ```

 **总结：** typeof 适合基本类型及function检测，遇到null失效；Class通过{}.toString拿到，适合内置对象和基本类型，遇到null和undefined失效(IE 6/7/8返回[object Object])；instanceof适用自定义对象，也可以用来检测原生对象，在不同iframe和window间检测时失效。
 <!-- ![sss]({{site.baseurl}}/images/javascript/JavaScript-data-types-01.png) -->

