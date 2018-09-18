import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Badge, Icon, Popover, Button } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import { PREFIX_CLS, WEBSOCKET_SERVER } from '../../common/constants';
import warning from '../../../common/warning';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;

@inject('HeaderStore', 'AppState')
@observer
export default class Inbox extends Component {
  state = {
    iData: [],
    count: 0,
  };

  ws = null;

  hb = null;

  // 前端发送心跳
  heartBeat = (ws) => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'heartBeat' }));
    }
  };

  initSocket() {
    const { AppState } = this.props;
    const server = `${WEBSOCKET_SERVER}/choerodon:msg/sit-msg/${AppState.userInfo.id}`;
    if (server) {
      try {
        const ws = new WebSocket(server);
        ws.addEventListener('open', this.handleOpen);
        ws.addEventListener('message', this.handleMessage);
        ws.addEventListener('error', this.handleError);
        ws.addEventListener('close', this.handleClose);
        this.hb = setInterval(() => this.heartBeat(ws), 50000);
        this.ws = ws;
      } catch (e) {
        warning(false, `WSProvider is stopped. Caused by <${e.message}>`);
        this.ws = null;
      }
    }
  }

  handleMessage = (e) => {
    const data = JSON.parse(e.data);
    this.getUnreadMsg();
    if (data.type === 'sit-msg') {
      this.setState({
        count: data.data,
      });
    }
  };

  handleClose = (e) => {
    clearInterval(this.hb);
    setTimeout(() => this.initSocket(), 3000);
  };

  componentWillMount() {
    this.getUnreadMsg();
    this.initSocket();
  }

  componentWillUnmount() {
    debugger;
    clearInterval(this.hb);
  }

  cleanMsg = (msgId) => {
    const { AppState, HeaderStore } = this.props;
    debugger;
    const newData = [];
    HeaderStore.readMsg([msgId], AppState.userInfo.id);
    this.state.iData.forEach((v) => {
      if (v.id !== msgId) newData.push(v);
    });
    this.setState({
      iData: newData,
    });
  };

  cleanAllMsg = () => {
    const { AppState, HeaderStore } = this.props;
    HeaderStore.readMsg(this.state.iData.map(({ id }) => id), AppState.userInfo.id);
    this.setState({
      iData: [],
    });
  };

  getUnreadMsg() {
    const { AppState, HeaderStore } = this.props;
    HeaderStore.axiosGetUserMsg(AppState.getUserId).then((data) => {
      this.setState({
        // 把html页面转化为纯文本
        iData: data.content.map(({ title, content, id }) => ({ title, id, content: content.replace(/\n|&nbsp|&lt|&gt|<[^>]+>| /g, '') })),
      });
    });
  }

  handleButtonClick = () => {
    this.getUnreadMsg();
  };

  renderMessages(inboxData) {
    if (inboxData.length > 0) {
      return (
        <ul>
          {
            inboxData.map(({ title, content, id }) => (
              <li>
                <div>
                  <label><Link to="/iam/user-msg?type=site">{title}</Link></label>
                  <p>{content}</p>
                </div>
                <Icon type="cancel" onClick={() => this.cleanMsg(id)} />
              </li>
            ))
          }
        </ul>
      );
    } else {
      return (
        <div className={`${prefixCls}-empty`}>
          暂时没有站内消息
        </div>
      );
    }
  }

  renderPopoverContent() {
    const { iData } = this.state;
    return (
      <div className={!iData.length && 'is-empty'}>
        <div className={`${popoverPrefixCls}-header`}>
          <span>通知</span>
          <a onClick={() => this.cleanAllMsg()}>全部清空</a>
        </div>
        <div className={`${popoverPrefixCls}-content`}>
          {
            this.renderMessages(iData)
          }
        </div>
        <div className={`${popoverPrefixCls}-footer`}>
          <Link to="/iam/user-msg?type=site">查看所有消息</Link>
        </div>
      </div>
    );
  }

  render() {
    return (
      <WSHandler messageKey="" onMessage={data => this.handleMessage(data)}>
        {
          (
            <Popover
              overlayClassName={popoverPrefixCls}
              arrowPointAtCenter
              placement="bottomRight"
              content={this.renderPopoverContent()}
              trigger="click"
            >
              <Badge className={prefixCls} count={this.state.count}>
                <Button onClick={this.handleButtonClick} functype="flat" shape="circle">
                  <Icon type="notifications" />
                </Button>
              </Badge>
            </Popover>
          )
        }
      </WSHandler>
    );
  }
}
