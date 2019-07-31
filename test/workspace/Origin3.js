import React from 'react';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { Button } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Header from '../../src/containers/components/c7n/page/Header';
import Content from '../../src/containers/components/c7n/page/Content';
import Breadcrumb from '../../src/containers/components/c7n/tab-page/Breadcrumb';
import TabPage from '../../src/containers/components/c7n/tab-page/TabPage';

@observer
@withRouter
export default class Index extends React.Component {
  render() {
    return (
      <TabPage>
        <Breadcrumb title="title3" />
        <Content>
          <div style={{ height: 1000 }}>halo3</div>
        </Content>
      </TabPage>
    );
  }
}
