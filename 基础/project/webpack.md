webpack是目前应用最广的前端应用程序静态模块打包工具。在处理应用程序时，它会在内部构建一个依赖图，此依赖图对应映射到项目所需的每个模块，然后生成一个活多个bundle。

### 基本配置

- 入口
    + 入口指示webpack将从哪个模块开始构建内部依赖图。
- 输出
    + 输出指示webpack应该在何处将所创建的bundle输出，以及如何命名这些文件。
- loader
    + repack只能理解JavaScript和JSON文件，loader 使得webpack能够处理其他类型的文件，并将它们转换为有效模块，以供应用程序使用，以及被添加到依赖图中。
- plugin
    + 不同与loader用于转换其他类型的模块，plugin则可以在webpack的整个生命周期中执行范围更广的任务。如：打包优化，资源管理，注入环境变量等。
- 模式
    + 通过设置不同模式（development|production|none），可以启用webpack内置在相应环境下的优化。默认为production。

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    // 入口
    entry: './src/index.js',
    // 出口
    ouput: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash:6].js'
    },
    module: {
        // loader
        rules:  [{
            test: /\.txt$/,
            use: 'raw-loader'
        }]
    },
    // plugin
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' })
    ]
}
```

### 实现一个loader

loader 本质上就是一个导出为函数的JavaScript模块，本loader runner调用，将原文件内容或者是上一个loader产生的结果传入，loader 中的 `this` 则会指向loader runner，因此通过runner提供的方法，可以获取到query参数或将loader的调用方式由同步变为异步。

实现一个文本替换loader，将js代码中的某些文本替换为目标文本。

```js
// text-replace-loader.js
module.exports = function(content, map, meta) {
    // 从query中获取到要替换的目标文本
    let { target, replacer } = this.query
    // 构建正则表达式
    let regExp = new RegExp(target, 'g')
    // // 返回替换后的原文本
    return content.replace(regExp, replacer)
}
```

当然还可以将其转变为异步方式。

```js
// async-text-replace-loader.js
module.exports = function(content, map, meta) {
    // 获取异步回调
    let callback = this.async()
    // 从query中获取到要替换的目标文本
    let { target, replacer } = this.query
    // 构建正则表达式
    let regExp = new RegExp(target, 'g')
    // 异步回调方式
    setTimeout(() => {
        // 第一个参数为error，设置为null
        callback(null, content.replace(regExp, replacer))
    }, 2000)
    // 返回替换后的原文本
    return
}
```

至此我们的文本替换loader就完成了。

### 实现一个Plugin

不同于 loader 用于转换非JavaScript模块，plugin 则能在webpack的整个编译周期中起到监听事件，从而对webpack的输出资源进行处理。

对于 webpack 编译，有两个重要的对象需要了解一下：

> Compiler 和 Compilation
在插件开发中最重要的两个资源就是 compiler 和 compilation 对象。理解它们的角色是扩展 webpack 引擎重要的第一步。

> compiler 对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。

> compilation 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。

> 这两个组件是任何 webpack 插件不可或缺的部分（特别是 compilation），因此，开发者在阅读源码，并熟悉它们之后，会感到获益匪浅。

plugin 实际上就是一个具有 apply 方法的函数，compiler 将通过参数的方式传入 apply 方法。

下面我们实现一个类似于 `html-webpack-plugin` 的插件。

```js
// html-webpack.plugin.js
class HtmlWebpackPlugin {
  constructor({ fileName }) {
    this.fileName = fileName
  }

  apply(compiler) {
    compiler.hooks.emit.tap('HtmlWebpackPlugin', compilation => {
      let assets = Object.keys(compilation.assets)
      // 假设只有js文件生成
      let scriptTags = assets.map(js => `<script src="./${js}"></script>`).join('\r\n')
      let html = `<!doctype html>
      <html>
        <head>
          <title>Hello</title>
        </head>
        <body>
          <div></div>
          ${scriptTags}
        </body>
      </html>
      `
      // 想compilation的资源中添加需要输出的新资源
      compilation.assets[this.fileName] = {
        source: function() {
          return html
        },
        size: function() {
          return html.length
        }
      }
    })
  }
}

module.exports = HtmlWebpackPlugin
```

而在使用时只需要像其他插件一样

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            fileName: 'index.html'
        })
    ]
}
```

### webpack提升前端性能

- 压缩代码
    + 设置 `mode` 为 `production`
    + webpack4内置了 `uglify-js-webpack-plugin`，当mode为production时就会自动压缩js代码
    + css 可以使用 `optimize-css-assets-webpack-plugin`
- tree-shaking，要求
    + 使用ESM，tree-shaking 依赖于ESM的静态导入。
    + 使用 `production` 模式
    + 确保没有编译器将ES2015模块转换为CommonJS模块(应该是在使用webpack之前没有将ES2015编译成CommonJS模块)
    + 添加 "sideEffects" 属性到项目的 `package.json` 文件(对于)
- 生成文件hash，配合缓存做优化
    + 设置 `output.filename` 为 `[name].[chunkhash:length]` 可以输出带 hash 的文件名，配合缓存可以做到更好的优化
- 分割代码，按需加载
    + 通过 `import('').then` 来实现分割代码按需加载
    + 由于wepack内部维护了一个自增id，当新增了依赖时，会打乱这个id，导致没有发生变化的chunk也产生变化。要解决这个问题可以引入 `webpack.HashedModuleIdsPlugin`，这个插件会根据模块的相对路径生成模块id。
- 打包公共库和公共代码
```js
optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: { 
            test: /node_modules/,
            name: 'vendors', 
            minSize: 0,
            minChunks: 1, 
            chunks: 'initial',
            priority: 2 // 该配置项是设置处理的优先级，数值越大越优先处理 
        },
        commons: {
          name: "comomns",
          test: resolve("src/components"), // 可自定义拓展规则
          minChunks: 2, // 最小共用次数
          minSize:0,   //代码最小多大，进行抽离
          priority: 1, //该配置项是设置处理的优先级，数值越大越优先处理 
        }
    }
}
```
