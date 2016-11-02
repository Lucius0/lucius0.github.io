---
layout: post
title:  "JavaScript的模块简史"
date:   2016-11-02
categories: javascript
permalink: /archivers/brief-history-of-js-modules
tags: javascript
publish: false
---

[原文](https://medium.com/@sungyeol.choi/javascript-module-module-loader-module-bundler-es6-module-confused-yet-6343510e7bde#.j3e1w7v9r)

你是否刚入门JavaScript并且经常被模块、模块加载器和模块打包器混淆？或者你已经写过一段时间的JavaScript了，但是还是无法掌握模块的专业用语？你可能听过的专业用语例如有**CommonJS，AMD，Browserify，SystemJS，Webpack，JSPM**等等。但是就是不知道我们为什么需要它们。

我将会尽我所能的去解释它们是什么，能解决什么样的问题，以及是怎么样去解决问题的。

## 示例程序

![]({{site.baseurl}}/images/javascript/js-01.png)

在本文中，我会用一个简单的网页应用程序去演示关于模块的概念。在浏览器上该程序展示了数组的和。它由4个函数跟一个*index.html*组成。

![]({{site.baseurl}}/images/javascript/js-02.jpeg)

main函数计算数组的和并把答案在```span#answer```展示。sum函数依赖两个函数：```add```跟```reduce```。```add```函数的作用顾名思义；即两数字相加。```reduce```函数会遍历数组并且调用```iteratee```回调函数。

花点时间理解一下以下的代码。我会在这篇文章反复的使用同样的函数。

0-index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JS Modules</title>
</head>
<body>
  <h1>
	The Answer is
	<span id="answer"></span>
  </h1>
</body>
</html>
```

1-main.js

```javascript
var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values)
document.getElementById("answer").innerHTML = answer;
```

2-sum.js

```javascript
function sum(arr){
  return reduce(arr, add);
}
```

3-add.js

```javascript
function add(a, b) {
  return a + b;
}
```

4-reduce.js

```javascript
function reduce(arr, iteratee) {
  var index = 0,
    length = arr.length,
    memo = arr[index];
  for(index += 1; index < length; index += 1){
    memo = iteratee(memo, arr[index])
  }
  return memo;
}
```

让我们一起来看看如何将这些碎片化的代码拼接在一起创建一个应用。

## 内嵌脚本

内嵌脚本就是当你在```<script></script>```标签添加```JavaScript```代码。我相信大多数的JavaScript开发者在他们的人生中至少有过一次这样子做过。

这是一种很好的开始方式。不需要担心外部脚本或者依赖关系。但同样也带来了不可维护的代码。原因如下：

- **缺乏代码可重用性：**假如我们需要添加另一个页面和需要在本页的一些函数，那么我们就只能复制跟黏贴我们所需要的代码。

- **缺乏依赖解析：**你得保证在```main```函数之前就存在```add,reduce,sum```函数脚本。

- **全局变量名污染：**所有的变量跟函数都是储存在全局变量作用域里面。

```html

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>JS Modules</title>
  </head>
  <body>
    <h1>
      The Answer is
      <span id="answer"></span>
    </h1>

    <script type="text/javascript">
      function add(a, b) {
        return a + b;
      }
      function reduce(arr, iteratee) {
        var index = 0,
          length = arr.length,
          memo = arr[index];
        for(index += 1; index < length; index += 1){
          memo = iteratee(memo, arr[index])
        }
        return memo;
      }
      function sum(arr){
        return reduce(arr, add);
      }
      /* Main Function */
      var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
      var answer = sum(values)
      document.getElementById("answer").innerHTML = answer;
    </script>
  </body>
</html>
```

## 引入外部脚本标签

这是从嵌入脚本的一种自然的过度。现在我们可以将一大块JavaScript代码划分成几小块的脚本文件并通过```<script src='...'></script>```标签来加载。

通过分离的文件我们可以实现代码的复用。我们也不再需要在不同的页面复制跟黏贴代码。我们只要简单地通过```<script></script>```标签引入文件。这种方法虽然比较好，但是还是存在同样的几种问题：

- **缺乏依赖解析：**文件的排序很重要。你需要在*main.js*之前引入了*add.js, reduce.js, add.js*。

- **全局变量污染：**所有的函数跟变量依旧暴露在全局作用域范围内。

0-index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>JS Modules</title>
  </head>
  <body>
    <h1>
      The Answer is
      <span id="answer"></span>
    </h1>

    <script type="text/javascript" src="./add.js"></script>
    <script type="text/javascript" src="./reduce.js"></script>
    <script type="text/javascript" src="./sum.js"></script>
    <script type="text/javascript" src="./main.js"></script>
  </body>
</html>
```

1-add.js

```javascript
//add.js
function add(a, b) {
  return a + b;
}
```

2-reduce.js

```javascript
//reduce.js
function reduce(arr, iteratee) {
  var index = 0,
    length = arr.length,
    memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index])
  }
  return memo;
}
```

3-sum.js

```javascript
//sum.js
function sum(arr){
  return reduce(arr, add);
}
```

4-main.js

```javascript
// main.js
var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values)
document.getElementById("answer").innerHTML = answer;
```

## 模块对象以及IIFE

通过使用模块对象和[立即调用函数表达式IIFE](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)，我们可以减少全局作用域污染。在这种方法，我们仅仅暴露了一个对象在全局作用域。该对象包含了所有的我们所需要的函数跟值在我们的应用里面。在这个例子，我们只暴露了```myApp```对象给全局作用域。所有的函数将会在```myApp```对象所支持。

01-my-app.js

```javascript
var myApp = {};
```

02-add.js

```javascript
(function(){
  myApp.add = function(a, b) {
    return a + b;
  }  
})();
```

03-reduce.js

```javascript
(function(){
  myApp.reduce = function(arr, iteratee) {
    var index = 0,
      length = arr.length,
      memo = arr[index];
  
    index += 1;
    for(; index < length; index += 1){
      memo = iteratee(memo, arr[index])
    }
    return memo;
  }  
})();
```

04-sum.js

```javascript
(function(){
  myApp.sum = function(arr){
    return myApp.reduce(arr, myUtil.add);
  }  
})();
```

05-main.js

```javascript
(function(app){
  var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
  var answer = app.sum(values)
  document.getElementById("answer").innerHTML = answer;
})(myApp);
```

06-index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>JS Modules</title>
  </head>
  <body>
    <h1>
      The Answer is
      <span id="answer"></span>
    </h1>

    <script type="text/javascript" src="./my-app.js"></script>
    <script type="text/javascript" src="./add.js"></script>
    <script type="text/javascript" src="./reduce.js"></script>
    <script type="text/javascript" src="./sum.js"></script>
    <script type="text/javascript" src="./main.js"></script>
  </body>
</html>
```