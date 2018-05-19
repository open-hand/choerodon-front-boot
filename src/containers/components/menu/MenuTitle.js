/**
 * Created by jaywoods on 2017/6/23.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';

const styles = {
  IconStyle: {
    position: 'absolute',
    top: 13,
    color: 'black',
    fontSize: 20,
    marginLeft: -17,
  },
  MenuTitleOutSpan: {
    fontSize: 18,
    color: 'rgb(69, 69, 70)',
    marginLeft: 10,
    marginTop: 10,
  },
  MenuTitleOutSpanMore: {
    fontSize: 18,
    color: 'rgb(69, 69, 70)',
    marginLeft: -5,
    marginTop: 10,
  },
  MenuTitleInSpan: {
    marginLeft: 30,
    fontSize: 16,
  },
};
class MenuTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  goHome() {
    const { history } = this.props;
    history.push('/');
  }
  render() {
    const { single } = this.props;
    const header = process.env.HEADER_TITLE_NAME || 'Hand Cloud Platform';
    const MenuTitleComponent = single ? (
      <span style={styles.MenuTitleOutSpan} onClick={this.goHome.bind(this)} role="button">
        <Icon
          type="cloud"
          onClick={this.goHome.bind(this)}
          style={styles.IconStyle}
        /><span style={styles.MenuTitleInSpan}>{header}</span>
      </span>) :
      (<span style={styles.MenuTitleOutSpanMore} onClick={this.goHome.bind(this)} role="button">
        <span>{header}</span>
      </span>);
    return (
      <span style={styles.MenuTitleOutSpan} onClick={this.goHome.bind(this)} role="button">
        {MenuTitleComponent}
      </span>
    );
  }
}
MenuTitle.propTypes = {
  single: PropTypes.boolean,
};
export default MenuTitle;
