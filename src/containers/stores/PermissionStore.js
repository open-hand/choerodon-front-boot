/**
 * Created by HughHzWu on 2018/5/23.
 */
import { action, observable } from 'mobx';
import axios from 'Axios';

const DELAY = 300;

class PermissionStore {
  @observable permissions = [];
  queue = [];
  delayId;

  @action
  clear() {
    this.permissions = [];
  }

  @action
  check(props) {
    this.judgeServices(props)
      .forEach(item => this.checkItem(item));
  }

  access(props) {
    return this.judgeServices(props).some(item => this.findPermission(item).approve);
  }

  fetch() {
    axios.post('/iam/v1/permissions/checkPermission', JSON.stringify(this.queue))
      .then(action((data) => {
        data.forEach(({ code, resourceType, organizationId, projectId, approve }) => {
          if (resourceType) {
            const item = this.judgeService(code, resourceType, organizationId, projectId);
            this.permissions.push({
              key: JSON.stringify(item),
              approve,
            });
          }
        });
      }));
    this.queue = [];
  }

  checkItem(item) {
    const found = this.findPermission(item);
    if (found.key) {
      return found.approve;
    } else if (item) {
      this.quequeCheck(item);
    }
    return false;
  }

  quequeCheck(item) {
    if (this.queue.findIndex(q => JSON.stringify(q) === JSON.stringify(item)) === -1) {
      this.queue.push(item);
      if (this.delayId) {
        clearTimeout(this.delayId);
      }
      this.delayId = setTimeout(() => {
        this.fetch();
      }, DELAY);
    }
  }

  judgeServices({ service, type, organizationId, projectId }) {
    if (service && service.length) {
      return service.map(serviceValue =>
        this.judgeService(serviceValue, type, organizationId, projectId),
      );
    } else {
      return [];
    }
  }

  judgeService(code, type, organizationId, projectId) {
    switch (type) {
      case 'organization':
        return {
          code,
          organizationId: Number(organizationId),
          resourceType: type,
        };
      case 'project':
        return {
          code,
          organizationId: Number(organizationId),
          projectId: Number(projectId),
          resourceType: type,
        };
      case 'site':
        return {
          code,
          resourceType: type,
        };
      default:
        return null;
    }
  }

  findPermission(item) {
    return this.permissions.find(({ key }) => key === JSON.stringify(item)) || { approve: false };
  }
}

const permissionStore = new PermissionStore();

export default permissionStore;
