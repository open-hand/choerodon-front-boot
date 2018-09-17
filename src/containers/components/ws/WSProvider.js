import React, { Component } from 'react';
import PropTypes from 'prop-types';
import addEventListener from 'choerodon-ui/lib/rc-components/util/Dom/addEventListener';
import warning from '../../../common/warning';

export default class WSProvider extends Component {
  static propTypes = {
    server: PropTypes.string,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onMessage: PropTypes.func,
    onError: PropTypes.func,
  };

  static childContextTypes = {
    ws: PropTypes.object,
  };

  getChildContext() {
    return {
      ws: this,
    };
  }

  ws = null;

  windowBeforeUnloadListener = null;

  map = {};

  retry = false;

  pending = [];

  componentWillMount() {
    this.initSocket(this.props);
    if (typeof window !== 'undefined') {
      this.windowBeforeUnloadListener = addEventListener(window, 'beforeunload', this.handleWindowBeforeUnload);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.server !== this.props.server) {
      this.destroySocket();
      this.initSocket(nextProps);
    }
  }

  componentWillUnmount() {
    this.destroySocket();
    if (this.windowBeforeUnloadListener) {
      this.windowBeforeUnloadListener.remove();
      this.windowBeforeUnloadListener = null;
    }
  }

  handleWindowBeforeUnload = () => {
    this.destroySocket();
  };

  handleOpen = () => {
    const { onOpen } = this.props;
    if (typeof onOpen === 'function') {
      onOpen();
    }
    this.retry = false;
    this.pending.forEach(this.send);
  };

  handleMessage = ({ key, data }) => {
    const { onMessage } = this.props;
    const handlers = this.map[key];
    if (typeof onMessage === 'function') {
      onMessage(data, key);
    }
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  };

  handleError = (e) => {
    const { onError, server } = this.props;
    if (typeof onError === 'function') {
      onError(e);
    }

    if (!this.retry) {
      this.retry = true;
      this.destroySocket();
      this.initSocket(this.props);
    }
  };

  handleClose = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  destroySocket() {
    const { ws } = this;
    if (ws) {
      ws.removeEventListener('open', this.handleOpen);
      ws.removeEventListener('message', this.handleMessage);
      ws.removeEventListener('error', this.handleError);
      ws.removeEventListener('close', this.handleClose);
      ws.close();
      this.ws = null;
    }
  }

  initSocket({ server }) {
    if (server) {
      try {
        const ws = new WebSocket(server);
        ws.addEventListener('open', this.handleOpen);
        ws.addEventListener('message', this.handleMessage);
        ws.addEventListener('error', this.handleError);
        ws.addEventListener('close', this.handleClose);
        this.ws = ws;
      } catch (e) {
        warning(false, `WSProvider is stopped. Caused by <${e.message}>`);
        this.ws = null;
      }
    }
  }

  send = (message) => {
    const { ws, pending } = this;
    if (ws.readyState === 1) {
      ws.send(message);
    } else if (pending.indexOf(message) === -1) {
      pending.push(message);
    }
  };

  register(key, message, handler) {
    if (this.ws) {
      const handlers = this.map[key];
      if (handlers) {
        if (handlers.indexOf(handler) === -1) {
          handlers.push(handler);
        }
      } else {
        this.map[key] = [handler];
      }
      this.send(JSON.stringify({
        key,
        ...message,
      }));
    }
  }

  unregister(key, handler) {
    if (this.ws) {
      const handlers = this.map[key];
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  render() {
    return this.props.children;
  }
}
