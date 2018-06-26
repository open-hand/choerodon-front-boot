/**
 * Created by jaywoods on 2017/6/24.
 */
import { action, computed, observable } from 'mobx';
import axios from '../components/axios';
import AppState from './AppState';

function getMenuType(menuType = AppState.currentMenuType, isUser = AppState.isTypeUser) {
  return isUser ? 'user' : menuType.type;
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

  @action
  loadMenuData(menuType = AppState.currentMenuType, isUser) {
    const type = getMenuType(menuType, isUser);
    const menu = this.menuData(type);
    if (menu.length) {
      return Promise.resolve(menu);
    }
    const { id = 0 } = menuType;
    return axios.get(`/iam/v1/menus?level=${type}&source_id=${id}`).then((data) => {
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

  treeReduce(tree, callback, childrenName = 'subMenus', parents = []) {
    return tree[childrenName].some((node, index) => {
      if (tree.code) {
        parents.push(tree);
      } else {
        parents = [];
      }
      if (node[childrenName] && node[childrenName].length > 0) {
        return this.treeReduce(node, callback, childrenName, parents);
      }
      return callback(node, parents, index);
    });
  }
}

const menuStore = new MenuStore();

export default menuStore;
