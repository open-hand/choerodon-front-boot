/*eslint-disable*/
//service 为一个数组，权限的code

import React, { Component, Children } from 'react';
import { Observable } from 'rxjs';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Tooltip } from 'antd';
import axios from 'Axios';
import _ from 'lodash';
import AppState from '../stores/AppState';

@inject('AppState')
@observer
class Permission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionFlag: !props.service || !props.service.length,
      flag: true,
    }
  }
  componentWillMount() {
    const { service, type, organizationId, projectId, AppState } = this.props;
    if (service) {
      this.setState({
        permissionFlag: false,
      });
      this.judgeService();
      if (JSON.parse(sessionStorage.permission).length >= 6) {
        if (JSON.parse(sessionStorage.permissionFlag)) {
          sessionStorage.permissionFlag = false;
          axios.post('/iam/v1/permissions/checkPermission', JSON.stringify(JSON.parse(sessionStorage.permission))).then((data) => {
            AppState.setPerMission(data);
            sessionStorage.permissionBackup = JSON.stringify([...JSON.parse(sessionStorage.permissionBackup), ...JSON.parse(sessionStorage.permission)]);
            sessionStorage.permission = '[]';
            sessionStorage.permissionFlag = true;
          });
        }
      }
    }
  }

  setSessionStorage = (data) => {
    const center = JSON.parse(sessionStorage.permission);
    center.push(data);
    sessionStorage.setItem('permission', JSON.stringify(center));
  };

  judgeService = () => {
    const { service, type, organizationId, projectId, AppState } = this.props;
    let permission, centerPermissionBackup;
    service.map(serviceValue => {
      switch (type) {
        case 'organization':
          permission = {
            "code": serviceValue,
            "organizationId": organizationId,
            "resourceType": type,
          };
          centerPermissionBackup = _.findIndex(JSON.parse(sessionStorage.permission), (value) => {
            return value.code == serviceValue && value.organizationId == organizationId && value.resourceType == type;
          });
          this.permissionBackFun(centerPermissionBackup, permission, serviceValue, type, organizationId);
          break;
        case 'project':
          permission = {
            "code": serviceValue,
            // "organizationId": organizationId,
            "projectId": projectId,
            "resourceType": type,
          };
          centerPermissionBackup = _.findIndex(JSON.parse(sessionStorage.permission), (value) => {
            return value.code == serviceValue && value.projectId == projectId && value.resourceType == type;
          })
          this.permissionBackFun(centerPermissionBackup, permission, serviceValue, type, null, projectId);
          break;
        case 'site':
          permission = {
            "code": serviceValue,
            "resourceType": type,
          };
          centerPermissionBackup = _.findIndex(JSON.parse(sessionStorage.permission), (value) => {
            return value.code == serviceValue && value.resourceType == type;
          });
          this.permissionBackFun(centerPermissionBackup, permission, serviceValue, type);
          break;
      }
    })
  }

  permissionBackFun = (backupFalg, permissionData, service, type, organizationId, projectId) => {
    let centerPermission;
    if (backupFalg < 0) {
      centerPermission = _.findIndex(JSON.parse(sessionStorage.permissionBackup), (value) => {
        switch (type) {
          case 'organization':
            return value.code == service && value.organizationId == organizationId && value.resourceType == type;
          case 'project':
            return value.code == service && value.projectId == projectId && value.resourceType == type;
          case 'site':
            return value.code == service && value.resourceType == type;
        }
      });
      if (centerPermission < 0) {
        this.setSessionStorage(permissionData);
      }
    }
  }

  componentDidMount() {
    const { service, type, organizationId, projectId, AppState } = this.props;
    if (service) {
      this.judgeService();
      if (JSON.parse(sessionStorage.permission).length > 0) {
        if (JSON.parse(sessionStorage.permissionFlag)) {
          sessionStorage.permissionFlag = false;
          axios.post('/iam/v1/permissions/checkPermission', JSON.stringify(JSON.parse(sessionStorage.permission))).then((data) => {
            AppState.setPerMission(data);
            sessionStorage.permissionBackup = JSON.stringify([...JSON.parse(sessionStorage.permissionBackup), ...JSON.parse(sessionStorage.permission)]);
            sessionStorage.permission = '[]';
            sessionStorage.permissionFlag = true;
          })
        }
      }
    }
  }

  render() {
    const { service, type, organizationId, projectId, AppState } = this.props;
    const { permissionFlag } = this.state;
    if (permissionFlag) {
      return Children.only(this.props.children)
    } else {
      if (Choerodon.getPermission(AppState.getPerMission, service, type, organizationId, projectId)) {
        return Children.only(this.props.children)
      } else {
        return null
      }
    }
  }
}



export default withRouter(Permission);
