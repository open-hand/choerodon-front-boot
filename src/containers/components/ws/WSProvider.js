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
    if (typeof window !== 'undefined') {
      this.windowBeforeUnloadListener = addEventListener(window, 'beforeunload', this.handleWindowBeforeUnload);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.server !== this.props.server) {
      this.destroyAllSocket();
      this.initSocket(nextProps);
    }
  }

  componentWillUnmount() {
    this.destroyAllSocket();
    if (this.windowBeforeUnloadListener) {
      this.windowBeforeUnloadListener.remove();
      this.windowBeforeUnloadListener = null;
    }
  }

  handleWindowBeforeUnload = () => {
    this.destroyAllSocket();
  };

  handleOpen = (evt, path) => {
    const { onOpen } = this.props;
    if (typeof onOpen === 'function') {
      onOpen();
    }
    this.retry = false;
    this.pending.forEach((data) => {
      this.send(data, path);
    });
  };

  handleMessage = ({ data }, path) => {
    const { key, data: message } = JSON.parse(data);
    const { onMessage } = this.props;
    const handlers = this.map.get(`${path}-${key}`);
    if (typeof onMessage === 'function') {
      onMessage(message, key);
    }
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  };

  handleError = (e, path) => {
    const { onError } = this.props;
    if (typeof onError === 'function') {
      onError(e);
    }

    if (!this.retry) {
      this.retry = true;
      this.destroySocketByPath(path);
      this.initSocket(this.props, path);
    }
  };

  handleClose = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  destroySocketByPath(path) {
    const { ws } = this;
    if (ws.get(path)) {
      ws.get(path).removeEventListener('open', evt => this.handleOpen(evt, path));
      ws.get(path).removeEventListener('message', evt => this.handleMessage(evt, path));
      ws.get(path).removeEventListener('error', evt => this.handleError(evt, path));
      ws.get(path).removeEventListener('close', evt => this.handleClose(evt, path));
      clearInterval(ws.get(path).hb);
      ws.get(path).close();
      ws.set(path, null);
    }
  }

  destroyAllSocket() {
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
        ws.addEventListener('open', evt => this.handleOpen(evt, path));
        ws.addEventListener('message', evt => this.handleMessage(evt, path));
        ws.addEventListener('error', evt => this.handleError(evt, path));
        ws.addEventListener('close', evt => this.handleClose.bind(evt, path));
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
    if (ws.get(path) && ws.get(path).readyState === 1) {
      ws.get(path).send(message);
    } else if (pending.indexOf(message) === -1) {
      pending.push(message);
    }
  };

  /**
   * 将handler注册到对应path的webSocket的handleMessage事件上，如果这个path没有建立连接，则建立连接，并发送订阅消息的请求。
   * @param key 要注册的key
   * @param message 订阅消息
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
      } else {
        this.map.set(`${path}-${key}`, [handler]);
      }
      this.send(JSON.stringify({
        ...message,
      }), path);
    } else {
      this.initSocket({ server }, path);
      this.map.set(`${path}-${key}`, [handler]);
      this.send(JSON.stringify({
        ...message,
      }), path);
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
