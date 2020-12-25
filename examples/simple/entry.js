import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  console.log(window._env_);
  return <div>the core module</div>;
};

ReactDOM.render(<App />, document.getElementById('app'));
