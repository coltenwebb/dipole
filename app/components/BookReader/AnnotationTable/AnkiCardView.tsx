import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import cnms from 'classnames';
import sanitizeHtml from 'sanitize-html';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import styles from './AnkiCardView.css';
import {
  AnkiCard,
  removeAnkiCard,
  updateAnkiCardFields
} from '../../../ducks/bookReader';
import FAButton from '../../UI/FAButton';
import FAHoverToolTip, {
  FAHoverToolTipStatement
} from '../../UI/FAHoverToolTip';

type AnkiCardViewProps = {
  ankiCard: AnkiCard;
  isHidden: boolean;
};

export default function AnkiCardView(props: AnkiCardViewProps) {
  const { ankiCard, isHidden } = props;

  const dispatch = useDispatch();

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [innerHtml, setInnerHtml] = useState(ankiCard.fields[0]);

  const onChange = (e: ContentEditableEvent) => {
    setInnerHtml(e.target.value);
  };

  useEffect(() => {
    const listener = () => {
      if (!contentEditableRef.current) return;
      const textArea = (contentEditableRef.current as unknown) as HTMLDivElement;
      const textAreaHtml = textArea.innerHTML;
      const sel = window.getSelection();

      if (sel?.rangeCount === 0) return;

      const range = sel?.getRangeAt(0);
      if (!range?.intersectsNode(textArea)) return;
      const rangeText = range?.toString();

      let clozeNum = 1;
      while (textAreaHtml.includes(`{{c${clozeNum}::`)) clozeNum += 1;

      const textToInsert = `{{c${clozeNum}::${rangeText}}}`;

      range?.deleteContents();
      range?.insertNode(document.createTextNode(textToInsert));

      setInnerHtml(textArea.innerHTML);
    };

    ipcRenderer.on('create-cloze', listener);
    return () => {
      ipcRenderer.removeListener('create-cloze', listener);
    };
  });

  const rollChangesIntoRedux = () => {
    // the contenteditable seems to avoid changing its onBlur method
    // this onBlur is set in ContentEditable only one time, so it must use the ref
    const dirty = contentEditableRef.current?.innerHTML;
    const clean = sanitizeHtml(dirty, {
      allowedTags: ['b', 'i', 'div', 'br', 'a', 'strong'],
      allowedAttributes: { a: ['href'] }
    });
    setInnerHtml(clean);
    dispatch(updateAnkiCardFields(ankiCard.id, [clean]));
  };

  const [isEditing, setIsEditing] = useState(false);

  const onFocus = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    rollChangesIntoRedux();
  };

  useEffect(() => {
    return () => rollChangesIntoRedux();
  }, []);

  const onRemoveClick = () => {
    dispatch(removeAnkiCard(ankiCard.id));
  };

  let tooltipIcon;
  switch (ankiCard.sync.status) {
    case 'success':
      tooltipIcon = (
        <FAHoverToolTip className="fas fa-info">
          <FAHoverToolTipStatement label="status" value="success" />
          {ankiCard.sync.ankiNoteId && (
            <FAHoverToolTipStatement
              label="nid"
              value={ankiCard.sync.ankiNoteId}
            />
          )}
        </FAHoverToolTip>
      );
      break;
    case 'unsynced':
      tooltipIcon = (
        <FAHoverToolTip className="fas fa-pen">
          <FAHoverToolTipStatement label="status" value="unsynced" />
          {ankiCard.sync.ankiNoteId && (
            <FAHoverToolTipStatement
              label="nid"
              value={ankiCard.sync.ankiNoteId}
            />
          )}
        </FAHoverToolTip>
      );
      break;
    case 'waiting':
      tooltipIcon = (
        <FAHoverToolTip className="fas fa-pen">
          <FAHoverToolTipStatement label="status" value="waiting" />
          {ankiCard.sync.ankiNoteId && (
            <FAHoverToolTipStatement
              label="nid"
              value={ankiCard.sync.ankiNoteId}
            />
          )}
        </FAHoverToolTip>
      );
      break;
    default:
      tooltipIcon = (
        <FAHoverToolTip className="fas fa-exclamation-triangle">
          <FAHoverToolTipStatement
            label="status"
            value={ankiCard.sync.status}
          />
          <FAHoverToolTipStatement label="msg" value={ankiCard.sync.errorMsg} />
          {ankiCard.sync.ankiNoteId && (
            <FAHoverToolTipStatement
              label="nid"
              value={ankiCard.sync.ankiNoteId}
            />
          )}
        </FAHoverToolTip>
      );
      break;
  }

  return (
    <div
      className={cnms(styles.ankiCardView, {
        [styles.isEditing]: isEditing,
        [styles.hidden]: isHidden
      })}
    >
      <div className={cnms(styles.editor)}>
        {/* <div className={cnms(styles.tools)}>Cloze</div> */}
        <ContentEditable
          className={styles.contentEditable}
          innerRef={contentEditableRef}
          html={innerHtml}
          disabled={false}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          tagName="div"
        />
      </div>
      <div className={cnms(styles.buttons)}>
        {tooltipIcon}
        <FAButton className="far fa-eye" />
        <FAButton className="far fa-trash-alt" onClick={onRemoveClick} />
      </div>
    </div>
  );
}
