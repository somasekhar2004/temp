// filename: client/src/components/molecules/Breadcrumbs/Breadcrumbs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.scss';
import Icon from '../../atoms/Icon/Icon';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className={styles.breadcrumbs}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <Icon name="chevron-right" size={12} className={styles.separator} />
            )}
            {isLast || !item.path ? (
              <span className={styles.activeItem}>{item.label}</span>
            ) : (
              <Link to={item.path} className={styles.linkItem}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
export default Breadcrumbs;
