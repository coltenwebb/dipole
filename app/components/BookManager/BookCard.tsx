import React, { useEffect, useState, useRef, SyntheticEvent } from 'react';
import { remote } from 'electron';
import { useDispatch } from 'react-redux';
import cnms from 'classnames';
import styles from './BookCard.css';
import { BookRecord, updateBook } from '../../ducks/bookManager';
import openBook, { removeBookCleanly } from '../../utils/bookManagerTools';

interface BookManagerBookCardProps {
  book: BookRecord;
  interaction: 'unselected' | 'selected' | 'selectedUnfocused' | 'editing';
  setInteraction: (interaction: string) => void;
}

export default function BookManagerBookCard(props: BookManagerBookCardProps) {
  const { book, interaction, setInteraction } = props;
  const dispatch = useDispatch();

  const onDoubleClick = () => {
    openBook(dispatch, book);
  };
  const onMouseDown = e => {
    setInteraction('selected');
    e.stopPropagation();
  };

  const onContextMenu = () => {
    setInteraction('selectedUnfocused');
    remote.Menu.buildFromTemplate([
      {
        label: 'Remove',
        click: () => {
          removeBookCleanly(dispatch, book);
        }
      }
    ]).popup({
      window: remote.getCurrentWindow(),
      callback: () => {
        setInteraction('selected');
      }
    });
  };

  const onChangeTitle = (newValue: string) => {
    dispatch(updateBook({ ...book, title: newValue }));
  };

  const onChangeAuthor = (newValue: string) => {
    dispatch(updateBook({ ...book, author: newValue }));
  };
  const onChangeTags = (newValue: string) => {
    dispatch(
      updateBook({
        ...book,
        tags: newValue.split(' ').filter(str => str !== '')
      })
    );
    return (
      newValue
        .split(' ')
        .filter(str => str !== '')
        .join(' ') || ''
    );
  };

  return (
    <div
      className={cnms(styles.bookCard, styles[interaction])}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <BookManagerBookCardTextEditable
        value={book.title || ''}
        placeholder="title"
        submitValue={onChangeTitle}
        additionalClassName={styles.title}
      />
      <BookManagerBookCardTextEditable
        value={book.author || ''}
        placeholder="author"
        submitValue={onChangeAuthor}
        additionalClassName={styles.author}
      />
      <BookManagerBookCardTextEditable
        value={book.tags?.join(' ') || ''}
        placeholder="tags"
        submitValue={onChangeTags}
        additionalClassName={styles.tags}
      />
    </div>
  );
}

type BookManagerBookCardTextEditableProps = {
  placeholder: string;
  value: string;
  submitValue: (value: string) => string | void;
  additionalClassName?: string;
};

export function BookManagerBookCardTextEditable(
  props: BookManagerBookCardTextEditableProps
) {
  const { placeholder, value, submitValue, additionalClassName } = props;
  const ref = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(value);
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const [editable, setEditable] = useState(false);
  const [lastFocus, setLastFocus] = useState(0);

  const onFocus = () => {
    // TODO: figure out system thresholds
    if (Date.now() - lastFocus < 1000 && Date.now() - lastFocus > 400) {
      setEditable(true);
    } else {
      setLastFocus(Date.now());
      ref.current?.blur();
    }
  };

  const onBlur = () => {
    setEditable(false);
    submitValue(internalValue);
  };

  const onDoubleClick = e => {
    if (editable) {
      e.stopPropagation();
    }
  };

  const onMouseDown = e => {
    // prevents left click then right click from focusing
    // e.button===2 is right button
    if (e.button === 2) setLastFocus(0);
  };

  return (
    <input
      type="text"
      className={cnms(styles.textEditable, additionalClassName, {
        [styles.editingReal]: editable
      })}
      ref={ref}
      onFocus={onFocus}
      onBlur={onBlur}
      onDoubleClick={onDoubleClick}
      onChange={e => setInternalValue(e.target.value)}
      onMouseDown={onMouseDown}
      value={internalValue}
      placeholder={placeholder}
    />
  );
}
