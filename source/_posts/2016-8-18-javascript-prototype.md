---
layout: post
title:  "JavaScript之十 - prototype"
date:   2016-08-18
categories: front-end
permalink: /archivers/javascript-prototype
tags: javascript
---

下面这段是ECMAScript关于原型的解释

> ECMAScript does not contain proper classes such as those in C++, Smalltalk, or Java, but rather, supports constructors which create objects by executing code that allocates storage for the objects and initialises all or part of them by assigning initial values to their properties. All constructors are objects, but not all objects are constructors. Each constructor has a Prototype property that is used to implement prototype-based inheritance and shared properties. Objects are created by using constructors in new expressions; for example, new String("A String") creates a new String object. Invoking a constructor without using new has consequences that depend on the constructor. For example, String("A String") produces a primitive string, not an object.

> ECMAScript supports prototype-based inheritance. Every constructor has an associated prototype, and every object created by that constructor has an implicit reference to the prototype (called the object's prototype) associated with its constructor. Furthermore, a prototype may have a non-null implicit reference to its prototype, and so on; this is called the prototype chain. When a reference is made to a property in an object, that reference is to the property of that name in the first object in the prototype chain that contains a property of that name. In other words, first the object mentioned directly is examined for such a property; if that object contains the named property, that is the property to which the reference refers; if that object does not contain the named property, the prototype for that object is examined next; and so on.

以下转自知乎**[doris](https://www.zhihu.com/question/34183746/answer/58155878?from=profile_answer_card)**的回答

首先，在JS中，除了基本类型{% post_link /archivers/javascript-data-types 基本类型 %}，其他的都为对象，Function也是对象，Function.prototype也是对象，因此都有隐式原型**__proto__**，指向了该对象的构造函数的原型，这保证了实例能够访问在构造函数原型中定义的属性和方法。

方法(Function)则除了以上的**__proto__**属性以外，还有**prototype**这个**原型对象**，这个属性是一个指针，指向一个对象，这个对象的用途就是包含所有实例共享的属性和方法(prototype)。原型对象也有一个属性，叫做**constructor**，这个属性包含了一个指向原构造函数的指针。

![](/images/javascript/javascript-prototype.jpg)

由图我们可以看出

1. **构造函数Foo** ：构造函数的原型属性**Foo.prototype**指向了原型对象，在原型对象里有共有的方法，所有构造函数声明的实例(f1, f2)都可以共享这个方法。

2. **原型对象Foo.prototype** ：原型对象保存着实例共享的方法，有一个constructor指回构造函数。

3. **实例** ：f1和f2是Foo这个对象的两个实例，这个两个对象也有属性**__proto__**，指向构造函数的原型对象，这样子就可以想*1*那样访问原型对象的所有方法。

另外，构造函数Foo()除了是方法，还是个对象，它也有**__proto__**属性，指向它的构造函数的原型对象。函数的构造函数是Function，因此这里的**__proto__**指向了**Function.prototype**。

原型对象同样是属于对象，它的**__proto__**属性指向它的构造函数的原型对象，即**Object.prototype**。

最后，Object.prototype的**__proto__**属性指向null。

*注意：* `typeof null`返回object是由于历史原因导致的，实际上ECMA规范尝试把`typeof null`返回值改为"null"，但是会导致很多旧的代码出现问题，因此又改回来了。所以说null并不是一个对象，而是一个基础类型。在**[stackoverflow](http://stackoverflow.com/questions/18808226/why-is-typeof-null-object)**有详细的说明。

**总结：**

1. 对象有属性**__proto__**，指向该对象的构造函数的原型对象；

2. 方法除了有属性**__proto__**，还有属性**prototype**，指向该方法的原型对象。






