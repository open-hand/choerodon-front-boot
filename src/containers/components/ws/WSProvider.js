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

  ws = new Map();

  windowBeforeUnloadListener = null;

  map = new Map();

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

  handleMessage = ({ data, currentTarget: { url } }) => {
    const { key, data: message } = JSON.parse(data);
    const { onMessage, server } = this.props;
    const path = url.replace(`${server}/`, '');
    const handlers = this.map.get(`${path}-${key}`);
    if (typeof onMessage === 'function') {
      onMessage(message, key);
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
    if (ws.size > 0) {
      ws.forEach((value) => {
        value.removeEventListener('open', this.handleOpen);
        value.removeEventListener('message', this.handleMessage);
        value.removeEventListener('error', this.handleError);
        value.removeEventListener('close', this.handleClose);
        clearInterval(value.hb);
        value.close();
      });
      this.ws.clear();
    }
  }

  /**
   * 获得指定的连接
   * @param server
   * @param path
   */
  initSocket = ({ server }, path) => {
    if (server && path) {
      try {
        const ws = new WebSocket(`${server}/${path}`);
        ws.addEventListener('open', this.handleOpen);
        ws.addEventListener('message', this.handleMessage.bind(this));
        ws.addEventListener('error', this.handleError);
        ws.addEventListener('close', this.handleClose);
        ws.hb = setInterval(() => this.heartBeat(path), 50000);
        this.ws.set(path, ws);
      } catch (e) {
        warning(false, `WSProvider is stopped. Caused by <${e.message}>`);
        this.ws.set(path, null);
      }
    }
  };

  // 前端发送心跳
  heartBeat = (path) => {
    this.send(JSON.stringify({ type: 'heartBeat' }), path);
  };

  send = (message, path) => {
    const { ws, pending } = this;
    if (ws.get(path).readyState === 1) {
      ws.get(path).send(message);
    } else if (pending.indexOf(message) === -1) {
      pending.push(message);
    }
  };

  /**
   *
   * @param key
   * @param message
   * @param handler
   * @param path
   */
  register(key, message, handler, path) {
    const { server } = this.props;
    if (this.ws.get(path)) {
      const handlers = this.map.get(`${path}-${key}`);
      if (handlers) {
        if (handlers.indexOf(handler) === -1) {
          handlers.push(handler);
        }
      }
      this.send(JSON.stringify({
        key,
        ...message,
      }), path);
    } else {
      this.initSocket({ server }, path);
      this.map.set(`${path}-${key}`, [handler]);
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
