import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Toolbar extends Component {
  static contextTypes = {
    render: PropTypes.func,
  };

  context;

  shouldUpdate = true;

  componentWillMount() {
    this.renderToolBar(this.props, this.context);
  }

  componentWillUpdate(props, state, context) {
    this.renderToolBar(props, context);
  }

  renderToolBar(props, context) {
    const { children } = props;
    const { render } = context;
    if (typeof render === 'function') {
      this.shouldUpdate = false;
      render(
        <nav className="c7n-boot-dashboard-toolbar">
          {children}
        </nav>,
      );
    }
  }

  shouldComponentUpdate() {
    if (!this.shouldUpdate) {
      this.shouldUpdate = true;
      return false;
    }
    return true;
  }

  render() {
    return null;
  }
}
