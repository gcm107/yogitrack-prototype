// shows a little popup message at the bottom
// it goes away after a few seconds. 
// like when an instrucvtor or class is added

import React, { useEffect } from 'react';
import styles from './Snackbar.module.css';

function Snackbar({ message, type = 'success', isOpen, onClose }) {
  // make it disappear after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // don't show anything if it's not open
  if (!isOpen) return null;

  return (
    <div className={`${styles.snackbar} ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.closeBtn}>×</button>
    </div>
  );
}

export default Snackbar;
