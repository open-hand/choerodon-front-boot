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
        API_HOST: 'http://api.example.org', // The `server` property of root config will be overwritten by this.
      }
    }
    // production env
    if (mode === 'build' || env === 'production') {
      return {
        API_HOST: 'an `enterpoint` placeholder string', // Reference to `enterpoint.sh`
      }
    }
  },
  entryName: 'index',
  root: '/',
  // By default, The property `routes` is null and we use property `main` as path of router component and use the last word of property `name` what be split by char `-` as router path in package.json
  routes: {
    'iam': 'src/app/iam/containers/IAMIndex.js', // For e.g.
  }, 
  // By default, dashboard is false.
  // The keys of dashboard are namespaces, and entries are Component paths.
  dashboard: {
    iam: 'src/dashboard/*', //  For e.g., use glob pattern
    devops: [
      'src/dashboard/Test', //  For e.g., use dir path
      'src/dashboard/Test2.js', //  For e.g., use file path
    ],
    // Intl example
    agile: {
      components: 'src/dashboard/*',
      locale: 'src/locale/*', 
    }
  },
  server: 'http://api.example.com', // API server
  fileServer: 'http://file.example.com', // File server
  clientid: 'localhost',
  titlename: 'Choerodon', // HTML title
  favicon: 'favicon.ico', // Page favicon
  theme: { // less/sass modify vars
    'primary-color': '#3F51B5', 
  },
}
```

## Run

```
$choerodon-front-boot start --config config.js
```

Once running, open http://localhost:9090

## Dist

```
$choerodon-front-boot build --config config.js
```

## Init Menu

First, you should make sure that you have `Menu.yml` under `./{1}/src/app/{1}/config/Menu.yml`. And also should have `language/en.yml & language/zh.yml`。

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
$python ./{1}/node_modules/choerodon-front-boot/structure/configAuto.py {1}
$python ./{1}/node_modules/choerodon-front-boot/structure/sql.py [-i HOST] [-p PORT] [-u USER] [-s PASSWD] [-a ATTRS] [-d DELETE]
```
`{1}` is your module name.

## Init Dashboard (0.7.0+)

First, you should make sure that you have `dashboard.yml` under `./{1}/src/app/{1}/config/dashboard/dashboard.yml`. And also should have `language/en.yml & language/zh.yml`。

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

Then, you can run the script to initialize the menu.
```
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard.py -o yml -m {1}
$python ./{1}/node_modules/choerodon-front-boot/structure/dashboard.py -o sql [-i HOST] [-p PORT] [-u USER] [-s PASSWD]
```
`{1}` is your module name.

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
