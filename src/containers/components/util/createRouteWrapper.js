import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs } from 'choerodon-ui';

const { TabPane } = Tabs;

export default function createRouteWrapper(keyString, cmp) {
  const maps = {};
  class RouterWrapper extends Component {
    render() {
      const { MenuStore } = this.props;
      const { activeMenu: { code }, tabs } = MenuStore;
      const currentTabs = tabs.filter(tab => tab.route && tab.route.startsWith(keyString));
  
      return (
        <Tabs activeKey={code} animated={false} className="boot-create-route-wrapper-tabs">
          {
            currentTabs.map(tab => (
              <TabPane
                tab="TAB_IFRAME"
                key={tab.code}
                forceRender={false}
              >
                <div style={{ width: '100%', height: 'calc(100vh - 88px)', overflow: 'hidden', position: 'relative' }}>
                  {React.createElement(cmp, { history: this.props.history })}
                </div>
              </TabPane>
            ))
          }
        </Tabs>
      );
    }
  }
  if (!maps[keyString]) {
    maps[keyString] = inject('MenuStore')(observer(RouterWrapper));
  }
  return maps[keyString];
}
