import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './Table.css';
import BookManagerBookCard from './BookCard';
import { BookRecord } from '../../ducks/bookManager';
import { ApplicationState } from '../../ducks';

export default function BookManagerTable() {
  const books = useSelector<ApplicationState, BookRecord[]>(
    state => state.bookManager.books
  );

  const [selected, setSelected] = useState({
    id: '',
    interaction: 'unselected'
  });

  const createSetInteractionHandler = (id: string) => {
    return (interaction: string) => {
      setSelected({ id, interaction });
    };
  };

  const createInteractionHandler = (id: string) => {
    if (selected.id === id) {
      return selected.interaction;
    }
    return 'unselected';
  };

  const onMouseDown = () => {
    setSelected({
      id: '',
      interaction: 'unselected'
    });
  };

  return (
    <div className={styles.table} onMouseDown={onMouseDown}>
      {books.map(book => (
        <BookManagerBookCard
          key={book.id}
          book={book}
          interaction={createInteractionHandler(book.id)}
          setInteraction={createSetInteractionHandler(book.id)}
        />
      ))}
    </div>
  );
}
