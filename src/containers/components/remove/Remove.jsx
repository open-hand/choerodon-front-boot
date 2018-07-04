import React, { Component } from 'react';
import { Button, Col, Icon, Modal, Row } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { getMessage } from '../../common';

class Remove extends Component {
  static propTypes = {
    open: PropTypes.bool,
  };

  render() {
    const { open, handleCancel, handleConfirm } = this.props;
    return (
      <Modal
        visible={open || false}
        width={400}
        onCancel={handleCancel}
        wrapClassName="vertical-center-modal remove"
        footer={<div><Button
          onClick={handleCancel}
          className="color3"
          height={36}
          text={getMessage('取消', 'cancel')}
        /><Button
          onClick={handleConfirm}
          className="color3"
          style={{ marginLeft: '8px' }}
          height={36}
          text={getMessage('删除', 'delete')}
        />
        </div>}
      >
        <Row>
          <Col span={24}>
            <Col span={2}>
              <a style={{ fontSize: 20, color: '#ffc07b' }}>
                <Icon type="question-circle-o" />
              </a>
            </Col>
            <Col span={22}>
              <h2>{getMessage('确认删除', 'confirm delete')}</h2>
            </Col>
          </Col>
        </Row>
        <Row>
          <Col offset={2}>
            <div style={{ marginTop: 10 }}>
              <span>{getMessage('当你点击删除后，该条数据将被永久删除，不可恢复!', 'When you click delete, after which the data will be permanently deleted and irreversible!')}</span>
            </div>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Remove;
