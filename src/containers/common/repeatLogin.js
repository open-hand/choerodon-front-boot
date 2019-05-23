import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { authorize, logout } from './authorize';
import axios from '../components/pro/axios';
import AppState from '../stores/pro/AppState';

const modalKey = Modal.key();

function repeatLigin() {
  Modal.open({
    key: modalKey,
    title: '提示',
    children: '异地登录，请重新登录',
    okCancel: false,
    onOk: () => {
      if (AppState.isCas) {
        logout();
      } else {
        axios.post('/logout')
          .then(() => {
            authorize();
          });
      }
    },
  });
}

export default repeatLigin;
