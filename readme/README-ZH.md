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

## 发布配置及配置项说明

## 编译
分为两种发布方式：
### npm run build:bin(使用node调用.bin中的build命令，调用方式和其他模块调用相同)
1. 运行会自动调用`prebuild:bin`（prebuild命令去调用`npm run compile`)，执行gulp任务对文件进行编译。
2. build 编译，编译完后进行一系列处理（用于单体应用部署，index.html与其他文件是分离的）

### npm run dist:bin(使用node调用.bin中的dist命令，调用方式和其他模块调用相同)
1. 运行会自动调用`predist:bin`进行编译。
2. dist 编译

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