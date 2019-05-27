import React, { Component } from 'react';
import TimeAgo from 'timeago-react';
import { inject, observer } from 'mobx-react';
// import timeago from 'timeago-react';
import { Badge, Button, Icon, Popover, Spin, Tabs, Card, Avatar, Tooltip } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import MouseOverWrapper from '../mouseOverWrapper';
import { PREFIX_CLS } from '../../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;
const siderPrefixCls = `${prefixCls}-sider`;
// timeago.register('zh_CN', require('./locale/zh_CN'));

/* eslint-disable-next-line */
const reg = /\n|&nbsp;|&lt|&gt|<[^a\/][^>]*>|<\/[^a][^>]*>/g;
const { TabPane } = Tabs;
const { Meta } = Card;

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

  openSettings = () => {
    window.open('/#/iam/receive-setting?type=site');
  };

  handleButtonClick = () => {
    const { HeaderStore } = this.props;
    if (!HeaderStore.inboxLoaded) {
      HeaderStore.setInboxLoading(true);
      this.getUnreadMsg();
    }
    this.handleVisibleChange(!HeaderStore.inboxVisible);
  };

  handleMessage = () => {
    this.props.HeaderStore.setInboxLoaded(false);
  };

  handleMessageClick = (e) => {
    this.handleVisibleChange(false);
  };

  handleVisibleChange = (visible) => {
    const { HeaderStore } = this.props;
    HeaderStore.setInboxVisible(visible);
  };

  renderMessages(inboxData) {
    const { AppState } = this.props;
    if (inboxData.length > 0) {
      return (
        <ul>
          {
            inboxData.map((data) => {
              const { title, content, id, sendByUser, type, sendTime } = data;
              return (
                <li className={`${prefixCls}-sider-content-list`}>
                  <div className={`${prefixCls}-sider-content-list-title`}>
                    <span>
                      <Icon type="textsms" style={{ marginRight: 10 }} />
                      {title}
                    </span>
                    <Icon
                      type="close"
                      style={{ color: 'rgba(0, 0, 0, 0.54)' }}
                      onClick={e => this.cleanMsg(e, data)}
                    />
                  </div>
                  <div className={`${prefixCls}-sider-content-list-description`}>
                    <p dangerouslySetInnerHTML={{ __html: `${content.replace(reg, '')}` }} />
                  </div>
                  <div className={`${prefixCls}-sider-content-list-time`}>
                    <TimeAgo
                      datetime={sendTime.slice(0, sendTime.length - 3)}
                      locale={Choerodon.getMessage('zh_CN', 'en')}
                    />
                  </div>
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

  renderPopoverContent(inboxData, inboxLoading) {
    const { HeaderStore } = this.props;
    return (
      <div className={!inboxData.length ? 'is-empty' : null} style={{ disable: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={`${prefixCls}-sider-header`}>
          <div className={`${prefixCls}-sider-header-title`}>
            <h3>消息通知</h3>
            <Button
              funcType="flat"
              type="primary"
              icon="close"
              shape="circle"
              onClick={() => this.handleVisibleChange(!HeaderStore.inboxVisible)}
            />
          </div>
          <div className={`${prefixCls}-sider-header-action`}>
            <span role="none" onClick={() => window.open('/#/iam/user-msg?type=site')}>
              查看所有消息
            </span>
            <span role="none" onClick={this.cleanAllMsg}>
              全部清除
            </span>
          </div>
        </div>
        <div className={`${prefixCls}-sider-content`}>
          <Spin spinning={inboxLoading} wrapperClassName={`${siderPrefixCls}-content`}>
            {this.renderMessages(HeaderStore.getUnreadAll)}
          </Spin>
        </div>
      </div>
    );
  }

  render() {
    const { AppState, HeaderStore } = this.props;
    const { inboxVisible, inboxLoaded, inboxData, inboxLoading } = HeaderStore;
    return (
      <React.Fragment>
        <WSHandler
          messageKey={`choerodon:msg:site-msg:${AppState.userInfo.id}`}
          onMessage={this.handleMessage}
        >
          {
            data => (
              <Badge onClick={this.handleButtonClick} className={prefixCls} count={data || 0}>
                <Button functype="flat" shape="circle">
                  <Icon type="notifications" />
                </Button>
              </Badge>
            )
          }
        </WSHandler>
        <div className={`${prefixCls}-sider ${inboxVisible ? `${prefixCls}-sider-visible` : ''}`}>
          {this.renderPopoverContent(inboxData, inboxLoading)}
        </div>
      </React.Fragment>
    );
  }
}
