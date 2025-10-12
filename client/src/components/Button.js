// button component


import React from 'react';
import styles from './Button.module.css';

function Button({ children, onClick, variant = 'primary', type = 'button', icon, disabled }) {
  // put together the css classes
  const className = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;