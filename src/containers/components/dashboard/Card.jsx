import React, { Component, createElement } from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import classes from 'component-classes';
import { Icon, Switch } from 'choerodon-ui';
import addEventListener from 'choerodon-ui/lib/rc-components/util/Dom/addEventListener';
import Animate from 'choerodon-ui/lib/rc-components/animate';
import CardContent from './CardContent';
import CardProvider from './CardProvider';
import warning from '../../../common/warning';

let dragItem = null;
let timeoutId = 0;

function findParent(node, cb) {
  let parent = node.parentNode;
  while (parent) {
    if (cb(parent)) {
      return parent;
    }
    parent = parent.parentNode;
  }
}

function findContainer(node) {
  return findParent(node, parent => classes(parent).has('page-content'));
}

@inject('DashboardStore')
@observer
export default class Card extends Component {
  state = {
    dropSide: null,
  };

  dndProps = {};

  onMouseMoveListener = null;

  onMouseWheelListener = null;

  onMouseUpListener = null;

  scrollInterval = null;

  componentWillUnmount() {
    this.unSubscriptListener();
  }

  unSubscriptListener() {
    if (this.scrollInterval) {
      cancelAnimationFrame(this.scrollInterval);
      this.scrollInterval = null;
    }
    if (this.onMouseMoveListener) {
      this.onMouseMoveListener.remove();
      this.onMouseMoveListener = null;
    }
    if (this.onMouseUpListener) {
      this.onMouseUpListener.remove();
      this.onMouseUpListener = null;
    }
    if (this.onMouseWheelListener) {
      this.onMouseWheelListener.remove();
      this.onMouseWheelListener = null;
    }
  }

  changeTop(top = dragItem.parentNode.getBoundingClientRect().top) {
    const { dndProps } = this;
    const { top: beginTop, relativeY } = this.dndProps;
    const deltaTop = top - beginTop;
    if (deltaTop !== 0) {
      const { top: originTop } = dragItem.style;
      dragItem.style.top = `${parseInt(originTop || 0, 10) - deltaTop}px`;
      this.dndProps = Object.assign(dndProps, {
        top,
        relativeY: relativeY + deltaTop,
      });
    }
  }

  scrollContainer = () => {
    const { container, deltaScroll } = this.dndProps;
    container.scrollTop += deltaScroll;
    if (dragItem) {
      this.changeTop();
    }
    if (this.scrollInterval) {
      this.scrollInterval = requestAnimationFrame(this.scrollContainer);
    }
  };

  handleVisibleChange = (checked) => {
    const { data, DashboardStore } = this.props;
    DashboardStore.changeVisible(data, checked);
  };

  handleAnimateEnd = (key, flag) => {
    if (dragItem) {
      if (!flag) {
        const { data, dragData, onAnimateEnd } = this.props;
        onAnimateEnd(dragData === data && (() => {
          const { dndProps } = this;
          const { top: beginTop } = dndProps;
          const container = findContainer(dragItem);
          const { left: containerLeft, top: containerTop, width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
          const { left, width, height, top } = dragItem.parentNode.getBoundingClientRect();
          const deltaTopFromAnimate = top - beginTop;
          const { clientHeight, scrollHeight } = container;
          this.dndProps = Object.assign(dndProps, {
            left,
            width,
            height,
            containerLeft,
            containerTop,
            containerWidth,
            containerHeight,
            deltaTopFromAnimate,
            hasScroll: scrollHeight > clientHeight,
            container,
          });
          this.changeTop(top);
          this.onMouseWheelListener = addEventListener(container, 'scroll', this.handleContainerScroll);
        }));
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
      this.dndProps = {
        top,
        relativeX: clientX,
        relativeY: clientY,
      };
      this.onMouseMoveListener = addEventListener(document, 'mousemove', this.handleDragMove);
    }, 250);
    this.onMouseUpListener = addEventListener(document, 'mouseup', this.handleDragEnd);
  };

  handleDragMove = ({ clientX, clientY }) => {
    const {
      left, top, width, height,
      containerLeft, containerTop, containerWidth, containerHeight,
      hasScroll, relativeX, relativeY,
    } = this.dndProps;
    const x = Math.max(containerLeft - left, Math.min(clientX - relativeX, containerWidth - width - left + containerLeft));
    const y = Math.max(containerTop - top, Math.min(clientY - relativeY, containerHeight - height - top + containerTop));

    Object.assign(dragItem.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (hasScroll) {
      let delta = 0;
      const offsetTop = containerTop + height;
      const offsetBottom = containerTop + containerHeight - height;
      if (clientY < offsetTop) {
        delta = clientY - offsetTop;
      } else if (clientY > offsetBottom) {
        delta = clientY - offsetBottom;
      }
      if (delta !== 0) {
        this.dndProps.deltaScroll = delta / 10;
        this.scrollInterval = requestAnimationFrame(this.scrollContainer);
      } else if (this.scrollInterval) {
        cancelAnimationFrame(this.scrollInterval);
        this.scrollInterval = null;
      }
    }
  };

  handleContainerScroll = () => {
    this.changeTop();
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
      const { top: styleTop } = dragItem.style;
      Object.assign(dragItem.style, {
        transition: 'none',
        top: `${parseInt(styleTop || 0, 10) + this.dndProps.deltaTopFromAnimate}px`,
        zIndex: 1,
      });
      setTimeout(() => {
        Object.assign(dragItem.style, {
          transition: '',
          left: 0,
          top: 0,
        });
      }, 0);
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
    };
    if (dragData && !dragging) {
      Object.assign(wrapperProps, {
        onMouseMove: this.handleDropEnter,
        onMouseLeave: this.handleDropLeave,
        onMouseUp: this.handleDrop,
      });
    }

    warning(!!component, `Dashboard Component<${dashboardNamespace}/${dashboardCode}> is missing.`);
    return (
      <section {...wrapperProps}>
        <div className={`${prefixCls}-card-placeholder`}>
          <CardProvider>
            {
              toolBar => (
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
                      {
                        toolBar
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
              )
            }
          </CardProvider>
        </div>
      </section>
    );
  }
}
