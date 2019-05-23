import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import mainList from './mainList';
import footerLinks from './footerLinks';
import './style';

@inject('AppState')
@observer
class Home extends Component {
  renderItem({ title, icon, content, link, key }) {
    return (
      <li key={key}>
        <a href={link}>
          <div className="access-list-item">
            <div className={`access-list-icon ${icon}`} />
            <h4>
              {title}
            </h4>
            <p>
              {content}
            </p>
          </div>
        </a>
      </li>
    );
  }

  renderContentLinks() {
    return mainList.map(({ title, items, key }) => (
      <div key={key} className="access-list-group">
        <h3>
          {title}
        </h3>
        <ul>
          {items.map(item => this.renderItem(item))}
        </ul>
      </div>
    ));
  }

  renderFooterLinks() {
    return footerLinks.map(({ title, items, key }) => (
      <ul key={key}>
        <li>
          <h3>
            {title}
          </h3>
        </li>
        {
          items.map(({ text, link, key: itemKey }) => (
            <li key={itemKey}>
              <a href={link}>
                {text}
              </a>
            </li>
          ))
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
            <h1>
              {`${user ? `${user.realName}：` : ''} 您好！欢迎使用`}
            </h1>
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
