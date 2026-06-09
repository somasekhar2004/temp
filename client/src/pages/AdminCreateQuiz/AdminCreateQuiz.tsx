// filename: client/src/pages/AdminCreateQuiz/AdminCreateQuiz.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminCreateQuiz.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import Breadcrumbs from '../../components/molecules/Breadcrumbs/Breadcrumbs';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import { useCreateQuizMutation } from '../../services/adminApi';

export const AdminCreateQuiz: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');

  const [createQuizTrigger, { isLoading }] = useCreateQuizMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title || !description || !scheduleDate || !scheduleTime || !duration) {
      setErrorMsg('All fields are required.');
      return;
    }

    const start = new Date(`${scheduleDate}T${scheduleTime}`);
    if (start <= new Date()) {
      setErrorMsg('Start time must be in the future.');
      return;
    }

    const end = new Date(start.getTime() + duration * 60 * 1000);

    const payload = {
      title,
      description,
      duration,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    try {
      await createQuizTrigger(payload).unwrap();
      navigate('/admin/dashboard');
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Failed to create quiz.';
      setErrorMsg(msg);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Breadcrumbs
            items={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Create Quiz' },
            ]}
          />
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Create Quiz</h1>
          <p className={styles.subtitle}>Fill in all required fields to publish a new quiz</p>
        </div>

        <div className={styles.card}>
          {errorMsg && (
            <div className={styles.errorBox}>
              <Icon name="alert-triangle" size={16} className={styles.errorIcon} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Quiz Title *"
              placeholder="e.g. React Fundamentals Q2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <Input
              label="Quiz Description *"
              textarea
              placeholder="Provide a detailed description of what topics this quiz covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
            />

            <div className={styles.row}>
              <Input
                label="Schedule Date *"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                label="Schedule Time *"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Duration (minutes) *"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                disabled={isLoading}
                required
              />
              <div className={styles.placeholderField}>
                <label className={styles.fieldLabel}>Question Type *</label>
                <div className={styles.mockSelect}>
                  <Icon name="radio-selected" size={16} className={styles.brandIcon} />
                  <span>Single Choice / Multi Select</span>
                </div>
                <span className={styles.hint}>Supported options configurable in Draft tab</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => navigate('/admin/dashboard')} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} variant="primary">
                Create Draft Quiz
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
export default AdminCreateQuiz;
