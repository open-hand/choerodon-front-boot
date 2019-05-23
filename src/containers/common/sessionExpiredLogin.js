import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { authorize } from './authorize';

const modalKey = Modal.key();

function sessionExpiredLogin() {
  Modal.open({
    key: modalKey,
    title: '提示',
    children: '登录超时，请重新登录',
    okCancel: false,
    onOk: () => {
      authorize();
    },
    closeable: true,
  });
}

window.sessionExpiredLogin = sessionExpiredLogin;

export default sessionExpiredLogin;
