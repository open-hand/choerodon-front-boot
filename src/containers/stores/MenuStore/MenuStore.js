/**
 * Created by jaywoods on 2017/6/24.
 */
import { action, computed, observable } from 'mobx';
import axios from 'Axios';
import AppState from 'AppState';

function getMenuType() {
  return AppState.isTypeUser ? 'user' : AppState.currentMenuType.type;
}

function filterEmptyMenus(menuData, parent) {
  const newMenuData = menuData.filter((item) => {
    const { name, type, subMenus } = item;
    return name !== null && (type === 'menu' || (subMenus !== null && filterEmptyMenus(subMenus, item).length > 0));
  });
  if (parent) {
    parent.subMenus = newMenuData;
  }
  return newMenuData;
}

class MenuStore {
  @observable siteMenu = [];
  @observable orgMenu = [];
  @observable prjMenu = [];
  @observable userMenu = [];
  @observable selectedMenu;
  @observable chosenService = 0;

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

  @action
  loadMenuData(type) {
    if (type) {
      this.setChosenService(null);
    } else {
      type = getMenuType();
    }
    const menu = this.menuData(type);
    if (menu.length) {
      return Promise.resolve(menu);
    }
    return axios.get(`/iam/v1/menus?level=${type}`).then((data) => {
      const child = filterEmptyMenus(data);
      this.setMenuData(child, type);
      return child;
    });
  }

  @action
  setMenuData(child, childType) {
    let data = child;
    let type = childType;
    if (childType) {
      data = filterEmptyMenus(child);
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
