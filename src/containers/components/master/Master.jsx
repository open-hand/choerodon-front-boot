import React, { Component, createElement } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Spin, Steps } from 'choerodon-ui';
import queryString from 'query-string';
import CommonMenu from '../menu';
import MasterHeader from '../header';
import AnnouncementBanner from '../header/AnnouncementBanner';
import AppState from '../../stores/AppState';
import { dashboard, historyReplaceMenu } from '../../common';
import findFirstLeafMenu from '../util/findFirstLeafMenu';
import './style';
import Guide from '../guide/Guide';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

const outwardPath = ['/organization/register-organization', '/organization/register-organization/agreement'];

function parseQueryToMenuType(search) {
  const menuType = {};
  if (search) {
    const { type, name, id, organizationId, category } = queryString.parse(search);
    if (type) {
      menuType.type = type;
    }
    if (category) {
      menuType.category = category;
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

  return menuType;
}

@withRouter
@inject('AppState', 'MenuStore', 'HeaderStore')
@observer
class Masters extends Component {
  componentWillMount() {
    this.initMenuType(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.initMenuType(nextProps);
  }

  componentDidMount() {
    const { pathname } = this.props.location;
    const { getUserId } = this.props.AppState;
    this.initFavicon();
    if (pathname.includes('access_token') && pathname.includes('token_type') && localStorage.getItem(`historyPath-${getUserId}`)) {
      window.location = `/#${localStorage.getItem(`historyPath-${getUserId}`)}`;
    }
  }

  initFavicon() {
    AppState.loadSiteInfo().then((data) => {
      const link = document.createElement('link');
      const linkDom = document.getElementsByTagName('link');
      if (linkDom) {
        for (let i = 0; i < linkDom.length; i += 1) {
          if (linkDom[i].getAttribute('rel') === 'shortcut icon') document.head.removeChild(linkDom[i]);
        }
      }
      link.id = 'dynamic-favicon';
      link.rel = 'shortcut icon';
      link.href = data.favicon || 'favicon.ico';
      document.head.appendChild(link);
      data.defaultTitle = document.getElementsByTagName('title')[0].innerText;
      if (data.systemTitle) {
        document.getElementsByTagName('title')[0].innerText = data.systemTitle;
      }
      AppState.setSiteInfo(data);
    });
  }


  initMenuType(props) {
    const { location, MenuStore, HeaderStore, history } = props;
    const { pathname, search } = location;
    let isUser = false;
    let needLoad = false;
    let menuType = parseQueryToMenuType(search);
    if (pathname === '/') {
      if (!dashboard) {
        const recent = HeaderStore.getRecentItem;
        if (recent.length && !sessionStorage.home_first_redirect) {
          const { id, name, type, organizationId } = recent[0];
          menuType = { id, name, type, organizationId };
          needLoad = true;
        } else {
          menuType = {};
        }
        sessionStorage.home_first_redirect = 'yes';
      }
    } else if (menuType.type === 'site') {
      isUser = true;
    } else if (!menuType.type) {
      menuType.type = 'site';
    }
    AppState.setTypeUser(isUser);
    AppState.changeMenuType(menuType);
    if (needLoad) {
      MenuStore.loadMenuData().then((menus) => {
        if (menus.length) {
          const { route, domain } = findFirstLeafMenu(menus[0]);
          const { type, name, id, organizationId } = AppState.currentMenuType;
          let path = `${route}?type=${type}&id=${id}&name=${name}`;
          if (organizationId) {
            path += `&organizationId=${organizationId}`;
          }
          historyReplaceMenu(history, path, domain);
        }
      });
    }
  }

  render() {
    const { AutoRouter, GuideRouter } = this.props;
    if (outwardPath.includes(this.props.location.pathname)) {
      return (
        <div className="page-wrapper">
          <AutoRouter />
        </div>
      );
    } else {
      return (
        AppState.isAuth && AppState.currentMenuType ? (
          <div className="page-wrapper">
            <div className="page-header">
              <AnnouncementBanner />
              <MasterHeader />
            </div>
            <div className="page-body">
              <div className="content-wrapper">
                <div id="menu">
                  <CommonMenu />
                </div>
                <div id="autoRouter" className="content">
                  <AutoRouter />
                </div>
                <div id="guide" className="guide">
                  <Guide guide={GuideRouter} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={spinStyle}>
            <Spin />
          </div>
        )
      );
    }
  }
}

export default Masters;
