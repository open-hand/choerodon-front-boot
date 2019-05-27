import React, { Children, cloneElement, Component, createElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { inject, observer } from 'mobx-react';
import omit from 'object.omit';
import { FAILURE, PENDING, SUCCESS } from './PermissionStatus';

@inject('AppState')
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

  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: PENDING,
  };

  componentWillMount() {
    this.check(this.props, this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.check(nextProps, nextContext);
  }

  componentDidMount() {
    this.triggerAccess();
  }

  componentDidUpdate(preProps, preState) {
    this.triggerAccess(preState);
  }

  triggerAccess(preState = {}) {
    const { status } = this.state;
    const { onAccess } = this.props;
    if (status === SUCCESS && preState.status !== SUCCESS && typeof onAccess === 'function') {
      onAccess();
    }
  }

  check(props, context) {
    if (context.permission) {
      context.permission.check(this.getPermissionProps(props), this.handlePermission);
    }
  }

  handlePermission = (status) => {
    this.setState({
      status,
    });
  };

  getPermissionProps(props) {
    const { type: typeState = 'site', id = 0, projectId: projectIdState, organizationId: organizationIdState } = get(props, 'AppState.currentMenuType', {});
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
    const { defaultChildren, children, noAccessChildren } = this.props;
    const otherProps = omit(this.props, [
      'service', 'type', 'organizationId', 'projectId', 'defaultChildren',
      'noAccessChildren', 'children', 'onAccess', 'AppState',
    ]);
    const { status } = this.state;
    if (status === SUCCESS) {
      return this.extendProps(children, otherProps);
    } else if (status === FAILURE && (noAccessChildren || defaultChildren)) {
      return this.extendProps(noAccessChildren || defaultChildren, otherProps);
    } else if (status === PENDING && defaultChildren) {
      return this.extendProps(defaultChildren, otherProps);
    } else {
      return null;
    }
  }
}


export default Permission;
