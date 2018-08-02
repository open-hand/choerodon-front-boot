/*eslint-disable*/
import React, { Component } from 'react';
import { Icon, Menu, Tooltip } from 'choerodon-ui';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import findFirstLeafMenu from '../util/findFirstLeafMenu';
import { dashboard, historyReplaceMenu } from '../../common';
import './style';

const { SubMenu, Item } = Menu;

@withRouter
@inject('AppState', 'MenuStore', 'HeaderStore')
@observer
export default class CommonMenu extends Component {

  savedOpenKeys = [];

  state = {
    collapsed: false,
    activeMenu: null,
    selected: null,
    leftOpenKeys: [],
  };

  componentWillMount() {
    this.loadMenu(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadMenu(nextProps);
  }

  loadMenu(props) {
    const { location, AppState, MenuStore } = props;
    const { currentType, currentIsUser, currentId, selected, collapsed } = this.state;
    const { pathname } = location;
    const { type, id } = AppState.currentMenuType;
    if (type) {
      MenuStore.loadMenuData().then(menus => {
        const isUser = AppState.isTypeUser;
        if (pathname === '/') {
          this.setState({
            activeMenu: null,
            selected: selected ? menus.find(({ code }) => code === selected.code) || menus[0] : menus[0],
            currentType: type,
            currentId: id,
            currentIsUser: isUser,
            openKeys: [],
          });
        } else {
          MenuStore.treeReduce({ subMenus: menus }, (menu, parents) => {
            if (menu.route === pathname || pathname.indexOf(`${menu.route}/`) === 0) {
              const newState = {
                activeMenu: menu,
                selected: parents[0],
                currentType: type,
                currentId: id,
                currentIsUser: isUser,
              };
              const nCode = parents.length && parents.reverse()[0].code;
              const oCode = selected && selected.code;
              if (
                oCode !== nCode ||
                currentType !== type ||
                isUser !== currentIsUser ||
                currentId !== id) {
                newState.openKeys = collapsed ? [] : [menu, ...parents].map(({ code }) => code);
                this.savedOpenKeys = [menu, ...parents].map(({ code }) => code);
              }
              this.setState(newState);
              return true;
            }
            return false;
          });
        }
      });
    }
  }

  getMenuSingle(data, num) {
    if (!data.subMenus) {
      const { route } = findFirstLeafMenu(data);
      const link = (
        <Link
          to={this.getMenuLink(route)}
          style={{
            marginLeft: parseInt(num, 10) * 20,
          }}
        >
          <Icon type={data.icon} />
          <span>
            {data.name}
          </span>
        </Link>
      );
      return (
        <Item
          key={data.code}
        >
          {this.TooltipMenu(link, data.code)}
        </Item>
      );
    } else {
      return (
        <SubMenu
          key={data.code}
          className="common-menu-right-popup"
          title={
            <span
              style={{
                marginLeft: parseInt(num, 10) * 20,
              }}
            >
              <Icon type={data.icon} />
              <span>
                {data.name}
              </span>
            </span>
          }
        >
          {data.subMenus.map(
            two => this.getMenuSingle(two, parseInt(num, 10) + 1),
          )}
        </SubMenu>
      );
    }
  }

  TooltipMenu(reactNode, code) {
    const { AppState } = this.props;
    if (AppState.getDebugger) {
      return (
        <Tooltip defaultVisible="true" trigger="hover" placement="right">
          {reactNode}
        </Tooltip>
      );
    } else {
      return reactNode;
    }
  }

  getMenuLink(route) {
    const { AppState } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    let search = '';
    switch (type) {
      case 'site':
        if (AppState.isTypeUser) {
          search = `?type=site`;
        }
        break;
      case 'organization':
      case 'project':
        search = `?type=${type}&id=${id}&name=${encodeURIComponent(name)}`;
        if (organizationId) {
          search += `&organizationId=${organizationId}`;
        }
        break;
      default:
    }
    return `${route}${search}`;
  }

  findSelectedMenuByCode(child, code) {
    let selected = false;
    child.forEach((item) => {
      if (selected) {
        return;
      }
      if (item.code === code) {
        selected = item;
      } else if (item.subMenus) {
        selected = this.findSelectedMenuByCode(item.subMenus, code);
      }
    });
    return selected;
  }

  handleClick = (e) => {
    const { MenuStore } = this.props;
    const child = MenuStore.getMenuData;
    const selected = this.findSelectedMenuByCode(child, e.key);
    const paths = e.keyPath && e.keyPath.reverse()[0]; // 去掉boot的
    const selectedRoot = paths ? child.find((item) => item.code === paths) : selected;
    if (selected) {
      const { history } = this.props;
      MenuStore.treeReduce(selectedRoot, (menu, parents, index) => {
        if (index === 0 && !menu.subMenus) {
          this.setState({
            activeMenu: selected,
            selected: selectedRoot,
            openKeys: [selected, ...parents].map(({ code }) => code),
          });
          return true;
        }
        return false;
      });
      const { route, domian } = findFirstLeafMenu(selected);
      const link = this.getMenuLink(route);
      historyReplaceMenu(history, link, domian);
    }
    this.collapseMenu();
  };

  handleOpenChange = (openKeys) => {
    this.setState({
      openKeys,
    });
  };

  handleLeftOpenChange = (leftOpenKeys) => {
    this.setState({
      leftOpenKeys,
    });
  };

  collapseMenu = () => {
    this.setState({
      leftOpenKeys: [],
    }, () => {
      this.props.AppState.setMenuExpanded(false);
    });
  };

  toggleRightMenu = () => {
    const { collapsed, openKeys } = this.state;
    if (collapsed) {
      this.setState({
        collapsed: false,
        openKeys: this.savedOpenKeys,
      });
    } else {
      this.savedOpenKeys = openKeys;
      this.setState({
        collapsed: true,
        openKeys: [],
      });
    }
  };

  renderLeftMenu(child, selected, expanded) {
    if (child.length > 0) {
      let homePath = '/';
      if (dashboard) {
        const { type, id, name, organizationId } = this.props.AppState.currentMenuType;
        if (type) {
          homePath = `${homePath}?type=${type}&id=${id}&name=${name}`;
          if (organizationId) {
            homePath += `&organizationId=${organizationId}`;
          }
        }
      }
      return (
        <div className={`common-menu-left ${expanded ? 'expanded' : ''}`}>
          <div
            className="common-menu-left-header"
            role="none"
          >
            <Link to={homePath} onClick={this.collapseMenu}><Icon type="home" /><span>主页</span></Link>
          </div>
          <div className="common-menu-right-content">
            <Menu
              onClick={this.handleClick}
              openKeys={this.state.leftOpenKeys}
              onOpenChange={this.handleLeftOpenChange}
              selectedKeys={[selected.code]}
              mode="vertical"
            >
              {child.map(item => this.renderLeftMenuItem(item, expanded))}
            </Menu>
          </div>
        </div>
      );
    }
  }

  renderLeftMenuItem(item, expanded) {
    let icon = <Icon type={item.icon} />;
    let text;
    if (expanded) {
      text = <span>{item.name}</span>;
    } else {
      icon = (
        <Tooltip placement="right" title={item.name}>
          {icon}
        </Tooltip>
      );
    }
    if (!item.subMenus) {
      return (
        <Item key={item.code}>
          {icon}
          {text}
        </Item>
      );
    } else {
      return (
        <SubMenu
          onTitleClick={this.handleClick}
          key={item.code}
          className="common-menu-right-popup"
          title={
            <span>
              {icon}
              {text}
            </span>
          }
        >
          {item.subMenus.map(two => {
            return (
              <Item key={two.code}>
                <Icon type={two.icon} style={{ marginLeft: '20px' }} />
                <span>{two.name}</span>
              </Item>
            );
          })}
        </SubMenu>
      );
    }
  }

  renderRightMenu(menu) {
    const { collapsed, openKeys, activeMenu } = this.state;
    return (
      <div className={classNames('common-menu-right', { collapsed })}>
        <Tooltip placement="right" title={collapsed ? menu.name : ''}>
          <div className="common-menu-right-header">
            <Icon type={menu.icon} />
            <span>{menu.name}</span>
          </div>
        </Tooltip>
        <div className="common-menu-right-content">
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[activeMenu && activeMenu.code]}
            openKeys={openKeys}
            onOpenChange={this.handleOpenChange}
          >
            {menu.subMenus.map(two => this.getMenuSingle(two, 0))}
          </Menu>
        </div>
        <div className="common-menu-right-footer" onClick={this.toggleRightMenu}>
          <Icon type="first_page" />
        </div>
      </div>
    );
  }

  render() {
    // 服务的菜单
    const { MenuStore, AppState } = this.props;
    const child = MenuStore.getMenuData;
    if (child && child.length > 0) {
      const { selected } = this.state;
      const expanded = AppState.getMenuExpanded;
      const mask = expanded && (
        <div
          role="none"
          onClick={this.collapseMenu}
          className="common-menu-mask"
        />
      );
      return (
        <div style={{ height: '100%' }}>
          <div className="common-menu">
            {this.renderLeftMenu(child, selected || child[0], expanded)}
            {this.renderRightMenu(selected || child[0])}
          </div>
          {mask}
        </div>
      );
    } else {
      return null;
    }
  }
}
