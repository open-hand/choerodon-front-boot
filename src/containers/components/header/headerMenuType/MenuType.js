/**
 * Created by smilesoul on 2018/2/24.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { Button, Icon, Input, Modal, Select, Table, Tabs } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import axios from 'Axios';
import classnames from 'classnames';
import _ from 'lodash';
import { toJS } from 'mobx';
import HeaderStore from '@/stores/HeaderStore';
import MenuStore from '@/stores/MenuStore';
import './MemuType.scss';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Search = Input.Search;

@inject('AppState')
@observer
class MenuType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      totalTabData: props.org && props.pro ? [...props.org, ...props.pro] : [],
      selected: {},
      filterOrganization: '',
      searchValue: '',
      handlesearch: false,
      expandRowKey: [],
      collapseRowKey: [],
      activeKey: null,
    };
  }

  // 请求封装
  fetchAxios = (method, url) => {
    return axios[method](url);
  };
  // 展示modal
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  // 确认模态框
  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.selectState(HeaderStore.getSelected);
  };
  // 取消模态框
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  //select 选择
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
  //search 搜索
  searchInput = (e) => {
    this.setState({
      searchValue: e.target.value,
    });
  };
  searchChange = (e) => {
    this.setState({
      handlesearch: !!this.state.searchValue,
    });
  };

  //选择组织和项目数据
  selectState = (value) => {
    const { AppState, history } = this.props;
    const { id, name, type, organizationId } = value;
    AppState.changeMenuType({ id, name, type, organizationId });
    HeaderStore.setRecentItem(value);
    MenuStore.loadMenuData(type).then(menus => {
      if (menus.length) {
        const { route, domain } = menus[0].subMenus[0];
        let path = `${route}?type=${type}&id=${id}&name=${name}`;
        if (organizationId) {
          path += `&organizationId=${organizationId}`;
        }
        Choerodon.historyPushMenu(history, path, domain);
      }
    });
    this.setState({
      visible: false,
    });
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
    if (dataSource && dataSource.length) {
      const columns = [{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          record.into === false ?
            <span className="menu-type-disabled">{text}</span> :
            <a
              role="none"
              onClick={this.selectState.bind(this, record)}
            >
              <Icon type={record.type === 'project' ? 'project' : 'domain'} />
              {text}
            </a>
        ),
      }, {
        title: '编码',
        dataIndex: 'code',
        key: 'code',
        render: (text, record) => {
          if (record.into === false) {
            return (
              <span className='menu-type-disabled'>
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
              <span className='menu-type-disabled'>
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
        <div className="menu-type-empty">
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
    const org = toJS(HeaderStore.getOrgData);
    return org && org.length > 0 ? [<Option key="total" value="total">所有组织</Option>].concat(
      org.map(orgOption => (
        <Option key={orgOption.id} value={orgOption.id}>{orgOption.name}</Option>
      )),
    ) : <Option value="total">无组织</Option>;
  }

  getCurrentData() {
    const { filterOrganization, handlesearch, searchValue } = this.state;
    const needFilterOrganization = filterOrganization !== '' && filterOrganization !== 'total';
    const orgData = toJS(HeaderStore.getOrgData);
    const proData = toJS(HeaderStore.getProData);
    if (!_.isNull(orgData) && !_.isNull(proData)) {
      return orgData.filter((item) => {
        const id = item.id;
        if (needFilterOrganization && Number(id) !== Number(filterOrganization)) {
          return false;
        }
        item.key = id;
        item.children = [];
        _.forEach(proData, (item2) => {
          const { id: id2, organizationId } = item2;
          item2.key = `${id},${id2}`;
          if (Number(organizationId) === Number(id) && (!handlesearch || this.hitSearch(item2, searchValue))) {
            item.children.push(item2);
          }
        });
        if (!item.children.length) {
          delete item.children;
        }
        if (handlesearch && !item.children && !this.hitSearch(item, searchValue)) {
          return false;
        }
        return true;
      });
    }
    return orgData;
  }

  render() {
    const { handlesearch, searchValue, visible, activeKey, filterOrganization } = this.state;
    const { name: selectTitle = '选择项目', type } = this.props.AppState.currentMenuType;
    const currentData = this.getCurrentData();
    const recentItem = HeaderStore.getRecentItem;
    const tabSelect = activeKey || (filterOrganization || !recentItem || recentItem.length === 0 ? 'total' : 'recent');
    const modalFooter = [
      <Button key="back" onClick={this.handleCancel}>取消</Button>,
      <Button key="submit" type="primary" disabled={!HeaderStore.getSelected} onClick={this.handleOk}>
        打开
      </Button>,
    ];
    let returnBtn;
    let searchClass = '';
    let content;
    let buttonClass;
    let buttonIcon;
    if (type === 'organization') {
      buttonClass = 'active';
      buttonIcon = 'domain';
    } else if (type === 'project') {
      buttonClass = 'active';
      buttonIcon = 'project';
    }
    buttonClass = classnames('menu-type-btn', buttonClass);
    if (handlesearch) {
      returnBtn = (
        <Button
          funcType="raised"
          icon="return"
          onClick={this.handleReturnButtonClick}
        />
      );
      content = (
        <div className="table-wrapper">{this.renderTable(currentData, true)}</div>
      );
      searchClass = 'has-search';
    } else {
      content = (
        <Tabs activeKey={tabSelect} onChange={this.handleTabChange}>
          <TabPane tab="最近" key="recent">
            {this.renderTable(recentItem)}
          </TabPane>
          <TabPane tab="全部" key="total">
            {this.renderTable(currentData, true)}
          </TabPane>
        </Tabs>
      );
    }
    return (
      <div>
        <Button
          className={buttonClass}
          funcType="flat"
          onClick={this.showModal}
        >
          <Icon type={buttonIcon} />
          {selectTitle}
          <Icon type="arrow_drop_down" />
        </Button>
        <Modal
          title="选择"
          className="menu-type-modal"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={modalFooter}
          width={708}
          closable={false}
        >
          <section className={`select-and-search ${searchClass}`}>
            {returnBtn}
            <Select label="组织" placeholder="Please Select" defaultValue="total" onChange={this.handleChange}>
              {this.getOptionList()}
            </Select>
            <Input
              prefix={<span className="icon-search" />}
              placeholder="搜索组织和项目"
              value={searchValue}
              onChange={this.searchInput}
              onBlur={this.searchChange}
              onPressEnter={this.searchChange} />
          </section>
          {content}
        </Modal>
      </div>
    );
  }
}

export default withRouter(MenuType);
