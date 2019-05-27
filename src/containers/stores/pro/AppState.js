import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import axios from '../../components/pro/axios';

class AppState {
  @observable isTabMode = true;

  @observable userInfo = {};

  @observable locales = {};

  @observable currentLang = 'zh_CN';

  @observable sysInfo = {};

  @observable cas = false;

  @computed
  get isCas() {
    return this.cas;
  }

  @action
  setCas(data) {
    this.cas = data;
  }

  @action
  updateSysInfo(type, value) {
    this.sysInfo[type] = value;
  }

  @action
  setIsTabMode(data) {
    this.isTabMode = data;
  }

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(user) {
    this.userInfo = user;
    if (user.locale) {
      this.setCurrentLang(user.locale);
    }
  }

  @action
  setCurrentLang(data) {
    this.currentLang = data;
  }

  @action
  setLocales(data) {
    this.locales = data;
  }

  @action
  setSysInfo(data) {
    this.sysInfo = data || {};
    window.updateFavicon(data.faviconImageSrc);
  }

  @computed
  get logo() {
    return this.sysInfo.logoImageSrc;
  }

  @computed
  get favicon() {
    return this.sysInfo.faviconImageSrc;
  }

  @computed
  get title() {
    return this.sysInfo.title;
  }

  async loadUserInfo() {
    try {
      const res = await axios.get('/sys/um/user_personal_info');
      if (res === '') {
        this.setCas(true);
        window.top.location.href = '/index';
      }
      return res;
    } catch (error) {
      throw Error('someting wrong');
    }
  }

  // loadUserInfo = () => axios.get('/sys/um/user_personal_info');

  loadSysInfo = () => axios.post('/sys/config/system/info');

  loadUserInfoC7n = () => axios.get('/iam/v1/users/self');

  loadTabMode() {
    axios.post('/sys/preferences/queryPreferences')
      .then((res) => {
        const { rows } = res;
        const nav = _.find(rows, row => row.preferences === 'nav') || {};
        this.setIsTabMode(!nav.preferencesValue || nav.preferencesValue === 'Y');
      });
  }

  loadLocale() {
    return axios.post('/common/language/')
      .then((res) => {
        const locales = {};
        res.forEach((v) => {
          locales[v.langCode] = v.description;
        });
        return locales;
      });
  }
}

const appState = new AppState();
export default appState;
