// filename: client/src/pages/CandidateDashboard/UpcomingQuizzes.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UpcomingQuizzes.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import CountdownClock from '../../components/molecules/CountdownClock/CountdownClock';
import Badge from '../../components/atoms/Badge/Badge';
import { useGetCandidateQuizzesQuery } from '../../services/candidateApi';

export const UpcomingQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Fetch only upcoming or live quizzes by requesting list with filter: upcoming / live
  // Wait, candidate service list quizzes can filter by 'upcoming' and 'live' separately, or we can filter them client-side
  // or call the backend query. Let's fetch with no filter or filter='upcoming' and merge client-side if needed, 
  // or fetch with 'upcoming' and 'live' filters. To make sure we show both upcoming and live quizzes, let's fetch all 
  // and filter in the client to find those with candidateStatus === 'upcoming' or 'live'.
  const { data, isLoading, refetch } = useGetCandidateQuizzesQuery({
    page: 1,
    limit: 100, // retrieve a wider set to display cards
    ...(search ? { search } : {}),
  });

  const allQuizzes = data?.quizzes || [];
  const upcomingAndLiveQuizzes = allQuizzes.filter(
    (q) => q.candidateStatus === 'upcoming' || q.candidateStatus === 'live'
  );

  const handleStartTest = (quizId: string) => {
    navigate(`/candidate/quiz-attempt/${quizId}`);
  };

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
          <h1 className={styles.title}>Upcoming & Live Quizzes</h1>
          <p className={styles.subtitle}>View your scheduled quizzes and join live assessments here.</p>
        </div>

        <div className={styles.controls}>
          <h3 className={styles.sectionTitle}>Available Tests</h3>
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search upcoming tests..."
          />
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            <span>Loading upcoming tests...</span>
          </div>
        ) : upcomingAndLiveQuizzes.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="empty-state" size={64} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>No Upcoming Tests</h4>
            <p className={styles.emptyText}>
              {search ? 'No tests match your search criteria.' : 'You have no scheduled or live assessments at this time.'}
            </p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {upcomingAndLiveQuizzes.map((quiz) => {
              const isLive = quiz.candidateStatus === 'live';
              const attempted = quiz.attemptStatus === 'submitted' || quiz.attemptStatus === 'auto-submitted';

              return (
                <div
                  key={quiz.id}
                  className={`${styles.card} ${isLive ? styles.liveCard : ''} ${attempted ? styles.attemptedCard : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.badgeRow}>
                      <Badge status={isLive ? 'Live' : 'Scheduled'} />
                      {quiz.attemptStatus && (
                        <span className={styles.attemptBadge}>
                          {quiz.attemptStatus === 'started' ? 'In Progress' : 'Attempted'}
                        </span>
                      )}
                    </div>
                    <div className={styles.durationBadge}>
                      <Icon name="stopwatch" size={14} />
                      <span>{quiz.duration} Mins</span>
                    </div>
                  </div>

                  <h3 className={styles.quizTitle}>{quiz.title}</h3>
                  <p className={styles.quizDesc}>{quiz.description}</p>

                  <div className={styles.quizDetails}>
                    <div className={styles.detailItem}>
                      <Icon name="calendar" size={14} className={styles.detailIcon} />
                      <div>
                        <p className={styles.detailLabel}>Starts</p>
                        <p className={styles.detailValue}>{formatDateTime(quiz.startTime)}</p>
                      </div>
                    </div>

                    <div className={styles.detailItem}>
                      <Icon name="chip-questions" size={14} className={styles.detailIcon} />
                      <div>
                        <p className={styles.detailLabel}>Questions</p>
                        <p className={styles.detailValue}>{quiz.questionCount} Qs</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {!isLive && !attempted && (
                      <div className={styles.countdownContainer}>
                        <CountdownClock
                          targetDate={quiz.startTime}
                          prefix="Starts in"
                          onComplete={() => refetch()}
                        />
                      </div>
                    )}

                    {isLive && !attempted && (
                      <Button
                        variant="primary"
                        icon="publish"
                        className={styles.actionBtn}
                        onClick={() => handleStartTest(quiz.id)}
                      >
                        {quiz.attemptStatus === 'started' ? 'Resume Test' : 'Start Test Now'}
                      </Button>
                    )}

                    {!isLive && !attempted && (
                      <Button
                        variant="secondary"
                        disabled
                        className={styles.actionBtn}
                      >
                        Waiting to Start
                      </Button>
                    )}

                    {attempted && (
                      <Button
                        variant="ghost"
                        icon="check-circle"
                        className={styles.actionBtn}
                        onClick={() => navigate(`/candidate/results/${quiz.id}`)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UpcomingQuizzes;
