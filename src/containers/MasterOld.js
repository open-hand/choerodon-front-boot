/**
 *create by mading on 2018/4/4
 */
/**
 * Created by jaywoods on 2017/6/23.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import AutoRouter from 'AutoRouter';
import CommonMenu from 'CommonMenu';
import IsAuthSpin from 'IsAuthSpin';
import MasterHeader from 'MasterHeader';

import { Tooltip } from 'antd';

import menuStore from 'menuStore';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

@inject('AppState')
@observer
class Masters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectFlag: true,
      organizationFlag: true,
    };
  }

  componentWillMount() {
    const { AppState } = this.props;
    menuStore.loadMenuTypeDate().then((res) => {
      const data = res.organizations;
      const projects = res.projects;
      data.map((item) => {
        const it = item;
        it.key = `organization${item.id}`;
        it.type = ORGANIZATION_TYPE;
        it.children = [];
        projects.map((project) => {
          const p = project;
          if (item.id === project.organizationId) {
            p.type = PROJECT_TYPE;
            p.key = `project${project.id}`;
            item.children.push(project);
          }
          return project;
        });
        return data;
      });
      menuStore.setMenuTypeData(data);
      // 如果有组织
      if (data && data.length !== 0) {
        // 如果只有一个组织 并且只有一个项目
        if (data.length === 1 && data[0].children.length === 1) {
          const defaultOrganization1 = data[0];
          const menuType1 = {
            id: defaultOrganization1.id,
            type: ORGANIZATION_TYPE,
            name: defaultOrganization1.name,
          };
          const urlObject1 = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
          // 如果当前在一个页面上
          if (urlObject1 !== null) {
            AppState.changeMenuType(urlObject1);
            sessionStorage.menuType = JSON.stringify(urlObject1);
            sessionStorage.type = urlObject1.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${urlObject1.type}/new?domain=true`);
              sessionStorage.user = '';
            }
          } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
            // 如果session没有数据
            AppState.changeMenuType(menuType1);
            sessionStorage.menuType = JSON.stringify(menuType1);
            sessionStorage.type = menuType1.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${menuType1.type}/new?domain=true`);
              sessionStorage.user = '';
            }
          } else {
            // 如果session有数据
            AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
            if (sessionStorage.type !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${JSON.parse(sessionStorage.menuType).type}/new?domain=true`);
              sessionStorage.user = '';
            }
          }
        } else {
          const defaultOrganization = data[0];
          const menuType = {
            id: defaultOrganization.id,
            type: ORGANIZATION_TYPE,
            name: defaultOrganization.name,
          };
          const urlObject = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
          if (urlObject !== null) {
            AppState.changeMenuType(urlObject);
            sessionStorage.menuType = JSON.stringify(urlObject);
            sessionStorage.type = urlObject.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${urlObject.type}/new?domain=true`);
              sessionStorage.user = '';
            }
          } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
            AppState.changeMenuType(menuType);
            sessionStorage.menuType = JSON.stringify(menuType);
            sessionStorage.type = menuType.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${menuType.type}/new?domain=true`);
              sessionStorage.user = '';
            }
          } else {
            AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
            if (sessionStorage.type !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${JSON.parse(sessionStorage.menuType).type}/new?domain=true`);
              sessionStorage.user = '';
            } else if (sessionStorage.user === 'user') {
              menuStore.loadMenuData('/uaa/v1/menus/user?domain=true');
              sessionStorage.user = 'user';
            } else {
              menuStore.loadMenuData('/uaa/v1/menus/global/new?domain=true');
            }
          }
        }
      } else if (projects && projects.length !== 0) {
        // 如果没有组织
        const defaultProject = projects[0];
        const menuType = {
          id: defaultProject.id,
          type: PROJECT_TYPE,
          organizationId: defaultProject.organizationId,
          name: defaultProject.name,
        };
        const urlObject = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
        if (urlObject !== null) {
          AppState.changeMenuType(urlObject);
          sessionStorage.menuType = JSON.stringify(urlObject);
          sessionStorage.type = urlObject.type;
          if (AppState.getType !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
          }
        } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
          AppState.changeMenuType(menuType);
          sessionStorage.menuType = JSON.stringify(menuType);
          sessionStorage.type = menuType.type;
          if (AppState.getType !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
          }
        } else {
          AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
          if (sessionStorage.type !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
          }
        }
      }
    });
  }

  componentDidMount() {
    const { AppState } = this.props;
    AppState.loadUserInfo();
    window.addEventListener('resize', this.ChangeContent.bind(this));
    const el = document.getElementById('autoRouter');
    document.addEventListener('keyup', (e) => {
      if (e.which === 27) {
        el.style.position = 'absolute';
        el.style.width = widths;
      }
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.ChangeContent.bind(this));
  }

  getStyles() {
    const { AppState } = this.props;
    const styles = {
      main: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        zIndex: 100,
      },
      body: {
        flex: '1 1 0%',
        display: 'flex',
      },
      titleStyle: {
        fontSize: '18px',
      },

      listItem: {
        paddingTop: '0',
        paddingBottom: '0',
        paddingRight: '0',
      },
      iconMenu: {
        width: '280px',
      },
      help: {
        marginTop: '12px',
        fontSize: '12px',
      },
      signOut: {
        marginTop: '12px',
        // minWidth: '65px',
        fontSize: '12px',
      },
      personalInfo: {
        marginTop: '12px',
        marginBottom: '8px',
        textAlign: 'center',
      },
      rsButtonDiv: {
        backgroundColor: '#F5F5F5',
        height: '60px',
      },
      labelStyle: {
        fontSize: '12px',
      },
      cascader: {
        width: '95px',
        position: 'absolute',
        top: '10px',
        right: '100px',
        zIndex: 1100,
      },
      content: {
        flex: '1 1 0',
        order: 2,
        flexDirection: 'column',
        height: window.innerHeight - 48,
        backgroundColor: 'white',
        position: 'absolute',
        left: AppState.getSingle ? '231px' : '280px',
        width: AppState.getSingle ? 'calc(100% - 231px)' : 'calc(100% - 280px)',
      },
      resourceMenu: {
        order: 1,
        zIndex: 3,
        backgroundColor: '#fafafa',
      },
      mainMenu: {
        flex: 'none',
        width: '16em',
        height: '100%',
        position: 'absolute',
        left: '0',
        float: 'left',
        zIndex: '6',
      },
      menuIcon: {
        lineHeight: '22px',
        margin: '10px',
        marginLeft: '-12px',
        fontSize: '15px',
        textAlign: 'center',
      },
      container: {
        display: 'flex',
        // flex: '1 1 auto',
        width: '100%',
        backgroundColor: Choerodon.setTheme('backgroundColor') || 'white',
      },
      menuStyle: {
        height: '100%',
      },
    };

    return styles;
  }
  ChangeContent() {
    if (this.content) {
      this.content.style.height = `${window.innerHeight - 48}px`;
    }
  }
  Content(instance) {
    this.content = instance;
  }

  render() {
    const styles = this.getStyles();
    const paperStyle = {
      height: '100%',
    };
    return (
      <IsAuthSpin>
        <div style={styles.main}>
          <div style={{ height: '47px' }}>
            <MasterHeader />
          </div>
          <div style={styles.body}>
            <div style={styles.container}>
              <div style={paperStyle} id="menu">
                <CommonMenu />
                {/* <MainMenu /> */}
              </div>
              <div id="autoRouter" style={styles.content} ref={this.Content.bind(this)}>
                <AutoRouter />
              </div>
              {/* <ResourceMenu id="menuItem" /> */}
            </div>
          </div>
        </div>
      </IsAuthSpin>
    );
  }
}

export default Masters;
