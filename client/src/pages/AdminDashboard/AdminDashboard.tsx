// filename: client/src/pages/AdminDashboard/AdminDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import StatCard from '../../components/molecules/StatCard/StatCard';
import DonutChartCard from '../../components/organisms/DonutChartCard/DonutChartCard';
import QuizTable from '../../components/organisms/QuizTable/QuizTable';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import Modal from '../../components/organisms/Modal/Modal';
import Button from '../../components/atoms/Buttons/Button';
import Input from '../../components/atoms/Input/Input';
import Icon from '../../components/atoms/Icon/Icon';
import {
  useGetAdminQuizzesQuery,
  useGetAnalyticsQuery,
  useCancelQuizMutation,
} from '../../services/adminApi';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Fetch data
  const { data: quizzesData, refetch: refetchQuizzes } = useGetAdminQuizzesQuery({
    page,
    limit: 5,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAnalyticsQuery({});
  const [cancelQuizTrigger] = useCancelQuizMutation();

  // Cancel Quiz Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetQuizId, setTargetQuizId] = useState<string | null>(null);
  const [targetQuizTitle, setTargetQuizTitle] = useState('');
  const [understandCancelled, setUnderstandCancelled] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleAction = (id: string, actionType: string) => {
    if (actionType === 'edit') {
      navigate(`/admin/edit-quiz/${id}`);
    } else if (actionType === 'view-result') {
      navigate(`/admin/results/${id}`);
    } else if (actionType === 'cancel') {
      const quiz = quizzesData?.quizzes.find((q) => q.id === id);
      if (quiz) {
        setTargetQuizId(id);
        setTargetQuizTitle(quiz.title);
        setUnderstandCancelled(false);
        setCancelModalOpen(true);
      }
    }
  };

  const confirmCancellation = async () => {
    if (!targetQuizId || !understandCancelled) return;
    setIsCancelling(true);
    try {
      await cancelQuizTrigger(targetQuizId).unwrap();
      refetchQuizzes();
      refetchStats();
      setCancelModalOpen(false);
    } catch (err) {
      console.error('Cancellation failed:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const chartDataPoints = stats
    ? [
        { label: 'Completed', value: stats.completedCount, color: '#1D9E75' },
        { label: 'Scheduled', value: stats.scheduledCount, color: '#534AB7' },
        { label: 'Draft', value: stats.draftCount, color: '#BA7517' },
        { label: 'Cancelled', value: stats.cancelledCount, color: '#E24B4A' },
      ]
    : [];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Platform overview — Completed quizzes now show View Result</p>
        </div>

        {/* Stats Grid */}
        {!statsLoading && stats && (
          <div className={styles.statsGrid}>
            <StatCard title="Completed" value={stats.completedCount} icon="check-circle" variant="secondary" />
            <StatCard title="Scheduled" value={stats.scheduledCount} icon="calendar" variant="primary" />
            <StatCard title="Draft" value={stats.draftCount} icon="empty-state" variant="highlight" />
            <StatCard title="Cancelled" value={stats.cancelledCount} icon="alert-cancel" variant="danger" />
          </div>
        )}

        <div className={styles.analyticsAndTable}>
          {/* Donut Chart */}
          {!statsLoading && stats && (
            <div className={styles.chartSection}>
              <DonutChartCard
                title="Quizzes Overview"
                dataPoints={chartDataPoints}
                centerText={String(stats.totalQuizzes)}
                centerSubText="Quizzes"
              />
            </div>
          )}

          {/* Quizzes Grid with Filter/Search */}
          <div className={styles.tableSection}>
            <div className={styles.tableControls}>
              <h3 className={styles.sectionTitle}>All Quizzes</h3>
              <div className={styles.filters}>
                <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search quizzes..." />
                
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className={styles.selectFilter}
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <QuizTable
              quizzes={quizzesData?.quizzes || []}
              role="admin"
              onAction={handleAction}
              pagination={quizzesData?.pagination}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel this quiz?"
        size="sm"
      >
        <div className={styles.cancelModalBody}>
          <div className={styles.modalAlert}>
            <Icon name="stat-warning" size={20} className={styles.warningIcon} />
            <div className={styles.alertContent}>
              <p className={styles.alertTitle}>Cancel quiz {targetQuizTitle}?</p>
              <p className={styles.alertText}>This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <div className={styles.modalInfoList}>
            <div className={styles.infoRow}>
              <Icon name="x-cancel" size={16} className={styles.dangerIcon} />
              <span>The quiz status permanently changes to <strong>Cancelled</strong></span>
            </div>
            <div className={styles.infoRow}>
              <Icon name="x-cancel" size={16} className={styles.dangerIcon} />
              <span>Assigned participants will no longer see this quiz in their dashboard</span>
            </div>
            <div className={styles.infoRow}>
              <Icon name="x-cancel" size={16} className={styles.dangerIcon} />
              <span>The quiz cannot be reopened or restored after cancellation</span>
            </div>
          </div>

          <hr className={styles.modalDivider} />

          <Input
            type="checkbox"
            label="I understand this quiz will be permanently cancelled and cannot be recovered"
            checked={understandCancelled}
            onChange={(e) => setUnderstandCancelled(e.target.checked)}
          />

          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>
              No, Keep Quiz
            </Button>
            <Button
              variant="danger"
              disabled={!understandCancelled}
              isLoading={isCancelling}
              onClick={confirmCancellation}
            >
              Yes, Cancel Quiz
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
export default AdminDashboard;
