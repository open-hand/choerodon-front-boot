import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip } from 'choerodon-ui';

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
    const { title, backPath, children } = this.props;
    let backBtn = '';
    if (backPath) {
      backBtn = (
        <div>
          <Tooltip
            title={Choerodon.getMessage('返回', 'return')}
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
      <div className="page-head" id="dd">
        {backBtn}
        <span className="page-head-title">{title}</span>
        {children}
      </div>
    );
  }
}
