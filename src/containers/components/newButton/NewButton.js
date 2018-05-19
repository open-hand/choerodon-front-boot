import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './NewButton.less';

// const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
// const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

function defaultLoading(element) {
  return element;
}

class NewButton extends React.Component {
  static propTpyes = {
    text: PropTypes.string,
    htmlType: PropTypes.oneOf(['submit', 'button', 'reset']),
    width: PropTypes.number,
    height: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    onHandle: PropTypes.func,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    iconLoading: PropTypes.bool,
    loadingRender: PropTypes.func,
    clicked: PropTypes.bool,
  };

  static defaultProps = {
    prefixCls: 'custom-btn',
    htmlType: 'button',
    disabled: false,
    height: 26,
    loadingRender: defaultLoading,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    // this.insertSpace = this.insertSpace.bind(this);
    this.state = {
      iconLoading: props.iconLoading,
      // disabled: props.disabled,
      // clicked: false,
    };
  }

  // button中文留空格
  // insertSpace = (text) => {
  //   let a = text;
  //   const flag = typeof a === 'string';
  //   if (a === null) {
  //     return null;
  //   } else if (flag) {
  //     const SPACE = isTwoCNChar(a) ? ' ' : '';
  //     a = a.split('').join(SPACE);
  //     return a;
  //   }
  //   return <span>{a}</span>;
  // }

  handleClick = (e) => {
    // this.setState({ clicked: true });
    const { htmlType, onClick, disabled } = this.props;
    // const { disabled } = this.state;
    if (disabled || htmlType === 'button') {
      e.preventDefault();
    }
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
  }

  render() {
    const { style = {}, className, width, height, htmlType,
      icon, prefixCls, text, disabled, clicked, loading } = this.props;
    style.width = width || '';
    style.height = height || '';
    const { iconLoading } = this.state;
    const classes = classNames(prefixCls, className, {
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-clicked`]: clicked,
    });
    const LoadNode = this.props.loadingRender(
      <div className="loading-circle"><div className="object" id="object-one" /><div className="object" id="object-two" /><div className="object" id="object-three" /></div>);
    const iconNode = icon ? <i className={`icon-${icon}`} /> : null;
    const textShow = <span>{text}</span>;
    let show = '';
    if (icon) {
      if (iconLoading) {
        show = classes.indexOf('icon-right') === -1 ? (<div className="button-wrap">{LoadNode}{textShow}</div>) :
          (<div className="button-wrap">{textShow}{LoadNode}</div>);
      } else {
        show = classes.indexOf('icon-right') === -1 ? (<div className="button-wrap">{iconNode}{textShow}</div>) :
          (<div className="button-wrap">{textShow}{iconNode}</div>);
      }
    } else {
      show = loading ? (<div className="button-wrap">{textShow}{LoadNode}</div>) :
        (<div className="button-wrap">{textShow}</div>);
    }

    return (
      <button
        type={htmlType}
        disabled={disabled}
        className={classes}
        style={style}
        onClick={this.handleClick}
      >
        {show}
      </button>
    );
  }
}

export default NewButton;
