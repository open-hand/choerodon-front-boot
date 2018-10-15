import React, { Component } from 'react';
import './index.scss';
import { Button, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import Step from '../../../src/containers/components/guide/Step';
import StepFooter from '../../../src/containers/components/guide/StepFooter';

@inject('GuideStore')
@injectIntl
@observer
export default class Basic extends Component {
  renderStep(current) {
    switch (current) {
      case 0:
        return (
          <div>
            <h2>choerodon基础操作</h2>
            <h3>choerodon的基础系统配置</h3>
            <p>在本新手指引中，您可以创建一个新组织，并且在该组织中创建组织下的新项目，向新组织添加新用户，分别在组织层和项目层给用户分配角色。</p>
            <p>本教程会分步指导您完成如下任务：</p>
            <ul>
              <li>创建组织</li>
              <li>选择组织</li>
              <li>创建项目</li>
              <li>添加用户</li>
              <li>组织角色分配</li>
              <li>选择项目</li>
              <li>项目角色分配</li>
            </ul>
          </div>
        )
      case 1:
        return (
          <div>
            <h2>choerodon基础操作</h2>
            <h3>创建组织</h3>
            <p>组织是项目的上一级。通过组织您可以管理项目、用户。</p>
            <p>您可以使用组织创建表单来创建组织，创建后平台默认您是这个组织的组织管理员。</p>
            <ol>
              <li>点击管理，进入组织管理页面。</li>
              <li>点击创建组织，输入组织信息。</li>
            </ol>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>choerodon基础操作</h2>
            <h3>选择组织</h3>
            <p>通过选择项目，您可以切换到您要进入的组织</p>
            <ol>
              <li>点击选择项目，进入选择表单。</li>
              <li>点击您要进入的组织。</li>
            </ol>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>choerodon基础操作</h2>
            <h3>创建项目</h3>
            <p>项目是最小粒度的管理层次。</p>
            <p>您可以在组织下创建项目，则创建的项目属于这个组织。</p>
            <ol>
              <li>点击左侧菜单栏，选择组织设置下的项目管理，进入组织管理页面。</li>
              <li>点击创建项目，输入项目信息。</li>
            </ol>
          </div>
        );
      default:
        return (
          <div>
            <h2>choerodon基础操作</h2>
            <h3>完成</h3>
            <p>恭喜！</p>
            <p>现在您已经知道如何在choerodon初始状态下进行系统配置的一系列基础操作。</p>
            <p>您可以点击表单页面的“了解更多    ”，了解系统配置的更多用户手册。</p>
            <p><a href="http://choerodon.io">菜单配置<Icon type="open_in_new" /></a> 用于配置平台菜单</p>
            <p>仪表盘配置    用于预置用户可见的仪表盘卡片</p>
            <p>LDAP    对组织应用的LDAP信息设置的管理</p>
            <p>或者了解如何在完成系统配置之后进行其他choerodon产品功能：</p>
          </div>
        );
    }
  }

  render() {
    const { GuideStore } = this.props;
    return (
      <div>
        <div style={{ width: '90%', margin: '0 auto' }}>
          <Step current={GuideStore.getCurrentStep} total={4} />
          {this.renderStep(GuideStore.getCurrentStep)}
        </div>
        <StepFooter total={4} />
      </div>
    );
  }
}
