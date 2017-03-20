---
layout: post
title:  "Vue - 生命周期和钩子"
date:   2017-02-27
categories: front-end
permalink: /archivers/vue-life-cycle-and-hook
tags: vue
---

生命周期的示例图，可以参考 {% post_link /archivers/vue-beginning 《Vue.js 初体验》 %} 中的**生命周期**。

结合上面给的生命周期示例图，我们大致清楚Vue从创建到销毁的整个过程，接下来我们来利用代码讲解下具体每个钩子的实际作用。

```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script type="text/javascript" src="vue.js"></script>
</head>
<body>

<div id="app">
     <div ref="refHook" >this is refHook</div>
     <p>{{ message }}</p>
</div>

<script type="text/javascript">
var app = new Vue({
    el: '#app',
    data: {
        message : "this is data message"
      },
     beforeCreate: function () {
        console.group('=========================================>>>>>>   beforeCreate');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); //undefined
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data); //undefined 
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  //undefined 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); //已被初始化
      },
      created: function () {
        console.group('=========================================>>>>>>   created');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); //undefined
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data); //已被初始化 
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  //已被初始化 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); //已被初始化
      },
      beforeMount: function () {
        console.group('=========================================>>>>>>   beforeMount');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); //已被初始化
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data); //已被初始化 
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  //已被初始化 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); //已被初始化
      },
      mounted: function () {
        console.group('=========================================>>>>>>   mounted');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); //已被初始化
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data); //已被初始化 
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  //已被初始化 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); //已被初始化
      },
      beforeUpdate: function () {
        console.group('=========================================>>>>>>   beforeUpdate');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); 
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data); 
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); 
      },
      updated: function () {
        console.group('=========================================>>>>>>   updated');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); 
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);  
        console.log("%c%s", "color:red", "message: " + this.message, this.message);  
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); 
      },
      beforeDestroy: function () {
        console.group('=========================================>>>>>>   beforeDestroy');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); 
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);  
        console.log("%c%s", "color:red", "message: " + this.message, this.message);   
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs); 
      },
      destroyed: function () {
        console.group('=========================================>>>>>>   destroyed');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el); 
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);  
        console.log("%c%s", "color:red", "message: " + this.message, this.message);   
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
      }
  })
</script>
</body>
</html>
```

如下图我们看到从创建到挂载的整个流程，特别注意的是，在`beforeMount`时，我们可以看到`el`还是`[[ message ]]`(*ps: 这里的 [ 指的是花括弧，因为hexo会把花括弧给视为关键字符*)，这里就是运用到了**visual dom**的原理，直到`mounted`才把数据渲染进去。

![](/images/vue/vue-15.png)

**小结：**

1. `beforecreated`：el 和 data 还未初始化，~~但是refs已经初始化完成了~~，refs也是只是拿到对象，属性方法还没渲染完毕([Vue warn]: Error in beforecreated hook)。

2. `created`：完成了 data 数据的初始化，el没有

3. `beforeMount`：完成了 el 和 data 初始化 

4. `mounted`：完成挂载，refs的组件属性方法渲染完成

在控制台输入`app.message = 'hello vue'`，会看到vue触发`beforeUpdate`以及`updated`。

![](/images/vue/vue-16.png)

至于销毁，`app.$destroy()`，会触发`beforeDestroy`和`destroyed`，但是销毁之后，我们重新修改`app.message = 'hello'`是不会再生效的了，也就是原先的dom依旧存在，但是已经无法使用vue来控制dom元素的变化了。

那么组件的生命周期是什么样的呢？我们同样也来做一下简单的模拟。

```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script type="text/javascript" src="vue.js"></script>
</head>
<body>

<div id="app">
     <child-com :child-msg="childMsg"></child-com>
</div>


<script type="text/javascript">
Vue.component('childCom', {
  template: "<div>{{childMsg}} - {{message}}</div>",
  props: ['childMsg'],
  data () {
    return {
      message: "this is child data message"
    }
  },
  beforeCreate: function () {
    console.group('=========================================>>>>>>  child beforeCreate');
    console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
    console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
    console.log("%c%s", "color:red", "message: " + this.message, this.message); 
    console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
    console.log("%c%s", "color:red", "props  : " + this.childMsg, this.childMsg);
  },
  created: function () {
    console.group('=========================================>>>>>>  child created');
    console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
    console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
    console.log("%c%s", "color:red", "message: " + this.message, this.message); 
    console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
    console.log("%c%s", "color:red", "props  : " + this.childMsg, this.childMsg);
  },
  beforeMount: function () {
    console.group('=========================================>>>>>>  child beforeMount');
    console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
    console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
    console.log("%c%s", "color:red", "message: " + this.message, this.message); 
    console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
    console.log("%c%s", "color:red", "props  : " + this.childMsg, this.childMsg);
  },
  mounted: function () {
    console.group('=========================================>>>>>>  child mounted');
    console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
    console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
    console.log("%c%s", "color:red", "message: " + this.message, this.message); 
    console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
    console.log("%c%s", "color:red", "props  : " + this.childMsg, this.childMsg);
  },
  beforeUpdate: function () {
    console.group('=========================================>>>>>>  child beforeUpdate');
  },
  updated: function () {
    console.group('=========================================>>>>>>  child updated');
  },
  beforeDestroy: function () {
    console.group('=========================================>>>>>>  child beforeDestroy');
  },
  destroyed: function () {
    console.group('=========================================>>>>>>  child destroyed');
  }
});

var app = new Vue({
    el: '#app',
    data: {
        message : "this is data message",
        childMsg: "this is childMsg"
    },
     beforeCreate: function () {
        console.group('=========================================>>>>>>  parent beforeCreate');
      },
      created: function () {
        console.group('=========================================>>>>>>  parent created');
      },
      beforeMount: function () {
        console.group('=========================================>>>>>>  parent beforeMount');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
        console.log("%c%s", "color:red", "message: " + this.message, this.message); 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
      },
      mounted: function () {
        console.group('=========================================>>>>>>  parent mounted');
        console.log("%c%s", "color:red", "el     : " + this.$el, this.$el);
        console.log("%c%s", "color:red", "data   : " + this.$data, this.$data);
        console.log("%c%s", "color:red", "message: " + this.message, this.message); 
        console.log("%c%s", "color:red", "refs   : " + this.$refs, this.$refs);
      },
      beforeUpdate: function () {
        console.group('=========================================>>>>>>  parent beforeUpdate');
      },
      updated: function () {
        console.group('=========================================>>>>>>  parent updated');
      },
      beforeDestroy: function () {
        console.group('=========================================>>>>>>  parent beforeDestroy');
      },
      destroyed: function () {
        console.group('=========================================>>>>>>  parent destroyed');
      }
  })
</script>
</body>
</html>
```

我们可以看到，`props`的数据是跟`data`的出现周期是一样的，组件是在父容器执行`beforeMount`时初始化的，在`beforeCreate`操作`props`数据则会报错，因为那个时候还没挂载到app实例化对象上。还有注意一下`parent beforeMount`，这个跟之前说的虚拟dom的原理一样，先占坑，然后再挂载。

![](/images/vue/vue-17.png)

在`created`时，组件的`props`数据出来了，注意组件的`el`在`beforeMount`时，是不会像父容器那样先占坑的，而是等到`mounted`之后才把数据渲染上去，之后返回父容器的`mounted`方法，才会把组件数据都渲染到dom上面去。

![](/images/vue/vue-18.png)

**总结：**

> beforecreate : 举个栗子：可以在这加个loading事件 
> created ：在这结束loading，还做一些初始化，实现函数自执行 
> mounted ： 在这发起后端请求，拿回数据，配合路由钩子做一些事情
> beforeDestory： 你确认删除XX吗？ 
> destoryed ：当前组件已被删除，清空相关内容

参考资料：[http://www.cnblogs.com/gagag/p/6246493.html](http://www.cnblogs.com/gagag/p/6246493.html)