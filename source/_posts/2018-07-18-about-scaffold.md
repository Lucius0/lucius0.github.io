---
layout: post
title:  "脚手架的略知一二"
date:   2018-07-18
categories: [js, node]
permalink: /archivers/about-scaffold
tags: [js, node]
---

## 什么是脚手架？
当我们建造房子的时候，工地上会先搭个架子，然后工人们会在这个的基础上添砖加瓦，直到房屋成型。那么我们程序也是这样的道理，会在我们开发之前有一套相对成熟且适用的架子(配置项、技术栈)，然后我们会在这基础上直接产出需求功能，而需求重复的造架子。脚手架在我们开发项目中也是极其重要，能够提高我们的开发。
![](/images/qiniu/180718232750.png)

那么我们开发中有用到哪些脚手架呢？有`vue-cli`、`create-react-app`、`yeoman`等。

## Yeoman
[yeoman](http://yeoman.io/)较真来讲更应该称为脚手架框架，因为它不能直接创建项目文件，而是提供了一套完整的开发API，可以通过这些API来灵活地来制造符合你需求的脚手架方案。

### 开始
我们先来创建一个`yeoman`脚手架生成器，**注意文件夹的名字得为generator-开头，如generator-vuecli、generator-createapp**。

- `npm install --global yo` 
-  `mkdir generator-testcli && cd generator-testcli`
- `npm init`，生成`package.json`需要主要几点：
  - name 属性必须带有前缀 `generator-`
  - keywords 属性必须含有 `yeoman-generator`；
- `npm install --save yeoman-generator`

`yeoman-generator`：yeoman 会根据用户选择的 `generator` 下载的本地，其中 `generator` 指的是一套具有模板的项目。
在官方例子中`generator-fountain-webapp`就是其中的一个`generator`。当然你也可以选择你要的`generator`，如输入命令行`yo`，会有选项`Install a generator`让你选择你想要安装的`generator`。

**提示：**假如安装过程报`Error: EACCES, permission denied`错误，请使用`sudo npm`进行安装。

### 目录结构
`yeoman`支持两种不同的目录结构：./ 和 ./generators。即：
```bash
|---- package.json
|---- generators/
    |---- app/
        |---- index.js
    |---- router/
        |---- index.js
############################################
|---- package.json
|---- app/
    |---- index.js
|---- router/
    |---- index.js
```

### 重写构造函数
某些生成器方法只能在构造函数内部调用。这些特殊方法可能会执行诸如设置重要状态控件之类的操作，并且可能无法在构造函数之外运行。
```js
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('babel'); // This method adds support for a `--babel` flag
  }
};
```

### 添加功能函数
```js
method1() {
  this.log('method 1 just ran');
}

method2() {
  this.log('method 2 just ran');
}
```

完整代码为：
```js
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('babel'); // This method adds support for a `--babel` flag
  }

  method1() {
    this.log('method 1 just ran');
  }

  method2() {
    this.log('method 2 just ran');
  }
};
```

### npm绑定全局
使用 npm 创建一个node全局模块，并且连接到本地。在脚手架项目根目录下`generator-name/`，输入`npm link`。

### 执行
`yo testcli`，会出现如下图信息。
![](/images/qiniu/180718233135.png)

到这里一个小小的官方demo已经执行完成了，更多的可以查看[Writing Your Own Yeoman Generator | Yeoman](http://yeoman.io/authoring/index.html)

## 自定义前端脚手架
刚才在上问已经说了，`yeoman`实际上更像是一个脚手架框架，可以通过它来打造各种利器(脚手架)。那我们现在就从头开始学习下怎么打造一个利器。

我们现在就来简单的做一个小栗子，执行`init`时会拉取GitHub上面的代码。**上面已经说过了，实际上就是相当于clone一个基础项目到本地。**

### 起步
我们把这个项目称为**messi**吧。

- `mkdir messi && cd messi`；
- `npm init`(此处的`package.json`就没有`yeoman`那样需要name跟key有前缀的要求了)；
- `npm install --save chalk co co-prompt commander`
  - [chalk](https://github.com/chalk/chalk)：能在terminal中显示自定义字符串颜色的插件；
  - [co](https://github.com/tj/co)：异步流程控制工具；
  - [co-prompt](https://github.com/tj/co-prompt)：不但可以提供提示信息，还可以分步骤输入你想要的参数和选项；
  - [commander](https://github.com/tj/commander.js/)：有效的组织terminal的输入；

### 入口文件
我们在根目录创建`/bin`文件夹，然后在该文件夹创建的文件`messi.js`。即`bin/messi.js`为我们这个项目的入口文件。

```js
// bin/messi.js
// 执行环境能够支持ES6
#!/usr/bin/env node --harmony
'use strict'

const program = require('commander');
const pkg = require('../package');

 // 定义当前版本
program.version(pkg.version);

// 定义使用方法
// Usage: messi [options] [command] -> 
// Usage: messi <command>
// 区别就是可选到必选
program
  .usage('<command>');

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
```

### 挂载全局
其实这样就可以看到效果了。我们现在在`package.json`添加以下配置，表示全局钩子`messi`的加载文件是`bin/messi.js`。

例如：
```js
>>> /usr/local/bin/messi -> /usr/local/lib/node_modules/messi/bin/messi.js
>>> /usr/local/lib/node_modules/messi -> /Users/xxx/Documents/study/messi
```

**package.json**
```json
"bin": {
  "messi": "bin/messi.js"
}
```

然后在根目录执行`npm link`或`sudo npm link`。打开另一个terminal标签执行`messi`命令。
![](/images/qiniu/180718233522.png)

### 添加init模版
我们在根目录创建`command`文件夹，然后在其文件夹创建我们的主角`init.js`。目的是想通过`init`从远端仓库拉取一个项目模板。

我们需要在`messi.js`添加了相对应的命令行。
```js 
// messi.js
const init = require('../init');

program
  .command('init')
  .description('创建新项目')
  .alias('i')
  .action(() => { init(); });
```

然后我们需要在`init.js`添加逻辑代码。
```js
// init.js
const co = require('co');
const chalk = require('chalk')
const prompt = require('co-prompt');
const exec = require('child_process').exec;

module.exports = () => {
  console.log(chalk.white('init...'));

  co(function *() {
    let pull = yield prompt('你是否想要拉取scaffold-cli项目? y/n ');
    pull = pull.toLowerCase();
    if (pull === 'n') {
      console.log(chalk.red('已经成功退出!'));
      process.exit()
    } else if (pull === 'y') {
      const projectName = yield prompt('项目名称：');
      const gitCmd = `git clone git@github.com:Lucius0/scaffold-cli.git ${projectName} && cd ${projectName} && git checkout master`;
    
      console.log(chalk.white('开始拉取...'));

      exec(gitCmd, (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          process.exit();
        }
        console.log(chalk.green('拉取成功!'));
        process.exit()
      });
    }
  });
};
```
到此刻为止，我们基本上的一个小demo已经完成了。关于`exec`方法，可以阅览[exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)。

### 目录结构
```js
|__ bin
  |__ messi.js
|__ command
  |__ init.js
|__ node_modules
|__ package.json
```

emmm。是不是感觉有些缺少什么？是的，我们如何能做到跟`vue-cli`一样优秀，可以自主选择自己想要的选择(有点拗口)。
![](/images/qiniu/180718233622.png)

### inquirer

> 常用交互式命令行用户界面的集合。

具体的官方文档可以看 -> [inquirer](https://github.com/SBoudrias/Inquirer.js#readme)，我们来简单的展示一下使用方法。首先`npm install --save inquirer`，然后在`messi.js`添加我们跟`init.js`功能一样的指令`init2`以及在`init2.js`添加相对应的逻辑。
```js
// messi.js
const init2 = require('../command/init2');
program
  .command('init2')
  .description('创建新项目')
  .alias('i2')
  .action(() => {
    init2();
  });

// init2.js
const co = require('co');
const chalk = require('chalk')
const inquirer = require('inquirer');
const exec = require('child_process').exec;

module.exports = () => {
  console.log(chalk.white('init...'));

  co(function *() {
    var promps = [];

    promps.push({
      type: 'list',
      name: 'pullProject',
      message: '你是否想要拉取scaffold-cli项目?',
      choices: [{
        name: 'Yes',
        value: 'y'
    }, {
        name: 'No',
        value: 'n'
      }]
    });

    inquirer.prompt(promps).then((answers) => {
      console.log(answers);
      const wanna = answers['pullProject'].toLowerCase();
      if (wanna === 'n') {
        console.log(chalk.red('已经成功退出!'));
        process.exit()
      } else if (wanna === 'y') {
        promps = [];

        promps.push({
          type: 'input',
          name: 'nameProject',
          message: '项目名称：'
        });

        inquirer.prompt(promps).then((answers) => {
          const projectName = answers['nameProject'];
          const gitCmd = `git clone git@github.com:Lucius0/scaffold-cli.git ${projectName} && cd ${projectName} && git checkout master`;
          console.log(chalk.white('开始拉取...'));
          exec(gitCmd, (error, stdout, stderr) => {
            if (error) {
              console.log(error);
              process.exit();
            }
            console.log(chalk.green('拉取成功!'));
            console.log(`cd ${projectName}`);
            exec(`cd ${projectName}`, () => {
              process.exit();
            });
          });
        });
      }
    });
  });
};
```

接下来一步就是构建项目`npm link`，然后执行`messi ini2`。
![](/images/qiniu/180718234154.png)

好了。。。。。。睡觉。。。。。。。