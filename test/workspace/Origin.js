import React from 'react';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';

@observer
@withRouter
export default class Index extends React.Component {
  render() {
    const code = get(this, 'props.match.params.code');
    return (
      <div className="master-wrapper">
        {code}
      </div>
    );
  }
}
