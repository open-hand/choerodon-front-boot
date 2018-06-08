/*eslint-disable*/
import React, { Children, cloneElement, createElement, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'object.omit';
import AppState from '../../stores/AppState';
import PermissionStore from '../../stores/PermissionStore';

@observer
class Permission extends Component {
  static propTypes = {
    service: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    organizationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    defaultChildren: PropTypes.node,
    noAccessChildren: PropTypes.node,
  };

  componentWillMount() {
    this.check(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.check(nextProps);
  }

  check(props) {
    PermissionStore.check(this.getPermissionProps(props));
  }

  getPermissionProps(props) {
    const { type: typeState, id, projectId: projectIdState, organizationId: organizationIdState } = AppState.currentMenuType;
    const {
      service,
      type = typeState,
      organizationId = organizationIdState || id,
      projectId = projectIdState || id,
    } = props;
    return {
      service,
      type,
      organizationId,
      projectId,
    };
  }

  extendProps(children, props) {
    if (isValidElement(children)) {
      return Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, props);
        } else {
          return child;
        }
      });
    } else if (typeof children === 'function') {
      return createElement(children);
    } else {
      return children;
    }
  }

  render() {
    const { defaultChildren, children, noAccessChildren } = this.props;
    const otherProps = omit(this.props, [
      'service', 'type', 'organizationId', 'projectId', 'defaultChildren', 'noAccessChildren', 'children',
    ]);
    const status = PermissionStore.access(this.getPermissionProps(this.props));
    if (status === 'success') {
      return this.extendProps(children, otherProps);
    } else if (status === 'failure' && (noAccessChildren || defaultChildren)) {
      return this.extendProps(noAccessChildren || defaultChildren, otherProps);
    } else if (status === 'pending' && defaultChildren) {
      return this.extendProps(defaultChildren, otherProps);
    } else {
      return null;
    }
  }
}


export default Permission;
