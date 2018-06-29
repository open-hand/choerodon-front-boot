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
  babelConfig(config) {
    return config;
  },
  webpackConfig(config) {
    return config;
  },
  enterPoints(mode) {
    // By default, it returns empty object.
    // In javascript files, words `process.env.XXX` will be replaced with the key of returned map object like `XXX` from this function .
    // e.g.
    // development env
    if (mode === 'start') {
      return {
        API_HOST: 'http://api.example.org', // The `server` property of root config will be overwritten by this.
      }
    }
    // production env
    if (mode === 'build') {
      return {
        API_HOST: 'an `enterpoint` placeholder string', // Reference to `enterpoint.sh`
      }
    }
  },
  entryName: 'index',
  root: '/',
  routes: null, // By default, routes use main in package.json
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
  choerodon-front-boot start --config config.js
```

Once running, open http://localhost:9090

## Dist

```
  choerodon-front-boot build --config config.js
```

## Dependencies

 * Node environment (6.9.0+)
 * Git environment
 * Python environment(2.7)

## Related documents and information

* [React](https://reactjs.org)
* [Mobx](https://github.com/mobxjs/mobx)
* [webpack](https://webpack.docschina.org)
* [gulp](https://gulpjs.com)

## Reporting Issues
If you find any shortcomings or bugs, please describe them in the  [issue](https://github.com/choerodon/choerodon/issues/new?template=issue_template.md).

## How to Contribute
Pull requests are welcome! [Follow](https://github.com/choerodon/choerodon/blob/master/CONTRIBUTING.md) to know for more information on how to contribute.
