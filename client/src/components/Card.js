// card that wraps stuff in a nice (hopefully) box

import React from 'react';
import styles from './Card.module.css';

function Card({ children, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
