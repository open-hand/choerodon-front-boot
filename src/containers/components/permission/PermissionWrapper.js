import React, { Component } from 'react';

export default class PermissionWrapper extends Component {
  componentDidMount() {
    const { onAccess } = this.props;
    if (typeof onAccess === 'function') {
      onAccess();
    }
  }

  render() {
    return this.props.children;
  }
}
