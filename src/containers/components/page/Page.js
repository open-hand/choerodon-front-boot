import React from 'react';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui';
import Permission from '../Permission';

const Page = ({ className, service, ...props }) => {
  const classString = classNames('page-container', className);
  const page = <div {...props} className={classString} />;
  if (service && service.length) {
    return (
      <Permission services={service} defaultChildren={<Spin />}>
        {page}
      </Permission>
    );
  } else {
    return page;
  }
};

export default Page;
