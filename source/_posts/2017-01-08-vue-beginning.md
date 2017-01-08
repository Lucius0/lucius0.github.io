---
layout: post
title:  "Vue.js 初体验"
date:   2017-01-08
categories: front-end
permalink: /archivers/vue-beginning
tags: vue
---

## 介绍

Vue.js 主要是利用到ECMAScript 5的特性，因此IE 8以下的浏览器都不支持，可以通过(caniuse)[http://caniuse.com/#feat=es5]来查看浏览器的支持情况。

[官方](http://doc.vue-js.com/v2/guide/index.html)的介绍是：

Vue.js（读音 /vjuː/, 类似于 view） 是一套构建用户界面的 渐进式框架。与其他重量级框架不同的是，Vue 采用自底向上增量开发的设计。Vue 的核心库只关注视图层，并且非常容易学习，非常容易与其它库或已有项目整合。另一方面，Vue 完全有能力驱动采用[单文件组件](http://doc.vue-js.com/v2/guide/single-file-components.html)和[Vue生态系统支持的库](http://github.com/vuejs/awesome-vue#libraries--plugins)开发的复杂单页应用。

Vue.js 的目标是通过尽可能简单的 API 实现响应的数据绑定和组合的视图组件。

如果你是有经验的前端开发者，想知道 Vue.js 与其它库/框架的区别，查看[对比其它框架](http://doc.vue-js.com/v2/guide/comparison.html)。

![](/images/vue/vue-01.jpeg)

其中`view`对应如下类似dom代码

```html
<div id="app">
	<p>{{msg}}</p>
</div>
```

`model`则为POJO，

`var data = {msg: 'hello'}`

所以vue.js充当的就是vm，数据层以及视觉层的桥梁

```javascript
var app = new Vue({
	el: '#app',
	data: {
		msg: data.msg
	}
})
```

**组件系统**

![](/images/vue/vue-02.png)

## 安装

### 直接引入

```html
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	<dir id="app"></dir>
</body>
<script src="scripts/vue.js"></script>
<script>
new Vue({
	el: '#app',
})
</script>
</html>
```

### 通过vue-cli

全局安装vue-cli就可以了

`npm install --global vue-cli`

详细的可以[查看](http://doc.vue-js.com/v2/guide/installation.html)

## 基本属性及其方法

可以查看[官网的API](http://doc.vue-js.com/v2/api/)，v1.0 跟 v2.0 有区别。建议好好研究一下，在这里就不再赘述了。

那么父节点，或者说是根结点的结构是怎么样的呢？

```javascript
var app = new Vue({
	el: '#app',
	components: {
		'header-component': headerComponent,
		'body-component': bodyComponent,
		'footer-component': footerComponent
	},
	data: {
		...
	},
	methods: {
		...
	},
	beforeCreate () {},
	created () {},
	beforeMount () {},
	...
})
```

组件的组织结构

```javascript
var component = Vue.extend({
	template: '#component',
	components: {
		'child-header-component': childHeaderComponent
	},
	props: {},
	events: {},
	methods: {},
	...
})
```

## 工作原理

![](/images/vue/vue-03.png)

vue是通过数据劫持的方式来做数据绑定的，其核心方法就是通过`Object.defineProperty()`来实现对属性的劫持。前面有提到这就是为什么不能支持IE 8以下的版本。要实现mvvm，需要实现以下的条件：

1. 实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动根据新老值的对比进行更新；

2. 实现一个指令解析器Compile，对元素节点的指令进行遍历并且解析，根据指令来替换数据，并且更新函数；

3. 实现一个watcher，作为Observer以及Compile的桥梁，能够订阅并且接收属性变动的通知，执行指令绑定相对应的回调函数，从而刷新视图；

4. 实现mvvm入口，组织上面的三个模块。

![](/images/vue/vue-04.jpeg)

```javascript
var data = { a: 1 }
var vm = new Vue({
  data: data
})
vm.a === data.a // -> true
// 设置属性也会影响到原始数据
vm.a = 2
data.a // -> 2
// ... 反之亦然
data.a = 3
vm.a // -> 3
```

## 生命周期

以下是 v2.0 的生命周期图

![](/images/vue/vue-05.png)

而这是 v1.0 的生命周期图

![](/images/vue/vue-06.png)

所以说v1.0跟v2.0还是有很大的差别的。

| v1.0          | v2.0          | 描述        |
| ------------- | ------------- | ----------- |
| init          | beforeCreate  | 组件实例刚被创建，组件属性计算之前，如 data 属性等 |
| created       | created       | 组件实例创建完成，属性已绑定，但 DOM 还未生成，`$el` 属性还不存在 |
| beforeCompile | beforeMount   | 模板编译/挂载之前 |
| compiled      | mounted       | 板编译/挂载之后 |
| ready         | mounted       | 模板编译/挂载之后（不保证组件已在 document 中） |
| -             | beforeUpdate  | 组件更新之前 |
| -             | updated       | 组件更新之后 |
| -             | activated     | for `keep-alive`，组件被激活时调用 |
| -             | deactivated   | for `keep-alive`，组件被移除时调用 |
| attached      | -             | - |
| detached      | -             | - |
| beforeDestory | beforeDestory | 组件销毁前调用 |
| destoryed     | destoryed     | 组件销毁后调用 |

## 数据绑定

```javascript
普通文本：`{{ }}`

纯html：`<div v-html="rawHtml"></div>`

*Mustache*不能用于html属性，应使用`v-bind`指令

`<div v-bind:id="dynamicId"></div>`

javascript表达式

`{{ number + 1 }}`

`{{ ok ? 'YES' : 'NO' }}`

`{{ message.split('').reverse().join('') }}`

`<div v-bind:id="'list-' + id"></div>`

**注意：** Vue每个绑定只能包含**单个表达式**，如以下的则不会生效。

<!-- 这是语句，不是表达式 -->
{{ var a = 1 }}
<!-- 流控制也不会生效，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

## 指令

- v-text：更新元素的 `textContent`。如果要更新部分的 `textContent` ，需要使用 {% raw %} {{ Mustache }} {% endraw %} 插值。

- v-html：更新元素的 `innerHTML` 。注意：**内容按普通 HTML 插入 - 不会作为 Vue 模板进行编译。**

- v-show：根据表达式之真假值，切换元素的 `display` CSS 属性。当条件变化时该指令触发过渡效果。

- v-if：根据表达式的值的真假条件渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。如果元素是 `<template>` ，将提出它的内容作为条件块。当条件变化时该指令触发过渡效果。

- v-else、v-else-if：前一兄弟元素必须有 `v-if` 或 `v-else-if`。

- v-for：基于源数据多次渲染元素或模板块。此指令之值，必须使用特定语法 `alias in expression`，如`item in items`或`(item, index) in items`，同js的遍历，不局限于遍历数据结构，还可以遍历对象属性，当遍历对象时，可以`(value, key, index) in object`。

- v-on：绑定事件监听器。事件类型由参数指定。

 **修饰符：**

 - .stop - 调用`event.stopPropagation()`

 - .prevent - 调用 `event.preventDefault()`

 - .capture - 添加事件侦听器时使用 capture 模式。

 - .self - 只当事件是从侦听器绑定的元素本身触发时才触发回调。

 - {keyCode | keyAlias} - 只当事件是从侦听器绑定的元素本身触发时才触发回调。

 - .native - 监听组件根元素的原生事件。

 **用法：**

 用在普通元素上时，只能监听 原生 DOM 事件。用在自定义元素组件上时，也可以监听子组件触发的自定义事件。在监听原生 DOM 事件时，方法以事件为唯一的参数。如果使用内联语句，语句可以访问一个 `$event` 属性： `v-on:click="handle('ok', $event)"`。

- v-bind：动态地绑定一个或多个特性，或一个组件 prop 到表达式。在绑定 `class` 或 `style` 特性时，支持其它类型的值，如数组或对象。

 **参考：**[Class 与 Style 绑定](https://cn.vuejs.org/v2/guide/class-and-style.html)和[组件 - 组件 Props](https://cn.vuejs.org/v2/guide/components.html#Props)

- v-model：在表单控件或者组件上创建双向绑定。

 **修饰符：**

 - `.lazy` - 取代 `input` 监听 `change` 事件

 - `.number` - 输入字符串转为数字

 - `.trim` - 输入首尾空格过滤

 **限制：**

 - `<input>`

 - `<select>`

 - `<textarea>`

 - components

- v-pre：跳过这个元素和它的子元素的编译过程。可以用来显示原始 Mustache 标签。跳过大量没有指令的节点会加快编译。

- v-cloak：个指令保持在元素上直到关联实例结束编译。和 CSS 规则如 `[v-cloak] { display: none }` 一起用时，这个指令可以隐藏未编译的 Mustache 标签直到实例准备完毕。

 **用法：**

 ```javascript
 [v-cloak] {
   display: none;
 }

 <div v-cloak>
   {{ message }}
 </div>

 // 不会显示，直到编译结束。
 ```
 
- v-once：只渲染元素和组件一次。随后的重新渲染,元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

## 计算属性

虽然可以通过{% raw %} {{ }} {% endraw %} 可以绑定数据，但是太重的逻辑会使得模板过重难以维护，因此`computed`运营而生。

官方demo

```javascript
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: "{{ reversedMessage }}"</p>
</div>

var vm = new Vue({
  el: '#example',
  data: {
    message: 'Hello'
  },
  computed: {
    // a computed getter
    reversedMessage: function () {
      // `this` points to the vm instance
      return this.message.split('').reverse().join('')
    }
  }
})

// 只要 message 不发生变化，多次访问 reversedMessage 计算属性会立即返回之前的计算结果，而不必再次执行函数
```

1、computed VS methods：`computed`基于依赖缓存，而`methods`则会每次执行函数，什么意思呢？`computed`只要相关依赖不发生改变，则不会重新取值，而`methods`则无论是否依赖会改变，都会重新调用函数计算一次。*当数据量大时，可以考虑有`computed`，而当你不想要有缓存则可以用`methods`*

```javascript
// 计算属性将不会更新，因为 Date.now() 不是响应式依赖
computed: {
  now: function () {
    return Date.now()
  }
}
```

2、computed VS $watch：`$watch`是观察Vue实例上数据变动，当数据发生变化时，`$watch`可以监听到其变化并作出相对应的逻辑处理。`$watch`跟`computed`使用场景只能视情况而定。

```javascript
<div id="demo">{{ fullName }}</div>

// $watch
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar',
    fullName: 'Foo Bar'
  },
  watch: {
    firstName: function (val) {
      this.fullName = val + ' ' + this.lastName
    },
    lastName: function (val) {
      this.fullName = this.firstName + ' ' + val
    }
  }
})

// computed
var vm = new Vue({
  el: '#demo',
  data: {
    firstName: 'Foo',
    lastName: 'Bar'
  },
  computed: {
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
```

`computed` 相比 `$watch` 简单多。

3、计算属性默认情况下只有`getter`，并没有`setter`，我们可以提供

```javascript
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
```

## Class 与 Style 绑定

class：

```javascript
<div v-bind:class="{ active: isActive }"></div>
======================================================================
<div class="static"
     v-bind:class="{ active: isActive, 'text-danger': hasError }">
</div>
data: {
  isActive: true,
  hasError: false
}
======================================================================
<div v-bind:class="classObject"></div>
data: {
  classObject: {
    active: true,
    'text-danger': false
  }
}
======================================================================
<div v-bind:class="[activeClass, errorClass]">
data: {
  activeClass: 'active',
  errorClass: 'text-danger'
}
======================================================================
<div v-bind:class="[isActive ? activeClass : '', errorClass]">
<div v-bind:class="[{ active: isActive }, errorClass]">

```

style：

```javascript
<div v-bind:style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
data: {
  activeColor: 'red',
  fontSize: 30
}
======================================================================
<div v-bind:style="styleObject"></div>
data: {
  styleObject: {
    color: 'red',
    fontSize: '13px'
  }
}
======================================================================
<div v-bind:style="[baseStyles, overridingStyles]">
```

## 列表渲染

### key

相关内容可以查看指令中的`v-for`，这里只讲述`key`，v2.0的`key`跟v1.0的`track-by`存在的意义一样，都是给每一项一个唯一标志符，这里需要利用到`v-bind`将`key`绑定起来。

```html
<div v-for="item in items" :key="item.id">
  <!-- 内容 -->
</div>
```

**注意事项：**由于js的限制， Vue 不能检测以下变动的数组：

1、当你利用索引直接设置一个项时，例如： `vm.items[indexOfItem] = newValue`

解决方法：

```javascript
// Vue.set
Vue.set(example1.items, indexOfItem, newValue)
// 或
// Array.prototype.splice`
example1.items.splice(indexOfItem, 1, newValue)
```

2. 当你修改数组的长度时，例如： `vm.items.length = newLength`

解决方法：

```javascript
example1.items.splice(newLength)
```

### 过滤|排序

```javascript
<li v-for="n in evenNumbers">{{ n }}</li>
data: {
  numbers: [ 1, 2, 3, 4, 5 ]
},
computed: {
  evenNumbers: function () {
    return this.numbers.filter(function (number) {
      return number % 2 === 0
    })
  }
}

======================================================================

<li v-for="n in even(numbers)">{{ n }}</li>
data: {
  numbers: [ 1, 2, 3, 4, 5 ]
},
methods: {
  even: function (numbers) {
    return numbers.filter(function (number) {
      return number % 2 === 0
    })
  }
}
```



















