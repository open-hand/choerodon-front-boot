import { action, computed, observable, set } from 'mobx';
import { dropByCacheKey, getCachingKeys } from 'react-router-cache-route';
import _ from 'lodash';
import axios from '../../components/pro/axios';
import { MENU_TYPE } from '../../components/pro/menu/util';

function getNodePath(node, treeNodes, children = 'subMenus') {
  if (node[children]) {
    node[children].forEach(child => getNodePath(child, treeNodes));
  } else {
    treeNodes.push(node);
  }
}

class MenuStore {
  @observable collapsed = false;

  @observable menus = {
    site: [],
    user: [],
  };

  @observable tabs = [
    {
      children: null,
      code: 'HOME_PAGE',
      name: '首页',
      route: '/',
      pagePermissionType: 'page',
    },
  ];

  @observable openKeys = [];

  @observable selectedKeys = [];

  @observable activeMenu = {};

  @observable contentKeys = {};

  @observable expanded = false;

  @observable history = undefined;

  @computed
  get treeNodeMenus() {
    const treeNodes = [];
    this.menus.site.forEach(v => getNodePath(v, treeNodes));
    return treeNodes;
  }

  @computed
  get getMenus() {
    return this.menus.site.slice();
  }

  @computed
  get getTabs() {
    return this.tabs.slice();
  }

  @computed
  get getIframeTabs() {
    return this.tabs.filter(tab => tab.pagePermissionType !== MENU_TYPE.react);
  }

  @computed
  get getSelectedKeys() {
    return this.selectedKeys.slice();
  }

  @action
  setContentKey(pathname, key) {
    set(this.contentKeys, pathname, key);
    return key;
  }

  @action
  setCollapsed(data) {
    this.collapsed = data;
  }

  @action
  setTabs(data) {
    this.tabs = data;
  }

  @action
  setMenus(code, data) {
    set(this.menus, code, data);
  }

  @action
  setActiveMenu(data) {
    this.activeMenu = data;
  }

  @action
  setOpenKeys(data) {
    this.openKeys = data;
  }

  @action
  setSelectedKeys(data) {
    this.selectedKeys = data;
  }

  @action
  setMenuExpanded(data) {
    this.expanded = data;
  }

  @action
  setHistory(data) {
    this.history = data;
  }

  @action
  closeTab(value, prop = 'code') {
    const tabs = this.tabs.slice();
    _.remove(tabs, v => v[prop] === value);
    this.setTabs(tabs);
  }

  @action
  clearCacheByCacheKey(cacheKey) {
    dropByCacheKey(cacheKey);
  }

  @action
  closeTabAndClearCacheByCacheKey(obj, remainTab) {
    let val;
    let prop;
    if (obj.pagePermissionType === MENU_TYPE.react) {
      val = obj.route;
      prop = 'route';
    } else {
      val = obj.code;
      prop = 'code';
    }
    if (!remainTab) {
      this.closeTab(val, prop);
    }
    if (obj.pagePermissionType === MENU_TYPE.react) {
      const existKeys = getCachingKeys();
      if (existKeys.includes(obj.route)) {
        dropByCacheKey(obj.route);
      } else if (existKeys.includes(`/${obj.route}`)) {
        dropByCacheKey(`/${obj.route}`);
      }
    }
    // dropByCacheKey(obj.functionCode);
  }

  getSubmenuByCode(code) {
    const menus = this.getMenus;
    let target = {};
    menus.forEach((submenu) => {
      if (submenu && submenu.subMenus.length) {
        submenu.subMenus.forEach((menuList) => {
          if (menuList.code === code) {
            target = submenu;
          }
        });
      }
    });
    return target;
  }

  /* eslint-disable */
  getPathById(code, tree, type, cb, noMatchCb = () => {
  }) {
    const key = type === MENU_TYPE.html ? 'code' : 'route';
    const path = [];
    let targetNode;
    try {
      function getNodePath(node) {
        path.push(node.code);

        if (node[key] === code) {
          targetNode = node;
          throw ('Get Target Node!');
        }
        if (node.subMenus && node.subMenus.length) {
          for (let i = 0; i < node.subMenus.length; i++) {
            getNodePath(node.subMenus[i]);
          }
          path.pop();
        } else {
          path.pop();
        }
      }

      tree.forEach(v => getNodePath(v));
      noMatchCb();
    } catch (e) {
      cb(path, targetNode);
    }
  }

  getMenuItemByCode(code) {
    const menus = this.getMenus;
    let target = {};
    menus.forEach((submenu) => {
      if (submenu && submenu.subMenus.length) {
        submenu.subMenus.forEach((menuList) => {
          if (menuList.code === code) {
            target = menuList;
          }
        });
      }
    });
    return target;
  }

  getNextTab(tab) {
    const tabs = this.getTabs;
    const len = tabs.length;
    const idx = tabs.findIndex(t => t.code === tab.code);
    if (idx === 0 && len === 1) return {};
    if (idx === 0 && len > 1) return tabs[1];
    return tabs[idx - 1];
  }

  @action
  loadMenus(code = 'site') {
    const { menus } = this;
    if (menus[code].length) {
      return Promise.resolve(menus[code]);
    }
    return axios.get(`/v1/menus?code=CHOERODON.CODE.TOP.${code.toUpperCase()}`)
      .then((res) => {
        const menusValid = Array.isArray(res.subMenus)
          ? res.subMenus
          : [];
        this.setMenus(code, menusValid);
        return menusValid;
      });
  }

  openTab(id, title, url, closeIcon) {
    if (!this.history) return;
    this.history.push({
      pathname: `/iframe${url}`,
      state: {
        title,
      },
    });
  }

  openTabR(url, title) {
    if (!this.history) return;
    this.history.push({
      pathname: url,
      state: {
        title,
      },
    });
  }
}

const menuStore = new MenuStore();
export default menuStore;
