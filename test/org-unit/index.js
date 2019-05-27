import React, { PureComponent } from 'react';
import { DataSet, Tabs } from 'choerodon-ui/pro';
import Content from '../../src/containers/components/pro/page/Content';
import OrgInfo from './view/OrgInfo';
import OrgStru from './view/OrgStru';
import OrgStruDataSet from './stores/OrgStruDataSet';
import HeadDataSet from './stores/HeadDataSet';
import './index.scss';

export default class Index extends PureComponent {
  orgStruDS = new DataSet(OrgStruDataSet);
  
  orgInfoDS = new DataSet({
    ...HeadDataSet,
    events: {
      submitSuccess: () => {
        this.orgStruDS.query();
      },
    },
  });

  /**
   * 渲染Tabs
   */
  render() {
    return (
      <Content>
        <Tabs>
          <Tabs.TabPane tab="组织信息" key="1"><OrgInfo dataSet={this.orgInfoDS} /></Tabs.TabPane>
          <Tabs.TabPane tab="查看组织结构" key="2"><OrgStru dataSet={this.orgStruDS} /></Tabs.TabPane>
        </Tabs>
      </Content>
    );
  }
}
