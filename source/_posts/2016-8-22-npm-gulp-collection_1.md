---
layout: post
title:  "npm&gulp常用插件(1)"
date:   2016-08-22
categories: tools
permalink: /archivers/npm-and-gulp-collection_1
tags: [gulp, npm]
---

这里收集了一些npm&gulp常用的插件，以方便查找。

- gulp：[http://gulpjs.com/](http://gulpjs.com/)

- npm：[https://www.npmjs.com](https://www.npmjs.com)

## rimraf ##

这一款实际上不是gulp的插件，是npm的插件，只是因为在windows下生成的node_module路径名太长了导致无法正常删除，因此可以用npm安装这个插件

> 官方描述：A deep deletion module for node (like rm -rf) 

> 简单点说，就是模拟unix或者linux下的rm -rf（强制删除命令）

安装：`npm install -g rimraf`

使用：`rimraf node_modules`

## Browsersync ##

Browsersync能让浏览器实时、快速响应您的文件更改（html、js、css、sass、less等）并自动刷新页面。更重要的是 Browsersync可以同时在PC、平板、手机等设备下进项调试。您可以想象一下：“假设您的桌子上有pc、ipad、iphone、android等设备，同时打开了您需要调试的页面，当您使用browsersync后，您的任何一次代码保存，以上的设备都会同时显示您的改动”。无论您是前端还是后端工程师，使用它将提高您30%的工作效率。

Browsersync中文网：[http://www.browsersync.cn/](http://www.browsersync.cn/)

安装：`npm install -g browser-sync` 或结合gulp `npm install --save-dev browser-sync`

使用：

- 静态网站：[《事例包》](http://www.browsersync.cn/example/packages/BrowsersyncExample.zip)跟[《示例视频》](http://www.browsersync.cn/example/video/browsersync1.mp4)

```javascript
// --files 路径是相对于运行该命令的项目（目录） 
browser-sync start --server --files "css/*.css"
// --files 路径是相对于运行该命令的项目（目录） 
browser-sync start --server --files "css/*.css, *.html"
// 如果你的文件层级比较深，您可以考虑使用 **（表示任意目录）匹配，任意目录下任意.css 或 .html文件。 
browser-sync start --server --files "**/*.css, **/*.html"
// 监听css文件 
browser-sync start --server --files "css/*.css"
// 监听css和html文件 
browser-sync start --server --files "css/*.css, *.html"
```

- 动态网站：

```javascript
// 主机名可以是ip或域名
browser-sync start --proxy "主机名" "css/*.css"
```

## JSHint && JSLint ##

**简介：**无论是JSHint，还是JSLint，都是通过检查和分析JavaScript代码，将不符合编码规则的代码警告开发者。JSHint是在JSLint进行二次开发，实际上，两种插件一样都拥有成熟的社区，就算是用途以及原理，都是相同的。但我们要选哪一种呢？

**区别：**

- JSLint检查规则较JSHint严格；

- JSLint配置选项上比JSHint少；

1. JSLint：[JSLint](https://github.com/douglascrockford/JSLint);

2. JSHint：[JSHint](https://github.com/spalger/gulp-jshint);

这里介绍JSHint

安装：`npm install jshint gulp-jshint --save-dev`

使用：

```javascript
gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint({ linter: 'some-jshint-module' }))
    .pipe(...);
});	
```

## gulp-babel ##

- git：[gulp-babel](https://github.com/babel/gulp-babel)

- npmjs:[gulp-babel](https://www.npmjs.com/package/gulp-babel)

安装：`npm install --save-dev gulp-babel`

在使用`gulp-babel`之前，需要安装`babel-preset-es2015`

使用：

```javascript
gulp.task('babel', function() {
	gulp.src("./src/*.js")
	    .pipe(babel({
            presets: ['es2015']
        }))
	    .pipe(gulp.dest("./dist/"));
});
```