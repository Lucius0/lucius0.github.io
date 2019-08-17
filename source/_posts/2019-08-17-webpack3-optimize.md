---
layout: post
title:  "Webpack 3 - 从优化到放弃"
date:   2019-08-17
categories: [webpack]
permalink: /archivers/webpack3-optimize
tags: [webpack]
---

## 背景

某一天，我突然发现构建项目会经常失败，直接报错：`FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`，这个错误很明显就是内存不足导致的构建失败。由于项目是在[CI / CD ](https://lucius0.github.io/2018/07/09/archivers/gitlab-ci-cd-getting-started-guide/) 上构建的，而在此期间运维又调整了一下资源上限，因此什么原因导致的还得进一步排查，是由于真的内存不足还是存在内存泄漏？

## 内存问题

### 突破限制

在64位计算机上，V8引擎的默认内存限制为约为1.5GB，就算有再多的RAM也无济于事，但是也不是没有办法，NodeJs允许我们设置节点进程的内存，也就是通过参数`max_old_space_size`，我们可以暂时先设置内存限制，至少能先让程序构建成功。

```js
// 增加上限至 4096 MB，该内存只要计算机支持就行。
node --max_old_space_size=4096 build.js
// 或者 
// 增加上限至 4194304 KB
node --max_new_space_size=4194304 build.js
```

### 调查问题

调整后发现再也没有出现问题了，但是莫名其妙的为啥会出现内存不足的问题呢？不过也可以理解，项目越来越大，难免会出现内存不足，CPU 暴增的问题。现在我们利用**Chrome DevTools**排查我们的构建程序。

排查的过程比较考验耐心，因为电脑配置低跑起来都很慢。既然说到利用**Chrome DevTools**，那我们就要制造证据。推荐使用 [node-nightly](https://webpack.docschina.org/contribute/debugging/) 或者 [node-heapdump](https://www.npmjs.com/package/heapdump) 配合 [memwatch-next](https://www.npmjs.com/package/memwatch-next)。在这里我们使用 `node-nightly`。安装以及使用方法链接上有，就不多说了。

我采集了**堆内存分配样本**和**堆内存动态分配时间线**。结果发现并没有异常的内存持续增长的情况。虽然说有少部分引用没有回收，但不至于内存泄漏。有两处突然增长的原因是1、实例化 `Compiler`，继承 `Tapable` 插件框架，实现注册和调用一系列插件；2、实例化插件，如 `UglifyJsPlugin`，然后读取源文件，编译并输出，在这里我们还输出了`sourcemap` (特殊原因，需要输出)。

**堆内存分配样本**

![](/images/webpack/webpack-05.png)

**堆内存动态分配时间线**

![](/images/webpack/webpack-06.png)


### 参考资料

- [Debugging Memory Leaks and Memory Bloat in Node.js - Tech @ Side](https://tech.residebrokerage.com/debugging-node-js-memory-problems-d450787d9253)
- [https://leokongwq.github.io/2016/11/08/nodejs-heapdump.html](https://leokongwq.github.io/2016/11/08/nodejs-heapdump.html)
- [https://developers.google.com/web/tools/chrome-devtools/memory-problems/](https://developers.google.com/web/tools/chrome-devtools/memory-problems/)

## 新的问题 - 打包速度

内存问题解决了之后发现在**本地打包**速度也异常的慢（**注：构建环境会影响打包速度，但是线上的构建环境资源是共享的，因此拿本地电脑来测试，构建时间因人而异**）。目前的打包图如下：

![](/images/webpack/webpack-07.png)

而同事（高端程序员）的电脑在未优化前则是这样：

![](/images/webpack/webpack-08.png)

话不多说，因为配置问题，才会导致我有优化的欲望，**低端配置**如下：
* 型号：MacBook Air(13-inch, 2017)；
* 处理器：1.8 GHz Intel Core i5
* 内存：8 GB 1600 MHz DDR3

**打包相关**如下：
* 脚手架：`create-react-app v1`；
* 技术栈：`React / Typescript / Antd / Less`；
* 打包优化上还处理了 Code Splitting，ExtractText，UglifyJs 等。

## 工欲善其事，必先利其器

现在就开始选择工具，来对我们的项目进行分析。候选工具有`progress-bar-webpack-plugin/webpackbar/speed-measure-webpack-plugin`。我们想要的效果，是最好能分析出哪一个阶段的耗时。因此我们来比较一下这些工具是否匹配我们的需求。**PS：webpack —progress，并不满足我们的需求，因为是信息太过于简单让我们无处排查问题。**

### progress-bar-webpack-plugin

从下图可以看出  [progress-bar-webpack-plugin](https://github.com/clessg/progress-bar-webpack-plugin#readme)  跟 `webpack --progress`一样不满足我们的需求，它只是展示打包的进度信息。

![](/images/webpack/webpack-09.gif)

### webpackbar

[webpackbar](https://github.com/nuxt/webpackbar)  在不做任何的配置的前提下，也比 `progress-bar-webpack-plugin` 好，至少能知道卡在哪一步，加载 `node_modules` 依赖的过程。

![](/images/webpack/webpack-10.png)

我们通过设置 `profile` 来获取更多的信息，当然展示信息只有`loaders`，而我们往往也需要 `plugins` 的耗时，当然你也可以通过自定义输出信息，在这里我们就不展开讨论，有兴趣的小伙伴可以自行尝试。

```js
// 通过配置 profile 展示详细的信息
plugins: [
  new WebpackBar({
    profile: true,
    reporters: ['profile'],  // 注意这里的配置很关键，否则没信息
  })
]
```

![](/images/webpack/webpack-11.png)

### speed-measure-webpack-plugin（推荐）

[speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin)  可以通过很简单的配置，就可以获取 `plugins`以及`loaders` 的耗时。

```js
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const smpWrapperConfig = smp.wrap({
  // 将 webpack 的配置作为参数传给 SpeedMeasurePlugin
  ...webpackConfig,
});
module.exports = smpWrapperConfig;
```

![](/images/webpack/webpack-12.png)

### 测试
我们用 `speed-measure-webpack-plugin` 来检测下我们每个阶段的耗时，但是值得注意的是，我们只需要关注哪一个阶段的耗时最长，而不需要关注它跑了多长时间，因为 `speed-measure-webpack-plugin` 的加入也会拖慢我们构建的时间。（这是我反复测试的结果，假如有问题，麻烦请指出😂）

我们使用 `speed-measure-webpack-plugin` 来测试一下，发现`UglifyJsPlugin` 占时最长，调研了一下发现 [github issue](https://github.com/webpack-contrib/uglifyjs-webpack-plugin/issues/272) 上有不少这样的问题，甚至出现了我们上文出现的 `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory` 的问题：

![](/images/webpack/webpack-13.png)

## 优化尝试

在上文提到，项目构建速度慢，`UglifyJsPlugin` 占一半。当然网上还有很多打包速度优化的手段，在这里不做展开，一是因为效果不明显，二是因为项目本身在早期也已经处理过，因此在这里我们针对性的优化一下。

### webpack-parallel-uglify-plugin

我看网上有人推荐这个插件，但是其实在 CRA 中采用的 `uglifyjs-webpack-plugin` 也可以通过参数 `parallel: true` 来达到多线程的作用，我测试过其实两者在速度上没多大差别。更重要的是这个插件已经很久没更新了，所以这个就直接跳过了，不推荐使用。

### happypack

关于 `happypack`，我相信网上已经能找到很多关于它的传闻，从单一进程构建模式到多进程模式，从而加速代码构建，关于更多话不多说，有兴趣的自行研究。`happypack` 支持的 `loaders` 可以看这里 [Loader Compatibility](https://github.com/amireh/happypack/wiki/Loader-Compatibility-List)，原理看这里[happypack 原理解析](https://juejin.im/entry/58493e1c128fe100690ba209)。部分配置如下：

```js
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

// module
{
  test: /\.(ts|tsx)$/,
  include: resolveApp('src'),
  exclude: /node_modules/,
  use:'happypack/loader?id=tsx',
}
// less 的就不写了。

// plugins
new HappyPack({
  id: 'tsx',
  threadPool: happyThreadPool,
  loaders: [
    {
      loader: require.resolve('ts-loader'),
      options: {
        happyPackMode: true,
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [
            tsImportPluginFactory([
              {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true,
              },
            ]),
          ],
        }),
      },
    }
  ]
}),
```

不知道为什么，在我的电脑使用 `happypack` 之前的比使用 `happypack`  之后的首次速度还要快，但是缓存构建也是不分上下没差多少。这是因为 `happypack` 对电脑的内核有一定的要求，假如电脑的内核低的情况下又开启多线程，反而会让占满电脑的 CPU，整体速度变慢，因此这个方案也不是最好的选择（**反正我的电脑烂**）。

![](/images/webpack/webpack-14.png)

### terser-webpack-plugin

`terser-webpack-plugin` 是 webpack4 用来取代 `uglifyjs-webpack-plugin` 的压缩插件，假如单纯结合 webpack3 和 `terser-webpack-plugin`，不知道能不能解决压缩速度的问题。

在 webpack3 中，官方提供的插件是 `terser-webpack-plugin-legacy`（看起来像是妥协版本）。从下图可以看出 ，oh my god（麻烦自行脑补李佳琦），这也太神奇了吧，简直就是质的飞跃（不敢相信的我特意试了几次）。

![](/images/webpack/webpack-15.png)

配置如下：

```js
new TerserPlugin({
  parallel: true,
  cache: true,
  terserOptions: {
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
      comparisons: false,
      inline: 2,
    },
  },
}),
```

### 小结

经过一段时间（具体不详）的观察，在 webpack 3 提升构建速度的方法有如下的方法：

- 设置缓存，可以有效的减少再次构建速度；
- 使用 `terser-webpack-plugin` 替换 `uglifyjs-webpack-plugin`；
- 假如你能确定某些模块没有依赖，可以设置`noParse`；
- 使用 `alias`，这个能提升开发效率哦；
- 使用 `webpack-bundle-analyzer` 剔除无关的依赖；
- 在确定模块的情况下，可以配置 `resolve.modules`，如 `resolve.modules = ['node_modules']`，可以减少搜索范围；
- `loaders`  可以使用 `test/include/exclude` 来减少不必要的遍历；
- 在构建环境允许的情况下，可以试试 `happypack`。

### 最后小彩蛋

假如你的项目使用了类似 [React-Loadable](https://github.com/jamiebuilds/react-loadable)进行**按需加载**，那么请注意，`React-Loadable` 可以帮助我们**根据路由来按需加载**。它的原理是使用了`import()` 而非 `import` 是因为 `import` 是静态编译，而`import()` 同 `require`，是可以进行动态加载的。 但是**千万要注意的是，引用过程中千万不要使用变量，这会导致编译通过但是编译时间长得令人发指又或者直接内存溢出。** - [ES6 DYNAMIC IMPORT AND WEBPACK MEMORY LEAKS - Adrian Oprea - Medium](https://medium.com/@oprearocks/es6-dynamic-import-and-webpack-memory-leaks-fa09f98f3243)

## 升级Webpack 4
那么最后我们来尝试一下这个号称编译速度提升了 60% ~ 98% 的“黑科技”。由于我们是使用了`create-react-app`，因此我们在升级过程中会或多或少遇到很多问题，我在这里记录一下我升级过程中遇到的问题。

由于项目中已经 `eject` 了 `create-react-app`，因此不能使用官方推荐且快速的升级 `react-scripts` （自己挖的坑自己填）。

### 准备工作
`yarn add -D webpack webpack-cli webpack-dev-server`，升级webpack4 必备的三件套，缺一不可。别慌，准备工作其实就这么多。慌的是如何处理升级后的兼容问题😂😂😂。

### 排除万难
万事开头难，然后接着难，难上加难（满脸写着开心.jpg）。**注意：每次解决问题就直接执行程序，即yarn  start/build，下面就不赘述。**

> _this.compiler.applyPluginsAsync is not a function

👉🏻 升级 `fork-ts-checker-webpack-plugin`。

> Plugin could not be registered at 'html-webpack-plugin-before-html-processing'. Hook was not found.
> BREAKING CHANGE: There need to exist a hook at 'this.hooks'. To create a compatibility layer for this hook, hook into 'this._pluginCompat’.

👉🏻 升级 `html-webpack-plugin@next` 以及 `react-dev-utils`；
👉🏻 同时对配置文件(`dev/prod`)做以下优化：

```js
// plugins
[
  new HtmlWebpackPlugin({
    ... // dev 和 prod 保持原来的配置
  }),
  new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw)
]
```

> webpack is not a function

👉🏻 对 `start.js` 做以下优化：

```js
// 调整为对象结构
const compiler = createCompiler({ webpack, config, appName, urls, useYarn });
```

> When specified, "proxy" in package.json must be a string.
> Instead, the type of "proxy" was "object".
> Either remove "proxy" from package.json, or make it a string.

👉🏻 安装/升级 `http-proxy-middleware`；
👉🏻 将 `package.json` 中的 `proxy` 删除，并添加`src/setupProxy.js`，并将其添加到`paths.js`；
👉🏻 修改 `webpackDevServer.config.js`

**注意：**

> 为什么要删除 `package.json` 中的 `proxy` 呢？因为 `proxy` 在 `package.json` 中虽然以字符串存在，但是在默认情况下还是会优先读取  `package.json` 中的 `proxy` 字段，其次才是 `setupProxy.js`。

```js
// paths.js
module.exports = {
  ...,
  proxySetup: resolveApp('src/setupProxy.js'),
}

// webpackDevServer.config.js
before(app, server) {
  if (fs.existsSync(paths.proxySetup)) {
    require(paths.proxySetup)(app);
  }
}

// src/setupProxy.js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api', {
    target: 'https://xxx.xx.com',
    changeOrigin: true,
  }));
};
```

> this.htmlWebpackPlugin.getHooks is not a function
> 假如报这个错误，那么可以尝试以下操作：

👉🏻 删除 `node_modules` 并重新安装；
👉🏻 重新安装 `html-webpack-plugin@next`；
👉🏻 确保 `new InterpolateHtmlPlugin(env.raw)` ->
`new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw)`

> DeprecationWarning: Pass resolveContext instead and use createInnerContext
> DeprecationWarning: Resolver: The callback argument was splitted into resolveContext and callback
> DeprecationWarning: Resolver#doResolve: The type arguments (string) is now a hook argument (Hook). Pass a reference to the hook instead.

这个不是错误，你可以选择忽略，也可以做出以下处理：
👉🏻 升级 `tsconfig-paths-webpack-plugin`

> Tapable.plugin is deprecated. Use new API on `.hooks` instead

👉🏻 升级 `extract-text-webpack-plugin`，但是在webpack4 已经不推荐使用该插件了，可以使用 `mini-css-extract-plugin` 取代，值得注意的是使用 `mini-css-extract-plugin` 的同时可以不使用`style-loader`  ———[Advanced configuration example](https://github.com/webpack-contrib/mini-css-extract-plugin#advanced-configuration-example)

剩下的问题就是遇到什么插件不兼容直接升级就可以了，例如：
> TypeError: Cannot read property 'ts' of undefined
> URIError: Failed to decode param ‘/%PUBLIC_URL%/favicon.ico’

👉🏻 升级`ts-loader` 以及 `file-loader`

### extracting one single css file

如何使用 `mini-css-extract-plugin` 将所有的 css 文件都打包成一个css文件呢？其实有很多方法，我们就使用官方推荐的方法[Extracting all CSS in a single file](https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file)，但是在这过程可能会报 `Conflicting order between` 的warnings，我们可以关闭警告 [Remove Order Warnings](https://github.com/webpack-contrib/mini-css-extract-plugin#remove-order-warnings)。关于 `CommonsChunkPlugin` 可以看这里 [RIP CommonsChunkPlugin.md · GitHub](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693)。

```js
// 关于更多 splitChunks 可以查看 
// https://webpack.docschina.org/plugins/split-chunks-plugin/
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: { // entry 入口名称
          name: 'styles', // 提取 chunk 的名称
          test: /\.css$/,
          chunks: 'all', // initial | all | async，默认 async
          enforce: true,
        },
      },
    },
  },
  ...
}
```

### 替换依赖包

配置完毕之后，将下面的依赖包替换成 webpack4 推荐的依赖包。
-  `extract-text-webpack-plugin` ->  `mini-css-extract-plugin`；
-  `uglifyjs-webpack-plugin` -> `terser-webpack-plugin`。

### 小结

到此 webpack4 基本上已经解决完毕了，剩下的问题，都是根据个人需求来处理了。升级到 webpack4 的过程不算太顺利，但是这算是 webpack 的一个大版本，尝试一下说不定就成功，毕竟 webpack4 进行了多处优化，一些存在**安全问题**的依赖包也得到解决了，最后上一张升级后我本地和我同事构建的时间。

**我的电脑**

![](/images/webpack/webpack-16.png)

**别人家的电脑**

![](/images/webpack/webpack-17.png)

![](/images/emoji/emoji-01.png)卒～















