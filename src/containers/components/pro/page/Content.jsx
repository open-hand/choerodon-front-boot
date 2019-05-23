import React, { Component } from 'react';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { get } from 'mobx';
import Axios from '../axios';
import getHotkeyManager from '../masterPro/HotkeyManager';
import transformHotkey from '../../util/transformHotkey';
import './style';

@withRouter
@inject('AppState', 'MenuStore')
@observer
export default class PageContent extends Component {
  constructor(props) {
    super(props);
    this.urlKey = undefined;
    this.ref = React.createRef();
  }

  componentWillMount() {
    this.checkIfFocus(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkIfFocus(nextProps);
  }

  componentDidMount() {
    const { props: { MenuStore, history } } = this;
    const urlKey = history.location.pathname;
    this.registryHotkey();
    // MenuStore.setContentKey(urlKey, Date.now());
  }

  componentWillUnmount() {
    this.removeHotkey();
  }

  checkIfFocus = (props, isFocus = false) => {
    const { hotkeys, history } = props;
    if (hotkeys) {
      const urlKey = history.location.pathname;
      if (this.urlKey === urlKey || isFocus) {
        this.ref.current.focus();
      }
    }
  }

  registryHotkey() {
    const { props } = this;
    const { hotkeys, history } = props;
    if (hotkeys) {
      // registry hotkeys
      const hotkeyManager = getHotkeyManager();
      const urlKey = history.location.pathname;
      this.urlKey = urlKey;
      hotkeyManager.addHandlers({
        [urlKey]: hotkeys,
      });
      this.checkIfFocus(this.props, true);
    }
  }

  removeHotkey() {
    // remove hotkeys
    const { props } = this;
    const { hotkeys, history } = props;
    if (hotkeys && this.urlKey) {
      // registry hotkeys
      const hotkeyManager = getHotkeyManager();
      hotkeyManager.deleteHandlers([this.urlKey]);
    }
  }

  /**
   * get string of keydown, return `Shift+G` or such like this
   * @param {*} event 
   */
  handleEventToGetHotkeyString(event) {
    return transformHotkey(event);
  }

  handleOnKeyDown = (event) => {
    const hotkeyManager = getHotkeyManager();
    const { props } = this;
    const { hotkeys, history } = props;
    const urlKey = history.location.pathname;
    hotkeyManager.emit(urlKey, this.handleEventToGetHotkeyString(event), event);
  }

  render() {
    const { props } = this;
    const { className, children, style, history } = props;
    const classString = classNames('page-content', className);
    const styleObj = {
      ...style,
      posititon: 'absolute',
    };

    // const urlKey = history.location.pathname;
    // const key = get(props.MenuStore.contentKeys, [urlKey]);
    
    if (!props.hotkeys) {
      return (
        <div className={classString} style={styleObj}>
          {children}
        </div>
      );
    }
    return (
      <div className={classString} style={style} tabIndex="-1" onKeyDown={this.handleOnKeyDown} ref={this.ref}>
        {children}
      </div>
    );
  }
}
