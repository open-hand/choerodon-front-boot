import React, { cloneElement, Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Dropdown, Menu } from 'choerodon-ui';
import Permission from '../permission';

const { Item } = Menu;

@observer
class Action extends Component {
  state = {};

  handleClick = (arg) => {
    const { action } = arg.item.props;
    if (typeof action === 'function') {
      action();
    }
  };

  getAllService(data) {
    return data.reduce((list, { service = [] }) => {
      return list.concat(service);
    }, []);
  }

  renderMenu(data) {
    return (
      <Menu onClick={this.handleClick}>
        {data.map(item => this.renderMenuItem(item))}
      </Menu>
    );
  };

  renderMenuItem({ service, text, action, icon }) {
    const item = (
      <Item action={action}>
        {icon && <Icon type={icon} />}
        {text}
      </Item>
    );
    return (
      <Permission
        service={service}
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
      <Permission
        service={this.getAllService(data)}
      >
        <Dropdown overlay={this.renderMenu(data)} trigger={['click']} placement={placement}>
          <Button shape="circle" style={{ color: '#3F51B5' }} icon="more_vert" />
        </Dropdown>
      </Permission>
    );
  }
}

export default Action;
