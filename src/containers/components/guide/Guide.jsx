import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { Button } from 'choerodon-ui';
import Step from './Step';
import asyncRouter from '../util/asyncRouter';
import GuidePanel from './GuidePanel';
import GuideItem from './GuideItem';
import './style';
import warning from '../../../common/warning';
import asyncLocaleProvider from '../util/asyncLocaleProvider';


@inject('AppState', 'HeaderStore', 'GuideStore')
@injectIntl
@observer
export default class Guide extends Component {
  renderGuideStep(current) {
    const { guide: { guideComponents, guideLocale }, GuideStore } = this.props;
    const guideComponent = asyncRouter(guideComponents[current]);
    warning(current in guideComponents, `Guide Component<${current}> is missing.`);


    return (
      <div className="c7n-boot-guide-step">
        <GuidePanel component={guideComponent} locale={guideLocale} current={current} />
      </div>
    );
  }

  renderFooter() {
    const { AppState } = this.props;
    return (
      <div
        className="c7n-boot-guide-footer"
        onClick={() => this.props.AppState.setGuideExpanded(false)}
        style={{ display: AppState.getGuideExpanded ? null : 'none' }}
      >
        <div className="c7n-boot-guide-line" />
        <div className="c7n-boot-guide-close">
          X 关闭教程
        </div>
      </div>
    );
  }

  renderItem = (data) => {
    const { guide: { guideLocale }, AppState } = this.props;
    const localKey = 'iam/zh_CN';
    const getMessage = guideLocale[localKey];
    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(language, getMessage);
    return (
      <IntlProviderAsync>
        <GuideItem data={data} />
      </IntlProviderAsync>
    );
  };

  renderGuideIndex() {
    const { guide: { guideComponents } } = this.props;

    return (
      <div className="c7n-boot-guide-overflow">
        <div className="c7n-boot-guide-title">
          <h2>开始学习教程</h2>
          <p>通过教程了解choerodon产品和服务</p>
          <div className="c7n-boot-guide-line" />
        </div>
        <div className="c7n-boot-guide-content">
          <ul>
            {Object.keys(guideComponents).map(value => this.renderItem(value))}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const { AppState, GuideStore } = this.props;
    return (
      <div className="c7n-boot-guide" style={{ width: AppState.getGuideExpanded ? '300px' : '0px' }}>
        {GuideStore.getCurrentGuideComponent ? this.renderGuideStep(GuideStore.getCurrentGuideComponent) : this.renderGuideIndex() }
        {this.renderFooter()}
      </div>
    );
  }
}
