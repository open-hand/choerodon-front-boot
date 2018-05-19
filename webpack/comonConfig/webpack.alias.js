/*
  editor: smilesoul 2018/2/4
*/

const path = require('path');
const config = require('./webpack.file');
const dirPath = path.join(__dirname, '..');

let configCss;
if (config.mainCss == 'boot') {
  configCss = '../src/containers/asset/main.less';
} else {
  configCss = `../src/app/${config.mainCss}/assets/css/main.less`;
}

let configMaster;
if (config.Masters == 'boot') {
  configMaster = '../src/containers/Masters.js';
} else {
  configMaster = `../src/app/${config.Masters}/containers/Masters.js`;
}

const pathAlias = {
  Axios: path.resolve(dirPath, '../src/containers/common/axios.js'),
  Choerodon: path.resolve(dirPath, '../src/containers/common/Choerodon.js'),
  Store: path.resolve(dirPath, '../src/containers/common/store.js'),
  RouteMap: path.resolve(dirPath, '../src/app/generate/RouteMap.js'),
  Icons: path.resolve(dirPath, '../src/app/generate/Icons.js'),
  Permission: path.resolve(dirPath, '../src/app/generate/Permission.js'),
  PerComponent: path.resolve(dirPath, '../src/containers/components/permission.js'),
  MainCss: path.resolve(dirPath, configCss),
  Masters: path.resolve(dirPath, configMaster),
  Home: path.resolve(dirPath, '../src/containers/Home.js'),
  AutoRouter: path.resolve(dirPath, '../src/app/generate/AutoRouter.js'),
  Page: path.resolve(dirPath, '../src/containers/components/page'),
  PageHeader: path.resolve(dirPath, '../src/containers/components/page/Header'),
  MenuType: path.resolve(dirPath, '../src/containers/components/header/headerMenuType'),
  CommonMenu: path.resolve(dirPath, '../src/containers/components/menu/CommonMenu.js'),
  RightIconButton: path.resolve(dirPath, '../src/containers/components/header/headerManagerBtn'),
  UserPreferences: path.resolve(dirPath, '../src/containers/components/header/headerUserProfile'),
  IsAuthSpin: path.resolve(dirPath, '../src/containers/components/IsAuthSpin.js'),
  MasterHeader: path.resolve(dirPath, '../src/containers/components/header/headerComponent'),
  LeftIconButton: path.resolve(dirPath, '../src/containers/components/header/headerLogo'),
  MenuTitle: path.resolve(dirPath, '../src/app/iam/components/menu/MenuTitle.js'),
  Config: path.resolve(dirPath, '../../config.js'),
  Action: path.resolve(dirPath, '../src/containers/components/action.js'),
  nomatch: path.resolve(dirPath, '../src/containers/components/404.js'),
  // Button: path.resolve(dirPath, '../src/containers/components/Button/Button.js'),
  FullButton: path.resolve(dirPath, '../src/app/iam/components/FullButton.js'),
  ClientSearch: path.resolve(dirPath, '../src/containers/components/ClientSearch/ClientSearch.js'),
  Remove: path.resolve(dirPath, '../src/containers/components/Remove.js'),
  NewButton: path.resolve(dirPath, '../src/containers/components/newButton/NewButton.js'),
  RePagination: path.resolve(dirPath, '../src/containers/components/rePagination/RePagination.js'),
  // ReSelect: path.resolve(dirPath, '../src/containers/components/reSelect/ReSelect.js'),
  Select: path.resolve(dirPath, '../src/containers/components/Select/Select.js'),
  // IAMSpin: path.resolve(dirPath, '../src/containers/components/IAMSpin/IAMSpin.js'),
  SideBar: path.resolve(dirPath, '../src/containers/components/Sidebar'),

  //store
  menuStore: path.resolve(dirPath, '../src/containers/stores/MenuStore'),
  AppState: path.resolve(dirPath, '../src/containers/stores/AppState.js'),
  "@":  path.resolve(dirPath, '../src/containers/'),
}

module.exports = pathAlias;
