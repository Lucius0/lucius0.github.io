---
layout: post
title:  "搬进jekyll"
date:   2016-08-06 09:00:13
categories: jekyll
permalink: /archivers/move-to-jekyll
tags: jekyll
---

经过几个下班的时间，终于把jekyll捣弄好了。期间感谢以下几位博客的教程[ezlippi](http://www.ezlippi.com/blog/2015/03/github-pages-blog.html)以及[李跃东](http://blog.csdn.net/dliyuedong/article/details/46848155)，还有一些查找问题的过程中忘记存档下来的博主。

**以下记录以下我遇到的问题：**

1. git的使用跟ruby的安装请参考[ezlippi](http://www.ezlippi.com/blog/2015/03/github-pages-blog.html)，但是在安装jekyll的时候，下载速度会很慢以至于经常失败，大家可以使用[淘宝的镜像](https://ruby.taobao.org/)或者[Ruby China的镜像](http://gems.ruby-china.org/)(推荐)。在使用镜像安装之前会先卸载自带的镜像
``` --remove https://rubygems.org/ ```，但是在添加新的镜像的时候会报找不到该新镜像的错误，一旦有这个问题的解决方法就是到``` user/your account/.gemrc ``` 将sources的值改为新镜像地址就可以了。 

2. jekyll 3.2.0有路径查找错误的bug。我是退回到3.1.6就可以了。官方在3.2.1已经修复。若有问题，可以
``` gem install -v 3.1.6 jekyll -V ``` 来安装3.1.6版本。

3. [jekyllcn](http://jekyllcn.com/)是一个很好的中文官方文档，大家可以参考。

4. 评论我是用多说的，只要去多说官网创建一个管理站点就可以了，详细大家可以自行搜索。

5. 站内搜索可以参考[李跃东](http://blog.csdn.net/dliyuedong/article/details/46848155)。

以上是我的分享，jekyll是我从WordPress搬过来之后感觉很快很爽的一个静态博客网站，希望大家enjoy it！