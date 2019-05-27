import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Icon, Menu, Dropdown } from 'choerodon-ui';
import classNames from 'classnames';
import { getKeyAndTypeByLink, MENU_TYPE, getLinkByMenuType } from '../menu/util';
import './style';

const TAB_PLACEHOLDER_NAME = '临时标签页';
const MAX_WIDTH = 140;
const HIDDEN_CLOSE_WIDTH = 80;
const MIN_WIDTH = 20;

@withRouter
@inject('MenuStore', 'AppState')
@observer
export default class MenuBar extends Component {
  componentWillMount() {
    this.setIsTabMode();
    this.loadTabbar(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadTabbar(nextProps);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  loadTabbar(props) {
    const { location, MenuStore, AppState } = props;
    const { pathname, search, state } = location;
    const { activeMenu } = MenuStore;
    const { key, type } = getKeyAndTypeByLink(pathname);
    
    MenuStore.loadMenus().then((menus) => {
      if (pathname === '/') return;
      MenuStore.getPathById(key, menus, type, (temppath, targetNode) => {
        if (!targetNode) return;
        this.insertTabs(key, type, targetNode);
      }, () => {
        const construct = {
          children: null,
          code: key,
          name: (state && state.title) || {
            SYS_PREFERENCE: '用户信息',
            '/hap-core/sys/preferences': '首选项',
          }[key] || this.getNextTabName(),
          route: {
            SYS_PREFERENCE: 'sys/um/sys_user_info.html',
            '/hap-core/sys/preferences': '/hap-core/sys/preferences',
          }[key] || key,
          pagePermissionType: type,
        };
        this.insertTabs(key, type, construct);
      });
    });
  }

  setIsTabMode() {
    const { AppState } = this.props;
    AppState.loadTabMode();
  }

  getNextTabName() {
    const { MenuStore } = this.props;
    const tabs = MenuStore.getTabs;
    const tabsNameArr = _.filter(_.map(tabs, 'text'), v => v.startsWith(TAB_PLACEHOLDER_NAME));
    if (!tabsNameArr.length) return `${TAB_PLACEHOLDER_NAME}1`;

    const nums = tabsNameArr.map(v => v.slice(v.indexOf(TAB_PLACEHOLDER_NAME) + TAB_PLACEHOLDER_NAME.length));
    const nextNum = _.max(nums) * 1 + 1;
    return `${TAB_PLACEHOLDER_NAME}${nextNum}`;
  }

  insertTabs(key, type, tab) {
    if (!tab) return;
    const { MenuStore } = this.props;
    const tabs = MenuStore.getTabs;
    if (!tabs.find(v => v && v[type !== MENU_TYPE.html ? 'route' : 'code'] === key)) {
      tabs.push(tab);
      MenuStore.setTabs(tabs);
    }
  }

  handleMenuClick(tab) {
    this.handleLink(tab);
  }

  handleLink(tab, isFromFresh) {
    const { MenuStore, AppState: { isTabMode } } = this.props;
    const { selectedKeys } = MenuStore;
    const { code, route, pagePermissionType } = tab;

    if (selectedKeys.length && selectedKeys[0] === tab.functionCode && isTabMode && !isFromFresh) return;
    
    const link = getLinkByMenuType(pagePermissionType, route, code);
    this.props.history.push({
      pathname: link,
    });
    if (link === '/') {
      MenuStore.setActiveMenu({});
    }
  }

  handleCloseTab(tab, event) {
    const { MenuStore } = this.props;
    const { selectedKeys } = MenuStore;
    if (event) event.stopPropagation();
    if (selectedKeys.length && selectedKeys[0] === tab.code) {
      const desTab = MenuStore.getNextTab(tab);
      let desUrl;
      if (desTab.code !== 'HOME_PAGE') {
        const { code, route, pagePermissionType } = desTab;
        desUrl = getLinkByMenuType(pagePermissionType, route, code);
      } else {
        desUrl = '/';
        MenuStore.setActiveMenu({});
      }
      this.props.history.push(desUrl);
    }
    MenuStore.closeTabAndClearCacheByCacheKey(tab);
  }

  handleCloseCmpContainTab(tab, event) {
    const { MenuStore } = this.props;
    MenuStore.closeTabAndClearCacheByCacheKey(tab, true);
  }

  handleClickTabMenu(tab, { key }) {
    const { MenuStore, history } = this.props;
    const { tabs } = MenuStore;
    const urlKey = history.location.pathname;
    const index = tabs.findIndex(v => v.code === tab.code);
    switch (key) {
      case 'close_self':
        this.handleCloseTab(tab);
        break;
      case 'close_other':
        this.handleLink(tab);
        tabs
          .filter(v => v.code !== tab.code && v.code !== 'HOME_PAGE')
          .forEach((t) => {
            this.handleCloseTab(t);
          });
        break;
      case 'close_all':
        this.props.history.push('/');
        tabs
          .filter(v => v.code !== 'HOME_PAGE')
          .forEach((t) => {
            MenuStore.closeTabAndClearCacheByCacheKey(t);
          });
        break;
      case 'close_left':
        this.handleLink(tab);
        if (index !== undefined) {
          tabs
            .filter((v, i) => i < index && v.code !== 'HOME_PAGE')
            .forEach((t) => {
              this.handleCloseTab(t);
            });
        }
        break;
      case 'close_right':
        this.handleLink(tab);
        if (index !== undefined) {
          tabs
            .filter((v, i) => i > index && v.code !== 'HOME_PAGE')
            .forEach((t) => {
              this.handleCloseTab(t);
            });
        }
        break;
      case 'refresh':
        if (tab && tab.symbol === 'REACT') {
          MenuStore.setContentKey(urlKey, Date.now());
          // this.handleCloseCmpContainTab(tab);
          // this.handleLink(tab, true);
          // this.handleCloseCmpContainTab(tab);
          // this.props.history.push({
          //   pathname: '/',
          // });
          // setTimeout(() => this.handleLink(tab, true), 0);
          // this.handleLink(tab, true);
        } else {
          this.handleCloseTab(tab);
          this.handleLink(tab, true);
        }
        // MenuStore.setContentKey(urlKey, Date.now());
        break;
      default:
        break;
    }
  }

  handleWindowResize = _.debounce(() => {
    this.forceUpdate();
  }, 500);

  render() {
    const { location: { pathname }, MenuStore, AppState: { isTabMode } } = this.props;
    const { tabs, activeMenu, collapsed } = MenuStore;

    const isHome = pathname === '/';
    const SCREEN_WIDTH = document.body.clientWidth;
    const MAX_NUMBER = Math.floor((document.body.clientWidth - (collapsed ? 100 : 300)) / MAX_WIDTH);
    const num = tabs.length;
    const eachTabWidth = num ? (document.body.clientWidth - (collapsed ? 100 : 300)) / num : MAX_WIDTH;
    let width;
    if (num <= MAX_NUMBER) {
      width = MAX_WIDTH;
    } else if (eachTabWidth < MIN_WIDTH) {
      width = MIN_WIDTH;
    } else {
      width = eachTabWidth;
    }

    const htmlPlaceholder = '/iframe/';
    const metadataPlaceholder = '/hap-modeling/metadata/';
    const activeIndex = tabs
      .findIndex(tab => tab && pathname === (tab.pagePermissionType === MENU_TYPE.html ? `${htmlPlaceholder}${tab.code}` : `${tab.route}`));

    return (
      <div className="tab-bar-wrap">
        {
          isTabMode ? (
            <ul className="tab-bar-list">
              {
                tabs.filter(v => !!v).map((tab, i) => (
                  <Dropdown
                    trigger={['contextMenu']}
                    key={tab.functionCode}
                    placement="bottomLeft"
                    overlay={(
                      <Menu onClick={this.handleClickTabMenu.bind(this, tab)} selectedKeys={[]}>
                        {
                          tab.functionCode === 'HOME_PAGE' ? null : (
                            <Menu.Item key="close_self">
                              关闭该标签页
                            </Menu.Item>
                          )
                        }
                        {
                          pathname === `/${tab.url}` || pathname === `/iframe/${tab.functionCode}` ? (
                            <Menu.Item key="refresh">
                              刷新
                            </Menu.Item>
                          ) : null
                        }
                        <Menu.Item key="close_other">
                          关闭其他标签页
                        </Menu.Item>
                        <Menu.Item key="close_all">
                          关闭全部标签页
                        </Menu.Item>
                        <Menu.Item key="close_right">
                          关闭右侧标签页
                        </Menu.Item>
                        {
                          tab.functionCode === 'HOME_PAGE' ? null : (
                            <Menu.Item key="close_left">
                              关闭左侧标签页
                            </Menu.Item>
                          )
                        }
                      </Menu>
                    )}
                  >
                    <li
                      key={tab.functionCode}
                      className={classNames({
                        tab: true,
                        'tab-active': activeIndex === i,
                        'tab-hover': activeIndex !== i,
                        'tab-active-before': activeIndex >= 1 && i === activeIndex - 1,
                        'tab-active-after': activeIndex >= 0 && i === activeIndex + 1,
                      })}
                      style={{ width }}
                      onClick={this.handleMenuClick.bind(this, tab)}
                    >
                      <div className="li-wrapper" style={{ width, paddingLeft: 15.5, paddingRight: 13.5, positon: 'relative' }}>
                        <div
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {tab.name}
                        </div>
                        {
                          tab.functionCode === 'HOME_PAGE' || (num > MAX_NUMBER && eachTabWidth < HIDDEN_CLOSE_WIDTH && pathname !== `/${tab.url}` && pathname !== `/iframe/${tab.functionCode}`) ? null : (
                            <span
                              className="icon-wrapper"
                              style={{
                                background: activeIndex === i 
                                  ? 'linear-gradient(to right, rgba(255, 255, 255, 0), #fff 40%, #fff)'
                                  : 'linear-gradient(to right, rgba(245, 245, 245, 0), #f0f0f0 40%, #f0f0f0)',
                              }}
                            >
                              <Icon
                                type="close"
                                style={{ fontSize: 14, marginLeft: 20 }}
                                onClick={this.handleCloseTab.bind(this, tab)}
                              />
                            </span>
                          )
                        }
                      </div>
                    </li>
                  </Dropdown>
                ))
              }
            </ul>
          ) : (
            <div className="tab-bar-without-tab">
              <div>{activeMenu.name || '首页'}</div>
              {
                !isHome && (
                  <Dropdown
                    trigger={['click']}
                    // placement="bottomLeft"
                    overlay={(
                      <Menu onClick={this.handleClickTabMenu.bind(this, activeMenu)} selectedKeys={[]}>
                        <Menu.Item key="close_self">
                          关闭该标签页
                        </Menu.Item>
                        <Menu.Item key="refresh">
                          刷新
                        </Menu.Item>
                      </Menu>
                    )}
                  >
                    <span className="action">
                      <span>操作</span>
                      <Icon type="baseline-arrow_drop_down" />
                    </span>
                  </Dropdown>
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}
