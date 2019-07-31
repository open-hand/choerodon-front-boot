import React, { createContext, useMemo } from 'react';
import AppState from './AppState';

const Store = createContext();

export default Store;

export const AppProvider = (props) => {
  const { children } = props;
  const value = {
    ...props,
    AppState,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
};
