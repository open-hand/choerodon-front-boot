import { action, computed, observable } from 'mobx';
import store from 'Store';
import axios from 'Axios';
import omit from 'object.omit';

function findDataIndex(collection, value) {
  return collection ? collection.findIndex(
    ({ id, organizationId }) => id === value.id && (
      (!organizationId && !value.organizationId) ||
      organizationId === value.organizationId
    ),
  ) : -1;
}

// 保留多少recent内容
function saveRecent(collection = [], value, number) {
  const index = findDataIndex(collection, value);
  if (index !== -1) {
    return collection.splice(index, 1).concat(collection.slice());
  } else {
    collection.unshift(value);
    return collection.slice(0, number);
  }
}

@store('HeaderStore')
class HeaderStore {
  @observable orgData = null;
  @observable proData = null;
  @observable selected = null;
  @observable recentItem = null;

  @computed
  get getSelected() {
    return this.selected;
  }

  @action
  setSelected(data) {
    this.selected = data;
  }

  @computed
  get getOrgData() {
    return this.orgData;
  }

  @action
  setOrgData(data) {
    this.orgData = data.filter(item => item.enabled === true);
  }

  @computed
  get getProData() {
    return this.proData;
  }

  fetchAxios(method, url) {
    return axios[method](url);
  }

  axiosGetOrgAndPro(userId) {
    return axios.all([this.fetchAxios('get', `/iam/v1/users/${userId}/organizations`),
      this.fetchAxios('get', `/iam/v1/users/${userId}/projects`)]);
  }

  @action
  setProData(data) {
    this.proData = data.filter(item => item.enabled === true);
  }

  @action
  addProject(project) {
    if (this.proData) {
      this.proData.unshift(project);
    } else {
      this.proData = [project];
    }
  }

  @action
  updateProject(project) {
    if (this.proData) {
      const index = this.proData.findIndex(({ id }) => id === project.id);
      if (index !== -1) {
        this.proData.splice(index, 1, project);
      }
    }
    this.updateRecentItem(project);
  }

  @computed
  get getRecentItem() {
    let recents = [];
    if (this.recentItem) {
      recents = this.recentItem;
    } else if (localStorage.recentItem) {
      recents = JSON.parse(localStorage.recentItem)
        .map(recent => omit(recent, 'children'));
    }
    return recents.filter(
      value => findDataIndex(this.orgData, value) !== -1 ||
        findDataIndex(this.proData, value) !== -1,
    );
  }

  @action
  updateRecentItem(recent) {
    if (recent) {
      const recentItem = JSON.parse(localStorage.recentItem);
      const index = recentItem.findIndex(({ id }) => id === recent.id);
      if (index !== -1) {
        recentItem.splice(index, 1, recent);
        localStorage.recentItem = JSON.stringify(recentItem);
        this.recentItem = recentItem;
      }
    }
  }

  @action
  setRecentItem(recent) {
    if (recent) {
      const recentItem = saveRecent(
        this.getRecentItem,
        omit(recent, 'children'), 10,
      );
      localStorage.recentItem = JSON.stringify(recentItem);
      this.recentItem = recentItem;
    }
  }
}

const headerStore = new HeaderStore();

export default headerStore;
