import React from 'react';
import { remote } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import styles from './BookManager.css';
import Toolbar from '../UI/Toolbar/Toolbar';
import BookManagerSidebar from './Sidebar';
import BookManagerTable from './Table';
import ToolbarButton from '../UI/Toolbar/Button';
import {
  openPathInFileExplorer,
  getStoragePath
} from '../../utils/fileManager';
import { BookRecord, addBookFromFileChooser } from '../../ducks/bookManager';
import routes from '../../constants/routes.json';
import { ApplicationState } from '../../ducks';

export default function BookReader() {
  const dispatch = useDispatch();

  const addBookButtonClick = dispatch(addBookFromFileChooser);

  const currentBookRecord = useSelector<
    ApplicationState,
    BookRecord | undefined
  >(state => state.bookReader.bookRecord);
  const shouldRenderBookRedirect = typeof currentBookRecord !== 'undefined';

  return (
    <>
      {shouldRenderBookRedirect && <Redirect to={routes.BOOK_READER} />}

      <div className={styles.container}>
        <BookManagerSidebar />
        <div className={styles.tableGroupContainer}>
          <Toolbar isTitleBar>
            <ToolbarButton fa="fas fa-plus" onClick={addBookButtonClick} />
            <ToolbarButton
              fa="far fa-folder-open"
              onClick={() => {
                openPathInFileExplorer(getStoragePath());
              }}
            />
          </Toolbar>
          <BookManagerTable />
        </div>
      </div>
    </>
  );
}
