import React, { Component, createElement } from 'react';
import ReactDOM from 'react-dom';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import classes from 'component-classes';
import RenderInBody from './RenderInBody';
import './style';

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

@observer
class Mask extends Component {
  static defaultProps = {
    prefixCls: 'c7n-boot-guide-mask',
    visible: false,
    wrapperClassName: '',
    highLight: 'c7n-boot-header-user-avatar',
    idx: 0,
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    visible: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    wrapperClassName: PropTypes.string,
    indicator: PropTypes.node,
    highLight: PropTypes.string,
    idx: PropTypes.number,
  };

  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  getHighLightElement = () => {
    const { highLight, idx, prefixCls, tip, wrapperClassName, children, ...restProps } = this.props;
    const element = document.getElementsByClassName(highLight)[idx];
    const clientRect = element.getBoundingClientRect();
    const highLightElement = (
      <div className={`${prefixCls}-highLight`} key="highlight" style={{ left: clientRect.left, top: clientRect.top }} />
    );
    return highLightElement;
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }

  componentDidMount() {
    const elementClient = document.getElementsByClassName(this.props.highLight)[this.props.idx].getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const { top, left, width, height } = elementClient;
    this.setState({
      top,
      left,
      width,
      height,
      windowHeight,
      windowWidth,
    });
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    const elementClient = document.getElementsByClassName(this.props.highLight)[this.props.idx].getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const { top, left, width, height } = elementClient;
    this.setState({
      top,
      left,
      width,
      height,
      windowHeight,
      windowWidth,
    });
  };


  getOverlay = () => {
    const { top, left, width, height, windowWidth, windowHeight } = this.state;

    const maskStyle = {
      borderTopWidth: top,
      borderRightWidth: windowWidth - left - width,
      borderBottomWidth: windowHeight - top - height,
      borderLeftWidth: left,
      width: 'windowWidth',
      height: 'windowHeight',
    };
    const { prefixCls } = this.props;
    const maskElement = (
      <div className={`${prefixCls}-overlay`} style={maskStyle} key="mask" />
    );
    return maskElement;
  };

  render() {
    const { visible } = this.state;
    return (
      <RenderInBody>
        {
          visible
            ? this.getOverlay()
            : null
        }
      </RenderInBody>

    );
  }
}


Mask.newInstance = function confirm(properties, callback) {
  const { getContainer, ...props } = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  let called = false;
  function ref(notification) {
    if (called) {
      return;
    }
    called = true;
    callback({
      notice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      component: notification,
      destroy() {
        ReactDOM.unmountComponentAtNode(div);
        div.parentNode.removeChild(div);
      },
    });
  }
};

export default Mask;
