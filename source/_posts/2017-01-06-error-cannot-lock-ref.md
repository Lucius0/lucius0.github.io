---
layout: post
title:  "git pull时遇到error: cannot lock ref的错误"
date:   2017-01-06
categories: tools
permalink: /archivers/error-cannot-lock-ref
tags: git
---

> git pull 时遇到 **error: cannot lock ref 'xxx': 'xxx' exists; cannot create 'xxx'**，会导致pull失败。

## 问题原因

git工程的.git/refs目录下跟踪的某些git分支，在pull时候发现与远程仓库对应的分支refs不同，因此导致 git pull 失败

**举个例子：**

1. A同事`$ git push -force`了test这个分支，导致远程仓库的分支被覆盖，而你本地的refs则会与远程仓库的分支不一致，产生问题；

2. git分支是不区分大小写，有人删除了远程仓库的分支又重新创建一个同样名字的分支同样也会产生问题。

## 解决方法

要么强行git pull，要么删除出现问题的refs文件夹，再git pull(推荐)

1. 删除有问题的refs，可以直接在.git/refs下面根据错误提示删除相对应的refs文件，如'refs/remotes/origin/testParent/test'，你也可以删除refs整个文件夹。

2. 使用git命令`$ git update-ref -d refs/remotes/origin/testParent/test`

3. 强制执行pull，`$ git pull -p`