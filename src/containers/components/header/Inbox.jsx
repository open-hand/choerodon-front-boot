import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Badge, Icon, Popover, Button } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import { PREFIX_CLS } from '../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;

@inject('HeaderStore', 'AppState')
@observer
export default class Inbox extends Component {
  state = {
    iData: [],
    count: 0,
    visible: false,
  };

  componentWillMount() {
    this.getUnreadMsg();
  }

  componentWillUnmount() {
  }

  cleanMsg = (msgId) => {
    const { AppState, HeaderStore } = this.props;
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
      visible: false,
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

  handleMessage = (data) => {
    this.getUnreadMsg();
    this.setState({
      count: data,
    });
  };

  handleMessageClick = () => {
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }

  renderMessages(inboxData) {
    if (inboxData.length > 0) {
      return (
        <ul>
          {
            inboxData.map(({ title, content, id }) => (
              <li key={id}>
                <div onClick={() => this.handleMessageClick(id)}>
                  <label><Link to={`/iam/user-msg?msgId=${id}`}>{title}</Link></label>
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
    const { AppState, HeaderStore } = this.props;
    return (
      <WSHandler
        messageKey={`choerodon:msg:sit-msg:${AppState.userInfo.id}`}
        path={`choerodon:msg/sit-msg/${AppState.userInfo.id}`}
        onMessage={this.handleMessage}
      >
        {
          (
            <Popover
              overlayClassName={popoverPrefixCls}
              arrowPointAtCenter
              placement="bottomRight"
              content={this.renderPopoverContent()}
              trigger="click"
              visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}
            >
              <a onClick={this.handleButtonClick} href="#">
                <Badge className={prefixCls} count={this.state.count}>
                  <Button onClick={this.handleButtonClick} functype="flat" shape="circle">
                    <Icon type="notifications" />
                  </Button>
                </Badge>
              </a>
            </Popover>
          )
        }
      </WSHandler>
    );
  }
}
