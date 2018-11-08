import { action, computed, get, observable, set } from 'mobx';
import axios from '../components/axios';
import { handleResponseError } from '../common';
import AppState from './AppState';
import MenuStore from './MenuStore';

function getRandomColor() {
  const color = ['#6193ed', '#dc5d4e', '#66ae6a', '#f5bd48', '#784ae2', '#5c82db'];
  return color[parseInt(Math.random() * color.length, 10)];
}


class FavoritesStore {
  @observable favorites = [];

  @observable loading = false;

  @observable editId = null;

  @observable type = 'edit';

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

  @observable autoSaveTimer = null;

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
          value: `${this.getSiteLevelStr}${MenuStore.activeMenu ? MenuStore.activeMenu.name : ''}`,
        },
        url: {
          value: `${document.location.href}`,
        },
        icon: {
          value: `${MenuStore.activeMenu ? MenuStore.activeMenu.icon : 'cancel'}`,
        },
        color: {
          value: getRandomColor(),
        },
      };
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
        return `项目${AppState.menuType && AppState.menuType.name}的`;
      case 'organization':
        return `组织${AppState.menuType && AppState.menuType.name}的`;
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
          this.favorites = data.sort((a, b) => a.sort - b.sort);
        } else {
          Choerodon.prompt(data.message);
        }
      },
    ));
  };

  @action
  sortData = () => {
    this.favorites = this.favorites.sort((a, b) => a.sort - b.sort);
  };

  @action
  createFavorite(field) {
    this.loading = true;
    return axios.post('/iam/v1/bookmarks', JSON.stringify(field))
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          this.setFavorites([...this.favorites, data]);
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
  }

  @action
  swapSort(a, b) {
    const itemA = this.favorites.filter(v => v.id === a)[0];
    const itemB = this.favorites.filter(v => v.id === b)[0];
    const temp = itemA.sort;
    this.favorites.forEach((v, i, arr) => {
      if (v.id === a) v.sort = itemB.sort;
    });
    this.favorites.forEach((v, i, arr) => {
      if (v.id === b) v.sort = temp;
    });
    this.sortData();
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.saveSort(), 1000);
    } else {
      this.autoSaveTimer = setTimeout(() => this.saveSort(), 1000);
    }
  }

  @action
  saveSort() {
    return axios.put('/iam/v1/bookmarks', JSON.stringify(this.favorites)).then(action(
      (data) => {
        if (!data.failed) {
          this.favorites = data;
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
