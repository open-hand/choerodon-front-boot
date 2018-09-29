import { action, computed, observable } from 'mobx';
import omit from 'object.omit';
import queryString from 'query-string';
import store from '../components/store';
import axios from '../components/axios';
import { handleResponseError } from '../common';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

function findDataIndex(collection, value) {
  return collection ? collection.findIndex(
    ({ id, organizationId }) => id === value.id && (
      (!organizationId && !value.organizationId)
      || organizationId === value.organizationId
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

  @observable userPreferenceVisible = false;

  @observable menuTypeVisible = false;

  @observable inboxVisible = false;

  @observable inboxData = [];

  @observable inboxLoaded = false;

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

  @action
  setUserPreferenceVisible(userPreferenceVisible) {
    this.userPreferenceVisible = userPreferenceVisible;
  }

  @action
  setMenuTypeVisible(menuTypeVisible) {
    this.menuTypeVisible = menuTypeVisible;
  }

  @action
  setInboxVisible(inboxVisible) {
    this.inboxVisible = inboxVisible;
  }

  axiosGetOrgAndPro(userId) {
    return axios.all([
      axios.get(`/iam/v1/users/${userId}/organizations`),
      axios.get(`/iam/v1/users/${userId}/projects`),
    ]).then((data) => {
      const [organizations, projects] = data;
      organizations.forEach((value) => {
        value.type = ORGANIZATION_TYPE;
      });
      projects.forEach((value) => {
        value.type = PROJECT_TYPE;
      });
      this.setOrgData(organizations);
      this.setProData(projects);
      return data;
    });
  }

  axiosGetUserMsg(userId) {
    return axios.get(`/notify/v1/notices/sitemsgs?${queryString.stringify({
      user_id: userId,
      read: false,
      page: 0,
      size: 20,
      sort: 'id,desc',
    })}`)
      .then(action(({ content }) => {
        this.inboxData = content || [];
        this.inboxLoaded = true;
      }))
      .catch(handleResponseError);
  }

  @action
  setProData(data) {
    this.proData = data.filter(item => item.enabled === true);
  }

  @action
  addProject(project) {
    project.type = PROJECT_TYPE;
    if (this.proData) {
      this.proData.unshift(project);
    } else {
      this.proData = [project];
    }
  }

  @action
  updateProject(project) {
    project.type = PROJECT_TYPE;
    if (this.proData) {
      const index = this.proData.findIndex(({ id }) => id === project.id);
      if (index !== -1) {
        this.proData.splice(index, 1, project);
      }
    }
    this.updateRecentItem(project);
  }

  @action
  addOrg(org) {
    org.type = ORGANIZATION_TYPE;
    if (this.orgData) {
      this.orgData.unshift(org);
    } else {
      this.orgData = [org];
    }
  }

  @action
  updateOrg(org) {
    org.type = ORGANIZATION_TYPE;
    if (this.orgData) {
      const index = this.orgData.findIndex(({ id }) => id === org.id);
      if (index !== -1) {
        this.orgData.splice(index, 1, org);
      }
    }
    this.updateRecentItem(org);
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
      value => findDataIndex(this.orgData, value) !== -1
        || findDataIndex(this.proData, value) !== -1,
    );
  }

  @action
  readMsg(userId, data) {
    const body = (data ? [].concat(data) : this.inboxData).map(({ id }) => id);
    this.clearMsg(data);
    return axios.put(`/notify/v1/notices/sitemsgs/batch_read?user_id=${userId}`, JSON.stringify(body));
  }

  @action
  clearMsg(data) {
    if (data) {
      const index = this.inboxData.indexOf(data);
      if (index !== -1) {
        this.inboxData.slice(1, index);
      }
    } else {
      this.inboxData = [];
    }
  }

  @action
  updateRecentItem(recent) {
    if (recent) {
      const recentItem = JSON.parse(localStorage.recentItem);
      const index = recentItem.findIndex(
        ({ id, organizationId }) => id === recent.id
          && (!organizationId || organizationId === recent.organizationId),
      );
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
