---
layout: post
title:  "npm&gulp常用插件(1)"
date:   2016-08-22
categories: gulp
permalink: /archivers/npm-and-gulp-collection_1
tags: gulp npm
publish: false
---

这里收集了一些npm&gulp常用的插件，以方便查找。

- gulp：[http://gulpjs.com/](http://gulpjs.com/)

- npm：[https://www.npmjs.com](https://www.npmjs.com)

## rimraf ##

这一款实际上不是gulp的插件，是npm的插件，只是因为在windows下生成的node_module路径名太长了导致无法正常删除，因此可以用npm安装这个插件

> 官方描述：A deep deletion module for node (like rm -rf) 

> 简单点说，就是模拟unix或者linux下的rm -rf（强制删除命令）

安装：```npm install -g rimraf```

使用：```rimraf node_modules```

## Browsersync ##

Browsersync能让浏览器实时、快速响应您的文件更改（html、js、css、sass、less等）并自动刷新页面。更重要的是 Browsersync可以同时在PC、平板、手机等设备下进项调试。您可以想象一下：“假设您的桌子上有pc、ipad、iphone、android等设备，同时打开了您需要调试的页面，当您使用browsersync后，您的任何一次代码保存，以上的设备都会同时显示您的改动”。无论您是前端还是后端工程师，使用它将提高您30%的工作效率。

Browsersync中文网：[http://www.browsersync.cn/](http://www.browsersync.cn/)

安装：```npm install -g browser-sync``` 或结合gulp ```npm install --save-dev browser-sync```

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