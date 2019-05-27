import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import Mask from './Mask';
import './style';

@inject('AppState')
@observer
class AutoGuide extends Component {
  state = {
    current: -1,
    timer: null,
  };

  static defaultProps = {
    visible: false,
    highLight: [],
    idx: [],
    level: [],
    mode: ['mask'],
    time: 1000,
  };

  static propTypes = {
    visible: PropTypes.bool,
    highLight: PropTypes.arrayOf(PropTypes.string),
    idx: PropTypes.arrayOf(PropTypes.number),
    level: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.arrayOf(PropTypes.string),
    time: PropTypes.number,
    route: PropTypes.string,
    siteLevel: PropTypes.string,
    onLeave: PropTypes.func,
    onEnter: PropTypes.func,
    onStart: PropTypes.func,
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

  execGuide = () => {
    const { current } = this.state;
    const { highLight, mode, idx } = this.props;
    if (mode[current + 1] === 'click') document.getElementsByClassName(highLight[current])[idx[current]].click();
    this.setState({
      current: current + 1,
    });
  };

  handleStart = () => {
    const { time, onStart } = this.props;
    if (onStart) onStart();
    if (this.checkIsClickable()) {
      this.execGuide();
      const timer = setInterval(() => {
        const { current } = this.state;
        const { highLight } = this.props;
        if (current < highLight.length - 1) {
          this.execGuide();
        } else {
          clearInterval(this.state.timer);
        }
      }, time);
      this.setState({ timer });
    }
  };

  getMasks = () => {
    const { highLight, idx, level, mode } = this.props;
    const { current } = this.state;
    return (
      highLight.map((v, i) => (
        <Mask
          highLight={highLight[i]}
          idx={idx[i] || 0}
          level={level[i] || 0}
          mode={mode[i]}
          visible={current === i && mode[i] !== 'click'}
          onEnter={this.handleFinalClick}
          onLeave={this.handleFinalClick}
        />
      ))
    );
  };

  handleFinalClick = () => {
    const { timer } = this.state;
    if (timer) clearInterval(timer);
    this.setState({
      current: -1,
    });
  };

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <a onClick={this.handleStart}> {children} </a>
        {this.getMasks()}
      </React.Fragment>
    );
  }
}

export default AutoGuide;
