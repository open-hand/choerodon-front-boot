import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Badge, Icon, Popover } from 'choerodon-ui';
import WSHandler from '../ws/WSHandler';
import { PREFIX_CLS } from '../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-inbox`;
const popoverPrefixCls = `${prefixCls}-popover`;

@inject('HeaderStore')
@observer
export default class Inbox extends Component {
  renderMessages(inboxData) {
    if (inboxData.length > 0) {
      return (
        <ul>
          {
            inboxData.map(({ title, text }) => (
              <li>
                <div>
                  <label>{title}</label>
                  <p>{text}</p>
                </div>
                <Icon type="cancel" />
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
    const { inboxData } = this.props.HeaderStore;
    return (
      <div className={!inboxData.length && 'is-empty'}>
        <div className={`${popoverPrefixCls}-header`}>
          <span>通知</span>
          <a>全部清空</a>
        </div>
        <div className={`${popoverPrefixCls}-content`}>
          {
            this.renderMessages(inboxData)
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
      <WSHandler messageKey="org:1">
        {
          data => (
            <Popover
              overlayClassName={popoverPrefixCls}
              arrowPointAtCenter
              placement="bottomRight"
              content={this.renderPopoverContent()}
            >
              <Badge className={prefixCls} count={data}>
                <Icon type="notifications" />
              </Badge>
            </Popover>
          )
        }
      </WSHandler>
    );
  }
}
