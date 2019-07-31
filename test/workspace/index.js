import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import PageWrap from '../../src/containers/components/c7n/tab-page/PageWrap';
import PageTab from '../../src/containers/components/c7n/tab-page/PageTab';
import Origin from './Origin';
import Origin2 from './Origin2';
import Origin3 from './Origin3';

const App = () => (
  // <PageWrap noHeader={['tab3']}>
  //   <PageTab title="测试没有header" tabKey="tab3" component={Origin3} />
  //   <PageTab title="邮箱配置" tabKey="tab1" component={Origin} />
  //   <PageTab title="短信配置" tabKey="tab2" component={Origin2} />
  // </PageWrap>
  <Origin2 />
);

export default App;
