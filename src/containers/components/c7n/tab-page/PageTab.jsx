import React, { useState } from 'react';
import classNames from 'classnames';
import { Tabs } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';

const { TabPane } = Tabs;

export const Context = React.createContext({});

const PageTab = ({ children, ...props }) => (
  <React.Fragment>{children}</React.Fragment>
);

export default PageTab;
