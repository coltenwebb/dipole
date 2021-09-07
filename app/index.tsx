import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { throttle } from 'lodash';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { onStoreUpdate, storeLoad } from './utils/fileManager';

const store = configureStore(storeLoad());

store.subscribe(
  throttle(() => {
    onStoreUpdate(store.getState(), store.dispatch);
  }),
  1000
);

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  )
);
