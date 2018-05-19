import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import './Home.scss';

const footerLinks = [
  {
    key: 0,
    title: '互动',
    items: [
      {
        key: 0,
        text: '博客',
        link: 'http://choerodon.io/zh/blog/',
      }, {
        key: 1,
        text: '社区',
        link: 'http://choerodon.io/zh/community/',
      },
    ],
  },
  {
    key: 1,
    title: '快速链接',
    items: [
      {
        key: 3,
        text: '文档',
        link: 'http://choerodon.io/zh/docs/',
      }, {
        key: 4,
        text: '案例',
        link: 'http://choerodon.io/zh/case-studies/',
      },
    ],
  },
];

const mainList = [
  {
    key: 0,
    title: '快速入门',
    items: [
      {
        key: 1,
        icon: 'svg1',
        title: '创建一个项目',
        content: '从创建项目、定义环境、资源等方面介绍 Choerodon 项目，让读者能够了解项目的基本概念',
        link: 'http://choerodon.io/zh/docs/quick-start/project/',
      },
      {
        key: 2,
        icon: 'svg2',
        title: '创建一个前端应用',
        content: '从创建前端应用、创建前端应用模板、开发前端应用、生成版本、部署应用、配置网络、配置域名等方面介绍',
        link: 'http://choerodon.io/zh/docs/quick-start/microservice-front/',
      },
      {
        key: 3,
        icon: 'svg3',
        title: '创建一个后端应用',
        content: '从创建后端应用、创建后端应用模板、开发后端应用、生成版本、部署应用、查看运行信息等方面介绍',
        link: 'http://choerodon.io/zh/docs/quick-start/microservice-backend/',
      },
      {
        key: 4,
        icon: 'svg4',
        title: '创建一个Java库',
        content: '从创建Java库，创建Java库应用模板、开发Java等方面介绍',
        link: 'http://choerodon.io/zh/docs/quick-start/web-application/',
      },
    ],
  },
  {
    key: 1,
    title: '主要功能',
    items: [
      {
        key: 5,
        icon: 'svg5',
        title: '系统配置',
        content: '为了让Choerodon的用户更便捷、科学地使用平台，需在用户使用前进行的系统配置，包括角色、用户、项目、环境等',
        link: 'http://choerodon.io/zh/docs/user-guide/system-configuration/',
      },
      {
        key: 6,
        icon: 'svg6',
        title: '开发流水线',
        content: '借助 Gitlab CI 作为持续集成工具，结合 Gitflow 分支管理模型，提供持续集成的流水线可以减少代码冲突风险，降低修复错误代码的成本',
        link: 'http://choerodon.io/zh/docs/user-guide/assembly-line/',
      },
      {
        key: 7,
        icon: 'svg7',
        title: '部署流水线',
        content: '描述部署的环境、网络、域名、容器等，来告知用户如何部署和部署情况',
        link: 'http://choerodon.io/zh/docs/user-guide/deploy/',
      },
    ],
  },
  {
    key: 2,
    title: '开发手册',
    items: [
      {
        key: 8,
        icon: 'svg8',
        title: '前端开发',
        content: '介绍如何开发新的页面，如何建立并开发新的模块和系统平台的相关配置项',
        link: 'http://choerodon.io/zh/docs/development-guide/front/',
      },
      {
        key: 9,
        icon: 'svg9',
        title: '后端开发',
        content: '介绍基于开发的基本工具与其具体安装配置。通过此章节，用户可完成基本开发环境的搭建',
        link: 'http://choerodon.io/zh/docs/development-guide/backend/',
      },
      {
        key: 10,
        icon: 'svg10',
        title: '平台开发',
        content: '介绍如何向我们报告Issues，和如何帮助我们改进我们的程序',
        link: 'http://choerodon.io/zh/docs/development-guide/platform/',
      },
    ],
  },
  {
    key: 3,
    title: '安装与配置',
    items: [
      {
        key: 11,
        icon: 'svg11',
        title: 'Gitlab安装',
        content: '介绍Gitlab的安装流程',
        link: 'http://choerodon.io/zh/docs/installation-configuration/gitlab/',
      },
      {
        key: 12,
        icon: 'svg12',
        title: 'Redis安装',
        content: '介绍Redis的安装流程',
        link: 'http://choerodon.io/zh/docs/installation-configuration/redis/',
      },
      {
        key: 13,
        icon: 'svg13',
        title: 'Kubernetes安装',
        content: '介绍Kubernetes的安装流程',
        link: 'http://choerodon.io/zh/docs/installation-configuration/kubernetes/',
      },
      {
        key: 14,
        icon: 'svg14',
        title: 'Kafka安装',
        content: '介绍Kafka的安装流程',
        link: 'http://choerodon.io/zh/docs/installation-configuration/kafka/',
      },
    ],
  },
];

@inject('AppState')
@observer
class Home extends Component {
  renderItem({ title, icon, content, link, key }) {
    return (
      <li key={key}>
        <a href={link}>
          <div className="access-list-item">
            <div className={`access-list-icon ${icon}`} />
            <h4>{title}</h4>
            <p>{content}</p>
          </div>
        </a>
      </li>
    );
  }

  renderContentLinks() {
    return mainList.map(({ title, items, key }) => (
      <div key={key} className="access-list-group">
        <h3>{title}</h3>
        <ul>{items.map(item => this.renderItem(item))}</ul>
      </div>
    ));
  }

  renderFooterLinks() {
    return footerLinks.map(({ title, items, key }) => (
      <ul key={key}>
        <li><h3>{title}</h3></li>
        {
          items.map(({ text, link, key: itemKey }) => (
            <li key={itemKey}><a href={link}>{text}</a></li>),
          )
        }
      </ul>
    ));
  }

  render() {
    const { AppState } = this.props;
    const user = AppState.currentUser;
    return (
      <div className="choerodon-home">
        <header className="choerodon-home-header">
          <div className="choerodon-home-header-content">
            <h1>{user ? `${user.realName}：` : ''} 您好！欢迎使用</h1>
            <p>
              Choerodon猪齿鱼是一个开源企业服务平台，是基于Kubernetes的容器编排和管理能力，
              整合DevOps工具链、微服务和移动应用框架，来帮助企业实现敏捷化的应用交付和自动化的运营管理，
              并提供IoT、支付、数据、智能洞察、企业应用市场等业务组件，来帮助企业聚焦于业务，加速数字化转型
            </p>
          </div>
        </header>
        <div className="choerodon-home-content">
          <div className="access-list">
            {this.renderContentLinks()}
          </div>
        </div>
        <footer className="choerodon-home-footer">
          <div className="link-list">
            {this.renderFooterLinks()}
          </div>
        </footer>
      </div>
    );
  }
}

export default Home;
