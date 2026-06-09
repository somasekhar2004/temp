// filename: client/src/components/organisms/Sidebar/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Sidebar.module.scss';
import Icon from '../../atoms/Icon/Icon';
import { clearCredentials } from '../../../store/authSlice';
import { useLogoutMutation } from '../../../services/authApi';
import { baseApi } from '../../../services/baseApi';
import type { RootState } from '../../../store/store';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [logoutTrigger] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      navigate('/login');
    }
  };

  if (!user) return null;

  // Define menu items based on role
  const getMenuItems = () => {
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: 'nav-dashboard' },
        { label: 'Create Quiz', path: '/admin/create-quiz', icon: 'plus' },
        { label: 'Access Mgmt', path: '/admin/access-management', icon: 'nav-instructor' },
      ];
    }
    if (user.role === 'instructor') {
      return [
        { label: 'Dashboard', path: '/instructor/dashboard', icon: 'nav-dashboard' },
        { label: 'Update Quizzes', path: '/instructor/update-quizzes', icon: 'nav-quiz' },
        { label: 'Analytics', path: '/instructor/analytics', icon: 'nav-analytics' },
      ];
    }
    // candidate / participant
    return [
      { label: 'Dashboard', path: '/candidate/dashboard', icon: 'nav-dashboard' },
      { label: 'Upcoming Quizzes', path: '/candidate/upcoming', icon: 'quiz-upcoming' },
    ];
  };

  const menuItems = getMenuItems();

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Super Admin';
    if (role === 'instructor') return 'Instructor';
    return 'Candidate';
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <Icon name="logo-qa" size={36} className={styles.logo} />
        <span className={styles.brandText}>QuizArena</span>
      </div>

      {/* Nav Menu */}
      <nav className={styles.nav}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : ''].join(' ')
            }
          >
            <Icon name={item.icon} size={20} className={styles.linkIcon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile summary */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div className={styles.details}>
            <p className={styles.name}>{user.name}</p>
            <p className={styles.role}>{getRoleLabel(user.role)}</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Logout"
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
