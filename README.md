# 开发

## 安装依赖
npm install

安装的依赖包含了webpack，babel，react等@choerodon/boot必须的依赖，可以在`package.json`中进行查看。

## 运行配置及配置项说明

## 运行
npm  start

运行时会自动调用package.json的如下命令：
1. prestart  执行gulp对文件进行编译
2. start  启动

其中启动分为如下阶段：

1. 环境变量处理
2. 检测是否为多模块打包
3. 如果是多模块打包，进行路由收集
4. 入口文件处理

## 发布配置及配置项说明

## 发布
npm publish

运行publish会自动调用如下阶段：
1. prepublish：调用`npm run compile`对代码进行编译（因为要发布的代码是编译后的代码）
2. 发布编译后的lib文件夹
3. postpublish：发布完成后调用`npm run clean`去执行`rimraf lib`删除lib文件夹

## 编译

# 功能描述
@choerodon/boot作为一个脚手架项目，希望在功能纯净且单一的基础上帮助用户做更多的事，以更好地开发猪齿鱼Choerodon平台的模块或者Master。

## 环境变量方案

## 模块合并和路由体系

## Master配置和首页配置