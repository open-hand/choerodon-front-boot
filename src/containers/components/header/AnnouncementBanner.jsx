import React, { Component } from 'react';
import classNames from 'classnames';
import { Button, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { PREFIX_CLS } from '../../common/constants';
import './style';


const prefixCls = `${PREFIX_CLS}-boot-header-banner`;
const imgPartten = /<img(.*?)>/g;
const htmlTagParttrn = /<[^>]*>/g;

@inject('AppState', 'HeaderStore', 'MenuStore')
@observer
export default class AnnouncementBanner extends Component {
  componentDidMount() {
    this.props.HeaderStore.axiosGetNewSticky();
  }

  handleClose = () => {
    this.props.HeaderStore.closeAnnouncement();
  };

  handleInfo = () => {
    window.open('/#/iam/user-msg?type=site&msgType=announcement');
  };

  render() {
    const { src, children, className, HeaderStore: { announcementClosed, announcement: { content } } } = this.props;
    return (
      announcementClosed ? null : (
        <div
          className={classNames(`${prefixCls}`, className)}
        >
          <div className={`${prefixCls}-info`}>
            <Icon type="info" style={{ fontSize: 24, color: '#d50000' }} />
            <span dangerouslySetInnerHTML={{ __html: content && content.replace(imgPartten, '[图片]').replace(htmlTagParttrn, '') }} />
          </div>
          <div className={`${prefixCls}-buttons`}>
            <Button onClick={this.handleClose}>关闭提示</Button>
            <Button type="primary" funcType="raised" onClick={this.handleInfo}>了解详情</Button>
          </div>
        </div>
      )
    );
  }
}
