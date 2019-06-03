# HAP使用

## 配置文件

* 创建配置文件，名为 `config.js`

```js
const config = {
  // proxyTarget: 'http://hap4.c7nf.choerodon.staging.saas.hand-china.com',   // 服务器地址，前端请求发往的地方，默认为本地的8080端口
  master: '@choerodon/pro-master',  // 可配置的master，如不修改指明使用@choerodon/pro-master
  projectType: 'hap', // 指定项目类型为choerodon项目
  buildType: 'single',  // 指定启动形式为单体模式
  dashboard: {},
}
```

*我们建议你在日常开发中只修改其中的几个属性。事实上，我们提供了非常多可配置的属性和钩子，但是为了减少一些不必要的错误，并没有在文档中体现。如果你发现现有的选项无法满足你的开发需求时，可以阅读源码或者联系我们。*

## 本地开发

在package.json中加入如下两句：

```javascript
// package.json
...
"scripts": {
  "start": "choerodon-front-boot start --config ./react/config.js",
  "build": "choerodon-front-boot build --config ./react/config.js"
},
...
```

然后可以进行运行。

```javascript
// 如果你在linux 或 macOS上执行遇到了权限问题, 先运行 *chmod -R 755 node_modules*
$ npm start
```

当项目开始启动，会自动打开浏览器并访问 http://localhost:9090

*如果你想进行多模块运行，可以在package.json的dependences中加入需要的模块，然后在config.js中的modules属性中加入该模块名。*

## 打包

```
$ npm run build
```

## axiosPro as axios

`axios` 用于发起请求.

```jsx
import React from 'react';
import { axiosPro as axios } from '@choerodon/boot';

class Example1 extends React.Component {
  componentDidMount() {
    this.loadData();
  }
  
  async loadData() {
    try {
      const res = await this.props.axios.get('your url here');
      // if res get success, do something
    } catch (error) {
      // if something wrong, do something
    }
  }

  render() {
    return (
      <div>axios demo</div>
    )
  }
}

```

我们强烈建议你使用boot提供的axios来发起请求，原因如下:

- 增加了 `X-Requested-With` 头部字段使response信息更符合dataset开发
- 自动拼接在config.js中设置的 `API_HOST` 
- 在axios实例中增加了拦截器，用于处理未登录，登陆超时等逻辑

## 首页替换（注意这里的首页是指内容区域的首页）

你可以根据自己的需求进行首页替换。

你只需要在项目中开发你的首页，并且在config.js中设置 `homePath` 属性:

```jsx
const config = {
  homePath: 'your url here',
}
```

- 重启项目你就能看到自己开发的主页了

## Master替换

注意这里的Master和首页的概念不同，Master是指登录后进去看到的整个页面，默认的@choerodon/pro-master包括头部，菜单和AutoRouter（即内容区，上文所说的首页替换其实就是AutoRouter中当路由为'/'时的内容）。

只有当现在提供的页面布局，样式不符合项目需求的时候才会进行改动，而且改动后后续升级的部分需要自己跟进，需谨慎，最好与我们联系取得帮助。

一般有如下几个步骤：

1. 在自己的项目下（或者新建一个项目，后期通过npm发布，@choerodon/pro-master就是采用这种方式）建立自己的Master目录，并且命名
2. 搭建自己的布局，这块可以拉取@choerodon/pro-master的源码进行参照
3. @choerodon/pro-master中也暴露了`Header`, `Menu`等组件，可以直接引用到自己的Master中，AutoRoute通过this.props.AutoRoute获取并展示（这块理论上来说是必须的，如果项目连内容展示区都没用，那可能用不到这个框架了）
4. 在config.js中修改master，指向自己的Master（*注意这里是根据package.json所在的目录来定位，而不是config.js*）

## Content

`Content` 是一个包裹你的页面的最外层容器组件.

(当然你可以不使用这个组件包裹你的页面，但我们强烈建议你使用它。)

```jsx
...
render() {
  return (
    <Content>
      <div>hello hap</div>
    </Content>
  );
}
...
```

当你使用了 `Content`，你可以：
- 使用`hotkey system`
- 提供内置的样式比如`padding: 10px 20px;`，你可以通过重写style类似`style={{ padding: 0 }}`来删除默认样式
- 顺带一提，如果你的项目有自己的样式文件`index.sass`，你应该（必须）在`Content`上增加一个`className`，这个`className`最好是根据你的模块和方法组合的，比如`wf-editApproveChain-modal`，表示`workflow`模块下的`editApproveChain`页面下的模态框，然后你的样式文件可能如下：
```sass
.wf-model-editApproveChain-modal {
  // your style code here
}
```
*这就像个namespace，防止你的代码样式意外作用到其他人的模块，反之亦然*

## asyncRouter

`asyncRouter` 组件是一个boot提供的用于按需加载的组件。

```jsx
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { asyncRouter } from '@choerodon/boot';

const YOUR_PAGE = asyncRouter(() => import('./src/MyPage'));

...
<CacheRoute exact path={`${match.url}/mypage`} cacheKey={`${match.url}/mypage`} component={ApvStratYOUR_PAGEegy} />
...
```

- 使用该组件能更好的帮助webpack进行`bundle split`，改善用户体验
- 我们的刷新功能也是基于该组件进行设计的

## $l

`$l` 函数用于统一的本地化支持。

```jsx
import { $l } from '@choerodon/boot';

...
<div>$l('code')</div>
...
```

## openTabR
`openTabR` 函数用于打开（新开或者切换到某个）标签页。

```jsx
import { openTabR } from '@choerodon/boot';

...
openTabR(url, title);
...
```

## PermissionPro as Permission

Permission组件是提供的一种可以控制是否显示内容的手段。

```jsx
import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { PermissionPro as Permission } from '@choerodon/boot';

export default class App extends Component {
  render() {
    return (
      <React.Fragment>
        <div style={{ marginBottom: 40 }}>
          <h4>有权限,正常显示的按钮</h4>
          <Permission service={['task-execution.cancleExecute']}>
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>没有权限,被隐藏的按钮</h4>
          <Permission service={['permission-code']}>
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>无权限控制,永远显示的按钮</h4>
          <Button>Without Permission Btn</Button>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>没有权限,被隐藏的按钮,显示默认内容</h4>
          <Permission
            service={['permission-code']}
            noAccessChildren={<span>对不起你不能看到我!</span>}
          >
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>不知道有没有权限,反正加载的时候显示,没权限的时候也显示</h4>
          <Permission
            service={['permission-code']}
            defaultChildren={<span>我还在加载!或者你不能看我!</span>}
          >
            <Button>Permission Btn</Button>
          </Permission>
        </div>
      </React.Fragment>
    );
  }
}

```

## 额外的生命周期

有一种场景是比较常见的，在A页面中是一个表格展示，然后点击表格中的某一行，跳转到B页面进行编辑。

这里有几个分析点，

1. 用户跳到B后，回到A再直接通过标签页点回B，页面不刷新
2. 用户跳到B后，回到A再点击另一条表格内容跳到B，页面刷新（因为是两条不同的数据）

这里提供一种常见的代码模式：

```jsx
// A.jsx

// 当点击行时，跳转到B页面
goTo = () => {
  this.props.history.push(`/create?id=${this.state.id}`);

  // 也可以通过如下的方法传递参数
  // this.props.history.push({
  //     pathname: '/create',
  //     state: {
  //       id: this.state.id,
  //     },
  //   });
};

// B.jsx
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import querystring from 'query-string';

@inject('AppState')
@observer
export default class B extends Component {
  constructor(props) {
    super(props);
    this.id = undefined;  // 标识，确定是否要刷新页面
    this.checkShouldUpdate();
    props.cacheLifecycles.didRecover(this.componentDidRecover.bind(this));
  }

  componentDidRecover() {
    this.checkShouldUpdate();
  }

  checkShouldUpdata = () => {
    const { props, id } = this;
    const queryObj = querystring.parse(props.location.search);
    const currentId = queryObj.id;
    // 当使用第二种方法传递参数时，可以用如下注释的方法得到id，get方法为lodash/get
    // const currentId = get(props, 'history.location.state.id', undefined);
    if (currentId === id) {
      return;
    } else {
      this.id = currentId;
      // 执行刷新逻辑或者做一些其他事情
    }
  }

```

## 热键系统

使用`Content`组件，可以默认使用平台提供的热键系统。

```js
import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { ContentPro as Content } from '@choerodon/boot';

export default class App extends Component {
  render() {
    return (
      <Content
        hotkeys={{
          hotkey_create: () => {
            window.console.log('[Hotkey module, from `Hotkey`]: i emit hotkey ctrl + g');
          },
        }}
      >
        这是一个hotkey的演示demo.
      </Content>
    );
  }
}

```

## 依赖

 * Node environment (6.9.0+)
 * Git environment

## 相关文档和使用技术文档

* [React](https://reactjs.org)
* [Mobx](https://github.com/mobxjs/mobx)
* [webpack](https://webpack.docschina.org)
* [gulp](https://gulpjs.com)
* [choerodon ui](https://choerodon.github.io/choerodon-ui/)

## Reporting Issues
If you find any shortcomings or bugs, please describe them in the issue

## How to Contribute
Pull requests are welcome! Follow to know for more information on how to contribute.