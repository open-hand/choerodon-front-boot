import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class GuideProvider extends Component {
  static childContextTypes = {
    render: PropTypes.func,
  };

  state = {
    toolbar: null,
  };

  getChildContext() {
    return {
      render: this.renderToolBar,
    };
  }

  renderToolBar = (toolbar) => {
    this.setState({
      toolbar,
    });
  };

  render() {
    const { children } = this.props;
    const { toolbar } = this.state;
    if (typeof children === 'function') {
      return children(toolbar);
    } else {
      return children;
    }
  }
}
