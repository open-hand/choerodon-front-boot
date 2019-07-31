import React, { Component, useContext, useEffect } from 'react';
import { Breadcrumb as Bread } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { Context } from './PageWrap';
import './style/Bread.less';

const { Item } = Bread;

const Breadcrumb = ({ title = 'Choerodon猪齿鱼平台', ...props }) => {
  const { isTab, renderBread } = useContext(Context);

  return (
    <section
      className="page-breadcrumb"
      style={{
        marginBottom: isTab ? '50px' : 'auto',
      }}
    >
      <Bread separator=">">
        <Item>Choerodon框架</Item>
        <Item style={{ color: 'rgba(0, 0, 0, 0.87)' }}>{title}</Item>
      </Bread>
    </section>
  );
};

export default Breadcrumb;
