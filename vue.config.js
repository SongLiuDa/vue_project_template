'use strict'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  publicPath: '/',
  // 输出文件目录
  outputDir: 'dist',
  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: 'static',
  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码 (在生产构建时禁用 eslint-loader)
  lintOnSave: isDev,
  productionSourceMap: false,
  // 默认在生成的静态资源文件名中包含hash以控制缓存
  filenameHashing: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    https: false, // https:{type:Boolean}
    open: true // 配置自动启动浏览器
    // hotOnly: true, // 热更新
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  css: {
    // 启用 CSS modules
    requireModuleExtension: false,
    // 是否使用css分离插件
    // extract: true,
    // 开启 CSS source maps，
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      sass: {
        // 设置css中引用文件的路径，引入通用使用的scss文件
        data: `@import '@/styles/variables.scss';`
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()
    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            // runtime.js非常的小，gzip 之后一般只有几 kb，但这个文件又经常会改变，我们每次都需要重新请求它，它的 http 耗时远大于它的执行时间了，所以内联到我们的 index.html
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              // `runtime` 和 runtimeChunk 同名. 默认`runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // 只打包初始时依赖的第三方
                },
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
