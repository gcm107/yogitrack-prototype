// txt input or textarea for forms


import React from 'react';
import styles from './Input.module.css';

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  multiline = false,
  rows = 3
}) {
  // if it's a textarea or regular input
  const InputElement = multiline ? 'textarea' : 'input';

  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={name} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <InputElement
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className={styles.input}
      />
    </div>
  );
}

export default Input;
