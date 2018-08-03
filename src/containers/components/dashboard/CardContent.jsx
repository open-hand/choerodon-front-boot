import React, { Component } from 'react';
import classNames from 'classnames';

export default class CardContent extends Component {
  render() {
    const { visible, children, prefixCls } = this.props;
    return (
      <div className={classNames(`${prefixCls}-card-container`, { [`${prefixCls}-card-hidden`]: !visible })}>
        {children}
      </div>
    );
  }
}
