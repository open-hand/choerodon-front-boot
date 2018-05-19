import React from 'react';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';

const PageContent = (props) => {
  const classString = classNames('page-content', props.className);
  const { title, description, link, children, style } = props;
  return (
    <div className={classString} style={style}>
      {title || description ? (
        <div className="page-content-header">
          <div className="title">{title}</div>
          <div className="description">
            {description}
            {link && <a href={link} target="_blank">了解详情<Icon type="open_in_new" /></a>}
          </div>
        </div>) : null}
      {children}
    </div>
  );
};

export default PageContent;
