import React, { useState, ChangeEvent, FormEvent, Fragment } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { ApplicationState } from '../../../ducks';
import styles from './AnnotationTable.css';
import ToolbarButton from '../../UI/Toolbar/Button';
import Toolbar from '../../UI/Toolbar/Toolbar';
import AnnotationTableHighlightCard from './HighlightCard';
import {
  setAnkiCardAnkiNoteId,
  setAnkiCardSyncStatus,
  AnkiCard,
  Highlight,
  clearLocatedHighlightInTable
} from '../../../ducks/bookReader';
import syncAllCards from '../../../utils/ankiSync';
import { BookRecord } from '../../../ducks/bookManager';
import ToolbarText from '../../UI/Toolbar/Text';

type Props = {};

export default function AnnotationTable(props: Props) {
  const dispatch = useDispatch();

  const highlights = useSelector<ApplicationState, Highlight[]>(
    state => state.bookReader.bookData?.highlights || []
  );

  const book = useSelector<ApplicationState, BookRecord | undefined>(
    state => state.bookReader.bookRecord
  );

  const [selected, setSelected] = useState('');
  const [editing, setEditing] = useState('');

  // so we can highlight the element were gonna scroll to
  // the rest of the logic is in highlight card since we need to use a ref
  const scrollToHighlight = useSelector<ApplicationState, string>(
    state => state.bookReader.highlightIdInTable || ''
  );
  if (scrollToHighlight !== '') {
    const newSelected =
      highlights.find(hl => hl.id === scrollToHighlight)?.cfiRange || '';
    if (selected !== newSelected) setSelected(newSelected);
    if (editing) setEditing('');
  }

  function createHandleClick(key: string) {
    return (e: React.MouseEvent<HTMLElement>) => {
      if (editing !== key) {
        setSelected(key);
        setEditing('');
      }

      e.stopPropagation();
    };
  }

  function createHandleDoubleClick(key: string) {
    return (e: React.MouseEvent<HTMLElement>) => {
      if (selected === key) {
        setEditing(key);
        setSelected('');
      }
      e.stopPropagation();
    };
  }

  function clear(e: React.MouseEvent<HTMLElement>) {
    setEditing('');
    setSelected('');
  }

  const ankiCards = useSelector<ApplicationState, AnkiCard[]>(
    state => state.bookReader.bookData.ankiCards || []
  );

  const collectionSyncStatus = useSelector<ApplicationState, string>(
    state => state.bookReader.collectionSyncStatus || 'unknown'
  );

  const collectionSyncErrorMsg = useSelector<ApplicationState, string>(
    state => state.bookReader.collectionSyncErrorMsg || 'error msg not set'
  );

  const onSyncButtonClick = async () => {
    if (typeof book === 'undefined')
      throw new Error('cannot sync because book is undefined');
    syncAllCards(dispatch, ankiCards, highlights, book);
  };

  return (
    <div className={styles.annotationTableContainer}>
      <Toolbar isTitleBar inset>
        <ToolbarButton fa="fas fa-sync-alt" onClick={onSyncButtonClick} />
        <ToolbarText>
          {collectionSyncStatus}
          {collectionSyncStatus === 'error' && collectionSyncErrorMsg && (
            <>{': ' + collectionSyncErrorMsg}</>
          )}
        </ToolbarText>
      </Toolbar>
      <div className={styles.annotationTable} onMouseDown={clear} tabIndex={0}>
        {highlights.map(highlight => (
          <AnnotationTableHighlightCard
            key={highlight.id}
            highlight={highlight}
            onClick={createHandleClick(highlight.cfiRange)}
            selected={selected === highlight.cfiRange}
            scrollTo={scrollToHighlight === highlight.id}
            onDoubleClick={createHandleDoubleClick(highlight.cfiRange)}
            editing={editing === highlight.cfiRange}
          />
        ))}
      </div>
    </div>
  );
}
