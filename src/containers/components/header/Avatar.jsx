import React, { Component } from 'react';
import classnames from 'classnames';
import { fileServer } from '../../common';

export default class Avatar extends Component {
  render() {
    const { src, children, className, style, ...props } = this.props;
    return (
      <div
        className={classnames('user-preference-avatar', className)}
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
