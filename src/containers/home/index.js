import React from 'react';
import { Progress } from 'choerodon-ui';
import styles from './index.less';

function Home() {
  return (
    <div className={styles.spin}>
      <Progress type="loading" />
    </div>
  );
}

export default Home;
