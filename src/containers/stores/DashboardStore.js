import { action, computed, get, observable, set } from 'mobx';
import axios from '../components/axios';
import { handleResponseError } from '../common';
import AppState from './AppState';

class DashboardStore {
  @observable dashboardGroup = {
    site: { 0: [] },
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
  updateCachedData({ level, code, name, title, icon, namespace }) {
    const group = this.dashboardGroup[level];
    Object.keys(group).forEach((key) => {
      const found = group[key] && group[key].find(
        ({ dashboardCode, dashboardNamespace }) => dashboardCode === code
          && dashboardNamespace === namespace,
      );
      if (found) {
        set(found, 'dashboardTitle', title);
        set(found, 'dashboardName', name);
        set(found, 'dashboardIcon', icon);
      }
    });
  }

  @action
  setDashboardData(data, childType, id) {
    set(this.dashboardGroup[childType], id, data);
    this.dirty = false;
  }

  @computed
  get getDashboardData() {
    let i = -1;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    return this.dashboardData(type, id).map((v) => {
      if (v.w && v.w !== 0) {
        return { key: v.id };
      } else {
        i += 1;
        return { GridX: (i % 3) * 4, GridY: (i * 10), w: 4, h: 4, key: v.id, ...v };
      }
    });
  }

  @action
  loadDashboardData() {
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    this.loading = true;
    return axios.get(`/iam/v1/home/dashboard?level=${type}&source_id=${id}`)
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

  @action
  updateDashboardData() {
    this.loading = true;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
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
    return get(this.dashboardGroup[type], id) || [];
  }
}

const dashboardStore = new DashboardStore();

export default dashboardStore;
