import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from '../axios';
import { FAILURE, SUCCESS } from './PermissionStatus';

const DELAY = 500;

export default class PermissionProvider extends Component {
  static childContextTypes = {
    permission: PropTypes.object,
  };

  delayId = 0;

  permissions = new Map();

  queue = new Set();

  handlers = new Set();

  getChildContext() {
    return {
      permission: this,
    };
  }

  fetch() {
    const handlers = Array.from(this.handlers);
    axios.post('/iam/v1/permissions/checkPermission', `[${Array.from(this.queue).join(',')}]`)
      .then((data) => {
        data.forEach(({ code, resourceType, organizationId, projectId, approve }) => {
          if (resourceType) {
            const key = JSON.stringify(this.judgeService(code, resourceType, organizationId, projectId));
            this.permissions.set(key, approve ? SUCCESS : FAILURE);
          }
        });
        handlers.forEach(([props, handler]) => this.check(props, handler, true));
      });
  }

  start() {
    if (this.delayId) {
      clearTimeout(this.delayId);
    }
    this.delayId = setTimeout(() => {
      this.fetch();
      this.queue.clear();
      this.handlers.clear();
    }, DELAY);
  }

  check(props, handler, flag) {
    if (!props.service || props.service.length === 0) {
      handler(SUCCESS);
    } else {
      const queue = new Set();
      if (this.judgeServices(props).every((item) => {
        if (item) {
          const key = JSON.stringify(item);
          const status = this.permissions.get(key);
          if (status === SUCCESS) {
            handler(status);
            return false;
          } else if (status !== FAILURE) {
            this.queue.add(key);
            queue.add(key);
          }
        }
        return true;
      })
      ) {
        if (queue.size > 0 && !flag) {
          this.handlers.add([props, handler]);
          this.start();
        } else {
          handler(FAILURE);
        }
      }
    }
  }

  judgeServices({ service, type, organizationId, projectId }) {
    return service
      .map(code => this.judgeService(code, type, organizationId, projectId));
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

  render() {
    return this.props.children;
  }
}
