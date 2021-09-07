import React, { ReactNode } from 'react';
import cnms from 'classnames';
import styles from './Text.css';

type ToolbarButtonProps = { children: ReactNode; isTitleText?: boolean };

export default function ToolbarText(props: ToolbarButtonProps) {
  const { children, isTitleText = false } = props;

  return (
    <div className={cnms(styles.text, { [styles.titleText]: isTitleText })}>
      {children}
    </div>
  );
}
