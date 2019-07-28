import React, { Component, createElement } from 'react';
import { configure } from 'choerodon-ui';
import { Button, Icon, Input, Modal, Select, Table, Tabs } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { toJS } from 'mobx';
import classnames from 'classnames';
import { UI_CONFIGURE, CUSTOM_THEME_COLOR } from '../../../common/constants';
import { dashboard } from '../../../common';
import uiAxios from '../axios/UiAxios';
import findFirstLeafMenu from '../../util/findFirstLeafMenu';
import { historyPushMenu } from '../../../common';
import { PREFIX_CLS } from '../../../common/constants';
import Content from '../page/Content';
import Page from '../page/Page';

const { TabPane } = Tabs;
const { Option } = Select;
const prefixCls = `${PREFIX_CLS}-boot-header-menu-type`;

@withRouter
@inject('AppState', 'HeaderStore', 'MenuStore')
@observer
class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterOrganization: '',
      searchValue: '',
      handlesearch: false,
      expandRowKey: [],
      collapseRowKey: [],
      activeKey: null,
    };
  }

  selectState = (value) => {
    const { AppState, HeaderStore, MenuStore, history } = this.props;
    const { id, name, type, organizationId, category } = value;
    HeaderStore.setRecentItem(value);
    MenuStore.loadMenuData({ type, id }, false).then((menus) => {
      let route;
      let path;
      let domain;
      if (menus.length) {
        const { route: menuRoute, domain: menuDomain } = findFirstLeafMenu(menus[0]);
        route = menuRoute;
        domain = menuDomain;
      }
      if (route) {
        path = `/?type=${type}&id=${id}&name=${encodeURIComponent(name)}${category ? `&category=${category}` : ''}`;
        if (organizationId) {
          path += `&organizationId=${organizationId}`;
        }
      }
      if (path) {
        historyPushMenu(history, path, domain);
      }
    });
    AppState.setMenuExpanded(false);
    HeaderStore.setMenuTypeVisible(false);
  };

  getIconType = (record, isOut) => {
    if (record && record.type === 'project') {
      switch (record.category) {
        case 'AGILE': return isOut ? 'project_filled' : 'project_line';
        case 'PROGRAM': return 'project_group';
        case 'ANALYTICAL': return 'project_program_analyze';
        default: return isOut ? 'project_filled' : 'project_line';
      }
    } else {
      return 'domain';
    }
  };

  getTypeString = (record) => {
    if (record.type === 'project') {
      switch (record.category) {
        case 'AGILE': return '敏捷项目';
        case 'PROGRAM': return '普通项目群';
        case 'ANALYTICAL': return '分析型项目群';
        default: return 'project';
      }
    } else {
      return '组织'; // style fix
    }
  };

  getCurrentData() {
    const { HeaderStore } = this.props;
    const { filterOrganization, handlesearch, searchValue } = this.state;
    const needFilterOrganization = filterOrganization !== '' && filterOrganization !== 'total';
    const orgData = toJS(HeaderStore.getOrgData);
    const proData = toJS(HeaderStore.getProData);
    if (orgData && proData) {
      return orgData.filter((item) => {
        const { id } = item;
        if (needFilterOrganization && Number(id) !== Number(filterOrganization)) {
          return false;
        }
        item.key = id;
        item.children = [];
        proData.forEach((item2) => {
          const { id: id2, organizationId } = item2;
          item2.key = `${id},${id2}`;
          if (Number(organizationId) === Number(id) && (!handlesearch || this.hitSearch(item2, searchValue))) {
            item.children.push(item2);
          }
        });
        if (!item.children.length) {
          delete item.children;
        }
        if (!item.children && ((handlesearch && !this.hitSearch(item, searchValue)) || item.into === false)) {
          return false;
        }
        return true;
      });
    }
    return orgData;
  }

  renderTable(dataSource, isNotRecent) {
    const { HeaderStore } = this.props;
    if (dataSource && dataSource.length) {
      const columns = [{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: '220px',
        render: (text, record) => (
          record.into === false ? (
            <span className={`${prefixCls}-disabled`}>
              {text}
            </span>
          ) : (
            <React.Fragment>
              <span className="c7n-table-row-expand-icon c7n-table-row-spaced" />
              <a
                role="none"
                onClick={this.selectState.bind(this, record)}
              >
                <Icon type={this.getIconType(record)} />
                {text}
              </a>
            </React.Fragment>
          )
        ),
      }, {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
        width: '120px',
        render: (text, record) => {
          if (record.into === false) {
            return (
              <span className={`${prefixCls}-disabled`}>
                {text}
              </span>
            );
          }
          return text;
        },
      }, {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 116,
        render: (text, record) => {
          if (record.into === false) {
            return (
              <span className={`${prefixCls}-disabled`}>
                {this.getTypeString(record)}
              </span>
            );
          }
          return this.getTypeString(record);
        },
      }];
      const onTableRow = (record) => {
        if (record.into === false) {
          return {};
        }
        return {
          onDoubleClick: () => {
            this.selectState(record);
          },
          onClick: () => {
            HeaderStore.setSelected(record);
            if (isNotRecent) {
              this.handleExpand(record);
            }
          },
        };
      };
      return (
        <Table
          columns={columns}
          dataSource={dataSource}
          // filterBar={false}
          onRow={onTableRow}
          pagination={isNotRecent && dataSource.length > 10 ? { defaultPageSize: 10 } : false}
          // scroll={{ y: isNotRecent && dataSource.length > 30 ? 300 : 330 }}
          // fixed
        />
      );
    } else {
      return (
        <div className={`${prefixCls}-empty`}>
          您还没有在任何项目中被分配角色
        </div>
      );
    }
  }

  renderModalContent() {
    const { AppState } = this.props;
    const { type, id } = AppState.currentMenuType;
    const currentData = this.getCurrentData() || [];
    const currentOrg = currentData.find(v => String(v.id) === id && v.type === 'organization');
    let projectArr = [];
    if (currentOrg) {
      projectArr = currentOrg.children || [];
    }
    return (
      <div>
        {this.renderTable(projectArr, true)}
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Content>
          {this.renderModalContent()}
        </Content>
      </Page>
    );
  }
}

export default Projects;
