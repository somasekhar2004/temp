// filename: client/src/components/organisms/QuizTable/QuizTable.tsx
import React from 'react';
import styles from './QuizTable.module.scss';
import Badge from '../../atoms/Badge/Badge';
import Button from '../../atoms/Buttons/Button';
import Icon from '../../atoms/Icon/Icon';

export interface QuizTableItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  questionsCount?: number;
  participantsCount?: number;
  attemptStatus?: 'started' | 'submitted' | 'auto-submitted' | null;
}

interface QuizTableProps {
  quizzes: QuizTableItem[];
  role: 'admin' | 'instructor' | 'participant';
  onAction: (id: string, actionType: 'edit' | 'view-result' | 'cancel' | 'delete' | 'start-test') => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

export const QuizTable: React.FC<QuizTableProps> = ({
  quizzes,
  role,
  onAction,
  pagination,
  onPageChange,
}) => {
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    // Format: DD MMM YYYY . HH:MM AM/PM (e.g. 15 May 2026 . 10:00 AM)
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    return `${day} ${month} ${year} . ${formattedHours}:${minutes} ${ampm}`;
  };

  const getActions = (quiz: QuizTableItem) => {
    const actions: React.ReactNode[] = [];

    if (role === 'admin') {
      if (['Draft', 'Scheduled'].includes(quiz.status)) {
        actions.push(
          <Button key="edit" variant="secondary" size="sm" icon="edit" onClick={() => onAction(quiz.id, 'edit')}>
            Edit
          </Button>
        );
      }
      if (quiz.status === 'Completed') {
        actions.push(
          <Button key="result" variant="primary" size="sm" icon="eye" onClick={() => onAction(quiz.id, 'view-result')}>
            View Result
          </Button>
        );
      }
      if (['Draft', 'Scheduled', 'Live'].includes(quiz.status)) {
        actions.push(
          <Button key="cancel" variant="danger" size="sm" icon="x-cancel" onClick={() => onAction(quiz.id, 'cancel')}>
            Cancel
          </Button>
        );
      }
    } else if (role === 'instructor') {
      if (['Draft', 'Scheduled'].includes(quiz.status)) {
        actions.push(
          <Button key="edit" variant="secondary" size="sm" icon="edit" onClick={() => onAction(quiz.id, 'edit')}>
            Edit
          </Button>
        );
      }
      if (quiz.status === 'Completed') {
        actions.push(
          <Button key="result" variant="primary" size="sm" icon="eye" onClick={() => onAction(quiz.id, 'view-result')}>
            View Result
          </Button>
        );
      }
      if (['Draft', 'Scheduled', 'Live'].includes(quiz.status)) {
        actions.push(
          <Button key="cancel" variant="danger" size="sm" icon="x-cancel" onClick={() => onAction(quiz.id, 'cancel')}>
            Cancel
          </Button>
        );
      }
    } else if (role === 'participant') {
      const isAttempted = quiz.attemptStatus === 'submitted' || quiz.attemptStatus === 'auto-submitted';
      const isLive = quiz.status === 'Live';

      if (isAttempted) {
        actions.push(
          <Button key="view" variant="secondary" size="sm" icon="eye" onClick={() => onAction(quiz.id, 'view-result')}>
            View Result
          </Button>
        );
      } else if (isLive) {
        actions.push(
          <Button key="start" variant="primary" size="sm" icon="publish" onClick={() => onAction(quiz.id, 'start-test')}>
            Start Test
          </Button>
        );
      } else {
        // Upcoming or Expired without attempt
        actions.push(<span key="no-action" className={styles.noAction}>—</span>);
      }
    }

    return <div className={styles.actionsContainer}>{actions}</div>;
  };

  if (quizzes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="empty-state" size={64} className={styles.emptyIcon} />
        <h4 className={styles.emptyTitle}>No Quizzes Found</h4>
        <p className={styles.emptyText}>There are no quizzes matching your current selection.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>QUIZ TITLE</th>
            <th>STATUS</th>
            <th>SCHEDULED TIME</th>
            <th>DURATION</th>
            <th className={styles.actionHeader}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id}>
              <td className={styles.titleCell}>
                <p className={styles.title}>{quiz.title}</p>
                <p className={styles.description}>{quiz.description}</p>
              </td>
              <td>
                <Badge status={quiz.status} />
              </td>
              <td className={styles.dateText}>
                {formatDateTime(quiz.startTime)}
              </td>
              <td className={styles.durationText}>
                {quiz.duration} mins
              </td>
              <td>{getActions(quiz)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      {pagination && pagination.pages > 1 && onPageChange && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className={styles.pageBtn}
          >
            <Icon name="pagination-prev" size={16} />
            Previous
          </button>
          
          <div className={styles.pagesList}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={[styles.pageNum, pagination.page === p ? styles.activePage : ''].join(' ')}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
            className={styles.pageBtn}
          >
            Next
            <Icon name="pagination-next" size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
export default QuizTable;
