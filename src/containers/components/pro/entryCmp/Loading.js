import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Spin, ModalContainer, Button, Modal } from 'choerodon-ui/pro';

@withRouter
export default class Loading extends Component {
  render() {
    return [
      <div key="entry-loading" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, margin: 'auto', width: 30, height: 30 }}>
        <Spin />
      </div>,
      <ModalContainer key="entry-modal-container" />,
    ];
  }
}
