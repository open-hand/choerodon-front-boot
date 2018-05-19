import React from 'react';
import PropTypes from 'prop-types';
import KEYCODE from './keyCode';

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.current,
      goInputText: '',
    };
  }

  // buildOptionText = (value) => {
  //   return `${value} { Choerodon.getMessage("条\\页","columns\\page") }`;
  // }

  changeSize = (value) => {
    this.props.changeSize(Number(value));
  }

  handleChange = (e) => {
    this.setState({
      goInputText: e.target.value,
    });
  }

  go = (e) => {
    let val = this.state.goInputText;
    if (val === '') {
      return;
    }
    val = Number(val);
    if (isNaN(val)) {
      val = this.state.current;
    }
    if (e.keyCode === KEYCODE.ENTER || e.type === 'click') {
      this.setState({
        goInputText: '',
        current: this.props.quickGo(val),
      });
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = `${props.rootPrefixCls}-options`;
    const { changeSize, quickGo, goButton } = this.props;
    // const buildOptionText = this.props.buildOptionText || this.buildOptionText;
    const Select = this.props.selectComponentClass;
    let changeSelect = null;
    let goInput = null;
    let gotoButton = null;

    if (!(changeSize || quickGo)) {
      return null;
    }

    if (changeSize && Select) {
      const Option = Select.Option;
      const pageSize = this.props.pageSize || this.props.pageSizeOptions[0];
      const options = this.props.pageSizeOptions.map(opt => (
        this.props.buildOptionText ?
          <Option key={Math.random() * 10} value={opt}>{this.props.buildOptionText}</Option> :
          <Option key={Math.random() * 10} value={opt}>{`${opt} { Choerodon.getMessage("条\\页","columns\\page") }`}</Option>
      ));

      changeSelect = (
        <Select
          prefixCls={props.selectPrefixCls}
          showSearch={false}
          className={`${prefixCls}-size-changer`}
          optionLabelProp="children"
          dropdownMatchSelectWidth={false}
          value={pageSize.toString()}
          onChange={this.changeSize}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {options}
        </Select>
      );
    }

    if (quickGo) {
      if (goButton) {
        if (typeof goButton === 'boolean') {
          gotoButton = (
            <button
              type="button"
              onClick={this.go}
              onKeyUp={this.go}
            >
              {Choerodon.getMessage('确定', 'sure')}
            </button>
          );
        } else {
          gotoButton = goButton;
        }
      }
      goInput = (
        <div className={`${prefixCls}-quick-jumper`}>
          {Choerodon.getMessage('跳至', 'jumpTo')}
          <input
            type="text"
            value={state.goInputText}
            onChange={this.handleChange}
            onKeyUp={this.go}
          />
          {Choerodon.getMessage('页', 'page')}
          {gotoButton}
        </div>
      );
    }

    return (
      <li className={`${prefixCls}`}>
        {changeSelect}
        {goInput}
      </li>
    );
  }
}
Options.propTypes = {
  changeSize: PropTypes.func,
  quickGo: PropTypes.func,
  current: PropTypes.number,
  selectComponentClass: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.string),
  pageSize: PropTypes.number,
  // buildOptionText: PropTypes.func,
};

Options.defaultProps = {
  pageSizeOptions: ['10', '20', '30', '40'],
};
export default Options;
