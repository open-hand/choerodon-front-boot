import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Badge, Button, Icon, Popover, Spin } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import { PREFIX_CLS } from '../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;
const reg = /\n|&nbsp;|&lt|&gt|<[^>]+>| /g;

@inject('HeaderStore', 'AppState')
@observer
export default class Inbox extends Component {
  cleanMsg = (e, data) => {
    e.stopPropagation();
    const { AppState, HeaderStore } = this.props;
    HeaderStore.readMsg(AppState.userInfo.id, data);
  };

  cleanAllMsg = () => {
    const { AppState, HeaderStore } = this.props;
    HeaderStore.readMsg(AppState.userInfo.id);
    HeaderStore.setInboxVisible(false);
  };

  getUnreadMsg() {
    const { AppState, HeaderStore } = this.props;
    HeaderStore.axiosGetUserMsg(AppState.getUserId);
  }

  handleButtonClick = () => {
    const { HeaderStore } = this.props;
    if (!HeaderStore.inboxLoaded) {
      this.getUnreadMsg();
    }
  };

  handleMessage = () => {
    this.getUnreadMsg();
  };

  handleMessageClick = () => {
    this.handleVisibleChange(false);
  };

  handleVisibleChange = (visible) => {
    const { HeaderStore } = this.props;
    HeaderStore.setInboxVisible(visible);
  };

  renderMessages(inboxData) {
    if (inboxData.length > 0) {
      return (
        <ul>
          {
            inboxData.map((data) => {
              const { title, content, id } = data;
              return (
                <li key={id} onClick={this.handleMessageClick}>
                  <label><Link to={`/iam/user-msg?type=site&msgId=${id}`}>{title}</Link></label>
                  <p>{content.replace(reg, '')}</p>
                  <Icon type="cancel" onClick={e => this.cleanMsg(e, data)} />
                </li>
              );
            })
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
    const { inboxData, inboxLoaded } = this.props.HeaderStore;
    return (
      <div className={!inboxData.length ? 'is-empty' : null}>
        <div className={`${popoverPrefixCls}-header`}>
          <span>通知</span>
          <a onClick={() => this.cleanAllMsg()}>全部清空</a>
        </div>
        <Spin spinning={!inboxLoaded} wrapperClassName={`${popoverPrefixCls}-content`}>
          {
            this.renderMessages(inboxData)
          }
        </Spin>
        <div className={`${popoverPrefixCls}-footer`} onClick={this.handleMessageClick}>
          <Link to="/iam/user-msg?type=site">查看所有消息</Link>
        </div>
      </div>
    );
  }

  render() {
    const { AppState, HeaderStore } = this.props;
    const visible = HeaderStore.inboxVisible;
    return (
      <WSHandler
        messageKey={`choerodon:msg:site-msg:${AppState.userInfo.id}`}
        onMessage={this.handleMessage}
      >
        {
          data => (
            <Popover
              overlayClassName={popoverPrefixCls}
              arrowPointAtCenter
              placement="bottomRight"
              content={this.renderPopoverContent()}
              trigger="click"
              visible={visible}
              onVisibleChange={this.handleVisibleChange}
            >
              <Badge onClick={this.handleButtonClick} className={prefixCls} count={data || 0}>
                <Button functype="flat" shape="circle">
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
