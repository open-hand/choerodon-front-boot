import React, { Component } from 'react';
import { Icon } from 'choerodon-ui/pro';
import mainList from './mainList';
import './style';

export default class Home extends Component {
  renderItemSubLinks(content) {
    return content.map(({ key, title, link }) => (
      <li key={key}>
        <a
          className="resource-link"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}<Icon type="open_in_new" />
        </a>
      </li>
    ));
  }

  renderItem({ title, icon, content, link, key }) {
    return (
      <li key={key}>
        <div className="access-list-item">
          <div className={`access-list-icon ${icon}`} />
          <h4 className="item-header">
            <span>{title}</span>
            <a
              className="resource-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              更多<Icon type="open_in_new" />
            </a>
          </h4>
          <ul>
            {this.renderItemSubLinks(content)}
          </ul>
        </div>
      </li>
    );
  }

  renderContentLinks() {
    return mainList.map(({ title, items, key, link }) => (
      <div key={key} className="access-list-group">
        <h3>
          <a href={link} target="_blank" rel="noopener noreferrer">{title}</a>
        </h3>
        <ul>
          {items.map(item => this.renderItem(item))}
        </ul>
      </div>
    ));
  }

  render() {
    return (
      <div className="choerodon-home">
        <header className="choerodon-home-header">
          <div className="choerodon-home-header-content">
            <h1>
              {'您好！欢迎使用HAP 4.0'}
            </h1>
            <p>
            汉得应用开发平台（HAND Application Platform）是汉得公司为了应对移动互联网化、
            应用云端化、海量数据化和数字化服务转型的应用开发平台，是中台化产品和应用开发的基础平台。
            HAP采用开源的Java EE技术体系，平台设计灵活可扩展、可移植、可应对高并发需求。
            </p>
          </div>
        </header>
        <div className="choerodon-home-content">
          <div className="access-list">
            {this.renderContentLinks()}
          </div>
        </div>
      </div>
    );
  }
}
