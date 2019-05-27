import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Tabs } from 'choerodon-ui';
import Iframe from './Iframe';
import './style.scss';

const { TabPane } = Tabs;

@inject('MenuStore')
@observer
export default class IframeWrapper extends Component {
  render() {
    const { MenuStore } = this.props;
    const { activeMenu: { code }, tabs } = MenuStore;

    return (
      <Tabs activeKey={code} animated={false} className="c7n-pro-iframe-wrapper-tabs">
        {
          MenuStore.getIframeTabs.map(tab => (
            <TabPane
              tab="TAB_IFRAME"
              key={tab.code}
              forceRender={false}
            >
              <Iframe tab={tab} />
            </TabPane>
          ))
        }
      </Tabs>
    );
  }
}
