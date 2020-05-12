import React from 'react';
import ReactDOM from 'react-dom';
import * as reactRedux from 'react-redux';
import App from './App';
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configureStore';
import configureFetch from './store/configureFetch';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import PollingClient from './PollingClient';

const store = configureStore();
configureFetch();

const polling = new PollingClient(store)
polling.start()

ReactDOM.render(
  <React.StrictMode>
    <reactRedux.Provider store={store}>
      <App />
    </reactRedux.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
