import { action, computed, get, observable, set } from 'mobx';
import axios from '../components/axios';
import { handleResponseError } from '../common';
import AppState from './AppState';

class DashboardStore {
  @observable dashboardGroup = {
    site: [],
    organization: {},
    project: {},
  };
  @observable editing = false;
  @observable loading = false;
  @observable dirty = false;

  @action
  setEditing(editing) {
    this.editing = editing;
  }

  @action
  changeVisible(data, visible) {
    set(data, 'visible', visible);
    this.dirty = true;
  }

  @action
  setDashboardData(data, childType, id) {
    if (id) {
      set(this.dashboardGroup[childType], id, data);
    } else {
      set(this.dashboardGroup, childType, data);
    }
    this.dirty = false;
  }

  @computed
  get getDashboardData() {
    const { currentMenuType: { id = 0, type = 'site' } } = AppState;
    return this.dashboardData(type, id);
  }

  @action
  loadDashboardData() {
    const { currentMenuType: { id = 0, type = 'site' } } = AppState;
    const data = this.dashboardData(type, id);
    if (data.length) {
      return Promise.resolve(data);
    }
    this.loading = true;
    return axios.get(`/iam/v1/home/dashboard?level=${type}&source_id=${id}`)
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          this.setDashboardData(data, type, id);
        }
        return data;
      }))
      .catch(action(error => {
        this.loading = false;
        handleResponseError(error);
      }));
  }

  @action
  updateDashboardData() {
    this.loading = true;
    const { currentMenuType: { id = 0, type = 'site' } } = AppState;
    return axios.post(`/iam/v1/home/dashboard?level=${type}&source_id=${id}`, JSON.stringify(this.dashboardData(type, id)))
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          this.setDashboardData(data, type, id);
        }
        return data;
      }))
      .catch(action((error) => {
        this.loading = false;
        handleResponseError(error);
      }));
  }

  dashboardData(type, id) {
    let data;
    if (type) {
      if (id) {
        data = get(this.dashboardGroup[type], id);
      } else {
        data = get(this.dashboardGroup, type);
      }
    }
    return data || [];
  }
}

const dashboardStore = new DashboardStore();

export default dashboardStore;
