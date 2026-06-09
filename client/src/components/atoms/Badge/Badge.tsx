// filename: client/src/components/atoms/Badge/Badge.tsx
import React from 'react';
import styles from './Badge.module.scss';
import Icon from '../Icon/Icon';

export type BadgeStatus = 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig: Record<BadgeStatus, { text: string; icon: string }> = {
  Draft: { text: 'Draft', icon: 'status-draft' },
  Scheduled: { text: 'Scheduled', icon: 'status-scheduled' },
  Live: { text: 'Live', icon: 'status-live' },
  Completed: { text: 'Completed', icon: 'status-completed' },
  Cancelled: { text: 'Cancelled', icon: 'status-cancelled' },
};

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status];
  if (!config) return null;

  const badgeClass = [
    styles.badge,
    styles[status.toLowerCase()],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClass}>
      <Icon name={config.icon} size={14} className={styles.icon} />
      <span className={styles.text}>{config.text}</span>
    </span>
  );
};
export default Badge;
