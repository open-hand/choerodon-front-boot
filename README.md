# 开发（@choerodon/boot）

## 安装依赖

```bash
npm install
```

安装的依赖包含了webpack，babel，react等@choerodon/boot必须的依赖，可以在`package.json`中进行查看。

## 运行配置及配置项说明

### 运行

### 功能描述

@choerodon/boot作为一个脚手架项目，希望在功能纯净且单一的基础上帮助用户做更多的事，以更好地开发猪齿鱼Choerodon平台的模块或者Master。

下面介绍贯穿在整个运行过程中的几个关键步骤：

## 环境变量方案

Choerodon猪齿鱼平台的前端环境变量方案是一种给用户自定义环境变量，并且可以在部署时进行替换的一种方案。

在react目录下建立.env文件，以`键=值`的方式写入环境变量，在启动过程中会与默认环境变量进行合并（默认环境变量文件在@choerodon/boot下，名为`.default.env`，当然用户变量的优先级更高）。

*特别需要注意的是，你永远应该配置一个名为`API_HOST`的环境变量，这是代码运行时访问的API的路径前缀。*

## 主入口生成和路由收集生成

主入口和路由文件，会生成在tmp目录下，有nunjucks模板生成。会经过如下步骤：

1. 收集路由，根据配置的modules去进行路由收集
   * 注意：如果modules字段为空，表示当前模块也不会被webpack编译进去，这也之前有不同，当前模块用'.'表示，其余模块可以直接用模块名或者模块路径表示，相对于根目录

2. 路由生成：根据收集路由得到的路由对象，生成路由文件
3. 主入口文件生成：根据配置的Master属性，将Master和路由文件注入到总入口，生成最终入口文件`entry.index.js`

## 组件转发

为了便于Master暴露的组件在模块中使用，而切换Master后不改用各个模块中的代码，所以用`@choerodon/boot`对组件进行转发。

主要是对master中的exportPath指向的文件进行解析，如果是指向一个相对路径的，使用exportPath和相对路径做一定处理（截尾+拼接），生成到`tmp/transfer.index.js`目录中，最后由@choerodon/boot暴露出去。
