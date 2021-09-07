import React, { useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { remote } from 'electron';
import TableOfContents from './TableOfContents';
import AnnotationTable from './AnnotationTable/AnnotationTable';
import styles from './BookReader.css';
import routes from '../../constants/routes.json';
import Toolbar from '../UI/Toolbar/Toolbar';
import ToolbarButton from '../UI/Toolbar/Button';
import { ApplicationState } from '../../ducks';
import { BookRecord } from '../../ducks/bookManager';
import { unloadBook, LocationDescription } from '../../ducks/bookReader';
import EpubViewer from './Epub/EpubViewer';
import Spacer from '../UI/Toolbar/Spacer';
import ToolbarText from '../UI/Toolbar/Text';
import PdfViewer from './Pdf/PdfViewer';

export default function BookReader() {
  const [showToc, setShowToc] = useState(false);
  const toggleShowToc = () => setShowToc(!showToc);

  // react-router wants us to render a redirect to change pages
  const dispatch = useDispatch();
  const redirectBack = () => {
    dispatch(unloadBook());
  };

  const currentBookRecord = useSelector<
    ApplicationState,
    BookRecord | undefined
  >(state => state.bookReader.bookRecord);
  const shouldRenderBackRedirect = typeof currentBookRecord === 'undefined';

  if (currentBookRecord?.title)
    remote.getCurrentWindow().setTitle(currentBookRecord?.title);

  return (
    <>
      {shouldRenderBackRedirect && <Redirect to={routes.BOOK_MANAGER} />}
      <div className={styles.pageContainer}>
        <div className={styles.viewerContainer}>
          <Toolbar isTitleBar inset>
            <ToolbarButton fa="fas fa-arrow-left" onClick={redirectBack} />
            <ToolbarButton fa="far fa-list-alt" onClick={toggleShowToc} />
            <Spacer />
            <ToolbarText isTitleText>{currentBookRecord?.title}</ToolbarText>
            <Spacer />
          </Toolbar>
          <div className={styles.viewer}>
            <TableOfContents
              hidden={!showToc}
              onBlur={() => setShowToc(false)}
            />
            <EpubViewer />
            {/* <PdfViewer /> */}
          </div>
        </div>
        <AnnotationTable />
      </div>
    </>
  );
}
