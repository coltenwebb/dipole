import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import BookManagerPage from './containers/BookManagerPage';
import BookReaderPage from './containers/BookReaderPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.BOOK_READER} component={BookReaderPage} />
        <Route path={routes.BOOK_MANAGER} component={BookManagerPage} />
      </Switch>
    </App>
  );
}
