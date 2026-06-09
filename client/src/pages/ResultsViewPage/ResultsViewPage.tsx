// filename: client/src/pages/ResultsViewPage/ResultsViewPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './ResultsViewPage.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import StatCard from '../../components/molecules/StatCard/StatCard';
import DonutChartCard from '../../components/organisms/DonutChartCard/DonutChartCard';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import Modal from '../../components/organisms/Modal/Modal';
import { useGetCandidateQuizResultQuery } from '../../services/candidateApi';
import { useGetQuizResultsQuery, useGetInstructorQuizzesQuery } from '../../services/instructorApi';
import type { RootState } from '../../store/store';

export const ResultsViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Determine user role
  const isCandidate = user?.role === 'participant';

  // Candidate/Participant query
  const { data: candidateResult, isLoading: candidateLoading } = useGetCandidateQuizResultQuery(id || '', {
    skip: !id || !isCandidate,
  });

  // Instructor/Admin query
  const { data: instructorResults, isLoading: instructorLoading } = useGetQuizResultsQuery(
    {
      id: id || '',
      params: {
        page,
        limit: 10,
        ...(search ? { search } : {}),
      },
    },
    {
      skip: !id || isCandidate,
    }
  );

  // Fetch quizzes list for detail result lookup (for instructor/admin)
  const { data: instructorQuizData } = useGetInstructorQuizzesQuery(
    { page: 1, limit: 100 },
    { skip: isCandidate || !id }
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleOpenAttemptDetail = (attempt: any) => {
    setSelectedAttemptDetail(attempt);
    setDetailModalOpen(true);
  };

  // Render Candidate Results Page
  if (isCandidate) {
    if (candidateLoading) {
      return (
        <Layout>
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            <span>Loading your scorecard...</span>
          </div>
        </Layout>
      );
    }

    if (!candidateResult) {
      return (
        <Layout>
          <div className={styles.errorState}>
            <Icon name="alert-triangle" size={48} className={styles.errorIcon} />
            <h2>Scorecard Not Available</h2>
            <p>We couldn't retrieve your scorecard. Make sure you have submitted the test.</p>
            <Button variant="primary" onClick={() => navigate('/candidate/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </Layout>
      );
    }

    const { score, percentage, totalQuestions, correctCount, wrongCount, skippedCount, timeTakenSeconds, questions } = candidateResult;

    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.header}>
            <BreadcrumbsContainer
              role="candidate"
              quizTitle="Detailed Scorecard"
              onBack={() => navigate('/candidate/dashboard')}
            />
            <h1 className={styles.title}>Your Scorecard</h1>
            <p className={styles.subtitle}>Below is the breakdown of your performance.</p>
          </div>

          {/* Stats Summary Cards */}
          <div className={styles.statsGrid}>
            <StatCard
              title="Your Score"
              value={`${score} / ${totalQuestions}`}
              icon="check-verified-2"
              variant="primary"
            />
            <StatCard
              title="Accuracy"
              value={`${Math.round(percentage)}%`}
              icon="analytics"
              variant="secondary"
            />
            <StatCard
              title="Time Taken"
              value={formatTime(timeTakenSeconds)}
              icon="timer"
              variant="highlight"
            />
            <div className={styles.breakdownCard}>
              <h4 className={styles.breakdownTitle}>Question Status</h4>
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownDot} style={{ backgroundColor: '#1D9E75' }} />
                <span className={styles.breakdownLabel}>Correct:</span>
                <span className={styles.breakdownVal}>{correctCount}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownDot} style={{ backgroundColor: '#E24B4A' }} />
                <span className={styles.breakdownLabel}>Incorrect:</span>
                <span className={styles.breakdownVal}>{wrongCount}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span className={styles.breakdownDot} style={{ backgroundColor: '#BA7517' }} />
                <span className={styles.breakdownLabel}>Skipped:</span>
                <span className={styles.breakdownVal}>{skippedCount}</span>
              </div>
            </div>
          </div>

          {/* Question Breakdown Checklist */}
          <div className={styles.questionsSection}>
            <h3 className={styles.sectionTitle}>Questions Review</h3>
            <div className={styles.questionsList}>
              {questions.map((q, idx) => {
                return (
                  <div key={q.id} className={`${styles.reviewCard} ${q.isCorrect ? styles.correctCard : q.selectedOptionIds.length === 0 ? styles.skippedCard : styles.wrongCard}`}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.qIndexGroup}>
                        <span className={styles.qNum}>Question {idx + 1}</span>
                        {q.isCorrect ? (
                          <span className={`${styles.statusLabel} ${styles.correctLabel}`}>
                            <Icon name="check" size={12} /> Correct
                          </span>
                        ) : q.selectedOptionIds.length === 0 ? (
                          <span className={`${styles.statusLabel} ${styles.skippedLabel}`}>
                            <Icon name="minus" size={12} /> Skipped
                          </span>
                        ) : (
                          <span className={`${styles.statusLabel} ${styles.wrongLabel}`}>
                            <Icon name="x-close" size={12} /> Incorrect
                          </span>
                        )}
                      </div>
                      <span className={styles.qType}>{q.type === 'multi-select' ? 'Multiple Selection' : q.type === 'true/false' ? 'True/False' : 'Single Selection'}</span>
                    </div>

                    <h4 className={styles.reviewText}>{q.text}</h4>

                    <div className={styles.optionsReviewList}>
                      {q.options.map((opt) => {
                        const isSelected = q.selectedOptionIds.includes(opt.id);
                        const isCorrectAnswer = q.correctOptionIds.includes(opt.id);

                        let optClass = styles.optReviewItem;
                        if (isCorrectAnswer) optClass += ` ${styles.optCorrectAnswer}`;
                        if (isSelected && !isCorrectAnswer) optClass += ` ${styles.optWrongAnswer}`;
                        if (isSelected && isCorrectAnswer) optClass += ` ${styles.optCorrectSelected}`;

                        return (
                          <div key={opt.id} className={optClass}>
                            <div className={styles.optIndicator}>
                              {isCorrectAnswer ? (
                                <Icon name="answer-correct" size={16} className={styles.correctTick} />
                              ) : isSelected ? (
                                <Icon name="answer-wrong" size={16} className={styles.wrongCross} />
                              ) : (
                                <span className={styles.emptyCircle} />
                              )}
                            </div>
                            <span className={styles.optLetter}>{opt.id}.</span>
                            <span className={styles.optText}>{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Render Instructor / Admin Results Page
  if (instructorLoading) {
    return (
      <Layout>
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
          <span>Loading assessment results...</span>
        </div>
      </Layout>
    );
  }

  const results = instructorResults;
  const attempts = results?.attempts || [];
  const stats = results?.stats;
  const pagination = results?.pagination;

  const chartDataPoints = stats
    ? [
        { label: 'Excel (>90%)', value: stats.distribution.excelCount, color: '#1D9E75' },
        { label: 'High (80-90%)', value: stats.distribution.highCount, color: '#534AB7' },
        { label: 'Mid (60-80%)', value: stats.distribution.midCount, color: '#BA7517' },
        { label: 'Low (50-60%)', value: stats.distribution.lowCount, color: '#BA1717' },
        { label: 'Fail (<50%)', value: stats.distribution.failCount, color: '#E24B4A' },
      ]
    : [];

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <BreadcrumbsContainer
            role={user?.role || 'instructor'}
            quizTitle="Assessment Results"
            onBack={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard')}
          />
          <h1 className={styles.title}>Quiz Results</h1>
          <p className={styles.subtitle}>Overview of candidate submissions and statistics.</p>
        </div>

        {stats && (
          <>
            {/* Stats Cards Row */}
            <div className={styles.statsGrid}>
              <StatCard
                title="Assigned Candidates"
                value={stats.totalParticipants}
                icon="user-group"
                variant="primary"
              />
              <StatCard
                title="Total Submissions"
                value={stats.totalSubmitted}
                icon="check-circle"
                variant="secondary"
              />
              <StatCard
                title="Average Score"
                value={stats.averageScore}
                icon="analytics"
                variant="highlight"
              />
              <StatCard
                title="Highest / Lowest"
                value={`${stats.highestScore} / ${stats.lowestScore}`}
                icon="check-verified"
                variant="secondary"
              />
            </div>

            {/* Chart + Table Group */}
            <div className={styles.analyticsAndTable}>
              {/* Distribution Chart */}
              <div className={styles.chartSection}>
                <DonutChartCard
                  title="Score Distribution"
                  dataPoints={chartDataPoints}
                  centerText={String(stats.totalSubmitted)}
                  centerSubText="Submitted"
                />
              </div>

              {/* Candidates Attempts Table */}
              <div className={styles.tableSection}>
                <div className={styles.tableControls}>
                  <h3 className={styles.sectionTitle}>Quiz Leaderboard</h3>
                  <SearchBar
                    value={search}
                    onChange={(val) => { setSearch(val); setPage(1); }}
                    placeholder="Search candidate by name..."
                  />
                </div>

                {attempts.length === 0 ? (
                  <div className={styles.emptyTable}>
                    <Icon name="empty-state" size={48} className={styles.emptyIcon} />
                    <h4>No Submissions Found</h4>
                    <p>{search ? 'No results matched your search term.' : 'No candidates have submitted this quiz yet.'}</p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>RANK</th>
                          <th>CANDIDATE USER</th>
                          <th>EMAIL ADDRESS</th>
                          <th>SCORE</th>
                          <th>TIME TAKEN</th>
                          <th>STATUS</th>
                          <th>DETAILS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((attempt, idx) => {
                          const candidate = attempt.candidateId;
                          if (!candidate) return null;
                          
                          // Calculate rank based on pagination
                          const rank = (page - 1) * 10 + idx + 1;
                          
                          // Calculate time taken
                          const start = new Date(attempt.startedAt).getTime();
                          const submit = new Date(attempt.submittedAt).getTime();
                          const secTaken = Math.round((submit - start) / 1000);

                          return (
                            <tr key={attempt._id || attempt.id}>
                              <td>
                                {rank === 1 ? (
                                  <span className={`${styles.rankBadge} ${styles.rank1}`}>🥇 1st</span>
                                ) : rank === 2 ? (
                                  <span className={`${styles.rankBadge} ${styles.rank2}`}>🥈 2nd</span>
                                ) : rank === 3 ? (
                                  <span className={`${styles.rankBadge} ${styles.rank3}`}>🥉 3rd</span>
                                ) : (
                                  <span className={styles.rankPlain}>#{rank}</span>
                                )}
                              </td>
                              <td className={styles.nameCell}>
                                <div className={styles.avatar}>
                                  {candidate.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'}
                                </div>
                                <span className={styles.candidateName}>{candidate.name}</span>
                              </td>
                              <td className={styles.emailCell}>{candidate.email}</td>
                              <td className={styles.scoreCell}>
                                <strong>{attempt.score}</strong>
                              </td>
                              <td className={styles.timeCell}>{formatTime(secTaken)}</td>
                              <td>
                                <span className={`${styles.statusBadge} ${attempt.status === 'auto-submitted' ? styles.autoBadge : styles.submitBadge}`}>
                                  {attempt.status === 'auto-submitted' ? 'Auto-Submitted' : 'Submitted'}
                                </span>
                              </td>
                              <td>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon="eye"
                                  onClick={() => handleOpenAttemptDetail(attempt)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                          className={styles.pageBtn}
                        >
                          <Icon name="pagination-prev" size={16} />
                          Previous
                        </button>
                        <div className={styles.pagesList}>
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={[styles.pageNum, page === p ? styles.activePage : ''].join(' ')}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <button
                          disabled={page === pagination.pages}
                          onClick={() => setPage(page + 1)}
                          className={styles.pageBtn}
                        >
                          Next
                          <Icon name="pagination-next" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructor Detail Result Modal */}
        {selectedAttemptDetail && (
          <Modal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            title={`Scorecard: ${selectedAttemptDetail.candidateId?.name || 'Candidate'}`}
            size="md"
          >
            <div className={styles.modalScrollBody}>
              <div className={styles.modalMetadataRow}>
                <div className={styles.modalMetaBlock}>
                  <p className={styles.metaLabel}>Final Score</p>
                  <p className={styles.metaValue}>{selectedAttemptDetail.score} Correct</p>
                </div>
                <div className={styles.modalMetaBlock}>
                  <p className={styles.metaLabel}>Submission Type</p>
                  <p className={styles.metaValue} style={{ textTransform: 'capitalize' }}>
                    {selectedAttemptDetail.status}
                  </p>
                </div>
                <div className={styles.modalMetaBlock}>
                  <p className={styles.metaLabel}>Date Submitted</p>
                  <p className={styles.metaValue}>
                    {new Date(selectedAttemptDetail.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <hr className={styles.modalDivider} />

              <h4 className={styles.modalReviewTitle}>Responses Review</h4>
              <div className={styles.modalAnswersReview}>
                {selectedAttemptDetail.answers?.map((ans: any, ansIdx: number) => {
                  // Wait, to review, we need to find the question in the quiz
                  // The results query returns the attempts, but does the attempt answers have the question text?
                  // No, the attempt has { questionId, selectedOptionIds }.
                  // Wait, is the quiz questions list available? Yes!
                  // But wait, the quiz is not directly returned by the results endpoint. We can fetch it client-side if we need to?
                  // Or does the attempt populate questions? No, QuizAttempt mongoose schema holds answers with subdocuments.
                  // Wait! Let's check: does the candidate result populate questions? Yes, candidate result returns the populated questions.
                  // But what about the instructor? Does the instructor list results endpoint return populated questions?
                  // Let's check `server/src/models/QuizAttempt.ts`. Does it store correctOptionIds or question text? No, it only stores questionId and selectedOptionIds.
                  // Wait, how can the instructor view which question was which?
                  // Ah! We can fetch the quiz details from the list of quizzes in the instructor state!
                  // In Redux, or using the instructorApi, we can find the quiz in the cache, or we can fetch the quiz details.
                  // Wait! The instructor has `useGetInstructorQuizzesQuery` which fetches all quizzes, including their questions and correct options!
                  // So we can find the quiz object in the instructor's quizzes list!
                  // Let's check if the instructor's quizzes list is loaded. Yes, on InstructorDashboard or when they navigate here, we can find the quiz.
                  // Wait, let's look at `instructorResults` or the quiz object.
                  // Wait! Can we find the quiz in the local cache?
                  // Yes! We can call `useGetInstructorQuizzesQuery` (with pagination or without) or we can look up the quiz details.
                  // Let's fetch the quiz details from `useGetInstructorQuizzesQuery`!
                  const quizDetail = instructorQuizData?.quizzes.find((q: any) => q.id === id);
                  const questionsList = quizDetail?.questions || [];

                  // Find the question matching ans.questionId
                  const matchedQ = questionsList.find((q: any) => (q._id || q.id) === ans.questionId);
                  if (!matchedQ) return null;

                  const isCorrect = JSON.stringify(matchedQ.correctOptionIds.sort()) === JSON.stringify(ans.selectedOptionIds.sort());

                  return (
                    <div key={ans.questionId} className={`${styles.modalQCard} ${isCorrect ? styles.modalQCorrect : ans.selectedOptionIds.length === 0 ? styles.modalQSkipped : styles.modalQWrong}`}>
                      <div className={styles.modalQHeader}>
                        <span className={styles.modalQNum}>Q{ansIdx + 1}</span>
                        {isCorrect ? (
                          <span className={styles.modalQStatusGreen}>Correct</span>
                        ) : ans.selectedOptionIds.length === 0 ? (
                          <span className={styles.modalQStatusOrange}>Skipped</span>
                        ) : (
                          <span className={styles.modalQStatusRed}>Incorrect</span>
                        )}
                      </div>
                      <p className={styles.modalQText}>{matchedQ.text}</p>
                      
                      <div className={styles.modalOptionsList}>
                        {matchedQ.options.map((opt: any) => {
                          const isSelected = ans.selectedOptionIds.includes(opt.id);
                          const isCorrectOpt = matchedQ.correctOptionIds.includes(opt.id);
                          
                          let optClass = styles.modalOptItem;
                          if (isCorrectOpt) optClass += ` ${styles.modalOptCorrect}`;
                          if (isSelected && !isCorrectOpt) optClass += ` ${styles.modalOptWrong}`;

                          return (
                            <div key={opt.id} className={optClass}>
                              <span className={styles.modalOptIndicator}>
                                {isCorrectOpt ? '✓' : isSelected ? '✗' : ''}
                              </span>
                              <strong>{opt.id}.</strong> {opt.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.modalActions}>
                <Button variant="primary" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

// Breadcrumbs Wrapper Component
interface BreadcrumbsProps {
  role: string;
  quizTitle: string;
  onBack: () => void;
}

const BreadcrumbsContainer: React.FC<BreadcrumbsProps> = ({ role, quizTitle, onBack }) => {
  const navigate = useNavigate();
  const getParentPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    return '/candidate/dashboard';
  };

  const getParentLabel = () => {
    if (role === 'admin') return 'Admin Dashboard';
    if (role === 'instructor') return 'Instructor Dashboard';
    return 'Candidate Dashboard';
  };

  return (
    <div className={styles.breadcrumbsRow}>
      <div className={styles.breadcrumbTrail}>
        <span className={styles.breadcrumbLink} onClick={() => navigate(getParentPath())}>
          {getParentLabel()}
        </span>
        <Icon name="chevron-right" size={12} className={styles.breadcrumbArrow} />
        <span className={styles.breadcrumbActive}>Results</span>
        <Icon name="chevron-right" size={12} className={styles.breadcrumbArrow} />
        <span className={styles.breadcrumbActive}>{quizTitle}</span>
      </div>
      <Button variant="ghost" size="sm" icon="arrow-left" onClick={onBack}>
        Back
      </Button>
    </div>
  );
};

export default ResultsViewPage;
