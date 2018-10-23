import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip } from 'choerodon-ui';
import classNames from 'classnames';
import { getMessage } from '../../common';

@withRouter
export default class PageHeader extends Component {
  static propTypes = {
    backPath: PropTypes.string,
  };

  onBackBtnClick = () => {
    this.linkToChange(this.props.backPath);
  };

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  render() {
    const { title, backPath, children, className } = this.props;
    let backBtn = '';
    if (backPath) {
      backBtn = (
        // 清除从父元素继承的 CSS 样式
        <div style={{ lineHeight: '39px' }}>
          <Tooltip
            title={getMessage('返回', 'return')}
            placement="bottom"
            getTooltipContainer={that => that}
          >
            <Button
              type="primary"
              onClick={this.onBackBtnClick}
              className="back-btn small-tooltip"
              shape="circle"
              size="large"
              icon="arrow_back"
            />
          </Tooltip>
        </div>
      );
    }
    return (
      <div className={classNames('page-head', className)}>
        {backBtn}
        <span className="page-head-title">
          {title}
        </span>
        {children}
      </div>
    );
  }
}
