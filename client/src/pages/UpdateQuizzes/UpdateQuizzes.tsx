// filename: client/src/pages/UpdateQuizzes/UpdateQuizzes.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UpdateQuizzes.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import Badge from '../../components/atoms/Badge/Badge';
import Icon from '../../components/atoms/Icon/Icon';
import Button from '../../components/atoms/Buttons/Button';
import { useGetInstructorQuizzesQuery } from '../../services/instructorApi';

export const UpdateQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch quizzes (Draft + Scheduled)
  // Note: we can fetch all and filter client-side or pass status filter if needed,
  // but to guarantee showing ONLY Draft/Scheduled as per M3, let's fetch all and filter in-memory!
  const { data: quizzesData, isLoading } = useGetInstructorQuizzesQuery({
    page,
    limit: 10,
    ...(search ? { search } : {}),
  });

  // Filter in-memory for Draft and Scheduled
  const draftAndScheduledQuizzes = (quizzesData?.quizzes || []).filter(
    (q) => q.status === 'Draft' || q.status === 'Scheduled'
  );

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    return `${day} ${month} ${year} . ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Update Quizzes</h1>
          <p className={styles.subtitle}>Draft & Scheduled only — Readiness indicators</p>
        </div>

        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>All Quizzes</h3>
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search quizzes..."
          />
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner} />
              <span>Loading quizzes...</span>
            </div>
          ) : draftAndScheduledQuizzes.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="empty-state" size={48} className={styles.emptyIcon} />
              <h4 className={styles.emptyTitle}>No Quizzes Found</h4>
              <p className={styles.emptyText}>There are no Draft or Scheduled quizzes matching your query.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>QUIZ TITLE</th>
                  <th>STATUS</th>
                  <th>SCHEDULED</th>
                  <th>READINESS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {draftAndScheduledQuizzes.map((quiz) => {
                  const questionsCount = quiz.questionsCount || 0;
                  const participantsCount = quiz.participantsCount || 0;

                  return (
                    <tr key={quiz.id}>
                      <td className={styles.titleCell}>
                        <p className={styles.title}>{quiz.title}</p>
                        <p className={styles.description}>{quiz.description}</p>
                      </td>
                      <td>
                        <Badge status={quiz.status} />
                      </td>
                      <td className={styles.dateText}>
                        {quiz.startTime ? formatDateTime(quiz.startTime) : '—'}
                      </td>
                      <td>
                        <div className={styles.readinessContainer}>
                          {/* Questions Indicator */}
                          <span
                            className={`${styles.indicatorBadge} ${
                              questionsCount >= 1 ? styles.ready : styles.notReady
                            }`}
                          >
                            <Icon name={questionsCount >= 1 ? 'check' : 'x-close'} size={12} />
                            <span>Questions {questionsCount >= 1 ? 'Added' : 'Missing'}</span>
                          </span>

                          {/* Participants Indicator */}
                          <span
                            className={`${styles.indicatorBadge} ${
                              participantsCount >= 1 ? styles.ready : styles.notReady
                            }`}
                          >
                            <Icon name={participantsCount >= 1 ? 'check' : 'x-close'} size={12} />
                            <span>Participants {participantsCount >= 1 ? 'Added' : 'Missing'}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="edit-pencil"
                          onClick={() => navigate(`/instructor/edit-quiz/${quiz.id}`)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};
export default UpdateQuizzes;
