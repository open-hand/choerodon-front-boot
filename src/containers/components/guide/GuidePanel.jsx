import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Card } from 'choerodon-ui';
import GuideProvider from './GuideProvider';
import asyncLocaleProvider from '../util/asyncLocaleProvider';

const localKeyReg = /.+\\/;

@inject('AppState', 'GuideStore')
@observer
export default class GuidePanel extends Component {
  state = {
  };

  render() {
    const { prefixCls, children, component, locale, AppState, current, GuideStore } = this.props;
    const localKey = 'iam/zh_CN';
    const getMessage = locale[localKey];
    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(language, getMessage);

    return (
      <IntlProviderAsync key={`${component.name}`}>
        <section>
          <div className="c7n-boot-guide-placeholder">
            <GuideProvider>
              {
              toolbar => (
                component && createElement(component)
              )
            }
            </GuideProvider>
          </div>
        </section>
      </IntlProviderAsync>
    );
  }
}
