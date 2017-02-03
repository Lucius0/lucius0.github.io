---
layout: post
title:  "Vue.js 2.0 源码学习"
date:   2017-01-20
categories: front-end
permalink: /archivers/code-review-for-vue
tags: vue
---

## Vue2.0 介绍

1.0版本正式发布后，就在业务中开始使用，将原先jQuery的功能逐步的进行迁移。16年10月1日，Vue2.0版本正式发布了，其中核心代码都进行了重写，于是就专门花时间，对Vue2.0的源码进行了学习。本篇文章就是2.0源码学习的总结。

先对Vue2.0的新特性做一个简单的介绍：

- **大小 & 性能**：Vue2.0的线上包gzip后只有12kb，而1.0需要22kb，react需要44kb。而且Vue2.0的性能在react等几个框架中，性能是最快的。

- **VDOM**：实现了virtual dom，并且将静态子树进行了提取，减少界面重绘时的对比。与1.0对比性能有明显提升。

- **Server Render**：2.0还对Server Render做了支持。

Vue的最新源码可以去[https://github.com/vuejs/vue](https://github.com/vuejs/vue)获得。本文讲的是2.0.3版本，2.0.3可以去[https://github.com/vuejs/vue/tree/v2.0.3](https://github.com/vuejs/vue/tree/v2.0.3)这里获得。

下面开始进入正题，首先从生命周期开始。

## 生命周期

![](/images/vue/vue-07.png)

上图就是官方给出的Vue 2.0的生命周期图，其中包含了Vue对象生命周期过程中的几个核心步骤。了解这几个过程，可以很好帮助我们理解Vue的创建与销毁过程。从图中我们可以看出，生命周期分为4个周期：

- **create**：`new Vue`时，会先进行create，创建出Vue对象。

- **mount**：根据`el，template，render`方法等属性，会生成DOM，并添加到对应位置。

- **update**：当数据发生变化后，会重新渲染DOM，并进行替换。

- **destroy**：销毁时触发。

那么这4个过程在源码中是怎么实现的？我们从`new Vue`中开始。

## new Vue

为了更好的理解new的过程，我整理了一个序列图：

![](/images/vue/vue-08.jpg)

new Vue的过程主要涉及到三个对象：`vm、compiler、watcher`。其中，`vm`表示`Vue`的具体对象；`compiler`负责将`template`解析为`AST render`方法；`watcher`用于观察数据变化，以实现数据变化后进行`re-render`。

下面来分析下具体过程和代码：

首先，运行`new Vue()`的时候，会进入代码`src/core/instance/index.js`的Vue构造函数中，并执行`this._init()`方法。在`_init`中，会对各个功能进行初始化，并执行`beforeCreate`和`created`两个生命周期方法。核心代码如下：

```javascript
initLifecycle(vm)
initEvents(vm)
callHook(vm, 'beforeCreate')
initState(vm)
callHook(vm, 'created')
initRender(vm)
```

> 这个过程有一点需要注意：`beforeCreate`和`create`之间只有`initState`，和官方给出的生命周期并不完全一样。这里的`initState`是用于初始化`data，props`等的监听的。

在`init`的最后，会运行`initRender`方法。在该方法中，会运行`vm.$mount`方法，代码如下：

```javascript
if (vm.$options.el) {
  vm.$mount(vm.$options.el)
}
```

> 这里的`vm.$mount`可以在业务代码中调用，这样，`new` 过程和 `mount` 过程就可以根据业务情况进行分离。

这里的`$mount`在`src/entries/web-runtime-with-compiler.js`中，主要逻辑是根据`el，template，render`三个属性来获得`AST render`方法。代码如下：

```javascript
if (!options.render) {   // 如果有render方法，直接运行mount
  let template = options.template
  if (template) {  // 如果有template， 获取template参数对于的HTML作为模板
    if (typeof template === 'string') {
      if (template.charAt(0) === '#') {
        template = idToTemplate(template)
      }
    } else if (template.nodeType) {
      template = template.innerHTML
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn('invalid template option:' + template, this)
      }
      return this
    }
  } else if (el) {  // 如果没有template, 且存在el，则获取el的outerHTML作为模板
    template = getOuterHTML(el)
  }
  if (template) { // 如果获取到了模板，则将模板转化为render方法
    const { render, staticRenderFns } = compileToFunctions(template, {
      warn,
      shouldDecodeNewlines,
      delimiters: options.delimiters
    }, this)
    options.render = render
    options.staticRenderFns = staticRenderFns
  }
}
return mount.call(this, el, hydrating)
```

> 这个过程有三点需要注意：
> 1、compile时，将最大的静态子树提取出来作为单独的AST渲染方法，以提升后面vNode对比时的性能。所以，当存在多个连续的静态标签时，可以在外边添加一个静态父节点，这样，staticRenderFns数目可以减少，从而提升性能。
> 2、Vue2.0 中的模板有三种引用方法：el，template，render(JSX)。其中优先级是render > template > el。
> 3、el，template两种写法，最后都会通过compiler转化为render(JSX)来运行，也就是说，直接写成render(JSX)的性能是最佳的。当然，如果使用了构建工具，最终生成的包就是使用的render(JSX)。这样子，在源码上就可以不用过多考虑这一块的性能了，直接用可维护性最好的方式就行。

将模板转化为render，用到了`compileToFunction`方法，该方法最后会通过`src/compiler/index.js`文件中的`compile`方法，将模板转化为AST语法结构的render方法，并对静态子树进行分离。

完成`render`方法的生成后，会进入`_mount(src/core/instance/lifecycle.js)`中进行DOM更新。该方法的核心逻辑如下：

```javascript
vm._watcher = new Watcher(vm, () => {
  vm._update(vm._render(), hydrating)
}, noop)
```

首先会new一个watcher对象，在watcher对象创建后，会运行传入的方法`vm._update(vm._render(), hydrating)` (watcher的逻辑在下面的watcher小节中细讲)。其中的`vm._render()`主要作用就是运行前面的compile生成的render方法，并返回一个vNode对象。这里的vNode就是一个虚拟的DOM节点。

拿到vNode后，传入 `vm._update()` 方法，进行DOM更新。

## VDOM

上面已经讲完了`new Vue`过程中的主要步骤，其中涉及到template如何转化为DOM的过程，这里单独拿出来讲下。先上序列图：

![](/images/vue/vue-09.jpg)

从图中可以看出，从template到DOM，有三个过程：

- **template -> AST render** (compiler解析template)

- **AST render -> vNode** (render方法运行)

- **vNode -> DOM** (vdom.patch)

首先template在compiler中解析为AST render方法的过程。上一节中有说到，`initState`后，会调用`src/entries/web-runtime-with-compiler.js`中的`Vue.prototype.$mount`方法。在`$mount`中，会获取template，然后调用`src/platforms/web/compiler/index.js`的`compilerToFunction`方法。在该方法中，会运行compile将template解析为多个render方法，也就是AST render。这里的compile在文件`src/compiler/index.js`中，代码如下：

```javascript
const ast = parse(template.trim(), options)   // 解析template为AST
optimize(ast, options)  // 提取static tree
const code = generate(ast, options)  // 生成render 方法
return {
  ast,
  render: code.render,
  staticRenderFns: code.staticRenderFns
}
```

可以看出，compile方法就是将template以AST的方式进行解析，并转化为render方法进行返回。

再看第二个过程，AST render -> vNode。这个过程很简单，就是将AST render方法进行运行，获得返回的vNode对象。

最后一步，vNode -> DOM。该过程中，存在vNode的对比以及DOM的添加修改操作。在上一节中，有讲到`vm._update()`方法中对DOM进行更新。`_update`的主要代码如下：

```javascript
// src/core/instance/lifecycle.js
if (!prevVnode) {
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating)  // 首次添加
} else {
  vm.$el = vm.__patch__(prevVnode, vnode)  // 数据变化后触发的DOM更新
}
```

可以看出，无论是首次添加还是后期的update，都是通过`__patch__`来更新的。这里的`__patch__`核心步骤是在`src/core/vdom/patch.js`中的patch方法进行实现，源码如下：

```javascript
function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (!oldVnode) {
      ...
    } else {
      ...
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)  // diff并更新DOM。
      } else {
        elm = oldVnode.elm
        parent = nodeOps.parentNode(elm)
        ...
        if (parent !== null) {
          nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm))  // 添加element到DOM。
          removeVnodes(parent, [oldVnode], 0, 0)
        }
        ...
      }
    }
    ...
  }
```

首先添加很简单，就是通过`insertBefore`将转换好的element添加到DOM中。如果update，则会调动`patchVNode()`。最后来看下`patchVNode`的代码：

```javascript
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  ...
  const elm = vnode.elm = oldVnode.elm
  const oldCh = oldVnode.children
  const ch = vnode.children
  ...
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {  // 当都存在时，更新Children
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {  // 只存在新节点时，即添加节点
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {  // 只存在老节点时，即删除节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {  // 删除了textContent
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) { // 修改了textContent
    nodeOps.setTextContent(elm, vnode.text)
  }
}
```

其中有调用了`updateChildren`来更新子节点，代码如下：

```javascript
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  ...
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      ...
    }
  }
  ...
}
```

可以看到`updateChildren`中，又通过`patchVnode`来更新当前节点。梳理一下，`patch`通过`patchVnode`来更新根节点，然后通过`updateChildren`来更新子节点，具体子节点，又通过`patchVnode`来更新，通过一个类似于递归的方式逐个节点的完成对比和更新。

> Vue 2.0中如何去实现VDOM的思路是否清晰，通过4层结构，很好的实现了可维护性，也为实现server render，weex等功能提供了可能。拿server render举例，只需要将最后`vNode -> DOM` 改成 `vNode -> String` 或 `vNode -> Stream`，就可以实现server render。剩下的compiler和Vue核心逻辑都不需要改。

## Watcher

我们都知道MVVM框架的特征就是当数据发生变化后，会自动更新对应的DOM节点。使用MVVM之后，业务代码中就可以完成不写DOM操作代码，不仅可以将业务代码聚焦在业务逻辑上，还可以提供业务的可维护性和可测试性。那么Vue2.0中是怎么实现对数据变化的监听呢？照例，先看序列图：

![](/images/vue/vue-10.jpg)

可以看出，整个Watcher的过程可以分为三个过程。

- 对state设置setter/getter

- 对vm设置好watcher，添加好state触发setter时的排序方法

- state变化触发执行

在前面有说过，在生命周期函数`beforeCreate`和`created`直接，会运行方法`initState()`。在`initState`中，会对props，data，computed等属性添加`setter/getter`。拿data举例，设置`setter/getter`的代码如下：

```javascript
function initData (vm: Component) {
  let data = vm.$options.data
  ...
  // proxy data on instance
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    ...
    proxy(vm, keys[i])   // 设置vm._data为代理
  }
  // observe data
  observe(data)
}
```

通过调用`observe`方法，会对data添加好观察者，核心代码为：

```javascript
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val
    if (Dep.target) {
      dep.depend()  // 处理好依赖watcher
      ...
    }
    return value
  },
  set: function reactiveSetter (newVal) {
    ...
    childOb = observe(newVal)  // 对新数据重新observe
    dep.notify()  // 通知到dep进行数据更新
  }
})
```

这个时候，对data的监听已经完成。可以看到，当data发生变化时，会运行dep.notify()。在notify方法中，会去运行watcher的update方法，内容如下：

```javascript
update () {
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
run () {
  if (this.active) {
    const value = this.get()
  }
  ...
}
```

`update` 方法中，`queueWatcher` 方法的目的是通过 `nextTicker` 来执行 `run` 方法，属于支线逻辑，就不分析了，这里直接看 `run` 的实现。`run` 方法其实很简单，就是简单的调用 `get` 方法，而 `get` 方法会通过执行 `this.getter()` 来更新DOM。

那么`this.getter`是什么呢？本文最开始分析`new Vue`过程时，有讲到运行`_mount`方法时，会运行如下代码：

```javascript
vm._watcher = new Watcher(vm, () => {
  vm._update(vm._render(), hydrating)
}, noop)
```

那么`this.getter`就是这里Watcher方法的第二参数。来看下`new Watcher`的代码：

```javascript
export default class Watcher {
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object = {}
  ) {
    ...
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
    ...
    this.value = this.lazy
      ? undefined
      : this.get()
  }
}
```

可以看出，在new Vue过程中，Watcher会在构造完成后主动调用this.get()来触发this.getter()方法的运行，以达到更新DOM节点。

总结一下这个过程：首先_init时，会对Data设置好setter方法，setter方法中会调用dep.notify()，以便数据变化时通知DOM进行更新。然后new Watcher时，会更新DOM的方法进行设置，也就是Watcher.getter方法。最后，当Data发生变化时候，dep.notify()运行，运行到watcher.getter()时，就会去运行render和update逻辑，最终达到DOM更新的目的。

## 总结和收获

刚开始觉得看源码，是因为希望能了解下Vue 2.0的实现，看看能不能得到一些从文档中无法知道的细节，用于提升运行效率。把主要流程理清楚后，的确了解到一些，这里做个整理：

- el属性传入的如果不是element，最后会通过`document.querySelector`来获取的，这个接口性能较差，所以，el传入一个element性能会更好。

- `$mount`方法中对html，body标签做了过滤，这两个不能用来作为渲染的根节点。

- 每一个组件都会从`_init`开始重新运行，所以，当存在一个长列表时，将子节点作为一个组件，性能会较差。

- `*.vue`文件会在构建时转化为render方法，而render方法的性能比指定template更好。所以，源码使用`*.vue`的方式，性能会更好。

- 如果需要自定义`delimiters`，每一个组件都需要单独指定。

- 如果是`*.vue`文件，制定`delimiters`是失效的，因为`vue-loader`对`*.vue`文件进行解析时，并没有将`delimiters`传递到`compiler.compile()`中。

转自：[https://segmentfault.com/a/1190000007484936](https://segmentfault.com/a/1190000007484936)

## 结构图

下面是取自[通过一张图走进 Vue 2.0](http://jiongks.name/blog/a-big-map-to-intro-vue-next/)的Vue2.0的结构图

![](/images/vue/vue-11.jpg)

------

**参考资料**

[详解vue的数据binding原理](http://www.cnblogs.com/dh-dh/p/5606596.html)

[Vue的事件解读](https://github.com/banama/aboutVue/blob/master/vue-event.md)

