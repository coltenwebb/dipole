import { Dispatch } from 'redux';
import { loadBookData, removeBookDirSafely } from './fileManager';
import { BookRecord, removeBook } from '../ducks/bookManager';
import {
  loadAnkiCards,
  loadHighlights,
  locate,
  loadBook
} from '../ducks/bookReader';

export default function openBook(dispatch: Dispatch, book: BookRecord) {
  const bookData = loadBookData(book.id);
  if (bookData) {
    dispatch(loadAnkiCards(bookData.ankiCards));
    dispatch(loadHighlights(bookData.highlights));
    dispatch(locate(bookData.cfi));
  }
  dispatch(loadBook(book));
}

export function removeBookCleanly(dispatch: Dispatch, book: BookRecord) {
  dispatch(removeBook(book.id));
  removeBookDirSafely(book.id, book.baseName);
}
