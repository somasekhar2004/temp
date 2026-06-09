// filename: client/src/components/atoms/Buttons/Button.tsx
import React from 'react';
import styles from './Button.module.scss';
import Icon from '../Icon/Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      {!isLoading && icon && iconPosition === 'left' && (
        <Icon name={icon} size={size === 'sm' ? 14 : 18} className={styles.iconLeft} />
      )}
      <span className={styles.content}>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={size === 'sm' ? 14 : 18} className={styles.iconRight} />
      )}
    </button>
  );
};
export default Button;
