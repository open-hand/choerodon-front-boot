import React from 'react';
import { Icon } from 'choerodon-ui';

const Navbar = ({ children }) => (
  <nav className="c7n-boot-dashboard-navbar">
    <Icon type="arrow_forward" />
    {children}
  </nav>
);

export default Navbar;
