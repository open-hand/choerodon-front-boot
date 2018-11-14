import React, { Component } from 'react';
import TimeAgo from 'timeago-react';
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

  openSettings = () => {
    window.open('/#/iam/receive-setting?type=site');
  };

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
              const { title, content, id, sendByUser, type, sendTime } = data;
              let avatar;
              if (sendByUser !== null) {
                const { imageUrl, loginName, realName } = sendByUser;
                avatar = (
                  <Tooltip title={`${loginName} ${realName}`}>
                    <Avatar src={imageUrl} style={{ userSelect: 'none', marginTop: '14px' }}>
                      {realName[0].toUpperCase()}
                    </Avatar>
                  </Tooltip>
                );
              } else {
                avatar = (
                  <Tooltip title={AppState.siteInfo.systemName || 'Choerodon'}>
                    <Avatar src={AppState.siteInfo.favicon || './favicon.ico'} style={{ userSelect: 'none', marginTop: '14px' }}>
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
                    title={<a onClick={() => { window.open(`/#/iam/user-msg?type=site&msgId=${id}&msgType=${type}`); }}><div>{title}</div></a>}
                    description={(
                      <React.Fragment>
                        <p dangerouslySetInnerHTML={{ __html: `${content.replace(reg, '')}` }} />
                        <p>
                          <TimeAgo
                            datetime={sendTime.slice(0, sendTime.length - 3)}
                            locale={Choerodon.getMessage('zh_CN', 'en')}
                          />
                        </p>
                      </React.Fragment>
                    )}
                  />
                  <Icon type="cancel" style={{ fontSize: '20px', top: '12px', left: '281px' }} onClick={e => this.cleanMsg(e, data)} />
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
          onClick={this.cleanAllMsg}
          shape="circle"
          icon="delete_sweep"
          style={{ fontSize: 20 }}
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
          <TabPane tab="消息" key="msg">
            <Spin spinning={!inboxLoaded} wrapperClassName={`${popoverPrefixCls}-content`}>
              {
                this.renderMessages(HeaderStore.getUnreadMsg)
              }
            </Spin>
          </TabPane>
          <TabPane tab="通知" key="notice">
            <Spin spinning={!inboxLoaded} wrapperClassName={`${popoverPrefixCls}-content`}>
              {
                this.renderMessages(HeaderStore.getUnreadNotice)
              }
            </Spin>
          </TabPane>
        </Tabs>

        <div className={`${popoverPrefixCls}-footer`} onClick={this.handleMessageClick}>
          <Button
            funcType="raised"
            type="primary"
            onClick={() => window.open('/#/iam/user-msg?type=site')}
          >所有消息
          </Button>
          <Button
            funcType="raised"
            onClick={() => window.open('/#/iam/receive-setting?type=site')}
            style={{ marginLeft: 16, color: '#3F51B5' }}
          >消息设置
          </Button>
          {/* <Link to="/iam/user-msg?type=site">查看所有消息通知</Link> */}
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
