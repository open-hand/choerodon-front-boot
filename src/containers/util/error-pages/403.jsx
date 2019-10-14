import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import './style/403.less';

const NoAccess = () => (
  <div className="c7n-403-page">
    <div className="c7n-403-page-banner" />
    <div className="c7n-403-page-banner-text">
      <span>抱歉 ，您没有权限访问！</span>
      <Link to="/">
        <Button funcType="raised" type="default">
          返回首页
        </Button>
      </Link>
    </div>
  </div>
);

export default NoAccess;
