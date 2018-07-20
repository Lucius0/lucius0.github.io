---
layout: post
title:  "GitLab CI / CD 入门配置"
date:   2018-07-09
categories: git
permalink: /archivers/gitlab-ci-cd-getting-started-guide
tags: [git]
---

## 什么是CI
**CI(Continuous integration)**，持续集成。即开发成员在工作时不断的集成工作分支到主分支。这样做不仅可以提供开发效率，还可以自动测试和构建工作，快速迭代的同时还可以及时发现错误，一举多得。

## 什么是CD
**CD(Continuous Deployment)**，持续交付。简单的说就是频繁地将集成后的产品交付给质量团队或用户进行下一步的评审，通过了则到生产阶段。

## GitLab CI / CD
GitLab CI / CD，就是在GitLab上集成了CI / CD系统。假如你的项目中有`.gitlab-ci.yml`文件，那么当开发成员在`commit`或者`merge request`之后，会按照`.gitlab-ci.yml`所配置的内容来执行，完成CI / CD操作。

Runner有很多执行平台，例如`SSH、Docker、Kubernetes`。这里我们先用SHELL来执行一下。(注意：这里操作系统统一为macOS)

### SHELL安装GitLab Runner
具体流程：[https://docs.gitlab.com/runner/install/osx.html#installation](https://docs.gitlab.com/runner/install/osx.html#installation)

1. 下载
```bash
>>> sudo curl --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64
```

2. 赋予权限
```bash
>>> sudo chmod +x /usr/local/bin/gitlab-runner
```

3. 注册
其中在注册步骤中，需要你输入URL和Token。
```bash
>>> Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com )
>>> xxx-url
>>> Please enter the gitlab-ci token for this runner
>>> xxx-token
```
那么我们需要在项目中找到对应的信息。如下图中的4则对应xxx-url、5则对应xxx-token。
![1](http://ouazw12mz.bkt.clouddn.com/18712982379123.png)
之后的步骤按照链接的执行，需要注意的是**executor**我们选**shell**。

4. 启动服务
```bash
>>> gitlab-runner install
>>> gitlab-runner start
```

5. 运行
```bash
>>> sudo gitlab-runner run
```

### Docker 安装 GitLab Runner
[参考链接](https://segmentfault.com/a/1190000012279248)，这里就不赘述了。

## 基础概念介绍
### Pipeline
每一次commit或者MR都会执行一次pipeline构建任务，当然里面有很多阶段需要执行，如测试、编译等。

### Stage
这里就是上文提到的阶段，每一次pipeline有很多个stage，这些stage都是会按上到下执行，而且只有当前stage执行完毕之后才能执行下一个stage，否则就会报错。

### Job
job 为GitLab CI / CD的最小独立运行单位，它表示在指定stage下执行的任务工作，当然加入其中一个job执行失败，同样的该stage也会算是执行失败。但是不同的一点是，相同stage里面可以有很多不同的job，这些job是并行执行的。

### .gitlab-ci.yml
介绍完基础概念，那么就是我们项目中需要的文件`.gitlab-ci.yml`。
```xml
// 定义在每个job之前运行的命令
before_script:
  - yarn
 
// 定义构建阶段，stages
stages:
  - build
  - test
  - deploy
 
// job1
lint:
  stage: test
  script:
    - echo "Running lint"
    - yarn lint
 
// job2
deploy_staging:
  stage: deploy
  script:
    - echo "Deploy to staging environment"
    - yarn build:stag
    - yarn pub:stag
  // 定义git分支，并为其创建job。这里表示只有release分支才会执行该job
  only:
    - release
```
更多的可以查看[gitlab-ci-yaml](https://fennay.github.io/gitlab-ci-cn/gitlab-ci-yaml.html)。

### 补充
1、在某些时候，我们的runner假如是在本地运行的时候，会针对项目做一些环境变量的处理，例如`CONFIG_ENV=UAT`、`CONFIG_ENV=DEV`分别表示两个不同的环境。那么我们也可以通过`.gitlab-cli.yml`的配置让runner在不同的环境变量下执行。
```xml
// 修改 job2
deploy_dev:
  stage: deploy
  script:
    - echo "Deploy to dev environment"
    // @1 表示设置runner执行的环境变量xxx_key为$xxx_key，会下面说明。
    - export xxx_key=$xxx_key
    // 表示设置runner执行的环境变量CONFIG_ENV为DEV
    - export CONFIG_ENV=DEV
    - yarn build:dev
    - yarn pub:dev
  only:
    - release
```
其中，xxx_key为下图中的4，$xxx_key为下图中的5。例如xxx_key = 123456
![1-1](http://ouazw12mz.bkt.clouddn.com/123823987231981-1.png)

2、在有些情况下，我们在runner执行任务时，会想npmjs拉去npm包，但是因为墙的问题，往往会因为超时而拉取失败，这时候我们可以通过`.gitlab-cli.yml`的配置来指定runner来执行。
```xml
// 修改 job2
deploy_dev:
  // 新增tags属性，表示指定tag为xxx的runner
  tags:
    - xxx
```
xxx在哪里可以找到呢？下图中的`inernal`，`k8s`，`shared`，`test`即为该runner的tag。
![1-2](http://ouazw12mz.bkt.clouddn.com/987128731219231-2.png)

3、在补充2中说到，假如要翻墙时我们可以设置指定的runner来执行我们的任务，当然我们也可以在环境变量中设置(不)代理环境的配置。
```xml
// 修改 job2
deploy_dev:
  // 新增环境代理(表示该job在执行runner时的环境下代理)
  - export http_proxy=http://xx.xx.xx.xx:xxxx
  - export https_proxy=http://xx.xx.xx.xx:xxxx
  // 新增环境不代理(表示当ip或域名为以下变量时，不执行代理)
  - export no_proxy=123.123.123.123:1234,noproxy.com
```

## Q & A(持续更新)
Q：为什么`yarn: not found`？
A：镜像里面找不到yarn，可以通过配置image为其指定镜像。

Q：`error An unexpected error occurred: "https://registry.npmjs.org/xxx: ETIMEDOUT".`
A：npm访问不了，得翻墙。（可以通过个人电脑运行specific runner亦或找运维配置一个shared runner），详情可以参考补充2。

Q：一直重复`Waiting for pod xxx to be running, status is Pending...`。
A：有时候受网络的影响，可能会拉取失败。这时候先自己**尝试多几次**，假如再不行，再看👆的解决方案。

Q：起了本地服务之后，在gitlab上运行时，一直`pending`状态并且处于`stuck`。如下图：
![](http://ouazw12mz.bkt.clouddn.com/180720221541.png?imageslim)
A：假如你成功起了本地服务之后，提示无法找到runner，那么你可以给配置`.gitlab-ci.yml`添加你本地添加的tag