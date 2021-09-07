import React, { useState } from 'react';
import styles from './Sidebar.css';

export default function BookManagerSidebar() {
  return (
    <div className={styles.sidebar}>
      <BookManagerSidebarEntry />
    </div>
  );
}

export function BookManagerSidebarEntry() {
  return <div className={styles.sidebarEntry}>All</div>;
}
