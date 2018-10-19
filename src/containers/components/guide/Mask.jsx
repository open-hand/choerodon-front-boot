import React, { Component } from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
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

@inject('AppState')
@observer
class Mask extends Component {
  static defaultProps = {
    prefixCls: 'c7n-boot-guide-mask',
    visible: false,
    wrapperClassName: '',
    highLight: '',
    idx: 0,
    level: 0,
    mode: 'mask',
    route: '',
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
    mode: PropTypes.string,
    route: PropTypes.string,
    siteLevel: PropTypes.string,
    onLeave: PropTypes.func,
    onEnter: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
      clickAble: false,
    };
  }

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
        clickAble: this.checkIsClickable(),
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
        clickAble: this.checkIsClickable(),
      });
    }
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.setMask);
    this.setMask();
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.setMask);
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = () => {
    this.setMask();
  };

  handleEnter = (e) => {
    document.getElementsByClassName(this.props.highLight)[this.props.idx].click();
    captureLock = false;
    this.setState({ visible: false });
    if (this.props.onEnter) this.props.onEnter(e);
  };


  handleLeave = (e) => {
    this.setState({ visible: false });
    if (this.props.onLeave) this.props.onLeave(e);
  };

  handleMaskClick = (e) => {
    const { mode } = this.props;
    if (this.checkIsClickable()) {
      switch (mode) {
        case 'click':
          document.getElementsByClassName(this.props.highLight)[this.props.idx].click();
          break;
        case 'mask':
          this.setState({ visible: true }, () => this.setMask());
          break;
        default:
          this.setState({ visible: true }, () => this.setMask());
          break;
      }
    }
  };

  checkSiteLevel = () => {
    const { AppState, siteLevel } = this.props;
    if (siteLevel) {
      return siteLevel === AppState.menuType.type || !AppState.menuType.type;
    }
    return true;
  };

  checkRoute = () => {
    const { route } = this.props;
    // const { hash } =
    if (route) {
      return route === document.location.hash.substring(1, document.location.hash.indexOf('?') === -1 ? document.location.hash.length : document.location.hash.indexOf('?'));
    }
    return true;
  };

  checkIsClickable = () => this.checkRoute() && this.checkSiteLevel();

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
        <div className={`${prefixCls}-overlay`} style={{ width: left, display: visible ? 'block' : 'none' }} onClick={e => this.handleLeave(e)} />
        <div className={`${prefixCls}-overlay`} style={{ left: left + width, display: visible ? 'block' : 'none' }} onClick={e => this.handleLeave(e)} />
        <div className={`${prefixCls}-overlay`} style={{ width, left, top: height + top, display: visible ? 'block' : 'none' }} onClick={e => this.handleLeave(e)} />
        <div className={`${prefixCls}-overlay`} style={{ width, left, top: 0, height: top, display: visible ? 'block' : 'none' }} onClick={e => this.handleLeave(e)} />
        <div className={classnames(`${prefixCls}-clickable`, visible ? `${prefixCls}-border` : '')} style={maskStyle} key="mask" />
        <div className={`${prefixCls}-clickable-btn`} style={{ top, left, width, height, display: visible ? 'block' : 'none' }} onClick={e => this.handleEnter(e, domHighLight)} />
      </div>
    );
    return maskElement;
  };

  render() {
    const { children, prefixCls } = this.props;
    return (
      <React.Fragment>
        <a onClick={e => this.handleMaskClick(e)} className={classnames(this.state.clickAble ? `${prefixCls}-valid` : `${prefixCls}-invalid`)}> {children} </a>
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
