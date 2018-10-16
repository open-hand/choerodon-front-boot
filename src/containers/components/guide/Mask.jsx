import React, { Component, createElement } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import classes from 'component-classes';
import RenderInBody from './RenderInBody';
import './style';

let captureLock = false;

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

function findEventCapture(dom) {
  if (dom && dom.onclick === null) {
    for (let i = 0; i < dom.childNodes.length; i += 1) {
      if (dom.childNodes[i].onclick === null) {
        return findEventCapture(dom.childNodes[i]);
      } else {
        return dom.childNodes[i];
      }
    }
  } else {
    return dom;
  }
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
        domHighLight,
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

  handleClick = (e, domHighLight) => {
    findEventCapture(domHighLight).click();
    captureLock = false;
    this.setState({ visible: false });
  };

  getOverlay = () => {
    const { top, left, width, height, windowWidth, windowHeight, visible, domHighLight } = this.state;

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
        <div className={`${prefixCls}-overlay`} style={{ width: left, display: visible ? 'block' : 'none' }} onClick={() => { this.setState({ visible: false }); }} />
        <div className={`${prefixCls}-overlay`} style={{ left: left + width, display: visible ? 'block' : 'none' }} onClick={() => { this.setState({ visible: false }); }} />
        <div className={`${prefixCls}-overlay`} style={{ width, left, top: height + top, display: visible ? 'block' : 'none' }} onClick={() => { this.setState({ visible: false }); }} />
        <div className={`${prefixCls}-overlay`} style={{ width, left, top: 0, height: top, display: visible ? 'block' : 'none' }} onClick={() => { this.setState({ visible: false }); }} />
        <div className={classnames(`${prefixCls}-clickable`, visible ? `${prefixCls}-border` : '')} style={maskStyle} key="mask" />
        <div className={`${prefixCls}-clickable-btn`} style={{ top, left, width, height, display: visible ? 'block' : 'none' }} onClick={e => this.handleClick(e, domHighLight)} />
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
            this.getOverlay()
          }
        </RenderInBody>
      </React.Fragment>
    );
  }
}

export default Mask;
