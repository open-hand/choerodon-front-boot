import React, { useState } from 'react';
import classNames from 'classnames';
import { Tabs } from 'choerodon-ui';
import './style/PageWrap.less';

const { TabPane } = Tabs;

export const Context = React.createContext({});

const PageWrap = ({ children, noHeader, ...props }) => {
  const keyArr = React.Children.map(children, child => child.props.tabKey);
  const [currentKey, setCurrentKey] = useState(keyArr[0]);

  function callback(key) {
    setCurrentKey(key && key.split('/')[0]);
  }

  return (
    <Context.Provider value={{ isTab: true }}>
      <Tabs
        className={classNames('wrap-tabs', { hasHeader: !noHeader.includes(currentKey) })}
        animated={false}
        onChange={callback}
      >
        {
          React.Children.map(children, (child) => {
            const { type: { name } } = child;
            if (name === 'PageTab') {
              return (
                <TabPane
                  tab={child.props.title}
                  key={child.props.tabKey}
                >
                  {React.createElement(child.props.component, props)}
                </TabPane>
              );
            } else {
              return child;
            }
          })
        }
      </Tabs>
    </Context.Provider>
  );
};

export default PageWrap;
