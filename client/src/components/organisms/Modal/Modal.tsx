// filename: client/src/components/organisms/Modal/Modal.tsx
import React, { useEffect } from 'react';
import styles from './Modal.module.scss';
import Icon from '../../atoms/Icon/Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClass = [
    styles.modalContainer,
    styles[size],
  ].join(' ');

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={modalClass}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <Icon name="x-close" size={18} />
          </button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
