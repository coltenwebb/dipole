import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cnms from 'classnames';
import styles from './HighlightCardAnkiCardGroup.css';
import { AnkiCard, Highlight } from '../../../ducks/bookReader';
import { ApplicationState } from '../../../ducks';
import AnkiCardView from './AnkiCardView';

type HighlightCardAnkiCardGroupProps = {
  highlight: Highlight;
  isHidden: boolean;
};

export default function HighlightCardAnkiCardGroup(
  props: HighlightCardAnkiCardGroupProps
) {
  const { highlight, isHidden } = props;

  const ankiCards =
    useSelector<ApplicationState, AnkiCard[] | undefined>(
      state => state.bookReader.bookData.ankiCards
    ) || [];

  const ankiCardsToDisplay = ankiCards.filter(
    ankiCard => ankiCard.highlightId === highlight.id
  );

  return (
    <div
      className={cnms(styles.container, {
        [styles.hidden]: isHidden
      })}
    >
      {ankiCardsToDisplay.map(ankiCard => (
        <React.Fragment key={ankiCard.id}>
          <AnkiCardView ankiCard={ankiCard} isHidden={false} />
        </React.Fragment>
      ))}
    </div>
  );
}
