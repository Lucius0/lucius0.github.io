---
layout: post
title:  "将github的合并到本地(含提交日志)"
date:   2016-08-15
categories: git
permalink: /archivers/git-local-merge-github
tags: git
publish: false
---

有时候我们在使用github上的某一个框架时，会先把框架下载下来而不是clone下来，虽然工程上可以使用，但是已经丢失了github上原作者跟众多维护者的提交日志。这篇文章就是来将本地已经修改的框架跟远程github的框架进行日志上的合并。

将生成的id_rsa.pub的内容提供给github，即在github上创建一个SSH key，并把该公钥复制进去。

以下是我使用git的内容，省了一些信息，其中local-master就是上文说的本地已经做修改的框架，将本地的master重命名为old-master，拉取github上的master，进行单修改合并：

```javascript
// 获取github的全部更新
user /local-framework (master)
$ git fetch github

// 重命名master为old-master，为了就是github上的master分支可以拉取到本地
user /local-framework (master)
$ git branch -m old-master

// checkout远程分支master并切换到该分支
user /local-framework (old-master)
$ git checkout github/master -b master

// 远程master分支合并本地已修改分支
user /local-framework (master)
$ git merge old-master

// 因为在上一步出现冲突，因此回滚上一步
user /local-framework (master|MERGING)
$ git reset --hard master

user /local-framework (master)
$ git status

user /local-framework (master)
$ git log --pretty=oneline

user /local-framwork (master)
$ git cherry-pick < commit id_1 >

user /local-framwork (master)
$ git cherry-pick < commit id_2 >

user /local-framwork (master)
$ git cherry-pick < commit id_3 >

...
```

到这里已经将github上的分支合并并且保留了以前提交的日志，之后可以删除远程github分支并且修改本地分支名为master了