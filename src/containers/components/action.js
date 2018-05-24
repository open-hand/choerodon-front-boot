import React, { Component, cloneElement } from 'react';
import { observer } from 'mobx-react';
import { Menu, Dropdown, Button } from 'choerodon-ui';
import Permission from 'PerComponent';
import PermissionStore from '../stores/PermissionStore';

const { Item } = Menu;

@observer
class Action extends Component {
  state = {};

  componentWillMount() {
    this.check(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.check(nextProps);
  }

  check({ data }) {
    data.forEach(({ service, type, organizationId, projectId }) => {
      PermissionStore.check(service, type, organizationId, projectId);
    });
  }

  renderMenu(data) {
    return (
      <Menu>
        {data.map(item => this.renderMenuItem(item))}
      </Menu>
    );
  };

  renderMenuItem({ service, type, organizationId, projectId, text, action, icon }) {
    const item = (
      <Item onClick={action}>
        {icon && <Icon type={icon} />}
        {text}
      </Item>
    );
    return (
      <Permission
        service={service}
        type={type}
        organizationId={organizationId}
        projectId={projectId}
        key={Math.random()}
        defaultChildren={cloneElement(item, { style: { display: 'none' } })}
      >
        {item}
      </Permission>
    );
  }

  render() {
    const { data, placement } = this.props;
    return (
      <Dropdown overlay={this.renderMenu(data)} trigger={['click']} placement={placement}>
        <Button shape="circle" style={{ color: '#3F51B5' }} icon="more_vert" />
      </Dropdown>
    );
  }
}

export default Action;
