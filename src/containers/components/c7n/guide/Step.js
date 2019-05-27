import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Step extends Component {
  static propTypes = {
    current: PropTypes.number,
    total: PropTypes.number,
  };

  render() {
    const { current, total } = this.props;
    const stepWidth = 276 * current / total;
    return (
      <div style={{ width: '276px', height: '4px', marginTop: '12px', marginBottom: '20px', background: 'rgba(0,0,0,0.08)' }}>
        <div style={{ width: stepWidth, height: '4px', marginTop: '12px', marginBottom: '20px', background: '#00BFA5' }} />
      </div>
    );
  }
}
