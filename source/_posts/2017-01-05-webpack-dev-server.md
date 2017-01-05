---
layout: post
title:  "webpack-dev-server"
date:   2017-01-05
categories: tools
permalink: /archivers/webpack-dev-server
tags: webpack-dev-server
---

## 什么是webpack-dev-server？

前端的开发一般都是本地调试开发的，一般情况下都是自己本地搭建tomcat、nginx之类的服务器。但是有时候这种服务器配置对于部分前端开发人员来说是相当的不友好，因为不熟悉，因此就有了webpack-dev-server的出现，它主要是启动了nodejs的一个框架**express**，不但可以实现浏览器的即时刷新，同时还可以监听和打包文件，简化了繁琐的操作和节约了宝贵的开发时间。

原理即启动**express**的http服务器，主要作用就是来监听资源文件，并且通过http服务器和客户端使用的websocket协议，当有资源发生变化，webpack-dev-server会实时编译并更新浏览器的内容。

**注意：启动webpack-dev-server后，在目标文件夹中是看不到编译后的文件的,实时编译后的文件都保存到了内存当中。因此使用webpack-dev-server进行开发的时候都看不到编译后的文件。**

## 安装和配置

### 一. 安装

`$ npm install webpack-dev-server -g` 全局安装
`$ npm install webpack-dev-server --save-dev` 项目安装(推荐)

### 二. 配置

我们先来看看有什么参数：

```javascript
--content-base //设定webpack-dev-server的director根目录。如果不进行设定的话，默认是在当前目录下。
--quiet: //控制台中不输出打包的信息，开发中一般设置为false，进行 打印，这样查看错误比较方面
--no-info: // 不显示任何信息
--colors: //对信息进行颜色输出
--no-colors: //对信息不进行颜色输出
--compress:  //开启gzip压缩
--host <hostname/ip>: //设置ip
--port <number>: //设置端口号，默认是:8080
--inline: //webpack-dev-server会在你的webpack.config.js的入口配置文件中再添加一个入口,
--hot: //开发热替换
--open: //启动命令，自动打开浏览器
--history-api-fallback: //查看历史url
```

详细参数可以查看[http://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli](http://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli)

**content-base: **设定webpack-dev-server的根目录。如果不进行设定的话，默认是在当前目录下。

`webpack-dev-server --content-base ./assets`

**注意：若webpack.config.js中的output配置了publicPath这个字段的值的话，在index.html也要做出相对应的调整。因为webpack-dev-server的根目录是相对publicPath这个路径。**

举个例子，若webpack.config.js配置如下：

```javascript
module.exports = {
    entry: './src/js/index.js',
    output: {
        path: './dist/js',
        filename: 'bundle.js'，
        publicPath: '/assets/'
    }
}
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demo</title>
</head>
<body>
    <script src="assets/bundle.js"></script>
</body>
</html>
```

若webpack.config.js没有配置output的publicPath的话，那么index.html如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demo</title>
</head>
<body>
    <script src="bundle.js"></script>
</body>
</html>
```

执行命令为：`webpack-dev-server --content-base ./assets`

## webpack-dev-server 热更新

webpack-dev-server有两种自动刷新模式：

- Iframe mode(默认)

- inline mode

### Iframe mode

在网页嵌入iframe，然后将我们的应用嵌入iframe当中，每次资源文件发生更改，就会刷新iframe，执行命令为`webpack-dev-server --content-base ./dist`，而访问路径为`localhost:8080/webpack-dev-server/index.html`

### Inline-mode

Inline-mode刷新模式是直接刷新页面，不会在页面增减任何的元素或者js插件，它是直接放在内存中，这种方式也是官方推荐的，并且速度相对来说比较快。实现Inline-mode刷新模式 有很多的方法，下面我们来列举一下：

**方法一：**将代码内联到入口配置文件webpack.config.js文件entry属性里面，并且添加new
 webpack.HotModuleReplacementPlugin()热点插件

```javascript
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");

module.exports = {

    //项目的文件夹 可以直接用文件夹名称 默认会找index.js ，也可以确定是哪个文件名字
    entry: [
        'webpack-dev-server/client?http://localhost:8080/',
        './src/index.js'
    ],

    //输出的文件名,合并以后的js会命名为bundle.js
    output: {
        path: path.join(__dirname, "dist/"),
        publicPath: "http://localhost:8088/dist/",
        filename: "bundle.js"
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};
```

这种方式比较容易，但是不够灵活，需要添加相关的热点插件。

**方法二：**直接在你index.html引入这部分代码

```html
<script src="http://localhost:8080/webpack-dev-server.js"></script>
```

这种方法更不好，项目上线还需要手动删除，坚决杜绝这些方法。

**方法三：**直接实现一个server.js，启动服务器(需要启动热替换plugin)

```javascript
var webpack = require('webpack');　　
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackDevServer = require('webpack-dev-server');
var config = require("./webpack.config.js");

config.entry.index.unshift("webpack-dev-server/client?http://localhost:9000"); // 将执替换js内联进去
config.entry.index.unshift("webpack/hot/only-dev-server");

var compiler = webpack(config);
var server = new webpackDevServer(compiler, {
    hot: true,
    historyApiFallback: false,
    // noInfo: true,
    stats: {　　 colors: true // 用颜色标识
            　　 },
    　　proxy: {　　 "*": "http://localhost:9000" // 用于转发api数据，但webpack自己提供的并不太好用
            　　 },
});
server.listen(9000);
```

**方法四：**直接在webpack.config.js上配置。这个办法最简单，当然灵活性没有自己实现一个服务器好。

```javascript
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var path = require('path');
var CURRENT_PATH = path.resolve(__dirname); // 获取到当前目录
var ROOT_PATH = path.join(__dirname, '../'); // 项目根目录
var MODULES_PATH = path.join(ROOT_PATH, './node_modules'); // node包目录
var BUILD_PATH = path.join(ROOT_PATH, './dist'); // 最后输出放置公共资源的目录

//用于提取多个入口文件的公共脚本部分，然后生成一个 common.js 来方便多页面之间进行复用
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {

    //项目的文件夹 可以直接用文件夹名称 默认会找index.js ，也可以确定是哪个文件名字
    entry: [
        './src/index.js'
    ],

    //输出的文件名,合并以后的js会命名为bundle.js
    output: {
        path: path.join(__dirname, "dist/"),
        publicPath: "http://localhost:8088/dist/",
        filename: "bundle.js"
    },
    devServer: {
        historyApiFallback: true,
        contentBase: "./",
        quiet: false, //控制台中不输出打包的信息
        noInfo: false,
        hot: true,
        inline: true,
        lazy: false,
        progress: true, //显示打包的进度
        watchOptions: {
            aggregateTimeout: 300
        },
        port: '8088'
    }
};
```

## 配置webpackDemo项目本地服务器

上面我们讲解了webpack-dev-server 搭建本地服务以及浏览器实时刷新的相关方法和配置，我们选择方法四 直接在webpack.config.js使用devServer配置服务器以及热点替换。内容如下：

```javascript
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var path = require('path');
var CURRENT_PATH = path.resolve(__dirname); // 获取到当前目录
var ROOT_PATH = path.join(__dirname, '../'); // 项目根目录
var MODULES_PATH = path.join(ROOT_PATH, './node_modules'); // node包目录
var BUILD_PATH = path.join(ROOT_PATH, './dist'); // 最后输出放置公共资源的目录

//用于提取多个入口文件的公共脚本部分，然后生成一个 common.js 来方便多页面之间进行复用
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {

    //项目的文件夹 可以直接用文件夹名称 默认会找index.js ，也可以确定是哪个文件名字
    entry: [
        './src/index.js'
    ],

    //输出的文件名,合并以后的js会命名为bundle.js
    output: {
        path: path.join(__dirname, "dist/"),
        publicPath: "http://localhost:8088/dist/",
        filename: "bundle.js"
    },
    devServer: {
        historyApiFallback: true,
        contentBase: "./",
        quiet: false, //控制台中不输出打包的信息
        noInfo: false,
        hot: true,
        inline: true,
        lazy: false,
        progress: true, //显示打包的进度
        watchOptions: {
            aggregateTimeout: 300
        },
        port: '8088'
    }
}
```

 这个时候index.html内容如下：

 ```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="dist/bundle.js"></script>
</head>
<body>
<h1>Hello</h1>
</body>
</html>
```

然后在命令行执行一下操作启动 服务：

`webpack-dev-server --hot --inline`

在浏览器输入:localhost:8088, 这里我们设置的端口号是:8088