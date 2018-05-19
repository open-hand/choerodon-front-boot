import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Permission from 'PerComponent';
import { Menu, Dropdown, Tooltip, Button } from 'choerodon-ui';

@inject('AppState')
@observer
class Action extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onClick = this.onClick.bind(this);
    this.onClick2 = this.onClick2.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
  }
  onClick = (key) => {
    for (let a = 0; a < this.props.data.length; a += 1) {
      if (a === key.item.props.index) {
        this.props.data[a].action();
      }
    }
  }
  onClick2 = (text) => {
    for (let a = 0; a < this.props.data.length; a += 1) {
      if (this.props.data[a].text === text) {
        this.props.data[a].action();
      }
    }
  }
  renderMenu = () => {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    let organizationId;
    let projectId;
    let child;
    if (type === 'project') {
      organizationId = menuType.organizationId;
      projectId = menuType.id;
      child = this.props.data.map(item =>
        (
          <Menu.Item
            key={Math.random()}
          >
            <Permission service={item.service} type={item.type} organizationId={item.organizationId} projectId={item.projectId}>
              <p>{item.text}</p>
            </Permission>
          </Menu.Item>
        ),
      );
    } else {
      organizationId = menuType.id;
      child = this.props.data.map(item =>
        (
          <Menu.Item
            key={Math.random()}
          >
            <Permission service={item.service} type={item.type} organizationId={item.organizationId} projectId={item.projectId}>
              <p>{item.text}</p>
            </Permission>
          </Menu.Item>
        ),
      );
    }
    return child;
  }
  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    let noPermission = 0;
    let organizationId;
    let projectId;
    if (type === 'project') {
      organizationId = menuType.organizationId;
      projectId = menuType.id;
      for (let a = 0; a < this.props.data.length; a += 1) {
        if (this.props.data[a].service === '') {
          noPermission += 1;
        } else if (Choerodon.getPermission(
          AppState.getPerMission,
          this.props.data[a].service,
          type,
          organizationId,
          projectId)) {
          noPermission += 1;
        }
      }
    } else {
      organizationId = menuType.id;
      for (let b = 0; b < this.props.data.length; b += 1) {
        if (this.props.data[b].service === '') {
          noPermission += 1;
        } else if (Choerodon.getPermission(
          AppState.getPerMission,
          this.props.data[b].service,
          type,
          organizationId)) {
          noPermission += 1;
        }
      }
    }
    const menu = (
      <Menu onClick={this.onClick.bind(this)}>
        {this.renderMenu()}
      </Menu>
    );
    return (
      // noPermission !== 0 ?
      //   (<Dropdown overlay={menu} trigger={['click']}>
      //     <span style={{ cursor: 'pointer', color: '#3F51B5' }} className="icon-more_vert" />
      //   </Dropdown>) : <div />
      <Dropdown overlay={menu} trigger={['click']}>
        <Button shape="circle" style={{ cursor: 'pointer', color: '#3F51B5' }} icon="more_vert" />
      </Dropdown>
    );
  }
}
export default Action;
