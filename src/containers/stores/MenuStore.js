/**
 * Created by jaywoods on 2017/6/24.
 */
import { action, computed, get, observable, set } from 'mobx';
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
  @observable menuGroup = {
    site: [],
    user: [],
    organization: {},
    project: {},
  };

  @action
  loadMenuData(menuType = AppState.currentMenuType, isUser) {
    const type = getMenuType(menuType, isUser) || 'site';
    const { id = 0 } = menuType;
    const menu = this.menuData(type, id);
    if (menu.length) {
      return Promise.resolve(menu);
    }
    return axios.get(`/iam/v1/menus?level=${type}&source_id=${id}`).then(action((data) => {
      const child = filterEmptyMenus(data);
      this.setMenuData(child, type, id);
      return child;
    }));
  }

  @action
  setMenuData(child, childType, id = AppState.currentMenuType.id) {
    const data = filterEmptyMenus(child);
    if (id) {
      set(this.menuGroup[childType], id, data);
    } else {
      set(this.menuGroup, childType, data);
    }
  }

  @computed
  get getMenuData() {
    return this.menuData();
  }

  menuData(type = getMenuType(), id = AppState.currentMenuType.id) {
    let data;
    if (type) {
      if (id) {
        data = get(this.menuGroup[type], id);
      } else {
        data = get(this.menuGroup, type);
      }
    }
    return data || [];
  }

  treeReduce(tree, callback, childrenName = 'subMenus', parents = []) {
    if (tree.code) {
      parents.push(tree);
    }
    return tree[childrenName].some((node, index) => {
      const newParents = parents.slice(0);
      if (node[childrenName] && node[childrenName].length > 0) {
        return this.treeReduce(node, callback, childrenName, newParents);
      }
      return callback(node, parents, index);
    });
  }
}

const menuStore = new MenuStore();

export default menuStore;
