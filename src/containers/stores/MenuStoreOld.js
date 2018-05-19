/**
 * Created by jaywoods on 2017/6/24.
 */
import { observable, action, computed } from 'mobx';
import Routes from 'RouteMap';
import axios from 'Axios';
import _ from 'lodash';
import AppState from 'AppState';

class MenuStore {
  @observable menu;

  @observable selectedSever;

  @observable selectedMenu;

  @observable chosenService;

  @observable recentChosen = [];

  @observable menuTypeData = [];

  @observable test = [];

  @observable subNum = 0;

  constructor() {
    this.menu = [];
    this.chosenService = 0;
  }

  @computed get getSubNum() {
    return this.subNum;
  }

  @action addSubNum() {
    this.subNum += 1;
  }

  @action setSubNum(data) {
    this.subNum = data;
  }

  @computed get getTest() {
    return this.test;
  }

  @action reCheckTest(current) {
    const data = [...this.test];
    if (data.length > 0) {
      for (let a = 0; a < data.length; a += 1) {
        if (parseInt(data[a].id, 10) === parseInt(current.id, 10)) {
          data[a].check = true;
        } else {
          data[a].check = false;
        }
      }
    }
    this.resetTest(data);
  }

  @action changeTestCheck(row) {
    const data = [...this.test];
    for (let a = 0; a < data.length; a += 1) {
      if (data[a].id === row.id) {
        data[a].check = true;
      } else {
        data[a].check = false;
      }
    }
    this.resetTest(data);
  }

  @action resetTest(data) {
    this.test = data;
    localStorage.recentList = JSON.stringify(data);
  }

  @action setTest(row) {
    // 往最近数组插一条数据
    if (this.test.length > 0) {
      let flag = 0;
      for (let a = 0; a < this.test.length; a += 1) {
        if (this.test[a].id === row.id) {
          flag = 1;
        }
      }
      if (flag === 0) {
        this.test.push(row);
      }
    } else {
      this.test.push(row);
    }
    for (let b = 0; b < this.test.length; b += 1) {
      if (this.test[b].id === row.id) {
        this.test[b].check = true;
      } else {
        this.test[b].check = false;
      }
    }
    localStorage.recentList = JSON.stringify(this.test);
  }

  @computed get getMenuTypeData() {
    return this.menuTypeData;
  }

  @action setMenuTypeData(data) {
    this.menuTypeData = data;
  }


  @computed get getRecentChosen() {
    return this.recentChosen;
  }
  @action pushRecentChosen(row) {

  }

  @action setRecentChosen(data) {
    this.recentChosen = data;
  }

  @action setChosenService(data) {
    this.chosenService = data;
  }

  @computed get getChosenService() {
    return this.chosenService;
  }

  @action setSelectedMenu(data) {
    this.selectedMenu = data;
  }

  @computed get getSelectedMenu() {
    return this.selectedMenu;
  }

  @action setSelectedSever(data) {
    this.selectedSever = data;
  }

  @computed get getSelectedSever() {
    return this.selectedSever;
  }

  checkMenuPermission(one) {
    if (one.subMenus) {
      return true;
    } else {
      const code = one.code;
      if (AppState) {
        let type = '';
        if (sessionStorage.type) {
          type = sessionStorage.type;
        } else if (AppState.currentMenuType) {
          type = AppState.currentMenuType.type;
        } else {
          return false;
        }
        let flag = 0;
        const menuPermission = [];
        for (let a = 0; a < AppState.getPerMission.length; a += 1) {
          const middle = _.filter(AppState.getPerMission[a], {
            menu: code,
            resourceType: type,
          });
          menuPermission.push(middle);
        }
        if (menuPermission) {
          menuPermission.forEach((valueMenu) => {
            valueMenu.forEach((value) => {
              if (value.approve) {
                flag += 1;
              }
            });
          });
        }
        return flag > 0;
        // return true;
      } else {
        return true;
        // return false;
      }
    }
  }

  cursiveMenu = (child, keys) => {
    if (child.code === keys) {
      this.setSelectedSever(child.serviceCode);
      let data = this.menu.filter(item => item.name !== null && item.subMenus !== null);
      const spliceChild = [];
      if (data.length > 0) {
        for (let a = 0; a < data.length; a += 1) {
          let flag = 0;
          for (let b = 0; b < data[a].subMenus.length; b += 1) {
            if (this.checkMenuPermission(data[a].subMenus[b])) {
              flag = 1;
            }
          }
          if (flag === 0) {
            spliceChild.push({
              id: data[a].id,
            });
            // child.splice(a, 1);
          }
        }
      }
      data = _.differenceBy(data, spliceChild, 'id');
      for (let c = 0; c < data.length; c += 1) {
        if (data[c].code === child.serviceCode) {
          this.setChosenService(c);
        }
      }
    } else if (child.subMenus !== null) {
      for (let d = 0; d < child.subMenus.length; d += 1) {
        this.cursiveMenu(child.subMenus[d], keys);
      }
    }
  }

  loadMenuTypeDate(level) {
    return axios.get(`/iam/v1/menus/tree?level=${level}`);
  }
  loadOrgMenu() {
    return axios.get('/iam/v1/organizations/list');
  }
  loadProMenu() {
    return axios.get('/iam/v1/organization/1/projects?organizationId=1');
  }

  loadMenuType() {
    return axios.all([this.loadOrgMenu()])
      .then(axios.spread((org) => {
        const data = { organizations: org };
        return data;
      }));
  }

  loadSelectedKey = (child) => {
    let keys;
    let locationSplit;
    if (location.hash.indexOf('?') !== -1) {
      locationSplit = location.hash.replace(/#/g, '').split('?')[0].split('/');
    } else {
      locationSplit = location.hash.replace(/#/g, '').split('/');
    }
    locationSplit = _.take(locationSplit, 3);
    Object.keys(Routes).forEach((key) => {
      if (Routes[key].split('/').length === locationSplit.length) {
        let flag = 0;
        for (let a = 0; a < Routes[key].split('/').length; a += 1) {
          if (Routes[key].split('/')[a] !== locationSplit[a]) {
            flag = 1;
          }
        }
        if (flag === 0) {
          keys = key;
        }
      }
    });
    for (let a = 0; a < child.length; a += 1) {
      for (let b = 0; b < child[a].subMenus.length; b += 1) {
        this.cursiveMenu(child[a].subMenus[b], keys);
      }
    }
    this.setSelectedMenu(keys);
  };

  // 加载主菜单数据
  loadMenuData(url) {
    axios.get(url).then((data) => {
      // console.log(data);
      this.setMenuData(data);
      const child = data.filter(item => item.name !== null && item.subMenus !== null);
      this.loadSelectedKey(child);
    });
  }

  @action setMenuData(data) {
    this.menu = data;
  }

  @computed get getMenuData() {
    return this.menu.slice();
  }
}

const menuStore = new MenuStore();

export default menuStore;
