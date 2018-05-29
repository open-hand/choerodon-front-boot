import React, { Component } from 'react';
import classnames from 'classnames';

export default class Avatar extends Component {
  render() {
    const { src, children, className, style, ...props } = this.props;
    return (
      <div
        className={classnames('userPro-avatar', className)}
        style={
          {
            ...style,
            backgroundImage: src && `url(${src})`,
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
