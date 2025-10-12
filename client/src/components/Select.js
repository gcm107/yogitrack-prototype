// dropdown menu for picking options


import React from 'react';
import styles from './Select.module.css';

function Select({ label, name, value, onChange, children, required = false }) {
  return (
    <div className={styles.selectWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={styles.select}
      >
        {children}
      </select>
    </div>
  );
}

export default Select;
