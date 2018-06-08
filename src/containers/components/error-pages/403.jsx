import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import './style/403.scss';

export default class NoAccess extends Component {
  render() {
    return (
      <div className="c7n-403-page">
        <div className="c7n-403-page-banner" />
        <Link to="/">
          <Button funcType="raised" type="primary">
            返回首页
          </Button>
        </Link>
      </div>
    );
  }
}
