import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'choerodon-ui/pro';
import './style/404.scss';

export default class NoMatch extends Component {
  render() {
    return (
      <div className="c7n-404-page">
        <div className="c7n-404-page-banner" />
        <div className="c7n-404-page-banner-text">
          <span>抱歉 ，您访问的页面不存在！</span>
          <Link to="/">
            <Button color="blue">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
