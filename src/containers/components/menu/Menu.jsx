/*eslint-disable*/
import React, { Component } from 'react';
import { Icon, Menu, Tooltip } from 'choerodon-ui';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import queryString from 'query-string';
import classNames from 'classnames';
import MenuStore from '../../stores/MenuStore';
import HeaderStore from '../../stores/HeaderStore';
import './style';
import findFirstLeafMenu from '../util/findFirstLeafMenu';

const { SubMenu, Item } = Menu;

@inject('AppState')
@observer
class CommonMenu extends Component {

  savedOpenKeys = [];

  state = {
    collapsed: true,
    activeMenu: null,
    selected: null,
  };

  componentWillMount() {
    this.loadMenu(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadMenu(nextProps);
  }

  loadMenu(props) {
    const { location, AppState, history } = props;
    const { pathname, search } = location;
    if (pathname !== '/') {
      const menuType = { type: 'site' };
      let newIsUser = false;
      if (search) {
        const { type, name, id, organizationId } = queryString.parse(search);
        newIsUser = type === 'site';
        if (type) {
          menuType.type = type;
        }
        if (name) {
          menuType.name = name;
        }
        if (id) {
          menuType.id = id;
          if (type === 'project') {
            menuType.projectId = id;
          } else if (type === 'organization') {
            menuType.organizationId = id;
          }
        }
        if (type === 'project' && organizationId) {
          menuType.organizationId = organizationId;
        }
      }
      AppState.setTypeUser(newIsUser);
      AppState.changeMenuType(menuType);
        MenuStore.loadMenuData(menuType).then(menus => {
          MenuStore.treeReduce({ subMenus: menus }, (menu, parents) => {
            if (menu.route === pathname || pathname.indexOf(`${menu.route}/`) === 0) {
              this.setState({
                activeMenu: menu,
                selected: parents[0],
                openKeys: this.state.collapsed ? [] : parents.map(({ code }) => code),
              });
              return true;
            }
            return false;
          });
        });
    } else {
      AppState.setTypeUser(false);
      const recent = HeaderStore.getRecentItem;
      if (recent.length && !sessionStorage.home_first_redirect) {
        const { id, name, type, organizationId } = recent[0];
        AppState.changeMenuType({ id, name, type, organizationId });
        MenuStore.loadMenuData().then(menus => {
          if (menus.length) {
            const { route, domain } = findFirstLeafMenu(menus[0]);
            let path = `${route}?type=${type}&id=${id}&name=${name}`;
            if (organizationId) {
              path += `&organizationId=${organizationId}`;
            }
            Choerodon.historyReplaceMenu(history, path, domain);
          }
        });
      } else {
        AppState.changeMenuType({});
      }
      sessionStorage.home_first_redirect = 'yes';
    }
  }

  getMenuSingle(data, num) {
    if (!data.subMenus) {
      const link = (
        <Link
          to={this.getMenuLink(data)}
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

  getMenuLink(service) {
    const { route } = service;
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

  handleClick = (e) => {
    const child = MenuStore.getMenuData;
    const selected = child.find(({ code }) => code === e.key);
    if (selected) {
      MenuStore.treeReduce(selected, (menu, parents, index) => {
        if (index === 0 && !menu.subMenus) {
          this.setState({
            activeMenu: menu,
            selected,
            openKeys: [selected, ...parents].map(({ code }) => code),
          });
          return true;
        }
        return false;
      });
    }
    this.collapseMenu();
  };

  handleOpenChange = (openKeys) => {
    this.setState({
      openKeys,
    });
  };

  collapseMenu = () => {
    this.props.AppState.setMenuExpanded(false);
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
      return (
        <div className={`common-menu-left ${expanded ? 'expanded' : ''}`}>
          <div
            className="common-menu-left-header"
            role="none"
          >
            <Link to="/" onClick={this.collapseMenu}><Icon type="home" /><span>主页</span></Link>
          </div>
          <div className="common-menu-right-content">
            <Menu onClick={this.handleClick} selectedKeys={[selected.code]}>
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
    return (
      <Item key={item.code}>
        {icon}
        {text}
      </Item>
    );
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
    let child = MenuStore.getMenuData;
    if (child && child.length > 0) {
      const { AppState } = this.props;
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

export default withRouter(CommonMenu);
