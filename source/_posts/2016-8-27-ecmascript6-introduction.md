---
layout: post
title:  "ES6 - 入门"
date:   2016-08-28
categories: front-end
permalink: /archivers/ecmascript6-introduction
tags: ES6
---

## 介绍 ##
ES6系列文章是在拜读阮一峰老师的《ES6标准入门》所做下的笔记，其github地址**[《es6tutorial》](https://github.com/ruanyf/es6tutorial)**，之后会在该系列文章继续添加在工作上遇到的问题或者看到比较好的关于ES6的文章。

ES6在ES5的基础上添加的新特性，在此**[es6-features](http://es6-features.org/)**可以参考，当做自己的一手API资料。

ECMAScript 6是在2015年发布的，也叫ECMAScript 2015。ECMAScript 6的发布，使得javascript的开发，越来越规范，也越来越方便。当然，较大的修改以及新功能的加入会导致兼容性的问题产生，因此会保留一些目前来看不是很成熟的设想到下一个版本，也就是ES7。

对于浏览器，支持ES6的情况可以查看**[http://kangax.github.io/es5-compat-table/es6/](http://kangax.github.io/es5-compat-table/es6/)**。NodeJs是Javascript的服务器运行环境，对ES6的支持比浏览器要高。阮一峰老师写了一个**[ES-Checker](https://github.com/ruanyf/es-checker)**，用来检查各种运行环境对ES6的支持情况。

```javascript
$ npm install -g es-checker
$ es-checker

=========================================
Passes 29 feature Detections
Your runtime supports 69% of ECMAScript 6
=========================================
```

## 转码器 ##

**[Babel](https://babeljs.io/)**是用于ES6转码器，可以将ES6转为ES5代码，从而兼容现有环境。在上文的**[es6-features](http://es6-features.org/)**，也有罗列出基本上的转换。

- **配置文件**`.babelrc`
	
	`.babelrc`是存放在项目的根目录下，使用Babel就是要配置该文件。该文件是用来设置转码规则和插件的，格式如下

```json
{
	"presets": [], // 设定转码规则
	"plugins": []
}
```

官方规则集

```javascript
# ES2015转码规则
$ npm install --save-dev babel-preset-es2015

# react转码规则
$ npm install --save-dev babel-preset-react

# ES7不同阶段语法提案的转码规则（共有4个阶段），选装一个
$ npm install --save-dev babel-preset-stage-0
$ npm install --save-dev babel-preset-stage-1
$ npm install --save-dev babel-preset-stage-2
$ npm install --save-dev babel-preset-stage-3
```

添加了规则之后的`.babelrc`

```json
{
    "presets": [
      "es2015",
      "react",
      "stage-2"
    ],
    "plugins": []
  }
```

**注意：**Babel工具跟模块的使用，必须写好`.babelrc`

- **命令行工具 babel-cli**

	安装

```javascript
$ npm install --global babel-cli
```

  基本使用方法

```javascript
# 转码结果输出到标准输出
$ babel example.js

# 转码结果写入一个文件
# --out-file 或 -o 参数指定输出文件
$ babel example.js --out-file compiled.js
# 或者
$ babel example.js -o compiled.js

# 整个目录转码
# --out-dir 或 -d 参数指定输出目录
$ babel src --out-dir lib
# 或者
$ babel src -d lib

# -s 参数生成source map文件
$ babel src -d lib -s
```

但是上面是在全局环境下安装的，也就是说项目假如有需要转换的话则需要安装Babel，那我们也可以采取在项目内安装`babel-cli`。

安装

```javascript
$ npm install --save-dev babel-cli
```

然后改写`package.json`

```json
{
  // ...
  "devDependencies": {
    "babel-cli": "^6.14.0"
  },
  "scripts": {
    "babel-build": "babel src -d lib"
  },
}
```

执行

```javascript
$ npm run babel-build
```

- **babel-node：**babel-cli自带的命令，提供了支持ES6的RELP环境；

- **babel-register：**模块改写`require`命令，为它加上钩子，每当`require`加载`js`、`jsx`、`es`、`es6`后缀文件，就会先用babel转码；

- **babel-core：**如若需要进行对Babel的API进行转码，可以使用`babel-core`

- **babel-polyfill：**Babel默认只转换新的JavaScript句法(syntax)，不转换新的API，比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，以及一些定义在全局对象上的方法（比如Object.assign）都不会转码。举例来说，ES6在Array对象上新增了Array.from方法。Babel就不会转码这个方法。如果想让这个方法运行，必须使用babel-polyfill，为当前环境提供一个垫片。

安装

```javascript
$ npm install --save babel-polyfill
```

使用，在脚本头部，加入如下一行代码。

```javascript
import 'babel-polyfill';
// 或者
require('babel-polyfill');
```

Babel默认不转码的API非常多，详细清单可以查看babel-plugin-transform-runtime模块的**[definitions.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/definitions.js)**文件。

除了在用`Babel-cli`将ES6转码，还可以在`node_modules/babel-core/`找到`babel`版本的`browser.js`嵌入项目网页，或者也可以使用**[babel-standalone](https://github.com/Daniel15/babel-standalone)**、**[Traceur](https://github.com/google/traceur-compiler)**嵌入网页，也可以使用在线转码平台**[REPL在线编译器](https://babeljs.io/repl/)**、**[Traceur](http://google.github.io/traceur-compiler/demo/repl.html#)**。

## gulp-babel ##

gulp的入门方法可以查看{% post_link /archivers/gulp-introduction 《gulp之一 - 入门教程[转]》 %}。

gulp-babel可以跳转到{% post_link /archivers/npm-and-gulp-collection_1 《gulp-babel》 %}

## 运行 ##

我是Windows操作系统，使用sublime text3来运行es6.

首先安装[nodejs](http://nodejs.org/)

sublime text3 中打开**tools -> build system -> new build system...**，粘贴以下代码保存

```json
{
    "cmd": ["node", "--use-strict", "--harmony", "$file"],
    "selector": "source.js"
}
```

**解释：**`node`是执行命令，而`--use-strict`跟`--harmony`则是执行参数，`$file`则是当前文件，如果不想要有es6特性，则只需要将配置文件改为以下的代码

```json
{
    "cmd": ["node", "$file"],
    "selector": "source.js"
}
```

使用：在sublime新建一个测试文件

```javascript
let a = 1;
console.log(a);
```

`ctrl + b`就可以得到结果`1`

最后：ECMAScript当前的所有提案，可以在TC39的官方网站**[https://github.com/tc39/ecma262](https://github.com/tc39/ecma262)**查看。