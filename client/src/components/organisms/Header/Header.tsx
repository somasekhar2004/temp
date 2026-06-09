// filename: client/src/components/organisms/Header/Header.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import Icon from '../../atoms/Icon/Icon';
import { toggleTheme } from '../../../store/themeSlice';
import { clearCredentials } from '../../../store/authSlice';
import { useLogoutMutation } from '../../../services/authApi';
import { baseApi } from '../../../services/baseApi';
import type { RootState } from '../../../store/store';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  const [logoutTrigger] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Real-time ticking clock
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Time: HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      // Date: Day, DD MMM YYYY (e.g. Fri, 15 May 2026)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      setDateStr(`${dayName}, ${day} ${monthName} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'Super Admin';
    if (role === 'instructor') return 'Instructor';
    return 'Candidate';
  };

  return (
    <header className={styles.header}>
      {/* Time & Date display */}
      <div className={styles.clockContainer}>
        <span className={styles.time}>{timeStr}</span>
        <span className={styles.date}>{dateStr}</span>
      </div>

      {/* Control Actions */}
      <div className={styles.actions}>
        {/* Theme Toggler */}
        <button 
          type="button" 
          onClick={() => dispatch(toggleTheme())}
          className={styles.themeToggle}
          title="Toggle Light/Dark Theme"
        >
          <Icon name={theme === 'light' ? 'theme-moon' : 'theme-sun'} size={18} />
        </button>

        {/* User Profile Dropdown */}
        {user && (
          <div className={styles.profileDropdown}>
            <button 
              type="button" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={styles.profileButton}
            >
              <div className={styles.avatar}>
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </div>
              <span className={styles.userName}>{user.name}</span>
              <Icon name="chevron-down" size={12} className={styles.arrow} />
            </button>

            {dropdownOpen && (
              <>
                <div className={styles.dropdownBackdrop} onClick={() => setDropdownOpen(false)} />
                <div className={styles.dropdownMenu}>
                  <div className={styles.menuHeader}>
                    <p className={styles.menuName}>{user.name}</p>
                    <p className={styles.menuEmail}>{user.email}</p>
                    <span className={styles.menuBadge}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <hr className={styles.divider} />
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                  >
                    <Icon name="logout" size={16} className={styles.logoutIcon} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
