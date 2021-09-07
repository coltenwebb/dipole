import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
import TextareaAutosize from 'react-autosize-textarea';
import moment from 'moment';
import { remote } from 'electron';
import cnms from 'classnames';
import styles from './HighlightCard.css';
import {
  AnkiCard,
  updateAnkiCard,
  removeAnkiCard,
  Highlight,
  locate,
  removeHighlight,
  addAnkiCard,
  clearLocatedHighlightInTable
} from '../../../ducks/bookReader';
import { ApplicationState } from '../../../ducks';
import HighlightCardAnkiCardGroup from './HighlightCardAnkiCardGroup';
import FAButton from '../../UI/FAButton';

type AnnotationTableHighlightCardProps = {
  key: string;
  highlight: Highlight;
  selected: boolean;
  onClick: () => void;
  editing: boolean;
  onDoubleClick: () => void;
  scrollTo: boolean;
};

export default function AnnotationTableHighlightCard(
  props: AnnotationTableHighlightCardProps
) {
  const {
    highlight,
    selected,
    onClick,
    editing,
    onDoubleClick,
    scrollTo
  } = props;

  const dispatch = useDispatch();

  // const highlights = useSelector<ApplicationState, Highlight[]>(
  //   state => state.bookReader.bookData?.highlights || []
  // );

  const ref = React.useRef<HTMLDivElement>();
  if (scrollTo) {
    ref?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    ref?.current?.focus({
      preventScroll: true
    });
    dispatch(clearLocatedHighlightInTable());
  }

  const removeNote = () => {
    dispatch(removeHighlight(highlight.id));
  };

  const locateNote = () => {
    dispatch(locate(highlight.cfiRange));
  };

  const addEmptyAnkiCard = () => {
    const ankiCard: AnkiCard = {
      type: 'cloze',
      fields: [''],
      id: v4(),
      highlightId: highlight.id,
      additionalTags: [],
      sync: { status: 'unsynced' },
      addDate: Date.now(),
      editDate: Date.now()
    };
    dispatch(addAnkiCard(ankiCard));
  };

  const ankiCardCount = useSelector<ApplicationState, number>(
    state =>
      (state.bookReader.bookData.ankiCards || []).filter(
        ankiCard => ankiCard.highlightId === highlight.id
      ).length
  );
  const ankiCardCountMessage = (() => {
    if (ankiCardCount > 1) return `${ankiCardCount} cards`;
    if (ankiCardCount === 1) return '1 card';
    return '';
  })();

  let lastEditDate = useSelector<ApplicationState, number>(state =>
    (state.bookReader.bookData.ankiCards || []).reduce(
      (ret, ankiCard) =>
        ankiCard.highlightId === highlight.id
          ? Math.max(ankiCard.editDate, ret)
          : ret,
      0
    )
  );
  lastEditDate = Math.max(lastEditDate, highlight.addDate || 0);

  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const message = (() => {
    return moment(lastEditDate).from(Date.now());
  })();

  const onContextMenu = () => {
    remote.Menu.buildFromTemplate([
      {
        label: 'Locate',
        click: () => {
          dispatch(locate(highlight.cfiRange));
        }
      },
      {
        label: 'Remove',
        click: () => {
          dispatch(removeHighlight(highlight.id));
        }
      }
    ]).popup({
      window: remote.getCurrentWindow(),
      callback: () => {}
    });
  };

  const numAnkiCards = useSelector<ApplicationState, number>(
    state =>
      state.bookReader.bookData?.ankiCards?.filter(
        ankiCard => ankiCard.highlightId === highlight.id
      ).length || 0
  );

  return (
    <div
      className={cnms(styles.highlightCard, {
        [styles.selected]: selected,
        [styles.editing]: editing
      })}
      onMouseDown={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      ref={ref}
      tabIndex={0}
    >
      <div className={cnms(styles.cardRow)}>
        <div
          className={cnms(styles.highlightText, {
            [styles.noBottomMargin]: numAnkiCards === 0 || !editing
          })}
        >
          {highlight.text}
        </div>
      </div>

      <div className={styles.cardRow}>
        <HighlightCardAnkiCardGroup highlight={highlight} isHidden={!editing} />
      </div>

      <div className={styles.cardRow}>
        <div className={cnms(styles.infoText, styles.left)}>{message}</div>
        {editing && (
          <div className={cnms(styles.buttonGroup, styles.right)}>
            <FAButton className="fas fa-map-marker-alt" onClick={locateNote} />
            <FAButton
              className="far fa-sticky-note"
              onClick={addEmptyAnkiCard}
            />
            <FAButton className="far fa-trash-alt" onClick={removeNote} />
          </div>
        )}
        {!editing && (
          <div className={cnms(styles.infoText, styles.right)}>
            {ankiCardCountMessage}
          </div>
        )}
      </div>
    </div>
  );
}
