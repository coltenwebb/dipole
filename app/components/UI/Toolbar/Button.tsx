import React from 'react';
import styles from './Button.css';

type ToolbarButtonProps = { fa: string; onClick?: () => void };

export default function ToolbarButton(props: ToolbarButtonProps) {
  const { fa, onClick } = props;

  return (
    <i
      className={[styles.toolbarButton, fa].join(' ')}
      onClick={onClick ? onClick : () => {}}
    />
  );
}
