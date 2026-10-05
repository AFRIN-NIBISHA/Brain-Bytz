import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SplashLoader from './components/SplashLoader';
import RegistrationPage from './pages/RegistrationPage';
import QuizPage from './pages/QuizPage';
import CompletionPage from './pages/CompletionPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { ThemeProvider } from './context/ThemeContext';
import { 
  fetchQuizConfig, 
  fetchQuestions, 
  startQuizAttempt, 
  invalidateQuizAttempt, 
  submitQuizAnswers 
} from './services/api';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('register'); // 'register' | 'quiz' | 'completed' | 'admin-login' | 'admin'
  const [quizConfig, setQuizConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Participant & Attempt State (In-Memory only, strict competition rule: no recovery from localStorage)
  const [participant, setParticipant] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptToken, setAttemptToken] = useState(null);
  
  // Admin State
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('bb_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('bb_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Initial Quiz Configuration
  const loadConfig = useCallback(async () => {
    try {
      const config = await fetchQuizConfig();
      setQuizConfig(config);
    } catch (err) {
      console.error('Failed to load quiz config:', err);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Start Quiz Handler (Registration -> Quiz)
  const handleStartQuiz = async (formData) => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Fetch public questions (no answers exposed)
      const qRes = await fetchQuestions();
      if (!qRes.questions || qRes.questions.length === 0) {
        throw new Error('No questions available for this competition.');
      }
      setQuestions(qRes.questions);

      // 2. Initialize Attempt on Backend
      const startRes = await startQuizAttempt(formData);
      setParticipant(startRes.participant);
      setAttemptId(startRes.attemptId);
      setAttemptToken(startRes.attemptToken);

      // 3. Switch to Quiz view
      setCurrentView('quiz');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Invalidate Attempt Handler (participant left session / tab switched / minimized)
  const handleInvalidateAttempt = useCallback(() => {
    if (attemptId && attemptToken) {
      invalidateQuizAttempt(attemptId, attemptToken);
    }
    // Wipe participant quiz state completely
    setAttemptId(null);
    setAttemptToken(null);
    setParticipant(null);
    setQuestions([]);
    setErrorMessage('⚠️ Session Terminated: You switched away from the active quiz tab. According to competition rules, your attempt was immediately invalidated and logged out. Please register again to start fresh from Question 1.');
    setCurrentView('register');
  }, [attemptId, attemptToken]);

  // Submit Quiz Handler (handles normal and timer expiration auto submit)
  const handleSubmitQuiz = async (answers, isAuto = false) => {
    if (!attemptId || !attemptToken) return;

    setSubmitting(true);
    try {
      await submitQuizAnswers(attemptId, attemptToken, answers);
      
      // Successfully submitted -> Show completion view
      setCurrentView('completed');
    } catch (err) {
      console.error('Submission failed:', err);
      // Transition cleanly to completion screen
      setCurrentView('completed');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = (token, admin) => {
    setAdminToken(token);
    setAdminUser(admin);
    sessionStorage.setItem('bb_admin_token', token);
    sessionStorage.setItem('bb_admin_user', JSON.stringify(admin));
    setCurrentView('admin');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    sessionStorage.removeItem('bb_admin_token');
    sessionStorage.removeItem('bb_admin_user');
    setCurrentView('register');
  };

  // Return to Home / Event Portal after Completion
  const handleReturnHome = () => {
    setParticipant(null);
    setAttemptId(null);
    setAttemptToken(null);
    setQuestions([]);
    setCurrentView('register');
    loadConfig();
  };

  const quizDuration = quizConfig?.durationMinutes || 20;

  return (
    <div className="min-h-screen bg-[#f4fbf7] dark:bg-[#050d0a] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
      {/* Intro High-Tech Splash Animation */}
      {showSplash && (
        <SplashLoader onComplete={() => setShowSplash(false)} />
      )}

      {/* Global Top Navbar with Theme Switcher */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin-login') {
            if (adminToken) {
              setCurrentView('admin');
            } else {
              setCurrentView('admin-login');
            }
          } else {
            setCurrentView(view);
          }
        }}
        participant={participant}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'register' && (
          <RegistrationPage
            config={quizConfig}
            onStartQuiz={handleStartQuiz}
            loading={loading}
            error={errorMessage}
          />
        )}

        {currentView === 'quiz' && (
          <QuizPage
            questions={questions}
            durationMinutes={quizDuration}
            attemptId={attemptId}
            participant={participant}
            onSubmitQuiz={handleSubmitQuiz}
            onInvalidateAttempt={handleInvalidateAttempt}
            submitting={submitting}
          />
        )}

        {currentView === 'completed' && (
          <CompletionPage
            participant={participant}
            onReturnHome={handleReturnHome}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={handleAdminLogin}
            onCancel={() => setCurrentView('register')}
          />
        )}

        {currentView === 'admin' && adminToken && (
          <AdminDashboardPage
            token={adminToken}
            admin={adminUser}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-100 dark:border-emerald-900/60 bg-white/95 dark:bg-[#050d0a]/95 py-4 px-4 sm:px-6 text-center text-xs font-mono text-emerald-950/80 dark:text-emerald-400/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 <strong>XENORAZZ 2K26</strong> • Department of CSE • DMI Engineering College, Aralvaimozhi
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
            BRAIN BYTZ • {quizDuration} Mins Live Evaluation Engine
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
