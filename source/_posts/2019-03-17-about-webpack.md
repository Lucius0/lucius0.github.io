---
layout: post
title:  "Webpack 之常见的见招拆招"
date:   2019-03-17
categories: [webpack]
permalink: /archivers/about-webpack
tags: [webpack]
---

前端的发展，大致的发展路线可以看黄玄的[JavaScript 模块化七日谈](https://huangxuan.me/js-module-7day/#/)。从最初的全局污染式的注入到ES6模块化，打包工具的不断迭代替换。主要的原因都是因为前端发展越来越复杂庞大所导致。

本篇文章主要是来谈谈 webpack 在我们平时的开发工作中起到什么作用，以及我们该如何灵活的应用它来成为我们的利器。大多数情况下我不会说明怎么使用，因为这样会导致篇幅太多不容易阅览，所以具体的配置还是得自己阅览官方文档。

## 背景
如今的前端百花齐放，不再像以前那样直接操作 DOM 然后压缩扔到服务器上去。看似没啥问题，但是不断的重复劳动力导致开发效率低下。

React、Vue、Angular2。Typescript、Flow、CoffeeScript、ES6。SASS、LESS。分别为**前端框架**、**JS超集/JS新标准**、**CSS预处理器**。以上的这些无法直接的在浏览器上跑，都需要转换为 ES5/CSS 才可以。（注：ES6 可以在支持 ES6 语法的浏览器上运行，如Chrome）

## 构建工具
无论什么构建工具，它们做的内容都是大同小异：代码转换、文件优化、代码分割、模块合并、自动刷新、代码校验、自动分布。历史上的构建工具都是基于Node.js开发的。有**Grunt**、**Gulp**、**Fis3**、**Rollup**、**Browserify** 等等。更具体可以参考[前端构建：3类13种热门工具的选型参考](https://segmentfault.com/a/1190000017183743)

至于它们之间优劣性以及为什么选择webpack在网上有很多相关的资料可以参考，在这里就不再赘述了。

## 开始
### 基础配置
```js
/// webpack.config.js
const path = require('path');
module.exports = {
  // js 执行入口文件
  entry: './main.js',
  output: {
    // 将所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 将输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

执行 `webpack --config webpack.config.js`，则会在`dist`文件夹生成`bundle.js`文件，这就是最基本的 webpack 配置。更多配置查看官网[webpack](https://webpack.js.org/concepts)

### Loader
Loader 主要是用于将模块代码转换为可在浏览器运行的代码。可以理解为翻译机。如将 Less 转换为 CSS，Typescript 转换为 Javascript 等。

### Plugin
Plugin 主要是扩展 webpack 的功能，增强 webpack 的灵活性。如`extract-text-webpack-plugin`，可以将包中的文本提取到单独的文件中，从`bundle.js`提取 css 到单独的文件出来等。

### DevServer
`webpack-dev-server`，可以帮我们解决上面没提到但是在开发中遇到的痛点。
* 提供 HTTP 服务而不是使用本地文件预览；
* 监听文件的变化并自动刷新网页，做到实时预览:
* 支持 Source Map，以方便调试。

## 见招拆招
交待完 webpack 的基础也是重要的功能之后，我们从工作中开始，见招拆招，也就是说我们平时需要做什么，webpack 能帮我们做什么。

### 见招 - ES6
ES6的出现引入了新的语法，提高了开发效率。但是目前仍有很多浏览器对其标准支持不全。所以我们需要将其转换为 ES5 以及对新 API 打 polyfill。才能正常的使用。

### 拆招 - Babel
Babel 是 JS 编译器，主要功能就是将 ES6 转为 ES5，详看 [What is Babel? · Babel](https://babeljs.io/docs/en/)。在项目根目录创建`.babelrc`。
```json
{
  // plugins 告诉 Babel 要使用哪些插件，这些插件可以控制如何转换代码 。 
  "plugins": [
    [
      "transform-runtime",
      {
        "polyfill": false
      }
    ],
  ],
  // presets属性告诉 Babel要转换的源码使用了哪些新的语法特性，一个 Presets对一组新语法的特性提供了支持，多个 Presets 可以叠加。
  "presets": [
    [
      // 除此之外，还有往上的标准如 ES2016等 以及 Env，其中 Env 包含ES 标准的最新特性
      "es2015", 
      {
        "modules": false
      }
    ],
    // 社区提出却还未入标准的新特性，有stage0 - stage4，被纳入的可能性依次增加
    "stage-2",
    // 特定应用场景语法特性
    "react"
  ]
}
```
在了解 Babel 后，下一步就是配置 Webpack。
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      }
    ]
  }
}
```
---
### 见招 - Typescript
**Type**script 是 Javascript **类型**的超集，它可以编译成纯 Javascript。[TypeScript—JavaScript的超集](https://www.tslang.cn/)

### 拆招 - Typescript
Typescript 官方提供了能将 Typescript 转换成 JavaScript 的编译器。执行安装`npm i -g typescript`，然后在根目录新建配置编译选项`tsconfig.json`。
```json
{
  "compilerOptions": {
    "module": "commonjs", // 编译出的代码采用的模块规范
    "target": "es5", // 编译出的代码采用 ES 的哪个版本
    "sourceMap": true // 输出 Source Map 以方便调试
  },
  "exclude": [
    "node_modules"
  ]
}
```
配置完`tsconfig.json`，我们就可以配置 Webpack。
```js
module.exports = {
  ...
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  devtool: 'source-map',
}
```
---
### 见招 - SASS/LESS
SASS 和 LESS 都是 CSS 的预处理器，它们都是可以方便的管理代码，抽离样式公共部分，通过逻辑来书写更加灵活的样式代码，从而提高效率。关于他们更多的信息可以[Sass: Syntactically Awesome Style Sheets](https://sass-lang.com/)和[Getting started | Less.js](http://lesscss.org/)去查看。

### 拆招 - SASS-LOADER / LESS-LOADER
安装完`sass-loader`或`less-loader`之后，直接配置Webpack。
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss/, 或 /\.less/
        use: ['style-loader', 'css-loader', 'sass-loader'] 或 ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  }
}
```
其处理流程如下：
1、通过 loader 将 sass/less 文件转换为 css 代码，再将其交给 `css-loader` 处理；
2、`css-loader` 会找出 css 代码中导入语句如`@import`或`url()`，同时支持 css modules、压缩 css 等功能，然后交给 `style-loader` 处理；
3、`style-loader` 会讲 css 转换为字符串注入 js 代码中。

---

### 见招 - React
React 中主要是因为其代码中使用了 JSX 和 Class 特性，因此我们需要将其转换为浏览器能识别的 JavaScript 代码。

### 拆招 - Babel
我们需要依赖 `babel-preset-react`来完成语法上的转换。所以我们还需要配置`.babelrc`，加入 React Preset。
```json
"presets": [
  "react"
]
```
其实这样就可以了。但是我们有时候会使用 React + Typescript 组合来提高我们开发效率。在上面我们提到 Typescript 的开发，我们这次来修改其配置文件`tsconfig.json`。
```json
{
  "compilerOptions": {
    "jsx": "react" // 开启 JSX，支持 React
  }
}
```

至于 Webpack 的配置，其实不用太多的改动，只需要支持下`/\.tsx/`后缀文件就行。

---
### 见招 - Vue
Vue 没有 React 那样会内置专属语法，但它和 React 一样，都推崇组件化和由数据驱动的思想。话不多说，直接拆招。

### 拆招 - vue-loader
解析 vue 主要需要 `vue-loader` 和 `vue-template-compiler`。`vue-loader` 主要事用来解析和转换`.vue`文件，提取出其中的逻辑代码、样式代码以及 html 模板 template，再分别将它们交给对应的 Loader 去处理，如 template 则就是由 `vue-template-compiler` 去处理的。
```js
/// webpack
module: {
  rules: [
    {
      test: /\.vue$/,
      use: ['vue-loader'],
    },
  ]
}
```
同样，假如我们需要 Vue + Typescript 组合呢？从 Vue 2.5 开始，就提供了对TS 的支持。配置 `tsconfig.json`。
```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "es2015", // 用于使 Tree Shaking 优化生效
    "moduleResolution": "node",
  }
}
```
除此之外还需要在声明文件 `vue-shims.d.ts` 定义 vue 类型：
```ts
declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}
```
修改 webpack 配置文件。
```js
module: {
  rules: [
    {
      test: /\.ts$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        appendTsSuffixTo: [/\.vue$/],
      }
    }
  ]
}
```
---

到这里为止，我们就可以通过 webpack 来进行我们的开发工作了。但是实际项目中有很多的痛点，例如代码检查，热更新，CDN发布等。我们不可能每次都手动的来配置，这样太繁琐太浪费时间了。接下来我们通过 webpack 来优化我们的开发体验。

### 见招 - 监听更新
当我们在开发阶段，肯定会在期间不断地修改源码。但是我们不可能每一次修改就手动编译然后刷新页面，这明显浪费我们的时间跟精力。于是就有了自动化监听更新，原理就是监听本地源码包括样式，一旦发生变化时，就会自动构建然后刷新浏览器。

### 拆招 - webpack
通过 webpack 开启监听模式，一般有两种方式：
- 配置`webpack.config.js`设置`watch: true`;
- 执行 webpack 时，可以带上参数，如 `webpack --watch`

它的工作原理就是通过 `aggregateTimeout` 设置等待时间，到该时间时就会去检查编辑后的文件的最后编辑时间从而达到监听的目的。

### 见招 - 自动刷新浏览器
在上面我们提到了**监听更新**，但是更新完后浏览器应该有所表现，不然手动刷新浏览器的行为也是蛮愚蠢的。所以当我们监听到的文件一旦发生了修改，浏览器就要主动去刷新浏览器。

### 拆招 - webpack-dev-server
我们使用 `webpack-dev-server` 模块启动 webpack 模块时，webpack 模块的监听模式默认会被开启。webpack 模块会在文件发生变化时通知 `webpack-dev-server` 模块。

通过 `webpack-dev-server` 启动时，有以下两种方式可以实现自动刷新：
- `webpack-dev-server`(默认)：向要开发的网页注入代理客户端代码，通过代理客户端去刷新整个页面；
- `webpack-dev-server --inline false`：将要开发的网页装进一个 iframe 中，通过刷新 iframe 去看到最新效果。

### 见招 - 模块热替换
在上面提到的更新后刷新是会刷新整个页面，这样的体验不好。所以 `webpack-dev-server` 还支持模块热替换，就是在不刷新整个页面的情况下只替换修改的文件，这样不但快捷，而且数据也不会丢失。

### 拆招 - webpack-dev-server
实现模块热替换也有两种方式：
- webpack-dev-server-hot
- HotModuleReplacementPlugin(推荐)

### 见招 - 检查代码
当我们的项目越来越庞大时，特别是多人协作开发，会导致一个问题就是代码会有多种风格导致可读性下降。因此我们需要在提交之前执行自动化检查，让项目成员强制遵守统一的代码风格，同时也可以分析出潜在的问题。

### 拆招 - **lint 及 husky
`**lint` 这里指的是针对不同的语言使用不同的 `lint` 检查工具。
 - `eslint`：用来检查 JavaScript，配置 `.eslintrc` 来添加规则，再结合 `eslint-loader` 就可以通过 webpack 来执行代码检查；
 - `tslint`：用来检查 TypeScript，配置 `tslint.json` 来添加规则，再结合 `tslint-loader` 就可以通过 webpack 来执行代码检查；
 - `stylelint`：用来检查样式文件，如 SCSS、Less等，配置`.stylelintrc` 来添加规则，再结合 `stylelint-webpack-plugin` 就可以通过 webpack 来执行代码检查；

上面通过整合到 webpack 存在个问题，就是在开发过程中构建速度会变慢很多。所以我们建议在提交的时候通过 Git Hook 来执行我们的代码检查，如**husky**，**husky** 会通过 Npm Script Hook 自动配置好 Git Hook，然后我们只需要在 `package.json` 添加 `script` 脚本，其中 `precommit` 和 `prepush` 只需要其中一个就好了，配置如下：

```json
{
  "scripts": {
    // 在执行 git commit 前会执行的脚本 
    "precommit": "npm run lint",
    //在执行 git push 前会执行的脚本 
    "prepush": "lint",
    // 调用 eslint、stylelint 等工具检查代码
    "lint": "eslint && stylelint"
  }
}
```


### 其他
除了上面这些，我们可能还需要需要以下的配置：
**加载图片**
	- `file-loader`：将 JavaScript 和 CSS 中导入图片的路径替换成正确的路径，并同时将其输出到对应位置；
	- `url-loader`：将文件的内容经过 base 64 编码后注入JavaScript 或 CSS 中。

**加载SVG**
	- `raw-loader`：可以将文本文件内容读取出来，注入到 JavaScript 或 CSS 中。
	- `svg-inline-loader`：跟 `raw-loader` 一样，但是增加了对 svg 压缩的功能。

## 优化
### 区分环境
区分环境的好处我就不多解释了，这里主要是用到了 webpack自带(当代码出现`process`时，webpack会将其模块打包进去)的 `process` 模块。使用方法也很简单 `process.env.NODE_ENV` 就行了。

### 压缩代码
上线后我们除了GZIP对其文件进行压缩，我们还需要对文件本身进行压缩进而减少网络传输流量和提高网页加载速度。这里的文件压缩就是用到了`UglifyJsPlugin` 插件。详情配置可以查看官方，需要注意的是，记得区分环境如 `source-map` 等。

### 压缩 CSS
压缩 CSS，用一款基于 `PostCSS` 的压缩工具 `cssnano`。`css-loader`已经内置其模块了，只需要开启 `css-loader` 的 `minimize` 选项即可。

### CDN加速
这里不是说要通过前端来做 CDN 加速的事，而是当我们上传静态资源时，静态资源需要通过 CDN 服务提供的 URL 地址去访问，而我们要做的，就是在生成页面时，将我们的**静态资源替换为CDN的地址**。
我们所说的静态资源主要分为两种，入口 HTML 文件以及 JS、CSS、图片等静态资源。前者的处理方法是存在服务器而非CDN，并且服务器不对其做缓存处理，这样就可以保证每次请求的入口文件都是最新的；后者则会上传 CDN 服务上，做缓存处理。
简单的来说就是入口 HTML 文件是在每一次请求都是最新的，那么其请求的 静态资源的 Hash 值也有可能会更新，那么只要发生变换，则去请求新的静态资源就行了。

那么问题来了，怎么做才能每次打包新的 HTML 文件时，其请求的静态资源的也会跟随变化呢？webpack 及其插件提供了其功能，分别为：
- `output.publicPath` 中设置 Javascript 的地址；
- `css-loader.publicPath` 中设置被 CSS 导入的资源的地址；
- `Webplugin.stylePublicPath` 中设置 CSS 文件的地址。


### 提取公共代码
webpack 有个专门用于提取多个 Chunk 中公共部分的插件 `CommonsChunkPlugin`，用法如下：
```js
const ComrnonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

new CommonsChunkPlugin({
  // 从 a、b chunk 提取共同的代码模块
  chunks: ['a', 'b'],
  // 将其封装到 common 新 chunk
  name: 'common',
}) 

```

### 按需加载
在这里只针对 Vue、React 来说。目前比较流行的做法就是在路由上做处理。

**Vue**
`vue-router` 通过 vue 的[动态组件 & 异步组件 — Vue.js](https://cn.vuejs.org/v2/guide/components-dynamic-async.html#%E5%BC%82%E6%AD%A5%E7%BB%84%E4%BB%B6)，就可以实现按需加载了，如：
```js
resolve => require(['./Test'], resolve)
```

**React**
`react-router` 还可以配合 `react-loadable`，实现路由按需加载，如：
```js
function asyncLoad (loader) {
  return Loadable({ loader });
}
asyncLoad(() => import('./Test'));
```

### 分析报告
webpack 自带分析功能`webpack --profile --json > stats.json`，也可以安装可视化分析工具`webpack-bundle-analyzer`更加直观的观察项目的情况。

## 最后
本篇的大多内容是阅览完《深入浅出 webpack》后的总结。之所以想总结，是因为 webpack 的配置给人的感觉就是配置麻烦很琐碎。因此就有了这个想法，对知识点的查漏补缺，同时也是一次对知识点的梳理。这篇文章目前主要梳理常用的一些配置、插件以及优化。当然这也只是冰山一角，更多的还需要自己去查阅官方文档，不同版本也会有不同的差异性。之后遇到问题，我也会持续记录下来。