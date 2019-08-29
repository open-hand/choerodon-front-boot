import React from 'react';
import obj from '../../tmp/transfer.index';

const App = ({ AutoRouter }) => {
  console.log(obj.fun(1, 2));
  return (
    <AutoRouter />
  );
};

export default App;
