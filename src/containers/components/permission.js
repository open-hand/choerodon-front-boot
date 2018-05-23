/*eslint-disable*/
//service 为一个数组，权限的code

import React, { Children, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import PermissionStore from '../stores/PermissionStore';

@inject('AppState')
@observer
class Permission extends Component {

  componentWillMount() {
    this.check(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.check(nextProps);
  }

  check(props) {
    const { service, type, organizationId, projectId } = props;
    PermissionStore.check(service, type, organizationId, projectId);
  }

  render() {
    const { service, type, organizationId, projectId } = this.props;
    if (PermissionStore.judgeServices(service, type, organizationId, projectId)
        .some(item => PermissionStore.findPermission(item).approve)) {
      return Children.only(this.props.children);
    } else {
      return null;
    }
  }
}


export default withRouter(Permission);
