import React, { SyntheticEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cnms from 'classnames';
import { TocElement, locate } from '../../ducks/bookReader';
import { ApplicationState } from '../../ducks';
import styles from './TableOfContents.css';

type Props = { hidden: boolean; onBlur: () => void };

export default function TableOfContents(props: Props) {
  const { hidden, onBlur } = props;

  const toc = useSelector<ApplicationState, TocElement[]>(
    state => state.bookReader.bookData.toc || []
  );

  return (
    <div className={styles.tocContainer} onBlur={onBlur} tabIndex={-1}>
      <div className={cnms(styles.toc, { [styles.hidden]: hidden })}>
        <ElementGroup subitems={toc} key="head" />
      </div>
    </div>
  );
}

type ElementGroupProps = {
  key: string;
  subitems: Array<TocElement>;
  label?: string;
  href?: string;
};

function ElementGroup(props: ElementGroupProps) {
  const { subitems, label, href } = props;
  const dispatch = useDispatch();

  const currentTocElement = useSelector<ApplicationState>(
    state => state.bookReader.locationDescription?.currentSectionHref || ''
  );

  return (
    <>
      {label && (
        <li
          className={cnms(styles.tocLi, {
            [styles.tocLiCurrent]: currentTocElement === href
          })}
          onClick={() => dispatch(locate(href))}
        >
          {label}
        </li>
      )}
      {subitems.length > 0 && (
        <ul className={styles.tocUl}>
          {subitems.map(
            value =>
              value.subitems && (
                <ElementGroup
                  key={value.id}
                  subitems={value.subitems}
                  label={value.label}
                  href={value.href}
                />
              )
          )}
        </ul>
      )}
    </>
  );
}
