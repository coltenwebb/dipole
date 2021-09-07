import { combineReducers, Store as ReduxStore, Action } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';
import bookReader, { State as BookReaderState } from './bookReader';
import bookManager, { State as BookManagerState } from './bookManager';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    bookReader,
    bookManager
  });
}

export interface ApplicationState {
  router: RouterState;
  bookReader: BookReaderState;
  bookManager: BookManagerState;
}

export type Store = ReduxStore<ApplicationState, Action<string>>;
