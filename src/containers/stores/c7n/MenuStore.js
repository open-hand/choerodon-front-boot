/**
 * Created by jaywoods on 2017/6/24.
 */
import { action, computed, get, observable, set } from 'mobx';
import groupBy from 'lodash/groupBy';
import concat from 'lodash/concat';
import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';
import axios from '../../components/c7n/axios';
import AppState from './AppState';

const BATCH_SIZE = 30;

function getMenuType(menuType = AppState.currentMenuType, isUser = AppState.isTypeUser) {
  return isUser ? 'user' : menuType.type;
}

function filterEmptyMenus(menuData, parent) {
  const newMenuData = menuData.filter((item) => {
    const { name, type, subMenus } = item;
    return name !== null && (type === 'menu_item' || (subMenus && filterEmptyMenus(subMenus, item).length > 0) || item.modelCode);
    // return name !== null && (type === 'menu_item' || (subMenus !== null && filterEmptyMenus(subMenus, item).length > 0));
  });
  if (parent) {
    parent.subMenus = newMenuData;
  }
  return newMenuData;
}

function insertLcMenuOneMenu(menuItem, groupLcMenu, groupParentLcMenu, parentArr) {
  if (menuItem.modelCode) {
    return;
  }
  if (groupLcMenu[menuItem.code]) {
    const keyGroup = orderBy(groupLcMenu[menuItem.code], ['sort'], ['asc']);
    const insertIndex = parentArr.findIndex(r => r === menuItem);
    if (insertIndex !== -1) {
      keyGroup.forEach((o, i) => {
        parentArr.splice(insertIndex + 1 + i, 0, o);
      });
    }
  }
  if (groupParentLcMenu[menuItem.code]) {
    menuItem.subMenus = menuItem.subMenus || [];
    const orderGroup = orderBy(groupParentLcMenu[menuItem.code], ['sort'], ['asc']);
    menuItem.subMenus = concat(orderGroup, menuItem.subMenus);
  }
  if (menuItem.subMenus) {
    menuItem.subMenus.forEach(item => insertLcMenuOneMenu(item, groupLcMenu, groupParentLcMenu, menuItem));
  }
}

function insertLcMenu(menuData, lcMenu) {
  const groupLcMenu = groupBy(lcMenu, 'afterBy');
  const groupNullLcMenu = groupLcMenu.null || [];
  const groupParentLcMenu = groupBy(groupNullLcMenu, 'parentCode');

  menuData.forEach(item => insertLcMenuOneMenu(item, groupLcMenu, groupParentLcMenu, menuData));
}

class MenuStore {
  @observable menuGroup = {
    site: [],
    user: [],
    organization: {},
    project: {},
  };

  @observable collapsed = false;

  @observable activeMenu = null;

  @observable selected = null;

  @observable leftOpenKeys = [];

  @observable openKeys = [];

  @observable type = null;

  @observable isUser = null;

  @observable id = null;

  statistics = {};

  counter = 0;

  click(code, level, name) {
    if (level in this.statistics) {
      if (code in this.statistics[level]) {
        this.statistics[level][code].count += 1;
      } else {
        this.statistics[level][code] = { count: 1, name };
      }
    } else {
      this.statistics[level] = {};
      this.statistics[level][code] = { count: 1, name };
    }
    this.counter += 1;
    const postData = Object.keys(this.statistics).map(type => ({ level: type, menus: Object.keys(this.statistics[type]).map(mCode => ({ mCode, ...this.statistics[type][mCode] })) }));
    if (postData.reduce((p, cur) => p + cur.menus.reduce((menusP, menusCur) => menusP + menusCur.count, 0), 0) >= BATCH_SIZE) {
      this.uploadStatistics();
      this.counter = 0;
    }
    localStorage.setItem('rawStatistics', JSON.stringify(this.statistics));
  }

  uploadStatistics() {
    const postData = Object.keys(this.statistics).map(type => ({ rootCode: `choerodon.code.top.${type}`, menus: Object.keys(this.statistics[type]).map(code => ({ code, ...this.statistics[type][code] })) }));
    if (!postData.every(v => v.rootCode && ['choerodon.code.top.site', 'choerodon.code.top.organization', 'choerodon.code.top.project', 'choerodon.code.top.user'].includes(v.rootCode))) {
      this.statistics = {};
      return;
    }
    axios.post('/manager/v1/statistic/menu_click/save', JSON.stringify(postData)).then((data) => {
      if (!data.failed) {
        this.statistics = {};
      }
    });
  }

  @action
  setCollapsed(collapsed) {
    this.collapsed = collapsed;
  }

  @action
  setActiveMenu(activeMenu) {
    this.activeMenu = activeMenu;
  }

  @action
  setSelected(selected) {
    this.selected = selected;
  }

  @action
  setLeftOpenKeys(leftOpenKeys) {
    this.leftOpenKeys = leftOpenKeys;
  }

  @action
  setOpenKeys(openKeys) {
    this.openKeys = openKeys;
  }

  @action
  setType(type) {
    this.type = type;
  }

  @action
  setIsUser(isUser) {
    this.isUser = isUser;
  }

  @action
  setId(id) {
    this.id = id;
  }

  @action
  loadMenuData(menuType = AppState.currentMenuType, isUser) {
    const type = getMenuType(menuType, isUser) || 'site';
    const { id = 0 } = menuType;
    const menu = this.menuData(type, id);
    if (menu.length) {
      return Promise.resolve(menu);
    }
    if (type === 'organization') {
      return Promise.all([axios.get(`/iam/v1/menus?code=choerodon.code.top.organization&source_id=${id}`), axios.get(`/lc/v1/organizations/${id}/menu/all`)])
        .then(action(([menuData, lcMenu]) => {
          // const child = filterEmptyMenus(menuData.subMenus || []);
          const child = menuData.subMenus || [];
          insertLcMenu(child, lcMenu);
          this.setMenuData(child, type, id);
          return child;
        }));
    } else {
      return axios.get(`/iam/v1/menus?code=choerodon.code.top.${type}&source_id=${id}`).then(action((data) => {
        const child = filterEmptyMenus(data.subMenus || []);
        this.setMenuData(child, type, id);
        return child;
      }));
    }
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

  @computed
  get getSiteMenuData() {
    return this.menuData('site', 0);
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
      node.parentName = parents[0].name;
      return callback(node, parents, index);
    });
  }
}

const menuStore = new MenuStore();

export default menuStore;
