# Choerodon Hap Front Boot


Choerodon hap front boot is a toolkit about front end package management, startup, compilation.

It is mainly used to provide custom some configurations file to create a project of React that can be modified to some extent.

The construction project can be used on `macOS`, `Windows` or `Linux`. Teams can be developed in modules, greatly speeding up development.

 * The project uses `webpack v3+` for construction.
 * `React` and `Mobx` are used as the main development technology.

## Install

```bash
$ npm install choerodon-hap-front-boot --registry https://nexus.choerodon.com.cn/repository/choerodon-npm/
```

*now the lib is in private repository so you should add --registry*

## Configuration

* Create a configuration file named `config.js`

```js
const config = {
  port: 9090,
  proxyTarget: 'http://localhost:8080',
}
```

*we suggest you only change the two options in daily development. Actually, we exposed a lot of configurable options, but for the sake of simplicity, we hidden them. If you have some special demand, contact us.*

## Run

add the below code in your package.json

```javascript
// package.json
...
"scripts": {
  "start": "choerodon-hap-front-boot start --config ./react/config.js",
  "build": "choerodon-hap-front-boot build --config ./react/config.js",
},
...
```

and run

```javascript
// if you can not run npm start with permission problems on linux or macOS, run *chmod -R 755 node_modules* first
$ npm start
```

Once running, open http://localhost:9090

*if you want to run all modules you relied on, you can change start commond as choerodon-hap-front-boot start --config ./react/config.js -m*

## Dist

```
$ npm run build
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