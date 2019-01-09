# Choerodon Boot


Choerodon front boot is a toolkit about front end package management, startup, compilation. It is mainly used to provide custom some configurations file to create a project of React that can be modified to some extent.

The construction project can be used on `macOS`, `Windows` or `Linux`. Teams can be developed in modules, greatly speeding up development.

 * The project uses `webpack` for construction.
 * `React` and `Mobx` are used as the main development technology.

## Install

```bash
$ npm install choerodon-front-boot -S
```

## Configuration

* Create a configuration file named `config.js`

```js
import autoprefixer from 'autoprefixer';
// default config of Choerodon
const config = {
  port: 9090,
  output: './dist',
  htmlTemplate: 'index.template.html',
  devServerConfig: {},
  postcssConfig: {
    plugins: [
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
    ],
  },
  babelConfig(config, mode, env) {
    return config;
  },
  webpackConfig(config, mode, env) {
    return config;
  },
  enterPoints(mode, env) {
    // By default, it returns empty object.
    // In javascript files, words `process.env.XXX` will be replaced with the key of returned map object like `XXX` from this function .
    // e.g.
    // development env
    if (mode === 'start' || env === 'development') {
      return {
        // The `server` property of root config will be overwritten by this.
        API_HOST: 'http://api.example.org', 
      }
    }
    // production env
    if (mode === 'build' || env === 'production') {
      return {
        // Reference to `enterpoint.sh`
        API_HOST: 'an `enterpoint` placeholder string', 
      }
    }
  },
  entryName: 'index',
  root: '/',
  // By default, The property `routes` is null and we use property `main` as path of router component
  // and use the last word of property `name` what be split by char `-` as router path in package.json
  routes: {
    'iam': 'src/app/iam/containers/IAMIndex.js', 
  }, 
  // By default, dashboard is false.
  // The keys of dashboard are namespaces, and the entries of which are component paths.
  dashboard: {
    //  For e.g., use glob pattern
    iam: 'src/dashboard/*', 
    devops: [
      //  For e.g., use dir path
      //  For e.g., use file path
      'src/dashboard/Test', 
      'src/dashboard/Test2.js', 
    ],
    // Intl example
    agile: {
      components: 'src/dashboard/*',
      locale: 'src/locale/*', 
    }
  },
  // API server
  server: 'http://api.example.com', 
  // File server
  fileServer: 'http://file.example.com', 
  // WebSocket server
  webSocketServer: 'ws://ws.example.com', 
  clientid: 'localhost',
  // HTML title
  titlename: 'Choerodon', 
  // Page favicon
  favicon: 'favicon.ico', 
  // modify variables for less and sass
  theme: { 
    'primary-color': '#3F51B5', 
  },
}
```

## Run

```
$ choerodon-front-boot start --config config.js
```

Once running, open http://localhost:9090

## Dist

```
$ choerodon-front-boot build --config config.js
```

## Init Menu

First, you should make sure that you have `Menu.yml` under `./{1}/src/app/{1}/config/Menu.yml`. 
And also should have `language/en.yml & language/zh.yml`。

A `Menu.yml` file like this:

``` yml
#Menu.yml
"iam": code
  icon: IAM  # icon ode
  sort: 1  # sort
  delete: "true"  # Whether it should be deleted
  site:  # menu level
    - "organization": # code
        sort: 1  # sort
        Routes: /iam/organization  # route
        icon: manage_organization  # icon
        permission:  # permissions
          - 'iam-service.organization.enableOrganization' 
```
A `language/en.yml` file like this:

``` yml
#language/en.yml
"iam": "platform settings"
# site
"iam.organization": "Organization"
```

Then, you can run the script to initialize the menu.
```
$python ./{1}/node_modules/choerodon-front-boot/structure/menu/__init__.py -o yml -m {1}
$python ./{1}/node_modules/choerodon-front-boot/structure/menu/__init__.py -o sql -m {1} [-i HOST] [-p PORT] [-u USER] [-s PASSWD] [-a ATTRS] [-d DELETE]
```
`{1}` is your module name.

## Init Dashboard (0.7.0+)

First, you should make sure that you have `dashboard.yml` under `./{1}/src/app/{1}/config/dashboard/dashboard.yml`. 
And also should have `language/en.yml & language/zh.yml`。

A `dashboard.yml` file like this:

``` yml
#dashboard.yml
dashboard:
  - code: "Guide"
    icon: APItest
    title: "快速入门"
    description: "新手指引"
    level: site
    sort: 1
  - code: "Document"
    icon: description
    title: "文档"
    description: "文档"
    level: site
    sort: 2
    
```
A `language/en.yml` file like this:

``` yml
#language/en.yml
"Guide": "Guide"
"Document": "Document"
```

Then, you can run the script to initialize the dashboard.
(0.7.0 - 0.9.0)
```
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard.py -o yml -m {1}
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard.py -o sql -m {1} [-i HOST] [-p PORT] [-u USER] [-s PASSWD]
```
(0.9.0+)
```
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard/__init__.py -o yml -m {1}
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard/__init__.py -o sql [-i HOST] [-p PORT] [-u USER] [-s PASSWD]
```
`{1}` is your module name.

In the dashboard card component, we can use the `DashboardToolBar` and `DashboardNavBar` component.
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardToolBar, DashboardNavBar } from 'choerodon-front-boot';

class Example extends React.Component {
  render() {
    return (
      <div>
        <DashboardToolBar>
          <button/>
        </DashboardToolBar>
        <div>
          content
        </div>
        <DashboardNavBar>
          <Link>go to home</Link>
        </DashboardNavBar>
      </div>
    );
  }
}

``` 

## WSHandler (0.8.0+)

`WSHandler` componnet is used for websocket to handle message.

```jsx
import React from 'react';
import { WSHandler } from 'choerodon-front-boot';

class Example1 extends React.Component {
  handleMessage = (data) => {
  };
  
  render() {
    <WSHandler
      path="choerodon:msg"
      key="..."
      onMessage={this.handleMessage}
    >
      {
        data => (
          <span>{data}</span>
        )
      }
    </WSHandler>
  }
}

```

- Set property `webSocketServer` in config.js.
- By default, `path` is `choerodon:msg`. 
It will open a websocket connection as `ws://ws.example.com/choerodon:msg`.
Each handler use the same path will open only one websocket connection.
- Set props `key` for subscript message.
- Props `onMessage` is used to handle message from server.
- The children of WSHandler can be a function which argument provide the received message.

## Dependencies

 * Node environment (6.9.0+)
 * Git environment
 * Python environment(2.7)

## Related documents and information

* [React](https://reactjs.org)
* [Mobx](https://github.com/mobxjs/mobx)
* [webpack](https://webpack.docschina.org)
* [gulp](https://gulpjs.com)
* [choerodon ui](http://ui.choerodon.io/docs/react/introduce-cn)

## Reporting Issues
If you find any shortcomings or bugs, please describe them in the  [issue](https://github.com/choerodon/choerodon/issues/new?template=issue_template.md).

## How to Contribute
Pull requests are welcome! [Follow](https://github.com/choerodon/choerodon/blob/master/CONTRIBUTING.md) to know for more information on how to contribute.
