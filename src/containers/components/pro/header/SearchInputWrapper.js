import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { inject } from 'mobx-react';
import SearchInput from './SearchInput';

@withRouter
@inject('MenuStore')
export default class SearchInputWrapper extends PureComponent {
  handleChange = (code) => {
    const { MenuStore, history } = this.props;
    const { treeNodeMenus, activeMenu } = MenuStore;
    const target = treeNodeMenus.find(node => node.functionCode === code);
    if (target && target.functionCode !== activeMenu.functionCode) {
      const LINK_MAP = {
        REACT: `/${target.url}`,
        HTML: `/iframe/${target.functionCode}`,
      };
      const desUrl = LINK_MAP[target.symbol] || '/';
      history.push(desUrl);
    }
  };

  render() {
    return (
      <SearchInput onChange={this.handleChange} />
    );
  }
}
