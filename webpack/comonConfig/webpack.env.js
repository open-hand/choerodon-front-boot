/*
  editor: smilesoul 2018/2/4
*/

const config = require('./webpack.file');

let webpackEnv;
switch (process.env.NODE_ENV) {
  case ('development'):
    webpackEnv = {
      'process.env.API_HOST': JSON.stringify(`${process.env.API_HOST}`),
      'process.env.AUTH_HOST': JSON.stringify(`${process.env.API_HOST}/oauth`),
      'process.env.CLIENT_ID': JSON.stringify(`${config.clientid}`),
      'process.env.LOCAL': JSON.stringify(`${config.local}`),
      'process.env.VERSION': JSON.stringify('本地'),
    };
    break;
  case ('production'):
    webpackEnv = {
      'process.env.API_HOST': JSON.stringify('localhost:http://localhost:8080'),
      'process.env.AUTH_HOST': JSON.stringify('localhost:http://localhost:8080/oauth'),
      'process.env.CLIENT_ID': JSON.stringify('localhost:clientId'),
      'process.env.LOCAL': JSON.stringify('localhost:local'),
      'process.env.HEADER_TITLE_NAME': JSON.stringify(process.env.HEADER_TITLE_NAME || 'localhost:headertitlename'),
      'process.env.COOKIE_SERVER': JSON.stringify(process.env.COOKIE_SERVER || 'localhost:cookieServer'),
      'process.env.VERSION': JSON.stringify(process.env.VERSION || 'localhost:version'),
      'process.env.TITLE_NAME': JSON.stringify('localhost:titlename'),
    };
    break;
  default:
    break;
}

module.exports = webpackEnv;
