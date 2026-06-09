// filename: client/src/components/molecules/StatCard/StatCard.tsx
import React from 'react';
import styles from './StatCard.module.scss';
import Icon from '../../atoms/Icon/Icon';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'highlight' | 'danger' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'neutral',
}) => {
  const cardClass = [
    styles.statCard,
    styles[variant],
  ].join(' ');

  return (
    <div className={cardClass}>
      <div className={styles.iconContainer}>
        <Icon name={icon} size={24} className={styles.icon} />
      </div>
      <div className={styles.info}>
        <span className={styles.value}>{value}</span>
        <span className={styles.title}>{title}</span>
      </div>
    </div>
  );
};
export default StatCard;
