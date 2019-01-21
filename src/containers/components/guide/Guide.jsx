import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { Icon, Spin } from 'choerodon-ui';
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
    const { guide: { guideComponents, guideLocale }, AppState, GuideStore } = this.props;
    const guideComponent = asyncRouter(guideComponents[current], null, null, () => { GuideStore.setLoading(current); });
    warning(current in guideComponents, `Guide Component<${current}> is missing.`);
    const locale = current.substring(0, current.indexOf('/')).concat('/zh_CN');
    return (
      <Spin spinning={AppState.getGuideExpanded && GuideStore.getLoading.get(current) !== false}>
        <div className="c7n-boot-guide-step" style={{ display: !AppState.getGuideExpanded ? 'none' : 'block', width: '300px' }}>
          <GuidePanel component={guideComponent} locale={guideLocale[locale]} current={current} />
        </div>
      </Spin>
    );
  }

  renderFooter() {
    const { AppState, GuideStore } = this.props;
    return (
      <div
        className="c7n-boot-guide-footer"
        onClick={() => {
          AppState.setGuideExpanded(false);
          GuideStore.setCurrentGuideComponent(false);
          GuideStore.setCurrentStep(0);
        }}
        style={{ display: AppState.getGuideExpanded ? null : 'none' }}
      >
        <div className="c7n-boot-guide-line" />
        <div className="c7n-boot-guide-close">
          <Icon type="close" /> 关闭教程
        </div>
      </div>
    );
  }

  renderItem = (data) => {
    const { guide: { guideLocale }, AppState, GuideStore } = this.props;
    // const localKey = Object.keys(guideLocale)[0];
    const localKey = data.substring(0, data.indexOf('/')).concat('/zh_CN');
    const getMessage = guideLocale[localKey];
    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(language, getMessage);
    return (
      <IntlProviderAsync key={`${data}`}>
        <GuideItem data={data} />
      </IntlProviderAsync>
    );
  };

  renderGuideIndex() {
    const { guide: { guideComponents }, AppState } = this.props;

    return (
      <div className="c7n-boot-guide-overflow" style={{ display: !AppState.getGuideExpanded ? 'none' : 'block', width: '280px' }}>
        <div className="c7n-boot-guide-title">
          <h2>开始学习教程</h2>
          <p>通过教程了解Choerodon产品和服务</p>
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
