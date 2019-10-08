import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import Permission from '../../src/containers/components/pro/permission/Permission';

export default class App extends Component {
  render() {
    return (
      <fragment>
        <div style={{ marginBottom: 40 }}>
          <h4>有权限,正常显示的按钮</h4>
          <Permission service={['task-execution.cancleExecute']}>
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>没有权限,被隐藏的按钮</h4>
          <Permission service={['permission-code']}>
            <Button>Permission Btn</Button>
          </Permission>
        </div>
        <div style={{ marginBottom: 40 }}>
          <h4>无权限控制,永远显示的按钮</h4>
          <Button>Without Permission Btn</Button>
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
      </fragment>
    );
  }
}
