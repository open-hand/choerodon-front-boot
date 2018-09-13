import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class WSHandler extends Component {
  static propTypes = {
    messageKey: PropTypes.string.isRequired,
    onMessage: PropTypes.func,
  };

  static contextTypes = {
    ws: PropTypes.object,
  };

  state = {
    data: null,
  };

  componentWillMount() {
    this.register(this.props, this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.messageKey !== this.props.messageKey) {
      this.unregister(this.props, this.context);
      this.register(nextProps, nextContext);
    }
  }

  componentWillUnmount() {
    this.unregister(this.props, this.context);
  }

  handleMessage = (data) => {
    const { onMessage } = this.props;
    if (typeof onMessage === 'function') {
      onMessage(data);
    }
    this.setState({
      data,
    });
  };

  register(props, context) {
    const { messageKey } = props;
    const { ws } = context;
    if (ws) {
      ws.register(messageKey, { type: 'test', payload: 'test' }, this.handleMessage);
    }
  }

  unregister(props, context) {
    const { messageKey } = props;
    const { ws } = context;
    if (ws) {
      ws.unregister(messageKey, this.handleMessage);
    }
  }

  render() {
    const { data } = this.state;
    const { children } = this.props;
    if (typeof children === 'function') {
      return children(data);
    } else {
      return children;
    }
  }
}
