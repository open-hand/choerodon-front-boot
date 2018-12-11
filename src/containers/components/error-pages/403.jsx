import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import './style/403.scss';

export default class NoAccess extends Component {
  render() {
    return (
      <div className="c7n-403-page">
        <div className="c7n-403-page-banner" />
        <div className="c7n-403-page-banner-text">
          <span>抱歉 ，您访问的页面不存在！</span>
          <Link to="/">
            <Button funcType="raised" type="default">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
