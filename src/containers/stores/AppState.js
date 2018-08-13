import { action, computed, observable } from 'mobx';
import axios from '../components/axios';

function getDefaultLanguage() {
  let locale;
  if (typeof window !== 'undefined') {
    // locale = navigator.language || navigator.userLanguage || navigator.systemLanguage;
  }
  return locale ? locale.replace('-', '_') : 'zh_CN';
}

class AppState {
  @observable menuType = null; // 一个菜单对象 {id:'',name:'',type:''}

  @observable expanded = false;

  @observable userInfo = {};

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
  get getMenuExpanded() {
    return this.expanded;
  }

  @action
  setMenuExpanded(data) {
    this.expanded = data;
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
