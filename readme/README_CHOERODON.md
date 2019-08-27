# Choerodon使用

## 配置文件

* 创建配置文件，名为 `config.js`

```js
const config = {
  server: 'https://api.choerodon.com.cn',   // 服务器地址，前端请求发往的地方
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  master: '@choerodon/master',  // 可配置的master，如不修改指明使用@choerodon/master
  projectType: 'choerodon', // 指定项目类型为choerodon项目
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
  "dist": "choerodon-front-boot dist --config ./react/config.js"
},
...
```

然后可以进行运行。

```javascript
// 如果你在linux 或 macOS上执行遇到了权限问题, 先运行 *chmod -R 755 node_modules*
$ npm start
```

当项目开始启动，会自动打开浏览器并反骨 http://localhost:9090

*如果你想进行多模块运行，可以在package.json的dependences中加入需要的模块，然后在config.js中的modules属性中加入该模块名。*

## 打包

```
$ npm run dist
```

## axios

`axios` is used to make a network request.

```jsx
import React from 'react';
import { inject } from 'mobx-react';

@inject('axios')
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

We strongly recommend that you use this method, reasons are as follows:

- add `X-Requested-With` header to fit dataset development way
- add `API_HOST` you set in config.js
- add login and timeout default processing with response interceptors

## change home

You can change the home page by yourself.

only put the home page in your project path, and set `homePath` in project:

```jsx
const config = {
  homePath: 'your url here',
}
```

- restart and you will see your page is at home(you can even set a function page at home)
- in the near future, we will launch a configurable dashboard settings homepage, and this approach will be retained.

## Content

`Content` component is the outest wrapper of your page.

(Of course you can write your page without it, but we strongly recommond you use it.)

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

- you can use hotkey system with it
- it provide default style like `padding: 10px 20px;`, you can delete it by rewrite style such as `style={{ padding: 0 }}`
- in the near future, we may add permission control on it
- by the way, if you have your own `index.less`, you can(should) add a className on Content, and named after your module and function, such as `wf-model-editApproveChain-modal`, and the less like below
```less
.wf-model-editApproveChain-modal {
  // your style code here
}
```
*like a namespace, block other people's code from affecting your page, and vice versa*

## asyncRouter

`asyncRouter` component is a component for demand loading

```jsx
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { asyncRouter } from 'choerodon-hap-front-boot';

const YOUR_PAGE = asyncRouter(() => import('./src/MyPage'));

...
<CacheRoute exact path={`${match.url}/mypage`} cacheKey={`${match.url}/mypage`} component={ApvStratYOUR_PAGEegy} />
...
```

- Using it will better help with split bundle and the user experience
- we provide cache and refresh control in it

## $l

`$l` function is use for uniform localization support.

```jsx
import { $l } from 'choerodon-hap-front-boot';

...
<div>$l('code')</div>
...
```

## openTabR
`openTabR` is a function that can open(create or locate) a tab.

```jsx
import { openTabR } from 'choerodon-hap-front-boot';

...
openTabR(url, title);
...
```

## Dependencies

 * Node environment (6.9.0+)
 * Git environment

## Related documents and information

* [React](https://reactjs.org)
* [Mobx](https://github.com/mobxjs/mobx)
* [webpack](https://webpack.docschina.org)
* [gulp](https://gulpjs.com)
* [choerodon hap ui](http://hap-ui.staging.saas.hand-china.com)

## Reporting Issues
If you find any shortcomings or bugs, please describe them in the issue

## How to Contribute
Pull requests are welcome! Follow to know for more information on how to contribute.