import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon, Menu, Dropdown } from 'choerodon-ui';
import classNames from 'classnames';
import './style';

@withRouter
@inject('MenuStore', 'AppState')
@observer
export default class Nav extends Component {
  handleLink(tab) {
    const { MenuStore, AppState: { isTabMode } } = this.props;
    const { selectedKeys } = MenuStore;
    // const isReact = tab.symbol === 'REACT';
    const type = tab.symbol;

    if (selectedKeys.length && selectedKeys[0] === tab.functionCode && isTabMode) return;
    
    const LINK_MAP = {
      REACT: `/${tab.url}`,
      HTML: `/iframe/${tab.functionCode}`,
    };
    const link = LINK_MAP[type] || '/';
    // const link = isReact
    //   ? `/${tab.url}`
    //   : `/iframe/${tab.functionCode}`;
    this.props.history.push(link);
    if (link === '/') {
      MenuStore.setActiveMenu({});
    }
  }

  handleCloseTab(tab, event) {
    const { MenuStore } = this.props;
    const { selectedKeys } = MenuStore;
    if (event) event.stopPropagation();
    if (selectedKeys.length && selectedKeys[0] === tab.functionCode) {
      const desTab = MenuStore.getNextTab(tab);
      let desUrl;
      if (desTab.functionCode !== 'HOME_PAGE') {
        const LINK_MAP = {
          REACT: `/${desTab.url}`,
          HTML: `/iframe/${desTab.functionCode}`,
        };
        // if (desTab.symbol === '1') {
        //   desUrl = `/${desTab.url}`;
        // } else {
        //   desUrl = `/iframe/${desTab.functionCode}`;
        // }
        desUrl = LINK_MAP[desTab.symbol];
      } else {
        desUrl = '/';
        MenuStore.setActiveMenu({});
      }
      this.props.history.push(desUrl);
    }
    MenuStore.closeTabAndClearCacheByCacheKey(tab);
  }

  render() {
    const { location: { pathname }, MenuStore, AppState: { isTabMode } } = this.props;
    const { tabs, activeMenu, collapsed } = MenuStore;

    const isHome = pathname === '/';
    const activeIndex = tabs.findIndex(tab => pathname === `/${tab.url}` || pathname === `/iframe/${tab.functionCode}`);

    return (
      isTabMode ? null : (
        <Dropdown
          trigger={['click']}
          overlay={(
            <ul className="nav-wrapper">
              {
                tabs.filter(v => !!v).map((tab, i) => (
                  <li
                    key={tab.functionCode}
                    className={classNames({
                      tab: true,
                      'tab-active': pathname === `/${tab.url}` || pathname === `/iframe/${tab.functionCode}`,
                      'tab-hover': pathname !== `/${tab.url}` && pathname !== `/iframe/${tab.functionCode}`,
                      'tab-active-before': activeIndex >= 1 && i === activeIndex - 1,
                      'tab-active-after': activeIndex >= 0 && i === activeIndex + 1,
                    })}
                    onClick={this.handleLink.bind(this, tab)}
                  >
                    <div className="li-wrapper" style={{ positon: 'relative' }}>
                      <div
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {tab.text}
                      </div>
                      {
                        tab.functionCode === 'HOME_PAGE' ? null : (
                          <Icon
                            type="close"
                            style={{ fontSize: 14, marginLeft: 20 }}
                            onClick={this.handleCloseTab.bind(this, tab)}
                          />
                        )
                      }
                    </div>
                  </li>
                ))}
            </ul>
          )}
        >
          <span className="header-nav-action">
            <span>页面导航</span>
            <Icon type="baseline-arrow_drop_down" />
          </span>
        </Dropdown>
      )
    );
  }
}
