import React, { Component } from 'react';
import './style/index.scss';
import { Button } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';


@inject('GuideStore')
@injectIntl
@observer
export default class StepFooter extends Component {
  static propTypes = {
    total: PropTypes.number,
  };

  handleNextClick = () => {
    const { GuideStore, total } = this.props;
    if (GuideStore.getCurrentStep < total) GuideStore.addCurrentStep();
    else {
      GuideStore.setCurrentGuideComponent(false);
      GuideStore.setCurrentStep(0);
    }
  };

  handleBackClick = () => {
    const { GuideStore } = this.props;
    if (GuideStore.getCurrentStep === 0) GuideStore.setCurrentGuideComponent(false);
    else GuideStore.setCurrentStep(GuideStore.getCurrentStep - 1);
  };

  render() {
    const { GuideStore, total } = this.props;
    return (
      <div className="c7n-boot-guide-step-footer">
        <Button onClick={() => this.handleBackClick()}>
          返回
        </Button>
        <Button style={{ float: 'right' }} onClick={() => this.handleNextClick()}>
          {GuideStore.getCurrentStep < total ? '继续' : '返回教程'}
        </Button>
      </div>
    );
  }
}
