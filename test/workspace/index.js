import React, { Component } from 'react';
import { Button, Spin } from 'choerodon-ui';
import Permission from '../../src/containers/components/pro/permission/Permission';
import themeColorClient from '../../src/containers/components/c7n/master/themeColorClient';

const getRandomColor = () => `#${(Math.random() * 0xffffff << 0).toString(16)}`;

const updateTheme = (newPrimaryColor) => {
  themeColorClient.changeColor(newPrimaryColor)
    // eslint-disable-next-line no-console
    .finally(() => console.log(`[choerodon] Current Theme Color: ${newPrimaryColor}`));
};

export default class App extends Component {
  handleClick = () => {
    updateTheme(getRandomColor());
  }

  render() {
    return (
      <React.Fragment>
        <Spin spinning>
          <div style={{ marginBottom: 40 }}>
            <h4>有权限,正常显示的按钮</h4>
            <Permission service={['task-execution.cancleExecute']}>
              <Button>Permission Btn</Button>
            </Permission>
          </div>
        </Spin>
        <div style={{ marginBottom: 40 }}>
          <h4>没有权限,被隐藏的按钮</h4>
          <Permission service={['permission-code']}>
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>无权限控制,永远显示的按钮</h4>
          <Button onClick={this.handleClick}>Without Permission Btn</Button>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>没有权限,被隐藏的按钮,显示默认内容</h4>
          <Permission
            service={['permission-code']}
            noAccessChildren={<span>对不起你不配看到我!</span>}
          >
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>不知道有没有权限,反正加载的时候显示,没权限的时候也显示</h4>
          <Permission
            service={['permission-code']}
            defaultChildren={<span>我还在加载!或者你不配看我!</span>}
          >
            <Button>Permission Btn</Button>
          </Permission>
        </div>
      </React.Fragment>
    );
  }
}
