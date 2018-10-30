import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Badge, Button, Icon, Popover, Spin, Tabs, Card, Avatar, Tooltip } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import { PREFIX_CLS } from '../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;

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

  handleButtonClick = () => {
    const { HeaderStore } = this.props;
    if (!HeaderStore.inboxLoaded) {
      this.getUnreadMsg();
    }
  };

  handleMessage = () => {
    this.getUnreadMsg();
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
              const { title, content, id, sendByUser, type } = data;
              let avatar;
              if (sendByUser !== null) {
                const { imageUrl, loginName, realName } = sendByUser;
                avatar = (
                  <Tooltip title={`${loginName} ${realName}`}>
                    <Avatar src={imageUrl} size="small" style={{ userSelect: 'none', marginTop: '14px' }}>
                      {realName[0].toUpperCase()}
                    </Avatar>
                  </Tooltip>
                );
              } else {
                avatar = (
                  <Tooltip title={AppState.siteInfo.systemName || 'Choerodon'}>
                    <Avatar src={AppState.siteInfo.favicon || './favicon.ico'} style={{ userSelect: 'none' }}>
                      {(AppState.siteInfo.systemName && AppState.siteInfo.systemName[0]) || 'Choerodon'}
                    </Avatar>
                  </Tooltip>
                );
              }
              return (
                <Card
                  className={`${popoverPrefixCls}-card`}
                  bordered={false}
                >
                  <Meta
                    avatar={avatar}
                    title={<Link onClick={this.handleMessageClick} to={`/iam/user-msg?type=site&msgId=${id}&msgType=${type}`}><div>{title}</div></Link>}
                    description={<p dangerouslySetInnerHTML={{ __html: `${content.replace(reg, '')}` }} />}
                  />
                  <Icon type="close" style={{ fontSize: '20px', top: '16px', color: 'rgba(0,0,0,0.65)' }} onClick={e => this.cleanMsg(e, data)} />
                </Card>
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

  renderRemoveAll() {
    return (
      <Tooltip
        title="清空全部"
        placement="right"
      >
        <Button
          size="small"
          onClick={this.cleanAllMsg}
          shape="circle"
          icon="delete"
        />
      </Tooltip>
    );
  }

  renderPopoverContent(inboxData, inboxLoaded) {
    const { HeaderStore } = this.props;
    return (
      <div className={!inboxData.length ? 'is-empty' : null}>
        <Tabs
          defaultActiveKey="msg"
          className={`${popoverPrefixCls}-header`}
          tabBarExtraContent={this.renderRemoveAll()}
        >
          <TabPane tab={`消息(${HeaderStore.getUnreadMsg.length})`} key="msg">
            <Spin spinning={!inboxLoaded} wrapperClassName={`${popoverPrefixCls}-content`}>
              {
                this.renderMessages(HeaderStore.getUnreadMsg)
              }
            </Spin>
          </TabPane>
          <TabPane tab={`通知(${HeaderStore.getUnreadNotice.length})`} key="notice">
            <Spin spinning={!inboxLoaded} wrapperClassName={`${popoverPrefixCls}-content`}>
              {
                this.renderMessages(HeaderStore.getUnreadNotice)
              }
            </Spin>
          </TabPane>
        </Tabs>

        <div className={`${popoverPrefixCls}-footer`} onClick={this.handleMessageClick}>
          <Link to="/iam/user-msg?type=site">查看所有消息通知</Link>
        </div>
      </div>
    );
  }

  render() {
    const { AppState, HeaderStore } = this.props;
    const { inboxVisible, inboxLoaded, inboxData } = HeaderStore;
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
              content={this.renderPopoverContent(inboxData, inboxLoaded)}
              trigger="click"
              visible={inboxVisible}
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
