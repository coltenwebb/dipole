import React, { ReactNode } from 'react';
import cnms from 'classnames';
import styles from './Toolbar.css';

type ToolbarProps = {
  children?: ReactNode;
  isTitleBar?: boolean;
  inset?: boolean;
};

export default function Toolbar(props: ToolbarProps) {
  const { children, isTitleBar = false, inset = false } = props;

  return (
    <div
      className={cnms(styles.toolbar, {
        [styles.titleBar]: isTitleBar,
        [styles.inset]: inset
      })}
    >
      {children}
    </div>
  );
}
