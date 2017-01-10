---
layout: post
title:  "Vue.js 组件"
date:   2017-01-10
categories: front-end
permalink: /archivers/vue-component
tags: vue
---

## 介绍

组件（Component）是 Vue.js 最强大的功能之一。组件可以扩展 HTML 元素，封装可重用的代码。在较高层面上，组件是自定义元素， Vue.js 的编译器为它添加特殊功能。在有些情况下，组件也可以是原生 HTML 元素的形式，以 is 特性扩展。

![](/images/vue/vue-02.png)

## 注册

### 全局注册

`Vue.component(tagName, options)`

如：

```javascript
// define
var myComponent = Vue.extend({
	template: '#template'
})

// register
Vue.component('my-component', myComponent)

// create a root instance
new Vue({
  el: '#app'
})
```

### 局部注册

通过使用组件实例选项注册，可以使组件**仅在另一个实例/组件的作用域**中可用：

```javascript
var Child = {
  template: '<div>A custom component!</div>'
}
new Vue({
  // ...
  components: {
    // <my-component> 将只在父模板可用
    'my-component': Child
  }
})
```

## data

组件的`data`必须是函数。

```javascript
var data = { a : 1}

// wrong 
var c1 = Vue.extend({
	data: data
})

// right
var c2 = Vue.extend({
	data () {
		return { a : 1}
	}
})
```

## 协同工作

在 Vue.js 中，父子组件的关系可以总结为 props down, events up 。父组件通过 props 向下传递数据给子组件，子组件通过 events 给父组件发送消息。

### props

组件实例的作用域是**孤立**的，`props`是单向的，只能由父组件传递给子组件，反之则会报错。

```javascript
Vue.component('child', {
  // 声明 props
  props: ['message'],
  // 就像 data 一样，prop 可以用在模板内
  // 同样也可以在 vm 实例中像 “this.message” 这样使用
  template: '<span>{{ message }}</span>'
})

<child message="hello!"></child>
```

结果

```html
<span>hello</span>
```

**注意：**

1、html不区分大小写，`prop`会从 camelCase转为 kebab-case

```javascript
Vue.component('child', {
  // camelCase in JavaScript
  props: ['myMessage'],
  template: '<span>{{ myMessage }}</span>'
})

// ===>>

<!-- kebab-case in HTML -->
<child my-message="hello!"></child>
```















