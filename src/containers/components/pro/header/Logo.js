import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { HEADER_TITLE_NAME } from '../../../common/constants';

@inject('AppState')
@observer
export default class Logo extends Component {
  render() {
    const { AppState } = this.props;
    return (
      <div className="header-logo-wrap">
        <div className="header-logo-icon" style={{ backgroundImage: `url(${AppState.logo})` }} />
        <div className="header-logo-title">{AppState.title || HEADER_TITLE_NAME}</div>
      </div>
    );
  }
}
