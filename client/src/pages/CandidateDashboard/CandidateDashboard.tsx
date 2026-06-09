// filename: client/src/pages/CandidateDashboard/CandidateDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CandidateDashboard.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import StatCard from '../../components/molecules/StatCard/StatCard';
import QuizTable from '../../components/organisms/QuizTable/QuizTable';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import { useGetCandidateQuizzesQuery } from '../../services/candidateApi';

export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch candidate quizzes
  const { data, isLoading } = useGetCandidateQuizzesQuery({
    page,
    limit: 5,
    ...(search ? { search } : {}),
    ...(statusFilter ? { filter: statusFilter } : {}),
  });

  const handleAction = (id: string, actionType: string) => {
    if (actionType === 'start-test') {
      navigate(`/candidate/quiz-attempt/${id}`);
    } else if (actionType === 'view-result') {
      navigate(`/candidate/results/${id}`);
    }
  };

  const stats = data?.stats || {
    totalAssigned: 0,
    participatedCount: 0,
    scheduledCount: 0,
    liveCount: 0,
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Candidate Dashboard</h1>
          <p className={styles.subtitle}>Welcome to your Quiz Arena panel. Here is your overview.</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Assigned"
            value={stats.totalAssigned}
            icon="user-group"
            variant="primary"
          />
          <StatCard
            title="Live Quizzes"
            value={stats.liveCount}
            icon="status-live"
            variant="secondary"
          />
          <StatCard
            title="Upcoming Quizzes"
            value={stats.scheduledCount}
            icon="calendar"
            variant="highlight"
          />
          <StatCard
            title="Participated"
            value={stats.participatedCount}
            icon="check-circle"
            variant="secondary"
          />
        </div>

        {/* Quizzes Table Area */}
        <div className={styles.tableSection}>
          <div className={styles.tableControls}>
            <h3 className={styles.sectionTitle}>Your Quizzes</h3>
            <div className={styles.filters}>
              <SearchBar
                value={search}
                onChange={(val) => { setSearch(val); setPage(1); }}
                placeholder="Search quizzes..."
              />
              
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className={styles.selectFilter}
              >
                <option value="">All Quizzes</option>
                <option value="live">Live</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner} />
              <span>Loading assigned quizzes...</span>
            </div>
          ) : (
            <QuizTable
              quizzes={(data?.quizzes || []).map((q) => ({
                ...q,
                status: q.realStatus,
              }))}
              role="participant"
              onAction={handleAction}
              pagination={data?.pagination}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CandidateDashboard;
