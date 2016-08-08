---
layout: post
title:  "JavaScript之二 - 表达式"
date:   2016-08-07
categories: javascript
permalink: /archivers/javascript-expression
tags: javascript
publish: false
---
## 1. **delete** ##

{% highlight javascript %}
var obj = {x:1};
obj.x; // 1
delete obj.x;
obj.x; // undefined

var obj1 = {};
Object.defineProperty(obj1, "x", {
	configurable: false, // configurable为false表示该值无法删除
	value: 1
});
delete obj1.x; // false
obj1.x; // 1
{% endhighlight %}

## 2. **in** ##

{% highlight javascript %}
window.x = 1; //全局变量
"x" in window; // true
{% endhighlight %}

## 3. **new** ##

{% highlight javascript %}
function Foo(){}
Foo.prototype.x = 1;
var obj = new Foo();
obj.x; // 1
obj.hasOwnProperty("x"); // false
obj.__proto__.hasOwnProperty("x"); // true
{% endhighlight %}

## 4. **this** ##

{% highlight javascript %}
this; // window
var obj = {fun:function() { return this; }};
obj.func(); // obj
{% endhighlight %}

## 5. **void** ##

{% highlight javascript %}
void 0; // undefined
void (0); // undefined
{% endhighlight %}
