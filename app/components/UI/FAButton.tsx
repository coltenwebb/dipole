import React from 'react';
import cnms from 'classnames';
import styles from './FAButton.css';

type ToolbarButtonProps = { className: string; onClick?: () => void };

export default function FAButton(props: ToolbarButtonProps) {
  const { className, onClick } = props;

  return (
    <i
      className={cnms(styles.button, className)}
      onClick={onClick ? onClick : () => {}}
    />
  );
}
