import React from 'react';
import cnms from 'classnames';
import styles from './FAHoverToolTip.css';

type FAHoverToolTipProps = {
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export default function FAHoverToolTip(props: FAHoverToolTipProps) {
  const { className, onClick, children } = props;

  return (
    <span className={styles.tooltip}>
      <i
        className={cnms(styles.button, className)}
        onClick={onClick ? onClick : () => {}}
      />
      <div className={styles.tooltiptext}>{children}</div>
    </span>
  );
}

type FAHoverToolTipStatementProps = {
  label: string;
  value: string;
};

export function FAHoverToolTipStatement(props: StatementProps) {
  const { label, value } = props;
  return (
    <div>
      <strong>{label}</strong> {value}
    </div>
  );
}
