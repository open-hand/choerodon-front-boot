/**
 * Created by laincarl on 2017/10/31.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { Icon, Menu, Tooltip } from 'choerodon-ui';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import queryString from 'query-string';
import config from 'Config';
import MenuStore from '@/stores/MenuStore';
import HeaderStore from '@/stores/HeaderStore';
import './CommonMenu.scss';

const { SubMenu, Item } = Menu;

let styles = {
  menuIcon: {
    lineHeight: '22px',
    // margin: '10px',
    // marginLeft: '-12px',
    fontSize: '15px',
    textAlign: 'center',
  },
  // 折叠主菜单按钮颜色
  toggleButtonColor: '#4a5064',
  // 左侧菜单背景
  leftMenuBackground: '#333744',
  // 左侧子菜单背景
  menuBackground: '#EFF0F1',
  // 左侧菜单字体颜色
  leftMenuColor: '#e9e9e9',
  // 左侧菜单字体选中时的颜色
  leftMenuSelectColor: '#6a98ed',
  // 右侧菜单背景
  childMenuBackground: '#FFFFFF',
  spanLeft: {
    marginLeft: 12,
    fontSize: 13,
  },
};
if (config.theme) {
  styles = { ...styles, ...config.themeSetting };
}

@inject('AppState')
@observer
class CommonMenu extends Component {

  componentWillMount() {
    sessionStorage.setItem('permission', '[]');
    sessionStorage.setItem('permissionBackup', '[]');
    sessionStorage.setItem('permissionApprove', '[]');
    sessionStorage.setItem('permissionFlag', true);
    this.loadMenu(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadMenu(nextProps);
  }

  loadMenu(props) {
    const { location, AppState, history } = props;
    const { pathname, search } = location;
    AppState.setTypeUser(false);
    if (pathname !== '/') {
      let menuType = { type: 'site' };
      if (search) {
        const { type, name, id, organizationId } = queryString.parse(search);
        if (type) {
          AppState.setTypeUser(type === 'site');
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
      AppState.changeMenuType(menuType);
      MenuStore.loadMenuData();
    } else {
      const recent = HeaderStore.getRecentItem;
      if (recent.length && !sessionStorage.home_first_redirect) {
        const { id, name, type, organizationId } = recent[0];
        AppState.changeMenuType({ id, name, type, organizationId });
        MenuStore.loadMenuData().then(menus => {
          if (menus.length) {
            const { route, domain } = menus[0].subMenus[0];
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
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: parseInt(num, 10) * 20,
            }}
          >
            <Icon type={data.icon} />
            <span>
              {data.name}
            </span>
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
          title={
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
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
    const { AppState } = this.props;
    let child = MenuStore.getMenuData;
    for (let a = 0; a < child.length; a += 1) {
      if (child[a].code === e.key) {
        MenuStore.setChosenService(a);
        AppState.setCollapsed(false);
      }
    }
  };
  handleClickMenu = (e) => {
    MenuStore.setSelectedMenu(e.key);
  };

  changeCollapse = () => {
    const { AppState } = this.props;
    const collapsed = AppState.getCollapsed;
    AppState.setCollapsed(!collapsed);
  };

  render() {
    // 服务的菜单
    let child = MenuStore.getMenuData;
    if (child && child.length > 0) {
      const { AppState, location, history } = this.props;
      const { pathname } = location;
      AppState.setSingle(child.length === 1);
      let activeMenu;
      let selected = child.find(node => MenuStore.treeReduce(node.subMenus, menu => {
        if (menu.route === pathname || pathname.indexOf(`${menu.route}/`) === 0) {
          activeMenu = menu;
          return true;
        }
        return false;
      }));
      selected = child[MenuStore.getChosenService] || selected || child[0];
      const collapsed = AppState.getCollapsed;
      const mask = collapsed && (
        <div
          role="none"
          onClick={() => AppState.setCollapsed(false)}
          className="common-menu-mask"
        />
      );
      return (
        <div style={{ height: '100%' }}>
          <div className="common-menu">
            {this.renderLeftMenu(child, selected, collapsed)}
            {this.renderRightMenu(selected, activeMenu ? activeMenu.code : MenuStore.getSelectedMenu)}
          </div>
          {mask}
        </div>
      );
    } else {
      return <div />;
    }
  }

  renderLeftMenu(child, selected, collapsed) {
    if (child.length > 1) {
      let header;
      if (collapsed) {
        header = (
          <div>
            <Icon type="settings" />
            <span>{Choerodon.getMessage('设置', 'setting')}</span>
          </div>
        );
      } else {
        header = <Icon type="menu" />;
      }
      return (
        <div className={`common-menu-left ${collapsed ? 'collapse' : ''}`}>
          <div
            className="common-menu-left-header"
            role="none"
            onClick={this.changeCollapse.bind(this)}
          >
            {header}
          </div>
          <div className="common-menu-right-content">
            <Menu onClick={this.handleClick} selectedKeys={[selected.code]}>
              {child.map(item => this.renderLeftMenuItem(item, collapsed))}
            </Menu>
          </div>
        </div>
      );
    }
  }

  renderLeftMenuItem(item, collapsed) {
    let icon = <Icon type={item.icon} />;
    let text;
    if (collapsed) {
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

  renderRightMenu(menu, selected) {
    return (
      <div className="common-menu-right">
        <div className="common-menu-right-header">
          <Icon type={menu.icon} />
          <span>{menu.name}</span>
        </div>
        <div className="common-menu-right-content">
          <Menu
            mode="inline"
            selectedKeys={[selected]}
            onClick={this.handleClickMenu}
          >
            {menu.subMenus.map(two => this.getMenuSingle(two, 0))}
          </Menu>
        </div>
      </div>
    );
  }
}

export default withRouter(CommonMenu);
