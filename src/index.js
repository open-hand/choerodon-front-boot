/*eslint-disable*/
import { AppContainer } from 'react-hot-loader'
import React from 'react';
import { render } from 'react-dom';
import { useStrict } from 'mobx'
import App from './App';

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
