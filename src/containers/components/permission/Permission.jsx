import React, { Children, cloneElement, Component, createElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import omit from 'object.omit';
import PermissionWrapper from './PermissionWrapper';

@inject('AppState', 'PermissionStore')
@observer
class Permission extends Component {
  static propTypes = {
    service: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    organizationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    defaultChildren: PropTypes.node,
    noAccessChildren: PropTypes.node,
    onAccess: PropTypes.func,
  };

  componentWillMount() {
    this.check(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.check(nextProps);
  }

  check(props) {
    this.props.PermissionStore.check(this.getPermissionProps(props));
  }

  getPermissionProps(props) {
    const { type: typeState = 'site', id = 0, projectId: projectIdState, organizationId: organizationIdState } = props.AppState.currentMenuType || {};
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
      return Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, props);
        } else {
          return child;
        }
      });
    } else {
      return children;
    }
  }

  render() {
    const { defaultChildren, children, noAccessChildren, onAccess, PermissionStore } = this.props;
    const otherProps = omit(this.props, [
      'service', 'type', 'organizationId', 'projectId', 'defaultChildren',
      'noAccessChildren', 'children', 'onAccess', 'PermissionStore', 'AppState',
    ]);
    const status = PermissionStore.access(this.getPermissionProps(this.props));
    if (status === 'success') {
      return (
        <PermissionWrapper onAccess={onAccess}>
          {this.extendProps(children, otherProps)}
        </PermissionWrapper>
      );
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
