/**
 * Created by jaywoods on 2017/6/24.
 */
import { action, computed, observable } from 'mobx';
import Routes from 'RouteMap';
import axios from 'Axios';
import AppState from 'AppState';

function getMenuType() {
  return AppState.isTypeUser ? 'user' : AppState.currentMenuType.type;
}

class MenuStore {
  @observable siteMenu = [];
  @observable orgMenu = [];
  @observable prjMenu = [];
  @observable userMenu = [];

  @observable selectedMenu;

  @observable chosenService = 0;

  @observable recentChosen = [];

  @observable menuTypeData = [];

  @observable test = [];

  @observable subNum = 0;

  @computed
  get getSubNum() {
    return this.subNum;
  }

  @action
  addSubNum() {
    this.subNum += 1;
  }

  @action
  setSubNum(data) {
    this.subNum = data;
  }

  @computed
  get getTest() {
    return this.test;
  }

  @action
  reCheckTest(current) {
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

  @action
  changeTestCheck(row) {
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

  @action
  resetTest(data) {
    this.test = data;
    localStorage.recentList = JSON.stringify(data);
  }

  @action
  setTest(row) {
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

  @computed
  get getMenuTypeData() {
    return this.menuTypeData;
  }

  @action
  setMenuTypeData(data) {
    this.menuTypeData = data;
  }

  @computed
  get getRecentChosen() {
    return this.recentChosen;
  }

  @action
  pushRecentChosen(row) {

  }

  @action
  setRecentChosen(data) {
    this.recentChosen = data;
  }

  @action
  setChosenService(data) {
    this.chosenService = data;
  }

  @computed
  get getChosenService() {
    return this.chosenService;
  }

  @action
  setSelectedMenu(data) {
    this.selectedMenu = data;
  }

  @computed
  get getSelectedMenu() {
    return this.selectedMenu;
  }

  loadMenuTypeDate() {
    return axios.get('/uaa/v1/menus/select');
  }

  @action
  loadMenuData(type = getMenuType()) {
    const menu = this.menuData(type);
    if (menu.length) {
      return Promise.resolve(menu);
    }
    return axios.get(`/iam/v1/menus/tree?test_permission=true&level=${type}`).then((data) => {
      const child = data.filter(
        item => item.name !== null && item.subMenus !== null && item.subMenus.length > 0,
      );
      this.loadRoute(child);
      this.setChosenService(null);
      this.setMenuData(child, type);
      return child;
    });
  }

  loadRoute(child) {
    this.treeReduce(child, (node) => {
      if (node.route) {
        Routes[node.code] = node.route;
      }
      return false;
    });
  }

  @action
  setMenuData(child, childType) {
    let data = child;
    let type = childType;
    if (childType) {
      data = child.filter(
        item => item.name !== null && item.subMenus !== null && item.subMenus.length > 0,
      );
    } else {
      type = getMenuType();
    }
    switch (type) {
      case 'site':
        this.siteMenu = data;
        break;
      case 'organization':
        this.orgMenu = data;
        break;
      case 'project':
        this.prjMenu = data;
        break;
      case 'user':
        this.userMenu = data;
        break;
      default:
    }
  }

  @computed
  get getMenuData() {
    return this.menuData(getMenuType());
  }

  menuData(type) {
    switch (type) {
      case 'site':
        return this.siteMenu;
      case 'organization':
        return this.orgMenu;
      case 'project':
        return this.prjMenu;
      case 'user':
        return this.userMenu;
      default:
        return [];
    }
  }

  treeReduce(tree, callback, childrenName = 'subMenus') {
    return tree.some((node, index) => {
      if (node[childrenName] && node[childrenName].length > 0) {
        return this.treeReduce(node[childrenName], callback, childrenName);
      }
      return callback(node, index);
    });
  }
}

const menuStore = new MenuStore();

export default menuStore;
