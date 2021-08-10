# 主要功能

 `@choerodon/boot`为猪齿鱼前端提供了模块的启动/打包，以及子模块的组合功能。

## 使用

### 1. 安装依赖

```
yarn add @choerodon/boot
```

### 2. 创建配置文件

在项目目录/react目录下创建`config.js`

```
module.exports = {
  modules: [
    '.',
  ]
};
```

### 3. 添加命令

在package.json添加

```json
"scripts": {
    "start": "node --max_old_space_size=4096 node_modules/@choerodon/boot/bin/choerodon-front-boot-start --config ./react/config.js",
    "dist": "choerodon-front-boot dist --config ./react/config.js"    
  },
```

## 常用运行配置及配置项说明

| 名称          | 值类型                                | 用途                                    | 默认值                                         |
| ------------- | ------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| port          | number                                | 前端启动时的端口                        | 9090                                           |
| modules       | Array<string>                         | 指定启动的子模块，其中`.`指代自身子模块 |                                                |
| webpackConfig | (config:webpackConfig)=>webpackConfig | 自定义webpack配置                       |                                                |
| entry         | string                                | 应用入口文件                            | node_modules下的@choerodon/master/lib/entry.js |
| theme         | Object                                | 全局覆盖less变量                        | {}                                             |
| titlename     | string                                | html的title                             | Choerodon \| 多云应用技术集成平台              |

> 更多配置请查看[链接](https://code.choerodon.com.cn/hzero-c7ncd/choerodon-front-boot/blob/master/react/config/getChoerodonConfig.js)
>



## 子模块路由收集

### 1. 配置方式

猪齿鱼前端具有子模块组合功能，猪齿鱼前端可分为`分前端`和`总前端`，分前端指代各个子模块，这些子模块在启动时一般会启动自身，这时需要配置`modules`为`['.']`，总前端是子模块的聚合，`modules`配置为子模块的名称列表，如：

```javascript
const config = {
  local: true, //是否为本地开发
  modules: [
    '@choerodon/base',
    '@choerodon/asgard',
    '@choerodon/notify',
    '@choerodon/manager',
    "@choerodon/agile",
    "@choerodon/testmanager",
    "@choerodon/knowledge",
    "@choerodon/devops",
    "@choerodon/code-repo",
    "@choerodon/prod-repo",
  ]
};

module.exports = config;
```

### 2. 约定

猪齿鱼前端子模块应遵守以下约定

1. 在package.json中配置唯一的`routeName`和`main`和`install`（可选）字段
2. main指定了一个文件路径，这个文件应有一个默认导出

### 3. 路由分配

每个在modules中配置的子模块都会被分配一个一级路由，路由分配规则是读取子模块的`package.json`中的`routeName`字段，并引入`main`字段配置的文件，所以请保证不同的子模块配置了不同的`routeName`。

例如针对以下`package.json`配置：

```json
{
  "routeName": "agile",
  "main": "./lib/index.js",
}
```

会生成

```javascript
const agile = React.lazy(()=>import("D:\\Desktop\\分前端\\agile-service\\react\\index.js"));

...
<Route path="/agile" component={agile}/>
```



## 环境变量方案

Choerodon猪齿鱼平台的前端环境变量方案是一种给用户自定义环境变量，并且可以在部署时进行替换的一种方案。

### 1. 使用

在react目录下建立.env文件，以`键=值`的方式写入环境变量，最终可以使用`window._env_`来访问配置的环境变量。

### 2. 常用环境变量

| 名称             | 类型                                                         | 用途                                   |
| ---------------- | ------------------------------------------------------------ | -------------------------------------- |
| HTTP             | 'http'\|'https'                                              | 目前没什么用（已废弃）                 |
| API_HOST         | string                                                       | 指定后端api地址前缀                    |
| CLIENT_ID        | string                                                       | 指定登录时使用的客户端                 |
| LOCAL            | true\|false                                                  | 是否为本地开发（目前请始终设置为true） |
| WEBSOCKET_SERVER | string                                                       | 指定后端websocket地址前缀              |
| outward          | 逗号隔开的路由地址，如/agile/preview,/agile/test,/agile/outside | 指定不需要登录即可访问的页面           |

### 3. 运行原理

环境变量方案分为开发时和部署时

在开发模式下使用了[dotenv-runtime-plugin](https://github.com/laincarl/dotenv-runtime-plugin)来实现了开发时的环境变量热更新。

在部署时，会执行[env.sh](https://code.choerodon.com.cn/hzero-c7ncd/choerodon-front-boot/blob/master/env.sh)实现在docker启动时读取docker配置的环境变量，并生成一个js语句，插入到html中

## 跨模块组件注入方案

[链接](https://code.choerodon.com.cn/hzero-c7ncd/c7n-front/blob/master/packages/inject/README.md)

## 组件转发

由于历史原因，你可以使用`import ...  from '@choerodon/boot'`形式的语句来引用`@choerodon/master`中的内容，这是因为`@choerodon/boot`配置了`alias`

[^注]: 新代码请使用`import ... from @choerodon/master`，因为`alias`之后可能会去掉。

