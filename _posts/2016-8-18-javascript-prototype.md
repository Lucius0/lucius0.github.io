---
layout: post
title:  "JavaScript之十 - prototype"
date:   2016-08-18
categories: javascript
permalink: /archivers/javascript-prototype
tags: javascript
publish: false
---

下面这段是ECMAScript关于原型的解释

> ECMAScript does not contain proper classes such as those in C++, Smalltalk, or Java, but rather, supports constructors which create objects by executing code that allocates storage for the objects and initialises all or part of them by assigning initial values to their properties. All constructors are objects, but not all objects are constructors. Each constructor has a Prototype property that is used to implement prototype-based inheritance and shared properties. Objects are created by using constructors in new expressions; for example, new String("A String") creates a new String object. Invoking a constructor without using new has consequences that depend on the constructor. For example, String("A String") produces a primitive string, not an object.

> ECMAScript supports prototype-based inheritance. Every constructor has an associated prototype, and every object created by that constructor has an implicit reference to the prototype (called the object's prototype) associated with its constructor. Furthermore, a prototype may have a non-null implicit reference to its prototype, and so on; this is called the prototype chain. When a reference is made to a property in an object, that reference is to the property of that name in the first object in the prototype chain that contains a property of that name. In other words, first the object mentioned directly is examined for such a property; if that object contains the named property, that is the property to which the reference refers; if that object does not contain the named property, the prototype for that object is examined next; and so on.