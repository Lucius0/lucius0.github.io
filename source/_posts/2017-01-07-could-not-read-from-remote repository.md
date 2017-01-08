---
layout: post
title:  "git clone时遇到could not read from remote repository"
date:   2017-01-07 21:00:00
categories: tools
permalink: /archivers/could-not-read-from-remote-repository
tags: git
---

git clone 时遇到如下的错误。

```
$ git clone git@github.com:xxxxx/xxx
Cloning into 'xxx'...
The authenticity of host 'github.com (192.30.252.128)' can't be established.
RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
Are you sure you want to continue connecting (yes/no)? 
**Host key verification failed.**
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

## 问题原因

缺少 known_hosts 文件, 而且必须生成 github.com 的ip执行内容.

只要执行命令`ssh git@github.com`，这样在.ssh目录就有三个文件了，即`id_rsa`，`id_rsa.pub`，`known_hosts`