import React, { Component } from 'react';
import classNames from 'classnames';
import { fileServer } from '../../../common';

export default class Avatar extends Component {
  render() {
    const { src, children, className, style, prefixCls, ...props } = this.props;
    return (
      <div
        className={classNames(`${prefixCls}-avatar`, className)}
        style={
          {
            ...style,
            backgroundImage: src && `url(${fileServer(src)})`,
          }
        }
        {
          ...props
        }
      >
        {!src && children}
      </div>
    );
  }
}
