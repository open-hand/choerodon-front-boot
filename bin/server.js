'use strict'

const WebpackDevServer = require('webpack-dev-server')
const config = require('../webpack/webpack.dev')
const webpack = require('webpack')
const path = require('path');
const compiler = webpack(config);
const hapconfig = require('../../config');

const server = new WebpackDevServer(compiler,
    {
        // hot: false,
        contentBase: path.resolve(__dirname, "../../dist"),
        port: 9090,
        host: "0.0.0.0",
        publicPath: "/",
        inline: false,
        compress: true,
        historyApiFallback: true,
        disableHostCheck: true,
        stats: "normal",
        stats: {
            // 增加资源信息
            assets: false,
            // 对资源按指定的项进行排序
            // 你可以使用 `!field` 来反转排序。
            cached: true,
            // Show cached assets (setting this to `false` only shows emitted files)
            cachedAssets: true,
            // 增加子级的信息
            children: false,
            // 增加包信息（设置为 `false` 能允许较少的冗长输出）
            chunks: false,
            // 将内置模块信息增加到包信息
            chunkModules: false,
            // 增加包 和 包合并 的来源信息
            colors: true,
            // Display the distance from the entry point for each module
            depth: false,
            // Display the entry points with the corresponding bundles
            entrypoints: true,
            // 增加错误信息
            errors: true,
            // 增加错误的详细信息（就像解析日志一样）
            hash: true,
            // Set the maximum number of modules to be shown
            maxModules: 15,
            // 增加内置的模块信息
            modules: false,
            // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
            moduleTrace: false,
            // Show performance hint when file size exceeds `performance.maxAssetSize`
            performance: false,
            // Show the exports of the modules
            providedExports: false,
            // 增加 public path 的信息
            publicPath: false,
            // 增加模块被引入的原因
            reasons: false,
            // 增加模块的源码
            source: true,
            // 增加时间信息
            timings: true,
            // Show which exports of a module are used
            usedExports: true,
            // 增加 webpack 版本信息
            version: true,
            // 增加提示
            warnings: true,
        },
        proxy: {
            "/api/**": {
                "target": `${hapconfig.server}`,
                "changeOrigin": true
            }
        }
    })
server.listen(9090, 'localhost', function (err) {
    if (err) throw err
})
