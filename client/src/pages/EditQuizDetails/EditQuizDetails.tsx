// filename: client/src/pages/EditQuizDetails/EditQuizDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditQuizDetails.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import Breadcrumbs from '../../components/molecules/Breadcrumbs/Breadcrumbs';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import Badge from '../../components/atoms/Badge/Badge';
import Modal from '../../components/organisms/Modal/Modal';
import Input from '../../components/atoms/Input/Input';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import {
  useUpdateInstructorQuizMutation,
  useAddQuestionMutation,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  usePublishQuizMutation,
  useCancelInstructorQuizMutation,
  useGetInstructorQuizzesQuery,
} from '../../services/instructorApi';

export const EditQuizDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Active Tab: 'questions' | 'participants' | 'schedule'
  const [activeTab, setActiveTab] = useState<'questions' | 'participants'>('questions');

  // Fetch the target quiz details from instructor's list
  const { data: quizzesData, refetch } = useGetInstructorQuizzesQuery({});
  const quiz = quizzesData?.quizzes.find((q) => q.id === id);


  // Mutations
  const [updateQuizDetails] = useUpdateInstructorQuizMutation();
  const [addQuestionTrigger] = useAddQuestionMutation();
  const [editQuestionTrigger] = useEditQuestionMutation();
  const [deleteQuestionTrigger] = useDeleteQuestionMutation();
  const [addParticipantTrigger] = useAddParticipantMutation();
  const [removeParticipantTrigger] = useRemoveParticipantMutation();
  const [publishQuizTrigger] = usePublishQuizMutation();
  const [cancelQuizTrigger] = useCancelInstructorQuizMutation();

  // Modals States
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  // Question Form Fields
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'single-choice' | 'multi-select' | 'true/false'>('single-choice');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);

  // CSV Question Modal
  const [csvQuestionModalOpen, setCsvQuestionModalOpen] = useState(false);
  const [csvQuestionError, setCsvQuestionError] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);

  // CSV Participant Modal
  const [csvParticipantModalOpen, setCsvParticipantModalOpen] = useState(false);
  const [csvParticipantError, setCsvParticipantError] = useState('');
  const [parsedParticipantEmails, setParsedParticipantEmails] = useState<string[]>([]);

  // Inline Participant Add
  const [inlineParticipantOpen, setInlineParticipantOpen] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');

  // Cancel Quiz Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [understandCancelled, setUnderstandCancelled] = useState(false);

  // Schedule Edit Fields
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    if (quiz) {
      const start = new Date(quiz.startTime);
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      setScheduleDate(`${year}-${month}-${day}`);

      const hours = String(start.getHours()).padStart(2, '0');
      const mins = String(start.getMinutes()).padStart(2, '0');
      setScheduleTime(`${hours}:${mins}`);

    }
  }, [quiz]);

  if (!quiz) {
    return (
      <Layout>
        <div className={styles.loading}>Loading quiz details...</div>
      </Layout>
    );
  }

  const isDraft = quiz.status === 'Draft';
  const isScheduled = quiz.status === 'Scheduled';
  const isLive = quiz.status === 'Live';
  const isCompleted = quiz.status === 'Completed';
  const isCancelled = quiz.status === 'Cancelled';

  const questionsCount = quiz.questions.length;
  const participantsCount = quiz.participants.length;
  const isPublishable = questionsCount >= 1 && participantsCount >= 1;

  // Formatting dates
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
    return `${day} ${month} ${year} - ${formattedHours}:${minutes} ${ampm}`;
  };

  // Question CRUD handlers
  const openAddQuestion = () => {
    setEditingQuestionId(null);
    setQText('');
    setQType('single-choice');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOptions([]);
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (question: any) => {
    setEditingQuestionId(question._id || question.id);
    setQText(question.text);
    setQType(question.type);
    
    const optA = question.options.find((o: any) => o.id === 'A')?.text || '';
    const optB = question.options.find((o: any) => o.id === 'B')?.text || '';
    const optC = question.options.find((o: any) => o.id === 'C')?.text || '';
    const optD = question.options.find((o: any) => o.id === 'D')?.text || '';
    
    setOptionA(optA);
    setOptionB(optB);
    setOptionC(optC);
    setOptionD(optD);
    setCorrectOptions(question.correctOptionIds || []);
    setQuestionModalOpen(true);
  };

  const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !optionA || !optionB) return;

    const options = [
      { id: 'A', text: optionA },
      { id: 'B', text: optionB },
    ];
    if (qType !== 'true/false') {
      if (optionC) options.push({ id: 'C', text: optionC });
      if (optionD) options.push({ id: 'D', text: optionD });
    }

    const payload = {
      text: qText,
      options,
      correctOptionIds: correctOptions,
      type: qType,
    };

    try {
      if (editingQuestionId) {
        await editQuestionTrigger({ id: quiz.id, qId: editingQuestionId, body: payload }).unwrap();
      } else {
        await addQuestionTrigger({ id: quiz.id, body: payload }).unwrap();
      }
      setQuestionModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  };

  const deleteQuestion = async (qId: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestionTrigger({ id: quiz.id, qId }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Participant handlers
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantEmail) return;

    try {
      await addParticipantTrigger({ id: quiz.id, body: { email: participantEmail } }).unwrap();
      setParticipantEmail('');
      setInlineParticipantOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.error?.message || 'Failed to add participant');
    }
  };

  const removeParticipant = async (pId: string) => {
    if (!window.confirm('Remove this participant from the quiz?')) return;
    try {
      await removeParticipantTrigger({ id: quiz.id, pId }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to remove participant:', err);
    }
  };

  // CSV file parsing & validation helpers
  const handleQuestionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setParsedQuestions([]);
      return;
    }

    setCsvQuestionError('');
    setParsedQuestions([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setCsvQuestionError('CSV is empty or missing headers');
        return;
      }

      // Check header format
      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      const expectedHeaders = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correct'];
      const hasCorrectHeaders = expectedHeaders.every((h) => headers.includes(h));
      if (!hasCorrectHeaders) {
        setCsvQuestionError('Invalid CSV header. Expected: Question,OptionA,OptionB,OptionC,OptionD,Correct');
        return;
      }

      const questionIndex = headers.indexOf('question');
      const optAIndex = headers.indexOf('optiona');
      const optBIndex = headers.indexOf('optionb');
      const optCIndex = headers.indexOf('optionc');
      const optDIndex = headers.indexOf('optiond');
      const correctIndex = headers.indexOf('correct');

      const tempParsedQuestions = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length < 6) {
          setCsvQuestionError(`Line ${i + 1} is invalid. Required columns: Question,OptionA,OptionB,OptionC,OptionD,Correct`);
          setParsedQuestions([]);
          return;
        }

        const qTextVal = cols[questionIndex];
        const optAVal = cols[optAIndex];
        const optBVal = cols[optBIndex];
        const optCVal = cols[optCIndex];
        const optDVal = cols[optDIndex];
        const correctVal = cols[correctIndex];

        if (!qTextVal || !optAVal || !optBVal || !correctVal) {
          setCsvQuestionError(`Line ${i + 1} is missing mandatory fields (Question, OptionA, OptionB, or Correct)`);
          setParsedQuestions([]);
          return;
        }

        const correctOptionIds = correctVal.split(';').map((s) => s.trim().toUpperCase());
        const validOptions = ['A', 'B', 'C', 'D'];
        const hasInvalidOption = correctOptionIds.some((id) => !validOptions.includes(id));
        if (hasInvalidOption) {
          setCsvQuestionError(`Line ${i + 1} has invalid correct options. Correct values must be A, B, C, or D.`);
          setParsedQuestions([]);
          return;
        }

        tempParsedQuestions.push({
          text: qTextVal,
          options: [
            { id: 'A', text: optAVal },
            { id: 'B', text: optBVal },
            { id: 'C', text: optCVal },
            { id: 'D', text: optDVal },
          ],
          correctOptionIds,
          type: correctOptionIds.length > 1 ? 'multi-select' : 'single-choice',
        });
      }

      setParsedQuestions(tempParsedQuestions);
    };
    reader.readAsText(file);
  };

  const handleParticipantFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setParsedParticipantEmails([]);
      return;
    }

    setCsvParticipantError('');
    setParsedParticipantEmails([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
      if (lines.length < 2) {
        setCsvParticipantError('CSV is empty or missing headers');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      const emailIndex = headers.indexOf('email');
      if (emailIndex === -1) {
        setCsvParticipantError('Invalid CSV header. Expected column: email');
        return;
      }

      const tempEmails: string[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
        const email = cols[emailIndex];
        if (!email) {
          setCsvParticipantError(`Line ${i + 1} has an empty email address`);
          setParsedParticipantEmails([]);
          return;
        }
        if (!emailRegex.test(email)) {
          setCsvParticipantError(`Line ${i + 1} has an invalid email format: ${email}`);
          setParsedParticipantEmails([]);
          return;
        }
        tempEmails.push(email);
      }

      setParsedParticipantEmails(tempEmails);
    };
    reader.readAsText(file);
  };

  const handleQuestionsCsvImport = async () => {
    setCsvQuestionError('');
    if (parsedQuestions.length === 0) return;

    try {
      await addQuestionTrigger({ id: quiz.id, body: parsedQuestions }).unwrap();
      setCsvQuestionModalOpen(false);
      setParsedQuestions([]);
      refetch();
    } catch (err: any) {
      setCsvQuestionError(err?.data?.error?.message || 'Bulk import failed');
    }
  };

  const handleParticipantsCsvImport = async () => {
    setCsvParticipantError('');
    if (parsedParticipantEmails.length === 0) return;

    try {
      await addParticipantTrigger({ id: quiz.id, body: { emails: parsedParticipantEmails } }).unwrap();
      setCsvParticipantModalOpen(false);
      setParsedParticipantEmails([]);
      refetch();
    } catch (err: any) {
      setCsvParticipantError(err?.data?.error?.message || 'Bulk import failed');
    }
  };

  // Publish / Cancel actions
  const handlePublish = async () => {
    try {
      await publishQuizTrigger(quiz.id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.error?.message || 'Failed to publish quiz');
    }
  };

  const handleCancel = async () => {
    if (!understandCancelled) return;
    try {
      await cancelQuizTrigger(quiz.id).unwrap();
      setCancelModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to cancel quiz:', err);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleDate || !scheduleTime) return;
    const start = new Date(`${scheduleDate}T${scheduleTime}`);
    const end = new Date(start.getTime() + quiz.duration * 60 * 1000); // end time matches start + duration

    try {
      await updateQuizDetails({
        id: quiz.id,
        body: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      }).unwrap();
      setShowScheduleForm(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.error?.message || 'Failed to update schedule');
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Breadcrumbs & Header Actions */}
        <div className={styles.topBar}>
          <Breadcrumbs
            items={[
              user?.role === 'admin'
                ? { label: 'Dashboard', path: '/admin/dashboard' }
                : { label: 'Update Quizzes', path: '/instructor/update-quizzes' },
              { label: 'Edit Quiz' },
              { label: `#${quiz.id.substring(quiz.id.length - 4)}` },
            ]}
          />
          <div className={styles.topActions}>
            <Button
              variant="ghost"
              size="sm"
              icon="arrow-left"
              onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/instructor/update-quizzes')}
            >
              Back
            </Button>
            {isDraft && user?.role !== 'admin' && (
              <Button variant="primary" size="sm" icon="publish" disabled={!isPublishable} onClick={handlePublish}>
                Publish Quiz
              </Button>
            )}
            {(isDraft || isScheduled) && (
              <Button variant="teal" size="sm" icon="republish" onClick={() => setShowScheduleForm(true)}>
                Re-schedule
              </Button>
            )}
            {!isCompleted && !isCancelled && (
              <Button variant="danger" size="sm" icon="x-cancel" onClick={() => setCancelModalOpen(true)}>
                Cancel Quiz
              </Button>
            )}
          </div>
        </div>

        {/* State Banners */}
        <div className={styles.bannerContainer}>
          {isDraft && (
            <div className={`${styles.banner} ${isPublishable ? styles.bannerReady : styles.bannerAlert}`}>
              <Icon name={isPublishable ? 'check-verified' : 'stat-warning'} size={20} />
              <div className={styles.bannerContent}>
                {isPublishable ? (
                  <>
                    <h4 className={styles.bannerTitle}>
                      {user?.role === 'admin' ? 'Quiz is ready to be published!' : 'Quiz is ready to be scheduled!'}
                    </h4>
                    <p className={styles.bannerText}>
                      {questionsCount} questions added | {participantsCount} participants added | {user?.role === 'admin' ? 'Awaiting Instructor publication.' : 'Click Publish Quiz to schedule.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className={styles.bannerTitle}>
                      {user?.role === 'admin' ? 'This quiz cannot be published yet' : 'This quiz cannot be scheduled yet'}
                    </h4>
                    <p className={styles.bannerText}>
                      Checklist: {questionsCount >= 1 ? '✅' : '❌'} {questionsCount} questions added | {participantsCount >= 1 ? '✅' : '❌'} {participantsCount} participants added.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {isScheduled && (
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <Icon name="calendar" size={20} />
              <div className={styles.bannerContent}>
                <h4 className={styles.bannerTitle}>Quiz is scheduled for {formatDateTime(quiz.startTime)}</h4>
                <p className={styles.bannerText}>
                  Any edits made to schedule will only take effect after clicking Re-schedule.
                </p>
              </div>
            </div>
          )}

          {isLive && (
            <div className={`${styles.banner} ${styles.bannerReady}`}>
              <Icon name="status-live" size={20} />
              <div className={styles.bannerContent}>
                <h4 className={styles.bannerTitle}>Quiz is currently Live!</h4>
                <p className={styles.bannerText}>
                  Participants are currently attempting the quiz. No edits can be made.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Metadata Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryInfo}>
            <h2 className={styles.quizTitle}>{quiz.title}</h2>
            <p className={styles.quizDesc}>{quiz.description}</p>
          </div>
          <div className={styles.metadataStats}>
            <div className={styles.metaRow}>
              <Icon name="timer" size={16} />
              <span>{quiz.duration} minutes</span>
            </div>
            <div className={styles.metaRow}>
              <Icon name="calendar" size={16} />
              <span>{quiz.startTime ? formatDateTime(quiz.startTime) : 'No Schedule Set'}</span>
            </div>
            <div className={styles.metaRow}>
              <Badge status={quiz.status} />
            </div>
          </div>
        </div>

        {/* Schedule Inline Editor */}
        {showScheduleForm && (
          <div className={styles.scheduleForm}>
            <h4 className={styles.formTitle}>Edit Quiz Schedule Time</h4>
            <div className={styles.scheduleFields}>
              <Input
                label="Schedule Date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <Input
                label="Schedule Time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateSchedule}>
                Update Schedule Time
              </Button>
            </div>
          </div>
        )}


        {/* Tabs Control */}
        {user?.role !== 'admin' && (
          <>
            <div className={styles.tabHeader}>
              <button
                onClick={() => setActiveTab('questions')}
                className={`${styles.tabBtn} ${activeTab === 'questions' ? styles.activeTab : ''}`}
              >
                Questions ({questionsCount})
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`${styles.tabBtn} ${activeTab === 'participants' ? styles.activeTab : ''}`}
              >
                Participants ({participantsCount})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'questions' ? (
          <div className={styles.tabContent}>
            {/* Questions Toolbar */}
            {isDraft && (
              <div className={styles.toolbar}>
                <Button variant="secondary" size="sm" icon="csv-upload" onClick={() => setCsvQuestionModalOpen(true)}>
                  Add via CSV
                </Button>
                <Button variant="primary" size="sm" icon="plus" onClick={openAddQuestion}>
                  Add Manually
                </Button>
              </div>
            )}

            {/* Questions Listing */}
            {questionsCount === 0 ? (
              <div className={styles.tabEmptyState}>
                <Icon name="feature-questions" size={48} className={styles.tabEmptyIcon} />
                <h4>No Questions Added Yet</h4>
                <p>Click Add Manually or upload a CSV to populate quiz questions.</p>
              </div>
            ) : (
              <div className={styles.questionsList}>
                {quiz.questions.map((q: any, idx: number) => (
                  <div key={q._id || q.id} className={styles.questionCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.qNum}>Question {idx + 1}</span>
                      {isDraft && (
                        <div className={styles.cardActions}>
                          <button onClick={() => openEditQuestion(q)} className={styles.editBtn}>
                            <Icon name="edit-pencil" size={14} />
                            Edit
                          </button>
                          <button onClick={() => deleteQuestion(q._id || q.id)} className={styles.deleteBtn}>
                            <Icon name="trash" size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p className={styles.qText}>{q.text}</p>
                    <div className={styles.optionsGrid}>
                      {q.options.map((o: any) => {
                        const isCorrect = q.correctOptionIds.includes(o.id);
                        return (
                          <div
                            key={o.id}
                            className={`${styles.optionItem} ${isCorrect ? styles.correctOption : ''}`}
                          >
                            <span className={styles.optLetter}>{o.id}</span>
                            <span className={styles.optText}>{o.text}</span>
                            {isCorrect && <Icon name="check" size={14} className={styles.checkIcon} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.tabContent}>
            {/* Participants Toolbar */}
            {(isDraft || isScheduled) && (
              <div className={styles.toolbar}>
                <Button variant="secondary" size="sm" icon="csv-upload" onClick={() => setCsvParticipantModalOpen(true)}>
                  Add via CSV
                </Button>
                <Button variant="primary" size="sm" icon="plus" onClick={() => setInlineParticipantOpen(true)}>
                  Add Manually
                </Button>
              </div>
            )}

            {/* Inline Email Input Form */}
            {inlineParticipantOpen && (
              <form onSubmit={handleAddParticipant} className={styles.inlineForm}>
                <Input
                  label="Candidate Email"
                  type="email"
                  placeholder="candidate@company.com"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  required
                />
                <div className={styles.inlineFormActions}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setInlineParticipantOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Add Participant
                  </Button>
                </div>
              </form>
            )}

            {/* Roster Listing */}
            {participantsCount === 0 ? (
              <div className={styles.tabEmptyState}>
                <Icon name="feature-participants" size={48} className={styles.tabEmptyIcon} />
                <h4>No Participants Assigned Yet</h4>
                <p>Add candidate emails individually or upload a roster list CSV.</p>
              </div>
            ) : (
              <div className={styles.rosterWrapper}>
                <table className={styles.rosterTable}>
                  <thead>
                    <tr>
                      <th>PARTICIPANT USER</th>
                      <th>EMAIL ADDRESS</th>
                      <th>DATE ADDED</th>
                      {(isDraft || isScheduled) && <th>ACTION</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.participants.map((p: any) => {
                      const userObj = p.userId;
                      if (!userObj) return null;

                      return (
                        <tr key={userObj._id || userObj.id}>
                          <td className={styles.rosterUserCell}>
                            <div className={styles.avatar}>
                              {userObj.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'}
                            </div>
                            <span className={styles.rosterName}>{userObj.name}</span>
                          </td>
                          <td className={styles.rosterEmail}>{userObj.email}</td>
                          <td className={styles.rosterDate}>{formatDateTime(p.addedAt)}</td>
                          {(isDraft || isScheduled) && (
                            <td>
                              <button
                                onClick={() => removeParticipant(userObj._id || userObj.id)}
                                className={styles.removeBtn}
                              >
                                <Icon name="trash" size={14} />
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>

      {/* Reusable Question Add/Edit Manual Modal */}
      <Modal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        title={editingQuestionId ? 'Edit Question' : 'Add Question'}
        size="md"
      >
        <form onSubmit={saveQuestion} className={styles.modalForm}>
          <Input
            label="Question Text"
            textarea
            placeholder="Enter your question here..."
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            required
          />

          <div className={styles.qTypeWrapper}>
            <label className={styles.fieldLabel}>Question Type</label>
            <select
              value={qType}
              onChange={(e) => {
                const type = e.target.value as any;
                setQType(type);
                if (type === 'true/false') {
                  setOptionA('True');
                  setOptionB('False');
                } else {
                  setOptionA('');
                  setOptionB('');
                }
              }}
              className={styles.selectType}
            >
              <option value="single-choice">Single Select</option>
              <option value="multi-select">Multi Select</option>
              <option value="true/false">True / False</option>
            </select>
          </div>

          {qType !== 'true/false' ? (
            <div className={styles.optionsFields}>
              <Input label="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
              <Input label="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
              <Input label="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
              <Input label="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} />
            </div>
          ) : (
            <div className={styles.optionsFields}>
              <Input label="Option A" value={optionA} disabled />
              <Input label="Option B" value={optionB} disabled />
            </div>
          )}

          <div className={styles.correctSelection}>
            <label className={styles.fieldLabel}>Correct Answer(s)</label>
            <div className={styles.checkboxesGroup}>
              {['A', 'B', 'C', 'D'].map((letter) => {
                // If true/false mode, only show A & B
                if (qType === 'true/false' && (letter === 'C' || letter === 'D')) return null;
                
                const isSelected = correctOptions.includes(letter);
                return (
                  <label key={letter} className={styles.checkboxLabel}>
                    <input
                      type={qType === 'single-choice' || qType === 'true/false' ? 'radio' : 'checkbox'}
                      name="correct-option"
                      checked={isSelected}
                      onChange={(e) => {
                        if (qType === 'single-choice' || qType === 'true/false') {
                          setCorrectOptions([letter]);
                        } else {
                          if (e.target.checked) {
                            setCorrectOptions([...correctOptions, letter]);
                          } else {
                            setCorrectOptions(correctOptions.filter((o) => o !== letter));
                          }
                        }
                      }}
                    />
                    <span>Option {letter}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingQuestionId ? 'Save Changes' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Question Upload Modal */}
      <Modal
        isOpen={csvQuestionModalOpen}
        onClose={() => {
          setCsvQuestionModalOpen(false);
          setCsvQuestionError('');
          setParsedQuestions([]);
        }}
        title="Upload Questions via CSV"
        size="md"
      >
        <div className={styles.modalForm}>
          <p className={styles.csvInstructions}>
            <strong>Required CSV format:</strong> One row per question with options A/B/C/D and correct answer(s) separated by semicolons.<br />
            <code>Question,OptionA,OptionB,OptionC,OptionD,Correct</code>
          </p>

          <div className={styles.fileInputWrapper} style={{ marginBottom: '16px' }}>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleQuestionFileChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          {csvQuestionError && <span className={styles.errorMessage} style={{ color: '#E24B4A', display: 'block', marginBottom: '16px', fontSize: '14px' }}>{csvQuestionError}</span>}
          {parsedQuestions.length > 0 && (
            <span className={styles.successMessage} style={{ color: '#1D9E75', display: 'block', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
              ✓ Ready to import {parsedQuestions.length} questions.
            </span>
          )}

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => {
              setCsvQuestionModalOpen(false);
              setCsvQuestionError('');
              setParsedQuestions([]);
            }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={parsedQuestions.length === 0 || !!csvQuestionError}
              onClick={handleQuestionsCsvImport}
            >
              Import Questions
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Participant Upload Modal */}
      <Modal
        isOpen={csvParticipantModalOpen}
        onClose={() => {
          setCsvParticipantModalOpen(false);
          setCsvParticipantError('');
          setParsedParticipantEmails([]);
        }}
        title="Upload Participants via CSV"
        size="md"
      >
        <div className={styles.modalForm}>
          <p className={styles.csvInstructions}>
            <strong>Required CSV format:</strong> Header row must contain <code>email</code>. One row per candidate email.<br />
            <code>email&#10;candidate1@company.com&#10;candidate2@company.com</code>
          </p>

          <div className={styles.fileInputWrapper} style={{ marginBottom: '16px' }}>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleParticipantFileChange}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          {csvParticipantError && <span className={styles.errorMessage} style={{ color: '#E24B4A', display: 'block', marginBottom: '16px', fontSize: '14px' }}>{csvParticipantError}</span>}
          {parsedParticipantEmails.length > 0 && (
            <span className={styles.successMessage} style={{ color: '#1D9E75', display: 'block', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
              ✓ Ready to import {parsedParticipantEmails.length} participants.
            </span>
          )}

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => {
              setCsvParticipantModalOpen(false);
              setCsvParticipantError('');
              setParsedParticipantEmails([]);
            }}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={parsedParticipantEmails.length === 0 || !!csvParticipantError}
              onClick={handleParticipantsCsvImport}
            >
              Import Participants
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Quiz Confirmation Modal */}
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
              <p className={styles.alertTitle}>Cancel quiz {quiz.title}?</p>
              <p className={styles.alertText}>This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <div className={styles.modalInfoList}>
            <div className={styles.infoRow}>
              <Icon name="x-cancel" size={16} className={styles.dangerIcon} />
              <span>Status permanently changes to <strong>Cancelled</strong></span>
            </div>
            <div className={styles.infoRow}>
              <Icon name="x-cancel" size={16} className={styles.dangerIcon} />
              <span>Quiz becomes read-only and no submissions allowed</span>
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
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              No, Keep Quiz
            </Button>
            <Button
              variant="danger"
              disabled={!understandCancelled}
              onClick={handleCancel}
            >
              Yes, Cancel Quiz
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
export default EditQuizDetails;
