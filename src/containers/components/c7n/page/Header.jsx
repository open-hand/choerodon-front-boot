import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip } from 'choerodon-ui';
import { inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { getMessage } from '../../../common';
import { Context } from '../tab-page/PageWrap';

@withRouter
@inject('AppState', 'MenuStore')
@injectIntl
export default class PageHeader extends Component {
  static propTypes = {
    backPath: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
  };

  onBackBtnClick = () => {
    const { backPath, history } = this.props;
    if (backPath === true) {
      this.props.history.goBack();
    } else {
      this.linkToChange(backPath);
    }
  };

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  componentDidMount() {
    const { MenuStore, AppState, title } = this.props;
    let titleText = null;
    if (title && title.props && title.props.id) {
      titleText = this.props.intl.formatMessage({ id: title.props.id, values: title.props.value });
    }
    if (MenuStore.activeMenu && this.props.location.pathname !== '/') {
      setTimeout(() => {
        document.getElementsByTagName('title')[0].innerText = `${titleText && titleText !== MenuStore.activeMenu.name ? `${titleText} – ` : ''}${MenuStore.activeMenu.name} – ${MenuStore.activeMenu.parentName} – ${AppState.menuType.type !== 'site' ? `${AppState.menuType.name} – ` : ''} ${AppState.getSiteInfo.systemTitle || AppState.getSiteInfo.defaultTitle}`;
      }, 500);
    }
  }

  render() {
    const { backPath, children, className } = this.props;
    let backBtn = null;
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
        {children}
      </div>
    );
  }
}
