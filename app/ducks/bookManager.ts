// State

import { ApplicationState } from '.';
import { Dispatch } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import { remote } from 'electron';
import { storeBook, loadBookMetadata } from '../utils/fileManager';

export type BookRecord = {
  id: string;
  baseName: string;

  title?: string;
  author?: string;
  tags?: string[];
  progress?: number;
  publisher?: string;
  dateLastRead?: string;
  dateAdded?: string;
  size?: number;
  length?: number;
  kind?: 'epub' | 'pdf';
  year?: number;
};

export type State = {
  books: BookRecord[];
};

const initialState: State = { books: [] };

// Actions
const ADD_BOOK = 'ADD_BOOK_RECORD';
const REMOVE_BOOK = 'REMOVE_BOOK_RECORD';
const UPDATE_BOOK = 'UPDATE_BOOK_RECORD';

// Action Creators
export const addBook = (book: BookRecord) => ({
  type: ADD_BOOK,
  payload: { book }
});

export const removeBook = (id: string) => ({
  type: REMOVE_BOOK,
  payload: { id }
});

export const updateBook = (book: BookRecord) => ({
  type: UPDATE_BOOK,
  payload: { book }
});

export const addBookFromFileChooser = () => {
  return async (dispatch: Dispatch, getState: () => ApplicationState) => {
    const ret = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Documents', extensions: ['pdf', 'epub'] }]
    });

    ret.filePaths.map(async pth => {
      const id = uuidv4();
      const baseName = await storeBook(pth, id);
      const bookWithoutMetadata = {
        id,
        baseName
      };
      dispatch(addBook(bookWithoutMetadata));
      const book = await loadBookMetadata(bookWithoutMetadata);
      dispatch(updateBook(book));
    });
  };
};

// Reducer

export default function reducer(state: State, action: unknown): State {
  if (typeof state === 'undefined') return initialState;

  switch (action.type) {
    case ADD_BOOK:
      return {
        ...state,
        books: [...state.books, action.payload.book]
      };
    case REMOVE_BOOK:
      return {
        ...state,
        books: state.books.filter(bk => bk.id !== action.payload.id)
      };
    case UPDATE_BOOK:
      return {
        ...state,
        books: state.books.map(bk =>
          bk.id === action.payload.book.id ? action.payload.book : bk
        )
      };
    default:
      return state;
  }
}
