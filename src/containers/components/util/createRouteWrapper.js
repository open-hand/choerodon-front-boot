import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs } from 'choerodon-ui';

const { TabPane } = Tabs;
const METADATA_PLACEHOLDER_STRING = 'hap-modeling/metadata';

export default function createRouteWrapper(keyString, cmp) {
  const maps = {};
  class RouterWrapper extends Component {
    render() {
      const { MenuStore } = this.props;
      const { activeMenu: { functionCode }, tabs } = MenuStore;
      let currentTabs;
      if (keyString === METADATA_PLACEHOLDER_STRING) {
        currentTabs = tabs.filter(tab => tab.symbol === 'PAGE');
      } else {
        currentTabs = tabs.filter(tab => tab.url && tab.url.startsWith(keyString));
      }
  
      return (
        <Tabs activeKey={functionCode} animated={false}>
          {
            currentTabs.map(tab => (
              <TabPane
                tab="TAB_IFRAME"
                key={tab.functionCode}
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
  // return inject('MenuStore')(observer(RouterWrapper));
  return maps[keyString];
}
