// filename: client/src/pages/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Login.module.scss';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import { useLoginMutation } from '../../services/authApi';
import { setCredentials } from '../../store/authSlice';
import type { RootState } from '../../store/store';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [loginTrigger, { isLoading }] = useLoginMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/candidate/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const response = await loginTrigger({ email, password }).unwrap();
      dispatch(setCredentials({ user: response.user }));
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Invalid email or password.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Pane - Form */}
      <div className={styles.leftPane}>
        <div className={styles.formCard}>
          <div className={styles.logoContainer}>
            <Icon name="logo-qa" size={36} className={styles.logoIcon} />
            <span className={styles.brandName}>QuizArena</span>
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.activeTab}`}>Sign In</button>
            <Link to="/signup" className={styles.tab}>Sign Up</Link>
          </div>

          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to access your quizzes</p>

          {errorMsg && (
            <div className={styles.errorBox}>
              <Icon name="alert-triangle" size={16} className={styles.errorIcon} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email address"
              type="email"
              placeholder="aryan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>
              Sign In
            </Button>
          </form>

          <p className={styles.footerText}>
            Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right Pane - Feature Deco */}
      <div className={styles.rightPane}>
        <div className={styles.decoContent}>
          <div className={styles.decoLogoWrapper}>
            <Icon name="logo-layers" size={80} className={styles.decoLogo} />
          </div>
          
          <h2 className={styles.decoTitle}>Test your knowledge, track your growth</h2>
          <p className={styles.decoSub}>
            Timed quizzes, instant results, and detailed analytics — all in one place.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <Icon name="timer" size={20} className={styles.featIcon} />
              <span>Timed quizzes with auto-submit</span>
            </div>
            <div className={styles.featureItem}>
              <Icon name="analytics" size={20} className={styles.featIcon} />
              <span>Instant scores & detailed reports</span>
            </div>
            <div className={styles.featureItem}>
              <Icon name="nav-analytics" size={20} className={styles.featIcon} />
              <span>Personal analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
