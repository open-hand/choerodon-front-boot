/*eslint-disable*/
//service 为一个数组，权限的code

import React, { Children, cloneElement, Component, isValidElement } from 'react';
import { observer } from 'mobx-react';
import PermissionStore from '../stores/PermissionStore';

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

  extendProps(children, props) {
    return Children.map(children, child => {
      if (isValidElement(child)) {
        return cloneElement(child, props);
      } else {
        return child;
      }
    });
  }

  render() {
    const { service, type, organizationId, projectId, defaultChildren, children, ...otherProps } = this.props;
    if (PermissionStore.judgeServices(service, type, organizationId, projectId)
        .some(item => PermissionStore.findPermission(item).approve)) {
      return this.extendProps(children, otherProps);
    } else if (defaultChildren) {
      return this.extendProps(defaultChildren, otherProps);
    } else {
      return null;
    }
  }
}


export default Permission;
