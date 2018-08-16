import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import { Icon, Switch } from 'choerodon-ui';
import addEventListener from 'choerodon-ui/lib/rc-components/util/Dom/addEventListener';
import Animate from 'choerodon-ui/lib/rc-components/animate';
import CardContent from './CardContent';
import warning from '../../../common/warning';

let dragItem = null;
let timeoutId = 0;


@inject('DashboardStore')
@observer
export default class Card extends Component {
  state = {
    dropSide: null,
  };

  relativeX = 0;

  relativeY = 0;

  height = null;

  onMouseMoveListener = null;

  onMouseUpListener = null;

  componentWillUnmount() {
    this.unSubscriptListener();
  }

  unSubscriptListener() {
    if (this.onMouseMoveListener) {
      this.onMouseMoveListener.remove();
      this.onMouseMoveListener = null;
    }
    if (this.onMouseUpListener) {
      this.onMouseUpListener.remove();
      this.onMouseUpListener = null;
    }
  }

  handleVisibleChange = (checked) => {
    const { data, DashboardStore } = this.props;
    DashboardStore.changeVisible(data, checked);
  };

  handleAnimateEnd = (key, flag) => {
    if (dragItem) {
      if (!flag) {
        const { top } = dragItem.parentNode.getBoundingClientRect();
        this.relativeY += top;
      } else {
        dragItem.style.zIndex = null;
        dragItem = null;
      }
    }
  };

  handleDragStart = ({ currentTarget, clientX, clientY }) => {
    timeoutId = setTimeout(() => {
      timeoutId = 0;
      const { onDragStart, data } = this.props;
      if (typeof onDragStart === 'function') {
        onDragStart(data);
      }
      dragItem = currentTarget.parentNode;
      const { top } = dragItem.parentNode.getBoundingClientRect();
      this.relativeX = clientX;
      this.relativeY = clientY - top;
      this.onMouseMoveListener = addEventListener(document, 'mousemove', this.handleDragMove);
    }, 250);
    this.onMouseUpListener = addEventListener(document, 'mouseup', this.handleDragEnd);
  };

  handleDragMove = ({ clientX, clientY }) => {
    Object.assign(dragItem.style, {
      left: `${clientX - this.relativeX}px`,
      top: `${clientY - this.relativeY}px`,
    });
  };

  handleDragLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.unSubscriptListener();
    }
  };

  handleDragEnd = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    this.unSubscriptListener();
    if (dragItem) {
      Object.assign(dragItem.style, {
        left: 0,
        top: 0,
        zIndex: 1,
      });
      const { onDragEnd } = this.props;
      if (typeof onDragEnd === 'function') {
        onDragEnd();
      }
    }
  };

  handleDropEnter = ({ currentTarget, clientY }) => {
    const { top, height } = currentTarget.getBoundingClientRect();
    const { dropSide: currentDropSide } = this.state;
    const dropSide = clientY - top > height / 2 ? 'bottom' : 'top';
    if (dropSide !== currentDropSide) {
      this.setState({
        dropSide,
      });
    }
  };

  handleDropLeave = () => {
    this.setState({
      dropSide: null,
    });
  };

  handleDrop = (e) => {
    const { onDrop, data } = this.props;
    const { dropSide } = this.state;
    if (dropSide) {
      if (typeof onDrop === 'function') {
        onDrop(e, data, dropSide);
      }
      this.setState({
        dropSide: null,
      });
    }
  };

  render() {
    const { prefixCls, component, data, DashboardStore, dragData } = this.props;
    const { dropSide } = this.state;
    const { editing } = DashboardStore;
    const { dashboardNamespace, dashboardCode, dashboardTitle, dashboardIcon, visible } = data;
    const dragging = dragData === data;
    const wrapperClassString = classNames(`${prefixCls}-card-wrapper`, {
      [`${prefixCls}-card-dragging`]: dragging,
      [`${prefixCls}-card-drop-${dropSide}`]: !!dropSide,
      [`${prefixCls}-card-disabled`]: !visible,
    });
    const wrapperProps = {
      className: wrapperClassString,
      // fix react 16.4.1 bug
      onMouseUp: () => {
      },
    };
    if (dragData && !dragging) {
      Object.assign(wrapperProps, {
        onMouseMove: this.handleDropEnter,
        onMouseLeave: this.handleDropLeave,
        onMouseUp: this.handleDrop,
      });
    }

    warning(!component, `Dashboard Component<${dashboardNamespace}/${dashboardCode}> is missing.`);

    return (
      <section {...wrapperProps}>
        <div className={`${prefixCls}-card-placeholder`}>
          <div className={`${prefixCls}-card`}>
            <header
              className={`${prefixCls}-card-title`}
              onMouseDown={this.handleDragStart}
              onMouseLeave={this.handleDragLeave}
            >
              <h1>
                <Icon type={dashboardIcon} />
                <span>
                  {dashboardTitle}
                </span>
                {
                  editing && (
                    <Switch className={`${prefixCls}-card-switch`} checked={visible} onChange={this.handleVisibleChange} />
                  )
                }
              </h1>
            </header>
            <Animate
              component=""
              transitionName="slide-up"
              showProp="visible"
              onEnd={this.handleAnimateEnd}
            >
              <CardContent visible={!dragData} key="content" prefixCls={prefixCls}>
                {component && createElement(component)}
              </CardContent>
            </Animate>
          </div>
        </div>
      </section>
    );
  }
}
