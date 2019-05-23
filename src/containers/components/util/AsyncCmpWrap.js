import React, { Component } from 'react';

export default class AsyncModuleWrapper extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.shouldUpdate || false;
  }

  render() {
    return this.props.children;
  }
}
