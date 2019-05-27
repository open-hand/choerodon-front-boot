import { action, computed, get, observable, set } from 'mobx';
import axios from '../../components/c7n/axios';
import { handleResponseError } from '../../common';
import AppState from './AppState';

/* eslint-disable-next-line */
const INF = 10000;

class DashboardStore {
  @observable dashboardGroup = {
    site: { 0: [] },
    organization: {},
    project: {},
  };

  @observable originDashboardGroup = {
    site: { 0: [] },
    organization: {},
    project: {},
  };

  @observable editing = false;

  @observable loading = false;

  @observable dirty = false;

  @observable visible = false;

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

  @action
  setModalVisible(flag) {
    this.visible = flag;
  }

  @action
  resetDashboardData() {
    // 深拷贝
    this.dashboardGroup = JSON.parse(JSON.stringify(this.originDashboardGroup));
    this.editing = false;
  }

  @action
  saveDashboardLaydout(newLayout, childType, id) {
    const newData = this.dashboardData(childType, id).map((v) => {
      let ret = v;
      newLayout.forEach((item) => {
        if (item.id === v.id) {
          ret = item;
          if (ret.positionDTO) ret.positionDTO = { height: item.h, width: item.w, positionX: item.GridX, positionY: item.GridY };
        }
      });
      return ret;
    });
    this.setDashboardData(newData, childType, id);
  }

  @action
  setOriginDashboardData(data, childType, id) {
    set(this.originDashboardGroup[childType], id, data);
  }

  @computed
  get getDashboardData() {
    let i = -1;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    return this.dashboardData(type, id).filter(v => v.visible === true).map((v) => {
      const { height: h, width: w, positionX: GridX, positionY: GridY } = v.positionDTO || { height: null, width: null, positionX: null, positionY: null };
      if (h && h !== 0 && w && w !== 0) {
        return { GridX, GridY, w, h, key: `${v.id}-${v.dashboardCode}`, ...v };
      } else {
        i += 1;
        return { GridX: (i % 3) * 4, GridY: (i * 1000), w: v.w || 4, h: v.h || 4, key: `${v.id}-${v.dashboardCode}`, ...v };
      }
    });
  }

  @computed
  get getHiddenDashboardData() {
    let i = -1;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    return this.dashboardData(type, id).filter(v => v.visible === false).map((v) => {
      const { height: h, width: w, positionX: GridX, positionY: GridY } = v.positionDTO || { height: null, width: null, positionX: null, positionY: null };
      if (h && h !== 0 && w && w !== 0) {
        return { GridX, GridY, w, h, key: `${v.id}-${v.dashboardCode}`, ...v };
      } else {
        i += 1;
        return { GridX: (i % 3) * 4, GridY: (i * 1000), w: v.w || 4, h: v.h || 4, key: `${v.id}-${v.dashboardCode}`, ...v };
      }
    });
  }

  @action
  setCardVisibleById(cardId, visible) {
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    const newData = this.dashboardData(type, id).map((v) => {
      if (v.id.toString() === cardId.toString()) {
        v.visible = visible;
        v.positionDTO.positionX = 0;
        v.positionDTO.positionY = INF; // 要放在最后面
        v.GridX = 0;
        v.GridY = INF;
        return v;
      } else {
        return { ...v };
      }
    });
    this.setDashboardData(newData, type, id);
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
          this.setOriginDashboardData(data, type, id);
          if (data[0].id === null) {
            this.updateDashboardData(true);
          }
        }
        return data;
      }))
      .catch(action((error) => {
        this.loading = false;
        handleResponseError(error);
      }));
  }

  @action
  updateDashboardData(isFirst) {
    this.loading = true;
    this.editing = false;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    return axios.post(`/iam/v1/home/dashboard?level=${type}&source_id=${id}`, JSON.stringify(this.dashboardData(type, id)))
      .then(action((data) => {
        this.loading = false;
        if (!data.failed) {
          this.setDashboardData(data, type, id);
          this.setOriginDashboardData(data, type, id);
          if (!isFirst) Choerodon.prompt('保存成功');
        }
        return data;
      }))
      .catch(action((error) => {
        this.loading = false;
        handleResponseError(error);
      }));
  }

  @action
  resetDashboard() {
    this.loading = true;
    this.editing = false;
    const { currentMenuType: { id = '0', type = 'site' } } = AppState;
    return axios.put(`/iam/v1/home/dashboard/reset?level=${type}&source_id=${id}`).then((data) => {
      if (!data.failed) {
        this.loadDashboardData();
      }
    }).catch(action((error) => {
      this.loading = false;
      handleResponseError(error);
    }));
  }

  dashboardData(type, id) {
    return get(this.dashboardGroup[type], id) || [];
  }

  originDashboardData(type, id) {
    return get(this.originDashboardGroup[type], id) || [];
  }
}

const dashboardStore = new DashboardStore();

export default dashboardStore;
