// filename: client/src/components/organisms/Layout/Layout.tsx
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />
      <div className={styles.mainContainer}>
        <Header />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;
