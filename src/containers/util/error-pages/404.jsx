import React, { useEffect } from 'react';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import './style/404.less';

const NoMatch = ({ MenuStore }) => {
  useEffect(() => {
    MenuStore.setNotFoundSignSign(false);

    return () => {
      MenuStore.setNotFoundSignSign(false);
    };
  }, []);

  return (
    <div className="c7n-404-page">
      <div className="c7n-404-page-banner" />
      <div className="c7n-404-page-banner-text">
        <span>抱歉 ，您访问的页面不存在！</span>
        <Link to="/">
          <Button funcType="raised" type="default">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default inject('MenuStore')(NoMatch);
