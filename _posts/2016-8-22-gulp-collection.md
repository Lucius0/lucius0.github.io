---
layout: post
title:  "gulp常用插件"
date:   2016-08-22
categories: gulp
permalink: /archivers/gulp-collection
tags: gulp
publish: false
---

这里收集了一些gulp常用的插件，以方便查找。

## rimraf ##

这一款实际上不算是gulp的插件，是npm的插件，只是因为在windows下生成的node_module路径名太长了导致无法正常删除，因此可以用npm安装这个插件

> 官方描述：A deep deletion module for node (like rm -rf) 

> 简单点说，就是模拟unix或者linux下的rm -rf（强制删除命令）

安装：```npm install -g rimraf```

使用：```rimraf node_modules```