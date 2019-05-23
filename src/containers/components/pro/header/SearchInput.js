import React, { Component } from 'react';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Icon, Select } from 'choerodon-ui/pro';

const { Option } = Select;

@inject('MenuStore')
@observer
export default class SearchInput extends Component {
  @observable code;

  constructor(props) {
    super(props);
    this.setCode(null);
  }

  handleChange = (code) => {
    this.setCode(code);
    const { onChange } = this.props;
    onChange(code);
  };

  @action
  setCode(code) {
    this.code = code;
  }

  render() {
    const { MenuStore } = this.props;
    return (
      <div className="search-input-wrap">
        <Icon type="search" />
        <Select
          style={{ width: 400, borderRadius: 2 }}
          placeholder="输入功能代码或功能名称"
          value={this.code}
          // optionFilterProp="children"
          // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          // filter
          onChange={this.handleChange}
          clearButton={false}
          searchable
        >
          {
            MenuStore.treeNodeMenus.map(node => (
              <Option
                key={node.functionCode}
                value={node.functionCode}
              >
                {node.text}
              </Option>
            ))
          }
        </Select>
      </div>
    );
  }
}
