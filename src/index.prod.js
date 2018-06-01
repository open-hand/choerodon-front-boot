/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { useStrict } from 'mobx'
import HappyPack from 'happypack';

const el = document.getElementById('app');

useStrict(true);

render(
        <App />, el
);
