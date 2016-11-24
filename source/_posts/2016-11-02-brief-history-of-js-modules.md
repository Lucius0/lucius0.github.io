---
layout: post
title:  "JavaScript的模块简史"
date:   2016-11-02
categories: front-end
permalink: /archivers/brief-history-of-js-modules
tags: javascript
---

[原文](https://medium.com/@sungyeol.choi/javascript-module-module-loader-module-bundler-es6-module-confused-yet-6343510e7bde#.j3e1w7v9r)

你是否刚入门JavaScript并且经常被模块、模块加载器和模块打包器混淆？或者你已经写过一段时间的JavaScript了，但是还是无法掌握模块的专业用语？你可能听过的专业用语例如有**CommonJS，AMD，Browserify，SystemJS，Webpack，JSPM**等等。但是就是不知道我们为什么需要它们。

我将会尽我所能的去解释它们是什么，能解决什么样的问题，以及是怎么样去解决问题的。

## 示例程序

![](/images/javascript/js-01.png)

在本文中，我会用一个简单的网页应用程序去演示关于模块的概念。在浏览器上该程序展示了数组的和。它由4个函数跟一个*index.html*组成。

![](/images/javascript/js-02.jpeg)

main函数计算数组的和并把答案在`span#answer`展示。sum函数依赖两个函数：`add`跟`reduce`。`add`函数的作用顾名思义；即两数字相加。`reduce`函数会遍历数组并且调用`iteratee`回调函数。

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

内嵌脚本就是当你在`<script></script>`标签添加`JavaScript`代码。我相信大多数的JavaScript开发者在他们的人生中至少有过一次这样子做过。

这是一种很好的开始方式。不需要担心外部脚本或者依赖关系。但同样也带来了不可维护的代码。原因如下：

- **缺乏代码可重用性：**假如我们需要添加另一个页面和需要在本页的一些函数，那么我们就只能复制跟黏贴我们所需要的代码。

- **缺乏依赖解析：**你得保证在`main`函数之前就存在`add,reduce,sum`函数脚本。

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

这是从嵌入脚本的一种自然的过度。现在我们可以将一大块JavaScript代码划分成几小块的脚本文件并通过`<script src='...'></script>`标签来加载。

通过分离的文件我们可以实现代码的复用。我们也不再需要在不同的页面复制跟黏贴代码。我们只要简单地通过`<script></script>`标签引入文件。这种方法虽然比较好，但是还是存在同样的几种问题：

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

通过使用模块对象和[立即调用函数表达式IIFE](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression)，我们可以减少全局作用域污染。在这种方法，我们仅仅暴露了一个对象在全局作用域。该对象包含了所有的我们所需要的函数跟值在我们的应用里面。在这个例子，我们只暴露了`myApp`对象给全局作用域。所有的函数将会在`myApp`对象所支持。

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

注意一点以上的文件除了*myApp.js*现在都包装成IIFE格式。

`(function(){ /*... your code goes here ...*/ })();`

通过将每一个文件都包装成IIFE，所有的本地变量都在函数作用域里面。因此不会对全局造成污染。

我们通过附加`add, reduce, sum`到`myApp`对象来暴露它们。我们只要引用`myApp`对象就能调用这些方法：

```javascript
myApp.add(1,2);
myApp.sum([1,2,3,4]);
myApp.reduce(add, value);
```

我们也可以通过往IIFE传递`myApp`全局对象作为它的参数，就像`main.js`文件所示。通过给IIFE传递参数对象，并可以为该对象设置为短别名。这样我们的代码就会稍微简短一点。

```javascript
(function(obj){
  // obj is new veryLongNameOfGlobalObject
})(veryLongNameOfGloablObject);
```

这相对于上一个例子是一个比较大的改进。并且大部分的js库都是采用这样的模式，包括jq。Jq暴露一个全局变量，$，这样所有的函数都在`$`的对象里面。

是的，这不是一个完美的解决方案。这个方法患有跟上一个案例同样的问题。

- **缺乏依赖解析：**文件的排序很重要。你需要在*main.js*之前引入了*add.js, reduce.js, add.js*。

- **全局变量污染：**全局变量的数量现在是1，而不是0。

## CommonJS

在2009年，出现关于要把JavaScript带到服务端的话题。于是，ServerJs诞生了。后来ServerJs改名为CommonJS。

CommonJS不是一个JavaScript库，而是一个标准化组织。它就跟ECMA或者W3C一样。ECMA制定了JavaScript语言的规范。W3C制定了JavaScript网页API，例如DOM或者DOM事件。CommonJS的目标是为网页服务器，桌面程序，命令行应用程序制定一套通用的API。

CommonJS同样为模块制定API。在服务端应用程序是没有HTML页面，也没有`<script>`标签，因此为模块制定一套清晰的API就显得十分有意义了。模块需要暴露(**export**)给其他模块使用，并且还是可访问性的(**import**)。它的模块输出语法就像下面这样：

```javascript
// add.js
module.exports = function add(a, b){
  return a+b;
}
```

上面的代码定义和输出了一个模块，并且保存在`add.js`文件里面。

为了使用和引入`add`模块，你需要将文件名或者模块名传参给`require`函数。下面就是如何引入模块的语法描述：

```javascript
var add = require(‘./add’);
```

假如你有写过NodeJS，这种语法会看起来十分的熟悉。这是因为NodeJS实现了CommonJS风格的模块API。

## Asynchronous Module Definition(AMD)

CommonJS带来的问题就是模块的定义是同步的。当你调用`‘var add=require(‘add’);`，系统会暂停直到模块准备好了。意思就是这行代码会使浏览器发生阻塞直到所有的模块都加载完毕。因此这也不是在浏览器端定义模块应用的最佳方法。

为了将服务端的语法转移到客户端的语法，CommonJS提出了几种模块格式，"Module/Transfer"。其中一个提案就是，"Module/Transfer/C"，后来就成了[AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)。

AMD的格式如下：

```javascript
define([‘add’, ‘reduce’], function(add, reduce){
  return function(){...};
});
```

注意`define`这个函数(或者说关键字)用依赖列表和回调函数作为参数。参数里的回调函数跟依赖列表的顺序一一对应。这跟模块导入无差别，并且回调函数返回的值就是输出(`export`)的值。

CommonJS和AMD同时解决了模块模式带来的两个遗留问题：**依赖解析**和**全局作用域污染**：我们只需要关心每个模块或者每个文件的依赖关系，和是否存在全局作用域污染问题。。

## RequireJS

AMD可以帮我们解决浏览器应用程序中的脚本标签跟全局污染的问题。那么，我们该如何使用它呢？RequireJS出现了。RequireJS是Javascript的**模块加载器**。它的作用就是帮助我们异步加载我们所需的模块。

今晚它的名字带有`require`，但是它的目标并不是支持CommonJS的`require`语法。有了RequireJS，我们就可以编写AMD风格的模块。。

在你开始写程序之前，你需要到[RequireJS website](http://requirejs.org/docs/start.html)下载*require.js*文件。如下就是用RequireJS风格编写的例子。

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

    <script data-main="main" src="require.js"></script>
  </body>
</html>
```

1-main.js

```javascript
// main.js
define(['sum'], function(sum){
  var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
  var answer = sum(values)
  document.getElementById("answer").innerHTML = answer;
})
```

2-sum.js

```javascript
// add.js
define([], function(){
  var add = function(a, b){
    return a + b;
  };

  return add;
});
```

3-add.js

```javascript
// add.js
define([], function(){
  var add = function(a, b){
    return a + b;
  };

  return add;
});
```

4-reduce.js

```javascript
// reduce.js
define([], function(){
  var reduce = function(arr, iteratee) {
    var index = 0,
      length = arr.length,
      memo = arr[index];

    index += 1;
    for(; index < length; index += 1){
      memo = iteratee(memo, arr[index])
    }
    return memo;
  }

  return reduce;
})
```

注意在index.html文件只有一个脚本标签

```html
<script data-main=”main” src=”require.js”></script>
```

该页面加载了`require.js`，并且`data-main='main'`属性通知RequireJs在这个页面哪里是开始节点。通常默认情况下，它假定所有的文件都有*'.js'*扩展名，因此可以忽略*'.js'*后缀名的文件。但当RequireJS加载完*main.js*之后，它会加载该文件的依赖，以及依赖的依赖，等等。浏览器的开发者工具展示了所有文件的加载顺序。

![](/images/css/css-08.png)

浏览器加载`index.html`以及加载它的`require.js`。剩下的文件和依赖由`require.js`来负责加载。

RequireJS和AMD解决了我们之前的所有问题。然而，它也带来了其他一些不是很严重的问题。

- AMD语法太过于复杂。因为所有都包装在`define`函数里面，所以会在我们的代码产生一些额外的缩进。假如是比较小的文件，这也没什么大问题，但假如是比较庞大的文件，那么它将是一种精神折磨。

- 数组里的依赖列表必须与函数的参数列表相匹配。假如有大量的依赖，那么要理清依赖顺序也是比较困难的一件事情。如果模块有几个个依赖，后来又要从中删除一个，那么久很难找到匹配的模块和参数。

- 伴随着现代浏览器(HTTP 1.1)，加载很多小文件也会降低性能。

## Browserify

由于这些原因，一些人想要用CommonJS语法来代替。但是CommonJS语法主要是针对服务器以及同步的，对吧？那么Browserify的出现就是要来解决这些问题的。有了Browserify，你就可以在浏览器应用程序使用CommonJS。Browserify是一个**模块加载器**。Browserify遍历你代码的依赖树，并且将它们打包成一个文件。

不像RequireJS，Browserify更像是一个命令行工具。你需要使用NodeJS和NPM来安装它。只要你在你的系统安装了nodeJS，那么输入以下命令行。

`npm install -g browserify`

让我们来看下用CommonJS语法的例子程序。

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

    <script src="bundle.js"></script>
  </body>
</html>
```

1-main.js

```javascript
//main.js
var sum = require('./sum');
var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values)

document.getElementById("answer").innerHTML = answer;
```

2-sum.js

```javascript
//sum.js
var reduce = require('./reduce');
var add = require('./add');

module.exports = function(arr){
  return reduce(arr, add);
};
```

3-add.js

```javascript
//add.js
module.exports = function add(a,b){
    return a + b;
};
```

4-reduce.js

```javascript
//reduce.js
module.exports = function reduce(arr, iteratee) {
  var index = 0,
    length = arr.length,
    memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index])
  }
  return memo;
};
```

你可能已经注意到在`index.html`文件中，加载了脚本文件`bundle.js`。那么`bundle.js`文件在哪里呢？只要你执行下面的命令行，Browserify会为我们生成该文件。

`$ brwoserify main.js -o bundle.js`

Browserify会解析`main.js`里的`require`函数调用和遍历项目里面的依赖树。然后将他们都打包成一个文件。

如下就是`bundle`文件的相关代码。

```javascript
function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function add(a,b){
    return a + b;
};

},{}],2:[function(require,module,exports){
var sum = require('./sum');
var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values)

document.getElementById("answer").innerHTML = answer;

},{"./sum":4}],3:[function(require,module,exports){
module.exports = function reduce(arr, iteratee) {
  var index = 0,
    length = arr.length,
    memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index])
  }
  return memo;
};

},{}],4:[function(require,module,exports){
var reduce = require('./reduce');
var add = require('./add');

module.exports = function(arr){
  return reduce(arr, add);
};

},{"./add":1,"./reduce":3}]},{},[2]);
```

你无需每一行的去理解这个打包文件的意思。你只要注意一点的是，所有熟悉的代码，主文件，以及所有的依赖都在这文件里面。

## UMD — 只会让你感到更加的困惑

现在我们已经学会了*全局对象*，*CommonJS*和*AMD*风格的模块。并且有很多库可以帮助我们要不用CommonJS，要不AMD。但是假如我们正在写一个模块，并想部署到互联网上去怎么办？我们该用那种风格的模块。

用三种不同的模块都是可以的，如全局模块对象，CommonJS和AMD都是最终选择来的。但是我们不得不维护这三种类型的文件，并且用户不得不他们所下载的是哪种模块类型。

通用模块定义(UMD)就是来处理这个特殊的问题的。在本质上，UMD就是用一套`if/else`来判断目前的运行环境支持哪种模块类型。

```javascript
//sum.umd.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['add', 'reduce'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('add'), require('reduce'));
    } else {
        // Browser globals (root is window)
        root.sum = factory(root.add, root.reduce);
    }
}(this, function (add, reduce) {
    //  private methods

    //    exposed public methods
    return function(arr) {
      return reduce(arr, add);
    }
}));
```

## ES6模块语法

Javascript全局模块变量，CommonJS，AMD和UMD，这里有太多选择了。现在你可能会问，我下一个项目应该使用什么模块风格？答案是一个也不用。

Javascript语言没有内置的模块系统。这就是为什么我们有太多不同的方式去导入导出模块了。但是最近以来这些改变了。伴随着ES6的到来，模块是Javascript其中的一部分。所以问题的答案是你假如想要你下一个项目前卫不过时的话，ES6模块语法是你最好的选择。

ES6通过`import`和`export`关键字来导入导出模块。下面是关于使用ES6模块语法的例子。

01-main.js

```javascript
// main.js
import sum from "./sum";

var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values);

document.getElementById("answer").innerHTML = answer;
```

02-sum.js

```javascript
// sum.js
import add from './add';
import reduce from './reduce';

export default function sum(arr){
  return reduce(arr, add);
}
```

03-add.js

```javascript
// add.js
export default function add(a,b){
  return a + b;
}
```

04-reduce.js

```javascript
//reduce.js
export default function reduce(arr, iteratee) {
  let index = 0,
  length = arr.length,
  memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index]);
  }
  return memo;
}
```

关于ES6模块有很多短语：ES6模块语法相当简洁。ES6模块将会引领Javascript未来的世界。但是不幸的是，有一个问题，浏览器对这种新语法还没准备好(并未全面支持)。在写这篇文章的时候，只有Chrome浏览器支持[import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)语句。即使当大部分的浏览支持`import`和`export`，假如你的应用程序需要在低版本的浏览器运行，那我们同样也会运行出错。

幸运的是，现在有很多工具可以用，这些工具允许我们使用ES6模块语法。

## Webpack

Webpack是一个**模块打包器**，就跟Browserify一样，它会遍历依赖树并且将它打包成一个至多个文件。假如真的跟Browserify一样，那我们为什么还需要另一个模块打包器？Webpack可以管理CommonJS，AMD和ES6模块。并且Webpack带来了更灵活更酷的特性：

- **代码分离：**当你有多个app同时共享同一些模块，Webpack可以将你的代码打包成两个或者多个文件。例如，当你有两个app，app1跟app2，两者共用多个模块。使用Browserify，你会得到`app1.js`和`app2.js`，并且两者都同时拥有所依赖的模块。但是假如使用Webpack，你可以创建`app1.js`，`app2.js`，和`share-lib.js`。是的，你必须在html页面加载这2个文件，但是由于哈希文件名，浏览器缓存以及CDN的原因，它可以减少初始化的加载时间。

- **加载：**通过自定义加载，你可以在加载任何文件到你的资源去。你可以通过使用`require`语法加载不单单是Javascript文件，还有css，CoffeeScript，Sass，Less，HTML模板，图片等等。

- **插件：**Webpack插件可以在你打包写入到文件之前对打包进行操作，有很多社区都在创建Webpack插件。例如，给打包代码添加注释，添加source map，将打包文件分离成众多小文件等等。

*WebpackDevServer*是一个检测到当你的代码发生变化时，会自动打包你的源代码以及自动刷新浏览器的开发服务器。通过代码的及时反馈，从而可以加速开发进度。

让我们看看我们是如何通过Webpack来打包我们的案例程序的。Webpack需要一点引导以及配置。

既然Webpack是JavaScript命令行工具，你就需要安装好nodejs和npm。装好npm之后，执行以下命令行初始化项目：

`
$ mkdir project; cd project
$ npm init -y
$ npm install -D webpack webpack-dev-server
`

你需要给Webpack添加配置文件。在你的配置文件中最少需要`entry`跟`output`两个字段。保存以下内容到`webpack.config.js`。

```javascript
module.exports = {
   entry: ‘./app/main.js’,
   output: {
       filename: ‘bundle.js’
   }
}
```

打开`package.json`并添加以下`script`内容。

```json
"scripts": {
    "start": "webpack-dev-server -progress -colors",
    "build": "webpack"
 },
```

现在添加所有你的JavaScript模块到*project/app*目录和添加*index.html*到*project*目录下。

01-index.html

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

    <script src="bundle.js"></script>
  </body>
</html>
```

02-webpack.config.js

```javascript

module.exports = {
  entry: './app/main.js',
  output: {
    path: './dist',
    filename: 'bundle.js'
  }
}
```

03-package.json

```json
{
  "name": "jsmodules",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "start": "webpack-dev-server --progress --colors",
    "build": "webpack"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^1.12.14",
    "webpack-dev-server": "^1.14.1"
  }
}
```

04-app-add.js

```javascript
// app/add.js
module.exports = function add(a,b){
    return a + b;
};
```

05-app-reduce.js

```javascript
// app/sum.js
// app/reduce.js
module.exports = function reduce(arr, iteratee) {
  var index = 0,
    length = arr.length,
    memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index])
  }
  return memo;
};
```

06-app-sum.js

```javascript
// app/sum.js
define(['./reduce', './add'], function(reduce, add){
  sum =  function(arr){
    return reduce(arr, add);
  }

  return sum;
});
```

07-app-main.js

```javascript
// app/main.js
var sum = require('./sum');
var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values)

document.getElementById("answer").innerHTML = answer;
```

注意一下`add.js`和`reduce.js`编写风格是CommonJS风格，而`sum.js`则是用AMD风格。Webpack，默认情况下，是可以管理CommonJS和AMD的。假如你的源码有用到ES6模块编码风格，那么你就不得不安装和配置*“babel loader”*。

一旦你已经安装好所有文件，你可以执行下面命令行来运行你的程序。

`
$ npm start
`

随后打开网站输入网址：`http://localhost:8080/webpack-dev-server/`

此时，你可以打开你喜爱的编译器和输入你的代码。待你保存之后，浏览器会自动刷新和展示你代码改动之后的结果。

有一件事你可能已经注意到了，就是你已经找不到*'dist/bundle.js'*文件。这是因为Wepback Dev Server会创建打包文件，并且没有将此写入文件系统中，而是保存在内存里。

为了可以部署，你可能想要创建一个打包文件。你可以执行下面的命令行创建*bundle.js*文件。

`
$ npm run build
`

假如你有兴趣想了解更多关于Webpack的知识，你可以访问[Webpack](https://webpack.github.io/docs/)。

## Rollup (2015-05)

你是否有过导入了一个很大的JavaScript文件但是却使用到里面的一小部分函数？Rollup是JavaScript ES6的另一个模块打包器。跟Browserify和Webpack不同的是，Rollup只会引入你在项目中使用到的代码。假如你的项目引入了一个有很多方法的大模块并且你只用到里面的一小部分方法，Rollup只会打包你在项目中你调用到的方法。这可以很显著的减少打包文件的大小。

Rollup 可以被用作为命令行工具。如果安装好 NodeJS 和 NPM，那么就可以用以下的命令安装。

`
$ npm install -g rollup
`

Rollup可以跟任何类型的模块类型一起执行。但是，推荐使用ES6模块风格，这样就可以使用 *tree-shaking* 功能。下面是用ES6 编写的例子。

01-add.js

```javascript
let add = (a,b) => a + b;
let sub = (a,b) => a - b;

export { add, sub };
```

02-reduce.js

```javascript
// reduce.js
export default (arr, iteratee) => {
  let index = 0,
  length = arr.length,
  memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index]);
  }
  return memo;
}
```

03-sum.js

```javascript
// sum.js
import { add } from './add';
import reduce from './reduce';

export default (arr) => reduce(arr, add);
```

04-main.js

```javascript
// main.js
import sum from "./sum";

var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values);

document.getElementById("answer").innerHTML = answer;
```

注意在`add`模块，我引入了另一个函数`sub()`，但是这个函数在这个项目里面并没有使用。

现在我们用Rollup来打包我们的项目

`$ rollup main.js -o bundle.js`

生成的`bundle.js`

bundle.js

```javascript
let add = (a,b) => a + b;

var reduce = (arr, iteratee) => {
  let index = 0,
  length = arr.length,
  memo = arr[index];

  index += 1;
  for(; index < length; index += 1){
    memo = iteratee(memo, arr[index]);
  }
  return memo;
}

var sum = (arr) => reduce(arr, add);

var values = [ 1, 2, 4, 5, 6, 7, 8, 9 ];
var answer = sum(values);

document.getElementById("answer").innerHTML = answer;
```

注意观察，`sub`函数并没有出现在此`bunldle.js`文件里面。

## SystemJS

SystemJS是一个通用的模块加载器，它可以在浏览器或者NodeJs动态的加载模块，并且它还支持CommonJS，AMD，全局对象和ES6模块。通过插件，它还不仅仅能加载JavaScript，还可以加载CoffeeScript和TypeScript。

SystemJS的另一个好处，就是它是基于ES6 module Loader polyfill。因此它的语法和API在未来很有可能成为JavaScript语言的一部分，它可以让你的代码更加前卫。

可以使用以下语法，通过SystemJS来异步的导入模块。

```javascript
System.import(‘module-name’);
```

然后我们可以用配置 API 来配置 SystemJS 的行为。

```javascript
System.config({
  transplier: ‘babel’,
  baseURL: ‘/app’
});
```

上面的配置会让SystemJS使用`babel`来作为ES6模块的编译器，并且从*/app*目录加载模块。

随着现代JavaScript变得越来越大越来越复杂，开发工作流亦是如此。所以我们需要的，不仅仅是模块加载器，还有寻找开发服务器，生产的模块打包器以及第三方模块包管理器。

## JSPM

JSPM是JavaScript开发工具的一把瑞士军刀。JSPM是一个(1)包管理器；(2)模块加载器；(3)模块打包器。

现在的JavaScript开发很少只需要自己的一些模块就可以完成的，大部分，我们是需要借用第三方模块的。

通过JSPM，你可以通过以下的命令行从NPM或者github来安装第三方模块。

`jspm install npm:package-name or github:package/name`

随后会从*'npm'*或者*'github'*下载至*'jspm_package'*目录下。

在开发模式下，你可以使用*'jspm-server'*，就跟Webpack Dev Server一样，它会探测到代码是否发生改变并且会自动刷新浏览器展示修改后的结果。但是不同Webpack Dev Server，jspm-server用的是SystemJS模块加载器。因此当它探测到文件有发生变化时，它不会打包所有的模块，而是只加载页面所需要的模块。

但当涉及到部署的问题，你可能想要打包你的代码。JSPM带有打包器，你可以使用以下的命令行来打包你的代码。

`jspm bundle main.js bundle.js`

在背后，JSPM采取了Rollup作为它的打包器。

## 总结

我希望已经给你足够的信息让你去理解关于JavaScript模块化的问题。现在你可能会问，那我在下一个项目应该采用什么的方式呢？很抱歉，我现在无法回答你的问题。现在你已经具备能力去为自己寻找答案。希望本文能让你更容易理解提到有关工具的文档和文章。

你可以到[github](https://github.com/sungthecoder/js-modules-examples)查看本文中所有的代码例子，假如你有任何疑问，欢迎到下面的评论区留下的问题。