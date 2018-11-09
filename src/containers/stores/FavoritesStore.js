import { action, computed, get, observable, set } from 'mobx';
import axios from '../components/axios';
import { handleResponseError } from '../common';
import AppState from './AppState';
import MenuStore from './MenuStore';

class FavoritesStore {
  @observable favorites = [];

  @observable loading = false;

  @observable editId = null;

  @observable type = 'edit';

  @observable index = new Map();

  @observable dndItemId = null;

  @observable fields = {
    name: {
      value: '',
    },
    url: {
      value: '',
    },
    icon: {
      value: '',
    },
    color: {
      value: '',
    },
  };

  @computed
  get getNextColor() {
    const color = ['#2196F3', '#E8453C', '#4CAF50', '#FFC107', '#692AE8', '#FF8B15', '#E91E63', '#00BCD4'];
    const num = this.favorites.length > 0
      ? this.getFavorites.reduce((previousValue, current) => (
        previousValue > current.sort ? previousValue : current.sort
      ), -999999) : 1;
    return color[num % 8];
  }

  @observable autoSaveTimer = null;

  @computed
  get getIndex() {
    return this.index;
  }

  @computed
  get getDndItemId() {
    return this.dndItemId;
  }

  @action
  setDndItemId(id) {
    this.dndItemId = id;
  }

  @computed
  get getType() {
    return this.type;
  }

  @action
  setType(type) {
    this.type = type;
  }

  @computed
  get getFavorites() {
    return this.favorites;
  }

  @action
  setFavorites(data) {
    this.favorites = data;
  }

  /**
   * 根据当前路由获得默认的创建选项
   */
  @action
  setDefaultFields(id) {
    if (id) {
      const { name, url, icon, color } = this.favorites.filter(v => v.id === id)[0];
      this.editId = id;
      this.fields = {
        name: {
          value: name,
        },
        url: {
          value: url,
        },
        icon: {
          value: icon,
        },
        color: {
          value: color,
        },
      };
    } else {
      this.fields = {
        name: {
          value: this.getUrlName,
        },
        url: {
          value: `${document.location.href}`,
        },
        icon: {
          value: `${MenuStore.activeMenu ? MenuStore.activeMenu.icon : 'cancel'}`,
        },
        color: {
          value: this.getNextColor,
        },
      };
    }
  }

  @computed
  get getUrlName() {
    if (document.location.hash.substring(1, document.location.hash.indexOf('?') === -1 ? document.location.hash.length : document.location.hash.indexOf('?')) === '/') {
      switch (AppState.menuType.type) {
        case 'site':
          return 'Choerodon主页';
        case 'project':
          return `${AppState.menuType.name}的dashboard`;
        default:
          return `${AppState.menuType.name}的dashboard`;
      }
    } else {
      switch (AppState.menuType.type) {
        case 'site':
          return `${MenuStore.activeMenu ? MenuStore.activeMenu.name : ''}`;
        default:
          return `${MenuStore.activeMenu ? MenuStore.activeMenu.name : ''}-${this.getSiteLevelStr}`;
      }
    }
  }

  @computed
  get getEditId() {
    return this.editId;
  }


  @computed
  get getFields() {
    return this.fields;
  }

  @computed
  get getSiteLevelStr() {
    switch (AppState.menuType.type) {
      case 'project':
        return `${AppState.menuType && AppState.menuType.name}`;
      case 'organization':
        return `${AppState.menuType && AppState.menuType.name}`;
      case 'site':
        return '';
      default:
        return '';
    }
  }

  @action
  loadData = () => {
    axios.get('/iam/v1/bookmarks').then(action(
      (data) => {
        if (!data.failed) {
          this.favorites = data;
          this.sortData();
        } else {
          Choerodon.prompt(data.message);
        }
      },
    ));
  };

  @action
  sortData = () => {
    this.favorites.sort((a, b) => a.sort - b.sort).forEach((value, index) => {
      this.index.set(value.id, index);
    });
    this.index = new Map(this.index);
  };

  @action
  createFavorite(field) {
    this.loading = true;
    return axios.post('/iam/v1/bookmarks', JSON.stringify(field))
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          data.objectVersionNumber = 1;
          this.setFavorites([...this.favorites, data]);
          this.sortData();
        }
        return data;
      }))
      .catch(action((error) => {
        this.loading = false;
        handleResponseError(error);
      }));
  }

  @action
  updateFavorite(value) {
    const { objectVersionNumber, sort } = this.favorites.filter(v => v.id === this.editId)[0];
    return axios.put('/iam/v1/bookmarks', JSON.stringify([
      {
        id: this.editId,
        objectVersionNumber,
        sort,
        ...value,
      },
    ]))
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          this.loadData();
          Choerodon.prompt('修改成功');
        } else {
          Choerodon.prompt(data.message);
        }
        return data;
      }))
      .catch(action((error) => {
        this.loading = false;

        handleResponseError(error);
      }));
  }

  @action
  deleteFavorite(id) {
    return axios.delete(`/iam/v1/bookmarks/${id}`);
  }

  @action
  deleteFavoriteLocal(id) {
    this.favorites = this.favorites.filter(v => v.id !== id);
    this.sortData();
  }

  /**
   * 把id为a的图标拖到id为b的图标的位置
   * @param a 拖动开始的位置的id
   * @param b 拖动到的位置
   */
  @action
  swapSort(a, b) {
    const increase = this.index.get(a) > this.index.get(b) ? 1 : -1;
    const from = this.index.get(a);
    const to = this.index.get(b);
    const itemA = this.favorites.filter(v => v.id === a)[0];
    const itemB = this.favorites.filter(v => v.id === b)[0];
    if (from > to) {
      this.favorites.forEach((v) => {
        if (v.id === a) {
          v.sort = itemB.sort;
        }
      });

      for (let j = 0; j < this.favorites.length; j += 1) {
        if (this.index.get(this.favorites[j].id) >= to && this.index.get(this.favorites[j].id) < from) {
          this.favorites[j].sort += 1;
        }
      }
    } else {
      for (let j = 0; j < this.favorites.length; j += 1) {
        if (this.index.get(this.favorites[j].id) > to && this.index.get(this.favorites[j].id) !== from) {
          this.favorites[j].sort += 1;
        }
      }

      this.favorites.forEach((v) => {
        if (v.id === a) {
          v.sort = itemB.sort + 1;
        }
      });
    }


    this.sortData();
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.saveSort(), 3000);
    } else {
      this.autoSaveTimer = setTimeout(() => this.saveSort(), 3000);
    }
  }

  @action
  saveSort() {
    return axios.put('/iam/v1/bookmarks', JSON.stringify(this.favorites)).then(action(
      (data) => {
        if (!data.failed) {
          // this.favorites = data;
          this.loadData();
          Choerodon.prompt('排序保存成功');
        } else {
          this.loadData();
          Choerodon.prompt(data.message);
        }
      },
    ));
  }
}

const favoritesStore = new FavoritesStore();

export default favoritesStore;
