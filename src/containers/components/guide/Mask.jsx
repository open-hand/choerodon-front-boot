import React, { Component, createElement } from 'react';
import ReactDOM from 'react-dom';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import classes from 'component-classes';
import RenderInBody from './RenderInBody';
import './style';

function findParent(node, level) {
  if (level > 0 && node) {
    return findParent(node.parentNode, level - 1);
  } else {
    return node;
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
    highLight: '',
    idx: 0,
    level: 0,
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
    level: PropTypes.number,
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

  setMask = () => {
    const domHighLight = findParent(document.getElementsByClassName(this.props.highLight)[this.props.idx], this.props.level);
    if (domHighLight) {
      const elementClient = domHighLight.getBoundingClientRect();
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
    } else {
      this.setState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
      });
    }
  };

  componentDidMount() {
    this.setMask();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    this.setMask();
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
      <div>
        <div className={`${prefixCls}-clickable`} onClick={() => { this.setState({ visible: false }); }} style={maskStyle} key="mask" />
      </div>
    );
    return maskElement;
  };

  render() {
    const { visible } = this.state;
    const { children } = this.props;
    return (
      <React.Fragment>
        <a onClick={() => this.setState({ visible: true }, () => this.setMask())}> {children} </a>
        <RenderInBody>
          {
            visible
              ? this.getOverlay()
              : null
          }
        </RenderInBody>
      </React.Fragment>
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
