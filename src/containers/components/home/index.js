import React from 'react';
import { Progress } from 'choerodon-ui';
import './index.less';

function Home() {
  return (
    <div className="spin-container">
      <Progress type="loading" />
    </div>
  );
}

export default Home;
