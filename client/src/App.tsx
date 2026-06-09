// filename: client/src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMeQuery } from './services/authApi';
import { setCredentials, clearCredentials } from './store/authSlice';
import type { RootState } from './store/store';

// Pages
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AccessManagement from './pages/AccessManagement/AccessManagement';
import AdminCreateQuiz from './pages/AdminCreateQuiz/AdminCreateQuiz';
import InstructorDashboard from './pages/InstructorDashboard/InstructorDashboard';
import UpdateQuizzes from './pages/UpdateQuizzes/UpdateQuizzes';
import EditQuizDetails from './pages/EditQuizDetails/EditQuizDetails';
import CandidateDashboard from './pages/CandidateDashboard/CandidateDashboard';
import UpcomingQuizzes from './pages/CandidateDashboard/UpcomingQuizzes';
import QuizAttemptScreen from './pages/QuizAttemptScreen/QuizAttemptScreen';
import ResultsViewPage from './pages/ResultsViewPage/ResultsViewPage';
import InstructorAnalytics from './pages/InstructorAnalytics/InstructorAnalytics';

// Guards
import ProtectedRoute from './components/atoms/ProtectedRoute/ProtectedRoute';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { data: meData, error, isLoading } = useMeQuery();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Restore credentials on mount/successful fetch
  useEffect(() => {
    if (meData?.user) {
      dispatch(setCredentials({ user: meData.user }));
    } else if (error) {
      dispatch(clearCredentials());
    }
  }, [meData, error, dispatch]);

  // Loading indicator for session restoration
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        color: '#534AB7',
        backgroundColor: 'var(--page-bg, #f8f9fc)'
      }}>
        <span style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(83, 74, 183, 0.1)',
          borderRadius: '50%',
          borderTopColor: '#534AB7',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ fontWeight: 600 }}>Connecting to QuizArena...</span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // Helper route to redirect root '/' based on role
  const RootRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-quiz"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/access-management"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AccessManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit-quiz/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditQuizDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/results/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ResultsViewPage />
          </ProtectedRoute>
        }
      />

      {/* Instructor Protected Routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/update-quizzes"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <UpdateQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/edit-quiz/:id"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <EditQuizDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/results/:id"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <ResultsViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/analytics"
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Candidate/Participant Protected Routes */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={['participant']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/upcoming"
        element={
          <ProtectedRoute allowedRoles={['participant']}>
            <UpcomingQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/quiz-attempt/:id"
        element={
          <ProtectedRoute allowedRoles={['participant']}>
            <QuizAttemptScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/results/:id"
        element={
          <ProtectedRoute allowedRoles={['participant']}>
            <ResultsViewPage />
          </ProtectedRoute>
        }
      />

      {/* Root Catch & Redirects */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
