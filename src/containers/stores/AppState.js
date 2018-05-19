import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import 'Choerodon';
import MenuStore from '@/stores/MenuStore';
import menuStore from './MenuStore/MenuStore';

function getDefaultLanguage() {
  let locale;
  if (typeof window !== 'undefined') {
    // locale = navigator.language || navigator.userLanguage || navigator.systemLanguage;
  }
  return locale ? locale.replace('-', '_') : 'zh_CN';
}

class AppState {
  @observable language = getDefaultLanguage();
  @observable user;
  @observable isAuthenticated;
  @observable menuType = {};// 一个菜单对象 {id:'',name:'',type:''}
  @observable timer = 0;// 调试时计时
  @observable deploymentFilter = {};// 用于页面历史返回
  @observable perMission = [];
  @observable collapsed = false;
  @observable changeFlex = '14%';
  @observable perMissionArray = [];
  @observable userInfo;
  @observable single = false;
  @observable mainMenuFold = true;
  @observable fullscreen = true;// 控制页面全屏
  @observable showMenuType = false;// 控制切换组织和项目
  @observable PerMissionFlag = true;
  @observable debugger = false;// 调试模式
  @observable userId = null;
  @observable isUser = false;

  constructor(isAuthenticated = false) {
    this.isAuthenticated = isAuthenticated;
  }

  @computed
  get getUserId() {
    return this.userId;
  }

  @action
  setUserId(data) {
    this.userId = data;
  }

  @computed
  get getDebugger() {
    return this.debugger;
  }

  @action
  setDebugger(data) {
    this.debugger = data;
  }

  @computed
  get getPerMissionFlag() {
    return this.PerMissionFlag;
  }

  @action
  setPerMissionFlag(data) {
    this.PerMissionFlag = data;
  }

  @computed
  get getShowMenuType() {
    return this.showMenuType;
  }

  @action
  setShowMenuType(data) {
    this.showMenuType = data;
  }

  @computed
  get getfull() {
    return this.fullscreen;
  }

  @action
  setfull(data) {
    this.fullscreen = data;
  }

  @computed
  get getMenuFold() {
    return this.mainMenuFold;
  }

  @action
  setMenuFold(data) {
    this.mainMenuFold = data;
  }

  @computed
  get getSingle() {
    return this.single;
  }

  @action
  setSingle(data) {
    this.single = data;
  }

  @computed
  get getType() {
    return this.currentMenuType.type;
  }

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(data) {
    this.userInfo = data;
    this.user = data;
  }

  loadUserInfo = () => axios.get('/iam/v1/users/self').then((data) => {
    if (data) {
      this.setUserInfo(data);
    }
  });

  @computed
  get getperMissionArray() {
    return this.perMissionArray.slice();
  }

  @action
  pushperMissionArray(data) {
    this.perMissionArray.push(data);
  }

  @action
  setperMissionArray(data) {
    this.perMissionArray = data;
  }

  @computed
  get getChangeFlex() {
    return this.changeFlex;
  }

  @action
  setChangeFlex(data) {
    this.changeFlex = data;
  }

  @computed
  get getCollapsed() {
    return this.collapsed;
  }

  @action
  setCollapsed(data) {
    this.collapsed = data;
  }

  @computed
  get getPerMission() {
    return this.perMission.slice();
  }

  @action
  setPerMission(falg) {
    this.perMission.push([...falg]);
  }

  loadPerMissions(data) {
    if (JSON.stringify(data[0]) !== '{}') {
      axios.post('/iam/v1/permissions/checkPermission', JSON.stringify(data))
        .then((permission) => {
          this.setPerMission(permission);
        });
    }
  }

  /**
   *
   * @param url 参数字符串 type=project&id=366&name=演示测试项目2&organizationId=1
   * @returns {*} {type: "project", id: "366", name: "演示测试项目2", organizationId: "1"}
   */
  getHashStringArgs(url) {
    if (url == null) {
      return null;
    } else {
      const hashStrings = url;
      const hashArgs = {};
      const items = hashStrings.length > 0 ? hashStrings.split('&') : [];
      let item = null;
      let name = null;
      let value = null;
      let i = 0;
      const len = items.length;
      for (i = 0; i < len; i += 1) {
        item = items[i].split('=');
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        if (name.length > 0) {
          hashArgs[name] = value;
        }
      }
      return hashArgs;
    }
  }

  /**
   *
   * @param str 路由 '''?type=project&id=366&name=演示测试项目2&organizationId=1
   * @returns 返回路由参数字符串 ?type=project&id=366&name=演示测试项目2&organizationId=1
   */
  analysisUrl(str) {
    const index = str.lastIndexOf('?');
    if (index === -1) {
      return null;
    } else {
      const url = str.substring(index + 1, str.length);
      return url;
    }
  }

  @computed
  get currentLanguage() {
    return this.language;
  }

  @computed
  get currentUser() {
    return this.user;
  }

  @computed
  get isAuth() {
    return this.isAuthenticated;
  }

  @computed
  get currentMenuType() {
    return this.menuType;
  }

  @computed
  get getDeploymentFilter() {
    return this.deploymentFilter;
  }

  @action
  changeLanguageTo(language) {
    this.language = language;
  }

  @action
  setCurrentUser(user) {
    this.user = user;
  }

  @action
  setAuthenticated(flag) {
    this.isAuthenticated = flag;
  }

  @action
  changeMenuType(type) {
    sessionStorage.menType = JSON.stringify(type);
    sessionStorage.selectData = JSON.stringify(type);
    sessionStorage.type = type.type;
    this.menuType = type;
  }

  @action
  resetTimer() {
    this.timer = 0;
  }

  @action
  setDeploymentFilter(filter = {}) {
    this.deploymentFilter = filter;
  }

  @action
  setTypeUser(isUser) {
    sessionStorage.user = isUser ? 'user' : '';
    this.isUser = isUser;
  }

  @computed
  get isTypeUser() {
    return this.isUser;
  }
}

const appState = new AppState();
export default appState;
