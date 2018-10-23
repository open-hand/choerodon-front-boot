import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Icon } from 'choerodon-ui';
import { inject } from 'mobx-react';

@inject('GuideStore')
@injectIntl
export default class GuideItem extends Component {
  handleGuideClick = (guideComponent) => {
    this.props.GuideStore.setCurrentGuideComponent(guideComponent);
  };

  render() {
    const { intl, data } = this.props;
    const prefix = data.replace('/', '.').toLowerCase();
    return (
      <li key={intl.formatMessage({ id: `guide.${prefix}.title` })}>
        <div className="c7n-boot-guide-item" onClick={() => this.handleGuideClick(data)}>
          <Icon type={intl.formatMessage({ id: `guide.${prefix}.icon` })} style={{ fontSize: '24px' }} />
          <h4>{intl.formatMessage({ id: `guide.${prefix}.title` })}</h4>
          <p>{intl.formatMessage({ id: `guide.${prefix}.description` })}</p>
        </div>
        <div className="c7n-boot-guide-line" />
      </li>
    );
  }
}
