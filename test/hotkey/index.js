import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';

@withRouter
export default class Index extends PureComponent {
  state = {
    id: this.props.match.params.id,
  };

  render() {
    const { id } = this.state;
    return (
      <div style={{ width: 200, height: 200, overflow: 'scroll' }}>
        <div style={{ width: 500, height: 500, fontSize: '24px', background: 'lightskyblue' }}>
          {id}
        </div>
      </div>
    );
  }
}
