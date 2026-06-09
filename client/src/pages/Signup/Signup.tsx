// filename: client/src/pages/Signup/Signup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Signup.module.scss';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import { useSignupMutation } from '../../services/authApi';
import type { RootState } from '../../store/store';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [signupTrigger, { isLoading }] = useSignupMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/candidate/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Real-time password check conditions
  const criteria = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Please satisfy all password strength requirements.');
      return;
    }

    try {
      await signupTrigger({ name, email, password }).unwrap();
      setSignupSuccess(true);
      // Wait 1.5s to show success toast, then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Email already in use or registration failed.';
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
            <Link to="/login" className={styles.tab}>Sign In</Link>
            <button className={`${styles.tab} ${styles.activeTab}`}>Sign Up</button>
          </div>

          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Join QuizArena and start your journey</p>

          {signupSuccess && (
            <div className={styles.successBox}>
              <Icon name="check-circle" size={16} className={styles.successIcon} />
              <span>Signup successful! Redirecting to login...</span>
            </div>
          )}

          {errorMsg && (
            <div className={styles.errorBox}>
              <Icon name="alert-triangle" size={16} className={styles.errorIcon} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Aryan Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || signupSuccess}
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="aryan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || signupSuccess}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Aryan@123!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || signupSuccess}
              required
            />

            {/* Password Validation Rules */}
            <div className={styles.passwordRules}>
              <div className={styles.ruleItem}>
                <Icon
                  name={criteria.hasLength ? 'check-verified-2' : 'radio-unselected'}
                  size={14}
                  className={criteria.hasLength ? styles.checked : styles.unchecked}
                />
                <span className={criteria.hasLength ? styles.checkedText : ''}>At least 8 characters</span>
              </div>
              <div className={styles.ruleItem}>
                <Icon
                  name={criteria.hasUpper ? 'check-verified-2' : 'radio-unselected'}
                  size={14}
                  className={criteria.hasUpper ? styles.checked : styles.unchecked}
                />
                <span className={criteria.hasUpper ? styles.checkedText : ''}>One uppercase letter (A–Z)</span>
              </div>
              <div className={styles.ruleItem}>
                <Icon
                  name={criteria.hasLower ? 'check-verified-2' : 'radio-unselected'}
                  size={14}
                  className={criteria.hasLower ? styles.checked : styles.unchecked}
                />
                <span className={criteria.hasLower ? styles.checkedText : ''}>One lowercase letter (a–z)</span>
              </div>
              <div className={styles.ruleItem}>
                <Icon
                  name={criteria.hasNumber ? 'check-verified-2' : 'radio-unselected'}
                  size={14}
                  className={criteria.hasNumber ? styles.checked : styles.unchecked}
                />
                <span className={criteria.hasNumber ? styles.checkedText : ''}>One number (0–9)</span>
              </div>
              <div className={styles.ruleItem}>
                <Icon
                  name={criteria.hasSymbol ? 'check-verified-2' : 'radio-unselected'}
                  size={14}
                  className={criteria.hasSymbol ? styles.checked : styles.unchecked}
                />
                <span className={criteria.hasSymbol ? styles.checkedText : ''}>One symbol (!@#$...)</span>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!isPasswordValid || signupSuccess}
              className={styles.submitBtn}
            >
              Create Account →
            </Button>
          </form>

          <p className={styles.footerText}>
            Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Pane - Feature Deco */}
      <div className={styles.rightPane}>
        <div className={styles.decoContent}>
          <div className={styles.decoLogoWrapper}>
            <Icon name="user-profile" size={80} className={styles.decoLogo} />
          </div>
          
          <h2 className={styles.decoTitle}>Your account, your progress</h2>
          <p className={styles.decoSub}>
            All your quizzes, scores, and analytics — saved and accessible anytime.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <Icon name="lock" size={20} className={styles.featIcon} />
              <span>Access your assigned quizzes</span>
            </div>
            <div className={styles.featureItem}>
              <Icon name="chart-line-score" size={20} className={styles.featIcon} />
              <span>Track your scores over time</span>
            </div>
            <div className={styles.featureItem}>
              <Icon name="message-square" size={20} className={styles.featIcon} />
              <span>Detailed per-question review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;
