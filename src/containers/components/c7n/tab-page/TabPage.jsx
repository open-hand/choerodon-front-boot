import React from 'react';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui';
import Permission from '../permission';
import NoAccess from '../error-pages/403';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

const defaultChildren = (
  <div style={spinStyle}>
    <Spin size="large" />
  </div>
);

const noAccess = (
  <div style={{ marginTop: 150 }}>没有权限</div>
);

const TabPage = ({ className, service, onAccess, ...props }) => {
  const classString = classNames(className);
  const page = <div {...props} className={classString} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }} />;
  if (service && service.length) {
    return (
      <Permission
        service={service}
        defaultChildren={defaultChildren}
        noAccessChildren={noAccess}
        onAccess={onAccess}
      >
        {page}
      </Permission>
    );
  } else {
    return page;
  }
};

export default TabPage;
