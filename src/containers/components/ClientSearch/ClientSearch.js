/**
* Created by hand on 2017/8/12.
*/
import React, { Component } from 'react';
import { Input } from 'antd';
import Select from 'Select';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import './search.less';

// const Option = Select.Option;

@inject('AppState')
@observer
class ClientSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenOption: '',
      inputValue: '',
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeInput = this.changeInput.bind(this);
  }

  componentDidMount() {
    const search = document.getElementById('redirect-input');
    // const iconP = document.getElementById('redirect-icon').parentNode;
    // iconP.setAttribute('class', 'ant-input-group-addon iconPNode');
    search.addEventListener('keyup', (e) => {
      if (e.keyCode === 13) {
        this.handleSearch();
      }
    });
  }

  handleChange = (value) => {
    this.setState({
      chosenOption: value,
      inputValue: '',
    });
  }

  handleSearch = () => {
    this.props.onSearch({ code: this.state.chosenOption, input: this.state.inputValue });
  }

  changeInput = (e) => {
    this.setState({
      inputValue: e.target.value,
    });
  }

  render() {
    const { options } = this.props;
    let selectBefore;
    if (options) {
      selectBefore = (
        <Select
          type2
          data={this.props.options}
          onChange={this.handleChange.bind(this)}
        />
        // <Select onChange={this.handleChange.bind(this)} defaultValue="请选择">
        //   <Option value="">请选择</Option>
        //   {options.map(item => (
        //     <Option key={Math.random()} value={item.code}>{item.name}</Option>
        //   ))}
        // </Select>
      );
    }
    return (
      <div style={{ display: 'flex' }} className="custom-input">
        {selectBefore}
        <Input prefix={<span role="none" className="icon-search" />} id="redirect-input" value={this.state.inputValue} className="redirect-input" onChange={this.changeInput.bind(this)} style={{ width: '380px', marginLeft: 12 }} />
      </div>
    );
  }
}
export default withRouter(ClientSearch);
