import React, { Component } from 'react';
import { get } from 'mobx';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Menu, Button, Tooltip } from 'choerodon-ui/pro';
import { getLinkByMenuType, getKeyAndTypeByLink } from './util';
import './style';

const { SubMenu } = Menu;

@withRouter
@inject('MenuStore')
@observer
export default class CommonMenu extends Component {
  savedOpenKeys = [];

  code = 'site';

  componentWillMount() {
    const { MenuStore, history } = this.props;
    this.loadMenu(this.props);
    MenuStore.setHistory(history);
  }

  componentWillReceiveProps(nextProps) {
    this.loadMenu(nextProps);
  }

  loadMenu(props) {
    const { location: { pathname }, MenuStore } = props;
    const { collapsed } = MenuStore;

    const { key, type } = getKeyAndTypeByLink(pathname);

    MenuStore.loadMenus().then((menus) => {
      if (pathname === '/') {
        MenuStore.setSelectedKeys([]);
        MenuStore.setActiveMenu({});
        return;
      }
      MenuStore.getPathById(key, menus, type, (temppath, targetNode) => {
        MenuStore.setOpenKeys(collapsed ? [] : temppath);
        this.savedOpenKeys = temppath;
        MenuStore.setSelectedKeys([targetNode.code]);
        MenuStore.setActiveMenu(targetNode);
      }, () => {
        MenuStore.setSelectedKeys([key]);
        MenuStore.setActiveMenu({
          code: key,
        });
      });
    });
  }

  onOpenChange = (openKeys) => {
    const { MenuStore } = this.props;
    MenuStore.setOpenKeys(openKeys);
  }

  onCollapsed = () => {
    const { MenuStore } = this.props;
    const { collapsed, openKeys } = MenuStore;
    if (collapsed) {
      MenuStore.setCollapsed(false);
      MenuStore.setOpenKeys(this.savedOpenKeys);
    } else {
      this.savedOpenKeys = openKeys;
      MenuStore.setCollapsed(true);
      MenuStore.setOpenKeys([]);
    }
  }

  onClickHome = () => {
    const { history, MenuStore } = this.props;
    MenuStore.setActiveMenu({});
    history.push('/');
  }

  renderMenu(menu, num) {
    if (menu.subMenus) {
      const { code, name, icon } = menu;
      return (
        <SubMenu
          key={code}
          title={[
            <Icon type={icon} key={`${code}-icon`} />,
            <span key={`${code}-name`}>{name}</span>,
          ]}
        >
          {menu.subMenus.map(submenu => this.renderMenu(submenu, parseInt(num, 10) + 1))}
        </SubMenu>
      );
    }
    return this.renderMenuItem(menu, num);
  }

  renderMenuItem(menuItem, num) {
    const { code, name, pagePermissionType, route, icon } = menuItem;
    const link = getLinkByMenuType(pagePermissionType, route, code);
    return (
      <Menu.Item key={code}>
        <Link to={link}>
          <Icon type={icon} />
          <span>{name}</span>
        </Link>
      </Menu.Item>
    );
  }

  render() {
    const { MenuStore } = this.props;
    const { collapsed, openKeys, selectedKeys } = MenuStore;
    const menus = get(MenuStore.menus, this.code);
    return (
      <div className={classNames('menu-content', { 'menu-collapsed': collapsed })}>
        <Tooltip placement="right" title={collapsed ? '首页' : undefined}>
          <div
            className={classNames('menu-head', { 'menu-collapsed': collapsed })}
            role="none"
            onClick={this.onClickHome}
          >
            <Icon type="home" />
            {collapsed ? null : <span>首页</span>}
          </div>
        </Tooltip>
        <div className="menu-body">
          <Menu
            theme="light"
            mode="inline"
            inlineCollapsed={collapsed}
            openKeys={openKeys.slice()}
            selectedKeys={selectedKeys.slice()}
            onOpenChange={this.onOpenChange}
          >
            {menus.map(menu => this.renderMenu(menu, 0))}
          </Menu>
        </div>
        <div
          className="menu-footer"
          onClick={this.onCollapsed}
        >
          <Icon type={!collapsed ? 'first_page' : 'last_page'} />
        </div>
      </div>
    );
  }
}
