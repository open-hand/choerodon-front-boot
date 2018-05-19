import React from 'react';
import PropTypes from 'prop-types';

const Pager = (props) => {
  const prefixCls = `${props.rootPrefixCls}-item`;
  let cls = `${prefixCls} ${prefixCls}-${props.page}`;

  if (props.active) {
    cls = `${cls} ${prefixCls}-active`;
  }

  if (props.className) {
    cls = `${cls} ${props.className}`;
  }

  const handleClick = () => {
    props.onClick(props.page);
  };

  const handleKeyPress = (e) => {
    props.onKeyPress(e, props.onClick, props.page);
  };

  const showNewTitle = props.showTitle ? props.page : null;
  return (
    <li>
      <a
        title={showNewTitle}
        className={cls}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        role="button"
      >
        {props.itemRender(props.page, 'page', <span>{props.page}</span>)}
      </a>
    </li>
  );
};

Pager.propTypes = {
  page: PropTypes.number,
  active: PropTypes.bool,
  // last: PropTypes.bool,
  className: PropTypes.string,
  showTitle: PropTypes.bool,
  rootPrefixCls: PropTypes.string,
  onClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  itemRender: PropTypes.func,
};

export default Pager;
