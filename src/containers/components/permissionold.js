/*eslint-disable*/
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
  }
  // componentWillMount() {
  //   const { service, type, organizationId, projectId, AppState } = this.props;
  //   let already = 0;
  //   //如果该权限已经查过就跳过
  //   for (let a = 0; a < AppState.getPerMission.length; a += 1) {
  //     for (let b = 0; b < AppState.getPerMission[a].length; b += 1) {
  //       if (type === 'organization') {
  //         if (AppState.getPerMission[a][b].name === service
  //           && AppState.getPerMission[a][b].resourceType === 'organization'
  //           && parseInt(AppState.getPerMission[a][b].resourceId, 10) === parseInt(organizationId, 10)
  //         ) {
  //           already = 1;
  //         }
  //       } else if (type === 'project') {
  //         if (AppState.getPerMission[a][b].name === service
  //           && AppState.getPerMission[a][b].resourceType === 'project'
  //           && parseInt(AppState.getPerMission[a][b].resourceId, 10) === parseInt(projectId, 10)
  //         ) {
  //           already = 1;
  //         }
  //       } else {
  //         if (AppState.getPerMission[a][b].name === service
  //           && AppState.getPerMission[a][b].resourceType === 'site'
  //         ) {
  //           already = 1;
  //         }
  //       }
  //     }
  //   }
  //   //查权限
  //   if (already === 0) {
  //     let permission = [];
  //     if (type === 'organization') {
  //       permission.push({
  //         name: service,
  //         organizationId: organizationId,
  //         resourceId: organizationId,
  //         resourceType: 'organization',
  //       })
  //     } else if (type === 'project') {
  //       permission.push({
  //         name: service,
  //         organizationId: organizationId,
  //         resourceId: projectId,
  //         resourceType: 'project',
  //       })
  //     } else {
  //       permission.push({
  //         name: service,
  //         resourceType: 'site',
  //       })
  //     }
  //     axios.post('/iam/v1/permissions/testPermission', JSON.stringify(permission)).then((data) => {
  //       AppState.setPerMission(data);
  //     })
  //   }
  // }
  componentWillMount() {
    const { service, type, organizationId, projectId, AppState } = this.props;
    let permission = {};
    let uniqMenuCodeArray = [];
    let types = AppState.currentMenuType.type;
    service.map(serviceValue => {
      if (types === 'organization') {
        permission = {
          "name": serviceValue,
          "resourceId": organizationId,
          "resourceType": type,
          "organizationId": organizationId,
        };
      } else if (types === 'project') {
        permission = {
          "name": serviceValue,
          "resourceId": projectId,
          "resourceType": type,
          "organizationId": organizationId,
        };
      }
      if (AppState.getPerMission[0]) {
        let flag = 0;
        AppState.getPerMission[0].map((valuePermission) => {
          let valuePermissionNew = _.omit(valuePermission, ['approve']);
          if (!(_.isEqual(valuePermissionNew, permission))) {
            flag++;
          }
        })
        if (flag > 0) {
          AppState.pushperMissionArray(permission);
          flag = 0;
        }
      }
      if (AppState.getperMissionArray.length > 5) {
        AppState.loadPerMissions(AppState.getperMissionArray);
        AppState.setperMissionArray([]);
      }
    })
  }
  componentDidMount() {
    const { service, type, organizationId, projectId, AppState } = this.props;
    if (AppState.getperMissionArray.length > 0) {
      AppState.loadPerMissions(AppState.getperMissionArray);
      AppState.setperMissionArray([]);
    }
  }
  render() {
    const that = this;
    const { service, type, organizationId, projectId, AppState } = this.props;
    // const flag = _.filter(AppState.getPerMission[0], {"name": type})
    // console.log(Choerodon.getPermission(AppState.getPerMission,service));
    // 不使用permission
    let content, serviceFlag;
    const debuggerflag = AppState.getDebugger;
    if (_.isArray(service)) {
      if (service.length === 0) {
        return Children.only(this.props.children);
      } else {
        serviceFlag = service.map(vlaue => Choerodon.getPermission(AppState.getPerMission, vlaue, this.props.type, this.props.organizationId, this.props.projectId));
        if (_.indexOf(serviceFlag, false) < 0) {
          content = service.map(value => (<span>{value}</span>));
          if (debuggerflag) {
            return (
              <Tooltip defaultVisible="true" trigger="hover" placement="bottom" title={content}>
                  {Children.only(this.props.children)}
              </Tooltip>
            )
          } else {
            return Children.only(this.props.children)
          }
        } else {
          return null;
        }
      }
    } else {
      if (this.props.service === '') {
        return Children.only(this.props.children);
      } else {
        if (Choerodon.getPermission(AppState.getPerMission, this.props.service, this.props.type, this.props.organizationId, this.props.projectId)) {
          content = <span>{this.props.service}</span>;
          if (debuggerflag) {
            return (
              <Tooltip defaultVisible="true" trigger="hover" placement="bottom" title={content}>
                  {Children.only(this.props.children)}
              </Tooltip>
            )
          } else {
            return Children.only(this.props.children)
          }
        } else {
          return null
        }
      }
    }
  }
}

Permission.propTypes = {
  service: PropTypes.string,
  type: PropTypes.string,
  organizationId: PropTypes.string,
  projectId: PropTypes.string,
};

export default withRouter(Permission);
