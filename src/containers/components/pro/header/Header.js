import React, { PureComponent } from 'react';
import Logo from './Logo';
import SearchInputWrapper from './SearchInputWrapper';
import UserPreferences from './UserPreferences';
import Nav from './Nav';
import './style';

export default class Header extends PureComponent {
  render() {
    return (
      <div className="master-head-wrap">
        <div className="master-head-left">
          <Logo />
          <Nav />
        </div>
        <div className="master-head-center">
          {/* <SearchInputWrapper /> */}
        </div>
        <div className="master-head-right">
          <UserPreferences />
        </div>
      </div>
    );
  }
}
