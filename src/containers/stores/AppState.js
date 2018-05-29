import { action, computed, observable } from 'mobx';
import axios from 'Axios';
import 'Choerodon';

function getDefaultLanguage() {
  let locale;
  if (typeof window !== 'undefined') {
    // locale = navigator.language || navigator.userLanguage || navigator.systemLanguage;
  }
  return locale ? locale.replace('-', '_') : 'zh_CN';
}

class AppState {
  @observable menuType = {}; // 一个菜单对象 {id:'',name:'',type:''}
  @observable collapsed = false;
  @observable userInfo = {};
  @observable single = false;
  @observable debugger = false; // 调试模式
  @observable isUser = false;

  @computed
  get getUserId() {
    return this.userInfo.id;
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
  setUserInfo(user) {
    this.userInfo = user;
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
  get currentLanguage() {
    return this.userInfo.language || getDefaultLanguage();
  }

  @computed
  get isAuth() {
    return !!this.userInfo.loginName;
  }

  @computed
  get currentMenuType() {
    return this.menuType;
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
  setTypeUser(isUser) {
    sessionStorage.user = isUser ? 'user' : '';
    this.isUser = isUser;
  }

  @computed
  get isTypeUser() {
    return this.isUser;
  }

  loadUserInfo = () => axios.get('/iam/v1/users/self');
}

const appState = new AppState();
export default appState;
