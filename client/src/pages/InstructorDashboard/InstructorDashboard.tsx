// filename: client/src/pages/InstructorDashboard/InstructorDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InstructorDashboard.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import DonutChartCard from '../../components/organisms/DonutChartCard/DonutChartCard';
import QuizTable from '../../components/organisms/QuizTable/QuizTable';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import { useGetInstructorQuizzesQuery } from '../../services/instructorApi';

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch quizzes assigned to this instructor
  const { data: quizzesData, isLoading } = useGetInstructorQuizzesQuery({
    page,
    limit: 5,
    ...(search ? { search } : {}),
  });

  const handleAction = (id: string, actionType: string) => {
    if (actionType === 'edit') {
      navigate(`/instructor/edit-quiz/${id}`);
    } else if (actionType === 'view-result') {
      navigate(`/instructor/results/${id}`);
    }
  };

  // Compute stat counts and chart values locally based on quizzes list
  const computeStats = () => {
    const list = quizzesData?.quizzes || [];
    let completed = 0;
    let scheduled = 0;
    let draft = 0;
    let cancelled = 0;
    let live = 0;

    list.forEach((q) => {
      if (q.status === 'Completed') completed++;
      else if (q.status === 'Scheduled') scheduled++;
      else if (q.status === 'Draft') draft++;
      else if (q.status === 'Cancelled') cancelled++;
      else if (q.status === 'Live') live++;
    });

    const total = completed + scheduled + draft + cancelled + live;

    return {
      completed,
      scheduled,
      draft,
      cancelled,
      live,
      total,
    };
  };

  const stats = computeStats();

  const chartDataPoints = [
    { label: 'Completed', value: stats.completed, color: '#1D9E75' },
    { label: 'Scheduled', value: stats.scheduled + stats.live, color: '#534AB7' }, // Bundle live & scheduled
    { label: 'Cancelled', value: stats.cancelled, color: '#E24B4A' },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Your quiz activity for today</p>
        </div>

        <div className={styles.analyticsAndTable}>
          {/* Donut Chart */}
          <div className={styles.chartSection}>
            <DonutChartCard
              title="Today's Quiz Status"
              dataPoints={chartDataPoints}
              centerText={String(stats.total)}
              centerSubText="Quizzes"
            />
          </div>

          {/* Quizzes Table */}
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.sectionTitle}>My Quizzes</h3>
              <SearchBar
                value={search}
                onChange={(val) => { setSearch(val); setPage(1); }}
                placeholder="Search quizzes..."
              />
            </div>

            {isLoading ? (
              <div className={styles.loadingState}>
                <span className={styles.spinner} />
                <span>Loading your quizzes...</span>
              </div>
            ) : (
              <QuizTable
                quizzes={quizzesData?.quizzes || []}
                role="instructor"
                onAction={handleAction}
                pagination={quizzesData?.pagination}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default InstructorDashboard;
