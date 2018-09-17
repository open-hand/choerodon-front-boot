import React, { Component } from 'react';
import { Button, Icon, Input, Modal, Select, Table, Tabs } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { toJS } from 'mobx';
import findFirstLeafMenu from '../util/findFirstLeafMenu';
import { historyPushMenu } from '../../common';
import { PREFIX_CLS } from '../../common/constants';

const { TabPane } = Tabs;
const { Option } = Select;
const prefixCls = `${PREFIX_CLS}-boot-header-menu-type`;

function getButtonIcon(type) {
  switch (type) {
    case 'organization':
      return 'domain';
    case 'project':
      return 'project';
    default:
  }
}

@withRouter
@inject('AppState', 'HeaderStore', 'MenuStore')
@observer
export default class MenuType extends Component {
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

  // 展示modal
  showModal = () => {
    const { HeaderStore } = this.props;
    HeaderStore.setSelected(null);
    HeaderStore.setMenuTypeVisible(true);
    this.setState({
      searchValue: '',
      handlesearch: false,
    });
  };

  // 确认模态框
  handleOk = () => {
    const { HeaderStore } = this.props;
    HeaderStore.setMenuTypeVisible(false);
    this.selectState(HeaderStore.getSelected);
  };

  // 取消模态框
  handleCancel = () => {
    this.props.HeaderStore.setMenuTypeVisible(false);
  };

  // select 选择
  handleChange = (value) => {
    this.setState({
      filterOrganization: value,
      activeKey: null,
    });
  };

  handleTabChange = (activeKey) => {
    this.setState({
      activeKey,
    });
  };

  // search 搜索
  searchInput = (e) => {
    this.setState({
      searchValue: e.target.value,
    });
  };

  searchChange = () => {
    const { searchValue } = this.state;
    this.setState({
      handlesearch: !!searchValue,
    });
  };

  // 选择组织和项目数据
  selectState = (value) => {
    const { AppState, HeaderStore, MenuStore, history } = this.props;
    const { id, name, type, organizationId } = value;
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
        path = `${route}?type=${type}&id=${id}&name=${encodeURIComponent(name)}`;
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

  renderDefaultExpandAllRows(dataSource) {
    const { filterOrganization, expandRowKey, collapseRowKey, handlesearch } = this.state;
    if (handlesearch) {
      return dataSource.map(data => data.key).filter(key => collapseRowKey.indexOf(key) === -1);
    } else if (filterOrganization !== '' && filterOrganization !== 'total') {
      return dataSource.length ? [dataSource[0].key] : [];
    } else {
      return expandRowKey;
    }
  }

  handleExpand = (record) => {
    const { expandRowKey, collapseRowKey, handlesearch } = this.state;
    const keys = handlesearch ? collapseRowKey : expandRowKey;
    const { key } = record;
    const index = keys.indexOf(key);
    if (index !== -1) {
      keys.splice(index, 1);
    } else {
      keys.push(key);
    }
    this.setState({
      expandRowKey,
      collapseRowKey,
    });
  };

  handleReturnButtonClick = () => {
    this.setState({
      searchValue: '',
      handlesearch: false,
    });
  };

  renderTable(dataSource, isNotRecent) {
    const { HeaderStore } = this.props;
    if (dataSource && dataSource.length) {
      const columns = [{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          record.into === false ? (
            <span className={`${prefixCls}-disabled`}>
              {text}
            </span>
          ) : (
            <a
              role="none"
              onClick={this.selectState.bind(this, record)}
            >
              <Icon type={record.type === 'project' ? 'project' : 'domain'} />
              {text}
            </a>
          )
        ),
      }, {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
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
        render: (text, record) => {
          if (record.into === false) {
            return (
              <span className={`${prefixCls}-disabled`}>
                {text === 'organization' ? '组织' : '项目'}
              </span>
            );
          }
          return text === 'organization' ? '组织' : '项目';
        },
      }];
      const selected = HeaderStore.getSelected;
      const rowSelection = {
        type: 'radio',
        onSelect: (record) => {
          HeaderStore.setSelected(record);
        },
        selectedRowKeys: selected ? [selected.key] : [],
        hideDefaultSelections: true,
      };
      let props = {};
      if (isNotRecent) {
        props = {
          expandedRowKeys: this.renderDefaultExpandAllRows(dataSource),
          onExpand: (expanded, record) => {
            this.handleExpand(record);
          },
        };
      }
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
          filterBar={false}
          onRow={onTableRow}
          pagination={false}
          rowSelection={rowSelection}
          {...props}
        />
      );
    } else {
      return (
        <div className={`${prefixCls}-empty`}>
          {
            isNotRecent ? '您还没有在任何组织或项目中被分配角色' : '您没有最近浏览记录'
          }
        </div>
      );
    }
  }

  hitSearch(item, value) {
    const { name, code } = item;
    return name.indexOf(value) !== -1 || code.indexOf(value) !== -1;
  }

  getOptionList() {
    const { HeaderStore } = this.props;
    const org = toJS(HeaderStore.getOrgData);
    return org && org.length > 0 ? [
      <Option key="total" value="total">
        所有组织
      </Option>,
    ].concat(
      org.map(orgOption => (
        <Option key={orgOption.id} value={orgOption.id}>
          {orgOption.name}
        </Option>
      )),
    ) : (
      <Option value="total">
        无组织
      </Option>
    );
  }

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

  renderModalContent() {
    const { handlesearch, searchValue, activeKey, filterOrganization } = this.state;
    const {
      AppState: { currentMenuType: { name: selectTitle = '选择项目', type } },
      HeaderStore: { menuTypeVisible: visible, getRecentItem: recentItem, getSelected },
    } = this.props;
    const currentData = this.getCurrentData();
    const tabSelect = activeKey || (filterOrganization || !recentItem || recentItem.length === 0 ? 'total' : 'recent');
    if (handlesearch) {
      return (
        <div className={`${prefixCls}-table-wrapper`}>
          {this.renderTable(currentData, true)}
        </div>
      );
    } else {
      return (
        <Tabs activeKey={tabSelect} onChange={this.handleTabChange}>
          <TabPane tab="最近" key="recent" className={`${prefixCls}-tab-body`}>
            {this.renderTable(recentItem)}
          </TabPane>
          <TabPane tab="全部" key="total" className={`${prefixCls}-tab-body`}>
            {this.renderTable(currentData, true)}
          </TabPane>
        </Tabs>
      );
    }
  }

  renderModalFooter() {
    const {
      HeaderStore: { getSelected },
    } = this.props;
    return [
      <Button key="back" onClick={this.handleCancel}>
        取消
      </Button>,
      <Button key="submit" type="primary" disabled={!getSelected} onClick={this.handleOk}>
        打开
      </Button>,
    ];
  }

  renderReturnButton() {
    const { handlesearch } = this.state;
    if (handlesearch) {
      return (
        <Button
          funcType="raised"
          icon="return"
          onClick={this.handleReturnButtonClick}
        />
      );
    }
  }

  render() {
    const { handlesearch, searchValue } = this.state;
    const {
      AppState: { currentMenuType: { name: selectTitle = '选择项目', type } },
      HeaderStore: { menuTypeVisible: visible },
    } = this.props;
    const buttonClass = classnames(`${prefixCls}-button`, { active: type === 'organization' || type === 'project' });
    const toolbarClass = classnames(`${prefixCls}-toolbar`, { 'has-search': handlesearch });
    const buttonIcon = getButtonIcon(type);
    return (
      <div>
        <Button
          className={buttonClass}
          funcType="flat"
          onClick={this.showModal}
        >
          {buttonIcon && <Icon type={buttonIcon} />}
          {selectTitle}
          <Icon type="arrow_drop_down" />
        </Button>
        <Modal
          title="选择"
          className={`${prefixCls}-modal`}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={this.renderModalFooter()}
          width={708}
          closable={false}
          center
        >
          <section className={toolbarClass}>
            {this.renderReturnButton()}
            <Select
              className={`${prefixCls}-organization-select`}
              label="组织"
              placeholder="Please Select"
              defaultValue="total"
              onChange={this.handleChange}
            >
              {this.getOptionList()}
            </Select>
            <Input
              prefix={<Icon type="search" />}
              placeholder="搜索组织和项目"
              value={searchValue}
              onChange={this.searchInput}
              onBlur={this.searchChange}
              onPressEnter={this.searchChange}
            />
          </section>
          {this.renderModalContent()}
        </Modal>
      </div>
    );
  }
}
