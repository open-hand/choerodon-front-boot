/*eslint-disable*/
import { AppContainer } from 'react-hot-loader'
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { useStrict } from 'mobx'

const el = document.getElementById('app')

useStrict(true)

render(
    <AppContainer>
        <App />
    </AppContainer>
    , el
);

if (module.hot) {
    module.hot.accept('./App', () => {
        const NextApp = require('./App').default;

        render(
            <AppContainer>
                <NextApp />
            </AppContainer>, el);
    });
}
