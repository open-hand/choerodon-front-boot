/*
  editor: smilesoul 2018/2/8
*/

const fs = require('fs');
const yaml = require('js-yaml');
const files = fs.readdirSync('../');
const path = require('path');
// 识别配置项
let config = {};
const proConfig = files.filter((value) => {
  return value == 'config.js';
});
if (proConfig && proConfig.length != 0) {
  const fileConfig = require('../../../config.js');
  if (fileConfig) {
    config = fileConfig;
  }
}
//服务器地址
if (config.server) {
  process.env.API_HOST = config.server;
} else {
  process.env.API_HOST = 'http://api.example.com';
}

//webpack模块加载
const proModules = files.filter((value) => {
  return value[0] !== '.';
});
const pathModule = proModules.map((value) => {
  return `../../${value}/node_modules`;
});

//加载各个模块下的theme
let themeSetting = {};
if (config.themeSetting) {
  themeSetting = config.themeSetting;
}
//添加mainCss的文件判断
let mainCss;
if (config.mainCss) {
  if (files.indexOf(JSON.parse(config.mainCss)) < 0) {
    mainCss = 'iam';
  } else {
    mainCss = config.mainCss.split('"')[1];
  }
} else {
  mainCss = 'iam';
}
//添加header配置项
let Masters;
if (config.Masters) {
  if (files.indexOf(JSON.parse(config.Masters)) < 0) {
    Masters = 'iam';
  } else {
    Masters = config.Masters.split('"')[1];
  }
} else {
  Masters = 'iam';
}

//添加Home页
let Home;
if (config.Home) {
  if (files.indexOf(JSON.parse(config.Home)) < 0) {
    Home = 'iam';
  } else {
    Home = config.Home.split('"')[1];
  }
} else {
  Home = 'iam';
}
//添加title名称
let titlename;
if (config.titlename) {
  titlename = config.titlename;
} else {
  titlename = 'HAP';
}

//添加icon配置
let favicon;
if (fs.existsSync(path.resolve(__dirname, `../../../${config.favicon}`))) {
  favicon = config.favicon;
} else {
  favicon = 'favicon.jpg';
}

//添加客户端
let clientid;
if (config.clientId) {
  clientid = config.clientId;
} else {
  clientid = 'local';
}
//添加线上客户端ID
let proclientId;
if (config.proclientId) {
  proclientId = config.proclientId;
} else {
  proclientId = 'hapcloudfront';
}

//添加本地开发环境确认

let local;
if (config.local == true || config.local == false) {
  local = config.local;
} else {
  local = true;
}

//添加icon配置
let webpackHook;
const webpackConfigPath = path.resolve(__dirname, `../../../${config.webpackConfig || 'webpack.config.js'}`);
if (fs.existsSync(webpackConfigPath)) {
  webpackHook = require(webpackConfigPath);
}

const configs = config;
module.exports = {
  themeSetting,
  mainCss,
  Masters,
  Home,
  pathModule,
  configs,
  titlename,
  favicon,
  clientid,
  proclientId,
  local,
  webpackHook,
};
