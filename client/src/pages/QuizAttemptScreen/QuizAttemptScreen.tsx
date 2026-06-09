// filename: client/src/pages/QuizAttemptScreen/QuizAttemptScreen.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './QuizAttemptScreen.module.scss';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import CountdownClock from '../../components/molecules/CountdownClock/CountdownClock';
import Modal from '../../components/organisms/Modal/Modal';
import {
  useGetCandidateQuizDetailsQuery,
  useStartCandidateQuizMutation,
  useSubmitCandidateQuizMutation,
} from '../../services/candidateApi';

export const QuizAttemptScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Test state machine: 'pre-test' | 'taking-test' | 'submitting' | 'submitted' | 'error'
  const [stage, setStage] = useState<'pre-test' | 'taking-test' | 'submitted' | 'error'>('pre-test');
  const [errorMsg, setErrorMsg] = useState('');

  // Quiz details & mutations
  const { data: detailData, isLoading: detailsLoading } = useGetCandidateQuizDetailsQuery(id || '', {
    skip: !id,
  });

  const [startQuizTrigger, { isLoading: isStarting }] = useStartCandidateQuizMutation();
  const [submitQuizTrigger, { isLoading: isSubmitting }] = useSubmitCandidateQuizMutation();

  // Questions and attempt data
  const [questions, setQuestions] = useState<any[]>([]);
  const [targetEndTime, setTargetEndTime] = useState<string>('');

  // Active question index
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Answers state: Record<questionId, selectedOptionIds[]>
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});

  // Question navigation tracking: Set of questionIds that have been visited
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());

  // Confirm Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Check if already attempted/started or errors
  useEffect(() => {
    if (detailData?.quiz) {
      // If candidate already attempted, they shouldn't take it again
      if (
        detailData.quiz.attemptStatus === 'submitted' ||
        detailData.quiz.attemptStatus === 'auto-submitted'
      ) {
        setErrorMsg('You have already submitted this quiz.');
        setStage('error');
      }
    }
  }, [detailData]);

  const handleStartQuiz = async () => {
    if (!id) return;
    try {
      const response = await startQuizTrigger(id).unwrap();
      setQuestions(response.questions);

      // Calculate end time: startedAt + duration minutes
      const end = new Date(new Date(response.startedAt).getTime() + response.duration * 60 * 1000);
      setTargetEndTime(end.toISOString());

      // Pre-populate any existing answers if the response returns them (resume state)
      // Note: for safety, initialize visited set with the first question
      if (response.questions.length > 0) {
        setVisitedQuestions(new Set([response.questions[0].id]));
      }

      setStage('taking-test');
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Failed to start the quiz. Make sure you are assigned and that the test is currently live.';
      setErrorMsg(msg);
      setStage('error');
    }
  };

  // Navigating to a question
  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentQIndex(index);
    const qId = questions[index].id;
    setVisitedQuestions((prev) => {
      const next = new Set(prev);
      next.add(qId);
      return next;
    });
  };

  // Option selection
  const handleSelectOption = (optionId: string) => {
    const activeQ = questions[currentQIndex];
    const qId = activeQ.id;
    const isMulti = activeQ.type === 'multi-select';

    setSelectedAnswers((prev) => {
      const currentSelections = prev[qId] || [];
      let newSelections: string[];

      if (isMulti) {
        if (currentSelections.includes(optionId)) {
          newSelections = currentSelections.filter((id) => id !== optionId);
        } else {
          newSelections = [...currentSelections, optionId];
        }
      } else {
        // Single choice or true/false
        newSelections = [optionId];
      }

      return {
        ...prev,
        [qId]: newSelections,
      };
    });
  };

  // Formatting answers for submission: array of { questionId, selectedOptionIds }
  const formatAnswersForSubmit = () => {
    return questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: selectedAnswers[q.id] || [],
    }));
  };

  const executeSubmit = async (isAuto = false) => {
    if (!id) return;
    setShowSubmitModal(false);
    try {
      const answers = formatAnswersForSubmit();
      await submitQuizTrigger({ id, answers }).unwrap();
      setStage('submitted');
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Failed to submit quiz. Please try again. ' + (err?.data?.error?.message || ''));
    }
  };

  const handleTimerComplete = () => {
    // Auto submit quiz when time runs out
    executeSubmit(true);
  };

  if (stage === 'error') {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <Icon name="alert-triangle" size={48} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Cannot Start Test</h2>
          <p className={styles.errorText}>{errorMsg}</p>
          <Button variant="primary" onClick={() => navigate('/candidate/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'submitted') {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrapper}>
            <Icon name="check-circle" size={56} className={styles.successIcon} />
          </div>
          <h2 className={styles.successTitle}>Test Submitted Successfully!</h2>
          <p className={styles.successText}>
            Your attempt has been recorded. Your responses have been graded automatically.
          </p>
          <div className={styles.successActions}>
            <Button variant="secondary" onClick={() => navigate('/candidate/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" icon="eye" onClick={() => navigate(`/candidate/results/${id}`)}>
              View Scorecard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'taking-test') {
    const activeQ = questions[currentQIndex];
    const activeQAnswers = selectedAnswers[activeQ?.id] || [];

    // Helper functions for navigator class names
    const getNavigatorClass = (q: any, index: number) => {
      const classes = [styles.navNum];
      if (index === currentQIndex) classes.push(styles.activeNum);

      const answered = (selectedAnswers[q.id] || []).length > 0;
      const visited = visitedQuestions.has(q.id);

      if (answered) {
        classes.push(styles.answeredNum);
      } else if (visited) {
        classes.push(styles.visitedNum);
      } else {
        classes.push(styles.unvisitedNum);
      }

      return classes.join(' ');
    };

    const unansweredCount = questions.filter(
      (q) => (selectedAnswers[q.id] || []).length === 0
    ).length;

    return (
      <div className={styles.takingTestWrapper}>
        {/* Navbar Clock & Title */}
        <header className={styles.testHeader}>
          <div className={styles.testBrand}>
            <Icon name="logo-qa" size={32} className={styles.brandIcon} />
            <div>
              <h1 className={styles.testTitle}>{detailData?.quiz?.title || 'Assessment'}</h1>
              <p className={styles.questionCounter}>
                Question {currentQIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className={styles.timerWrapper}>
            <span className={styles.timerLabel}>Time Remaining:</span>
            {targetEndTime && (
              <CountdownClock
                targetDate={targetEndTime}
                mode="test"
                onComplete={handleTimerComplete}
              />
            )}
          </div>

          <Button variant="danger" icon="publish" onClick={() => setShowSubmitModal(true)}>
            Submit Test
          </Button>
        </header>

        <div className={styles.takingTestBody}>
          {/* Main Question Box */}
          <main className={styles.questionPanel}>
            {activeQ && (
              <div className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.qIndexBadge}>Question {currentQIndex + 1}</span>
                  <span className={styles.qTypeBadge}>
                    {activeQ.type === 'multi-select'
                      ? 'Multiple Choices (Select all that apply)'
                      : activeQ.type === 'true/false'
                      ? 'True or False'
                      : 'Single Choice'}
                  </span>
                </div>

                <h2 className={styles.questionText}>{activeQ.text}</h2>

                <div className={styles.optionsList}>
                  {activeQ.options.map((opt: any) => {
                    const isSelected = activeQAnswers.includes(opt.id);
                    const isMulti = activeQ.type === 'multi-select';

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`${styles.optionItem} ${isSelected ? styles.selectedOption : ''}`}
                      >
                        <div className={styles.optionIndicator}>
                          <Icon
                            name={
                              isSelected
                                ? isMulti
                                  ? 'check-verified'
                                  : 'radio-selected'
                                : isMulti
                                ? 'check'
                                : 'radio-unselected'
                            }
                            size={20}
                            className={isSelected ? styles.selectedIcon : styles.unselectedIcon}
                          />
                        </div>
                        <span className={styles.optionLetter}>{opt.id}.</span>
                        <span className={styles.optionText}>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className={styles.navButtons}>
              <Button
                variant="secondary"
                icon="arrow-left"
                disabled={currentQIndex === 0}
                onClick={() => goToQuestion(currentQIndex - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={currentQIndex === questions.length - 1}
                onClick={() => goToQuestion(currentQIndex + 1)}
              >
                Next
                <Icon name="arrow-right" size={16} />
              </Button>
            </div>
          </main>

          {/* Sidebar Navigation */}
          <aside className={styles.navigatorPanel}>
            <h3 className={styles.panelTitle}>Question Navigator</h3>
            <div className={styles.navGrid}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={getNavigatorClass(q, idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <hr className={styles.navDivider} />

            <div className={styles.legendList}>
              <h4 className={styles.legendTitle}>Legend</h4>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendAnswered}`} />
                <span>Answered</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendVisited}`} />
                <span>Unanswered (Visited)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendUnvisited}`} />
                <span>Not Visited</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Submit Confirmation Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit your test?"
          size="sm"
        >
          <div className={styles.submitModalBody}>
            <div className={styles.modalWarningBox}>
              <Icon name="stat-warning" size={24} className={styles.warningIcon} />
              <div>
                <h4 className={styles.warningBoxTitle}>Submit Assessment?</h4>
                <p className={styles.warningBoxText}>
                  Once submitted, you will not be able to change your answers or rejoin this test.
                </p>
              </div>
            </div>

            {unansweredCount > 0 ? (
              <p className={styles.unansweredAlert}>
                You have <strong className={styles.dangerText}>{unansweredCount}</strong> unanswered question(s). We highly recommend answering all questions before submitting.
              </p>
            ) : (
              <p className={styles.completedAlert}>
                Great job! You have answered all questions.
              </p>
            )}

            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={isSubmitting} onClick={() => executeSubmit(false)}>
                Yes, Submit Test
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Pre-test instructions stage
  return (
    <div className={styles.preTestWrapper}>
      <div className={styles.preTestCard}>
        {detailsLoading ? (
          <div className={styles.loadingBox}>
            <span className={styles.spinner} />
            <span>Retrieving quiz guidelines...</span>
          </div>
        ) : detailData?.quiz ? (
          <>
            <div className={styles.badgeRow}>
              <span className={styles.quizBadge}>Live Assessment</span>
              <span className={styles.durationBadge}>
                <Icon name="timer" size={14} />
                <span>{detailData.quiz.duration} Mins</span>
              </span>
            </div>

            <h1 className={styles.quizTitle}>{detailData.quiz.title}</h1>
            <p className={styles.quizDescription}>{detailData.quiz.description}</p>

            <hr className={styles.divider} />

            <h3 className={styles.guidelinesTitle}>Assessment Instructions</h3>
            <ul className={styles.guidelinesList}>
              <li>
                <Icon name="check-verified" size={16} className={styles.guideIcon} />
                <span>This test is timed and lasts exactly <strong>{detailData.quiz.duration} minutes</strong>.</span>
              </li>
              <li>
                <Icon name="check-verified" size={16} className={styles.guideIcon} />
                <span>The timer begins immediately when you click <strong>Start Test</strong>.</span>
              </li>
              <li>
                <Icon name="check-verified" size={16} className={styles.guideIcon} />
                <span>The test will be <strong>automatically submitted</strong> when the time expires.</span>
              </li>
              <li>
                <Icon name="check-verified" size={16} className={styles.guideIcon} />
                <span>You can navigate back and forth between questions at any time.</span>
              </li>
              <li>
                <Icon name="check-verified" size={16} className={styles.guideIcon} />
                <span>Once submitted, you cannot re-enter or change your responses.</span>
              </li>
            </ul>

            <hr className={styles.divider} />

            <div className={styles.startActions}>
              <Button variant="ghost" onClick={() => navigate('/candidate/dashboard')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isStarting}
                icon="publish"
                onClick={handleStartQuiz}
              >
                Start Test
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.errorBox}>
            <Icon name="alert-triangle" size={24} />
            <span>Unable to load quiz details. Make sure you are assigned to this quiz.</span>
            <Button variant="primary" onClick={() => navigate('/candidate/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttemptScreen;
