// filename: client/src/components/atoms/Input/Input.tsx
import React, { useState } from 'react';
import styles from './Input.module.scss';
import Icon from '../Icon/Icon';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  type = 'text',
  textarea = false,
  rows = 4,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const wrapperClass = [
    styles.wrapper,
    type === 'checkbox' ? styles.checkboxWrapper : '',
    type === 'radio' ? styles.radioWrapper : '',
    className,
  ].filter(Boolean).join(' ');

  const inputClass = [
    styles.input,
    error ? styles.errorBorder : '',
    type === 'checkbox' ? styles.checkbox : '',
    type === 'radio' ? styles.radio : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      {label && type !== 'checkbox' && type !== 'radio' && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputContainer}>
        {textarea ? (
          <textarea
            id={inputId}
            className={`${styles.input} ${styles.textarea} ${error ? styles.errorBorder : ''}`}
            rows={rows}
            {...(props as any)}
          />
        ) : (
          <input
            id={inputId}
            type={resolvedType}
            className={inputClass}
            {...props}
          />
        )}

        {isPassword && !textarea && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            <Icon name={showPassword ? 'eye' : 'lock'} size={18} />
          </button>
        )}

        {(type === 'checkbox' || type === 'radio') && label && (
          <label htmlFor={inputId} className={styles.choiceLabel}>
            {label}
          </label>
        )}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
export default Input;
