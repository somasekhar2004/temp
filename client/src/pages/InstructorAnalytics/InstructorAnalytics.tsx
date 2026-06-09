// filename: client/src/pages/InstructorAnalytics/InstructorAnalytics.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InstructorAnalytics.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import Icon from '../../components/atoms/Icon/Icon';
import QuizTable from '../../components/organisms/QuizTable/QuizTable';
import { useGetInstructorQuizzesQuery } from '../../services/instructorApi';

export const InstructorAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch only Completed quizzes
  const { data, isLoading } = useGetInstructorQuizzesQuery({
    page,
    limit: 10,
    status: 'Completed',
    ...(search ? { search } : {}),
  });

  const completedQuizzes = data?.quizzes || [];
  const pagination = data?.pagination;

  const handleAction = (id: string, actionType: string) => {
    if (actionType === 'view-result') {
      navigate(`/instructor/results/${id}`);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quiz Analytics</h1>
          <p className={styles.subtitle}>Select a completed quiz below to view detailed scorecard distribution and candidate answers.</p>
        </div>

        <div className={styles.controls}>
          <h3 className={styles.sectionTitle}>Completed Assessments</h3>
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search completed quizzes..."
          />
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            <span>Loading completed quizzes...</span>
          </div>
        ) : completedQuizzes.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="empty-state" size={64} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>
              {search ? 'No Match Found' : 'No Completed Quizzes'}
            </h4>
            <p className={styles.emptyText}>
              {search
                ? 'Try adjusting your search query to find completed quizzes.'
                : 'There are no completed quizzes assigned to you at the moment.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <QuizTable
              quizzes={completedQuizzes}
              role="instructor"
              onAction={handleAction}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InstructorAnalytics;
