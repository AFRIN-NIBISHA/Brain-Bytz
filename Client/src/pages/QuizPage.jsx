import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Clock, 
  HelpCircle, 
  Send, 
  ShieldAlert, 
  Terminal 
} from 'lucide-react';

export default function QuizPage({
  questions,
  durationMinutes = 15,
  attemptId,
  participant,
  onSubmitQuiz,
  onInvalidateAttempt,
  submitting
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: 'A'|'B'|'C'|'D' }
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timerRef = useRef(null);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Format Timer MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timer Countdown and Automatic Quit & Submit on 00:00
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Anti-Cheat & Strict Instant Logout on Leaving/Tab Switch Rule
  useEffect(() => {
    const handleLeaveOrTabSwitch = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
        onInvalidateAttempt();
      }
    };

    const handleWindowBlur = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      onInvalidateAttempt();
    };

    const handleBeforeUnload = (e) => {
      if (timerRef.current) clearInterval(timerRef.current);
      onInvalidateAttempt();
      e.preventDefault();
      e.returnValue = '';
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleLeaveOrTabSwitch);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleLeaveOrTabSwitch);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onInvalidateAttempt]);

  // Keyboard shortcut listener (1,2,3,4 or A,B,C,D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentQuestion) return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleOptionSelect(key);
      } else if (key === '1') handleOptionSelect('A');
      else if (key === '2') handleOptionSelect('B');
      else if (key === '3') handleOptionSelect('C');
      else if (key === '4') handleOptionSelect('D');
      else if (e.key === 'Enter' && selectedAnswers[currentQuestion.id]) {
        if (currentIndex === totalQuestions - 1) {
          setShowSubmitModal(true);
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, selectedAnswers, currentIndex, totalQuestions]);

  const handleOptionSelect = (optionKey) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  const handleNextQuestion = () => {
    if (!selectedAnswers[currentQuestion.id]) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = (isAuto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const answersPayload = Object.entries(selectedAnswers).map(([qId, ans]) => ({
      questionId: Number(qId),
      selectedAnswer: ans
    }));

    onSubmitQuiz(answersPayload, isAuto);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-emerald-900 dark:text-emerald-300 text-sm font-medium">Preparing Competition Environment...</p>
        </div>
      </div>
    );
  }

  const currentSelection = selectedAnswers[currentQuestion.id];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isLowTime = secondsRemaining <= 180; // less than 3 minutes

  const optionKeys = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-[calc(100vh-6.5rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-between luxury-bg transition-colors duration-200">
      
      {/* Top Bar Header */}
      <div className="space-y-4 mb-6 animate-fade-in">
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
              QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
            <span className="hidden sm:inline text-xs font-mono text-slate-600 dark:text-slate-300 font-medium">
              Category: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{currentQuestion.category}</span>
            </span>
          </div>

          {/* Time Left Badge */}
          <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-xs ${
            isLowTime 
              ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse' 
              : 'bg-white dark:bg-[#061912] border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-xs'
          }`}>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>TIME LEFT: {formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-emerald-100/70 dark:bg-[#071d15] h-2.5 rounded-full overflow-hidden border border-emerald-200 dark:border-emerald-900/80">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Step Dots (Desktop only) */}
        <div className="hidden sm:flex items-center justify-between gap-1 pt-0.5">
          {questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={q.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? 'bg-emerald-600 dark:bg-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-800'
                    : isAnswered
                    ? 'bg-emerald-400 dark:bg-emerald-600'
                    : 'bg-slate-200 dark:bg-[#0c2b20]'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>

      </div>

      {/* Main Question Card */}
      <div 
        key={currentIndex} 
        className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative animate-scale-in transition-colors"
      >
        
        {/* Question Title */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Optional Code Snippet with Header */}
          {currentQuestion.codeSnippet && (
            <div className="rounded-2xl bg-[#06130d] border border-emerald-900/80 p-4 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto shadow-md relative group">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950 text-[11px] text-emerald-400/80">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-bold text-emerald-300 pl-2">
                    Code Snippet ({currentQuestion.category})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500 font-mono">Protected View</span>
              </div>
              <pre className="text-emerald-50 leading-relaxed font-mono">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Four Options */}
        <div className="space-y-3 pt-1">
          {optionKeys.map((key) => {
            const optionText = currentQuestion.options[key];
            const isSelected = currentSelection === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleOptionSelect(key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer group select-none shadow-xs ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-600 dark:border-emerald-400 shadow-md shadow-emerald-600/10 text-emerald-950 dark:text-white font-bold'
                    : 'bg-slate-50/80 dark:bg-[#082218]/70 hover:bg-emerald-50/40 dark:hover:bg-[#0b2d20] border-slate-200 dark:border-emerald-900/60 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {/* Option Letter Badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900'
                }`}>
                  {key}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm sm:text-base font-sans font-medium leading-snug">
                  {optionText}
                </div>

                {/* Checkmark Indicator */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-600 dark:bg-emerald-400 text-white'
                    : 'border-slate-300 dark:border-emerald-900 opacity-0 group-hover:opacity-40'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-emerald-950 dark:text-emerald-300 font-medium">
          {currentSelection ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Option {currentSelection} selected</span>
          ) : (
            <span className="text-slate-600 dark:text-slate-400">Select an option to proceed</span>
          )}
        </div>

        <div>
          {isLastQuestion ? (
            <button
              type="button"
              disabled={!currentSelection || submitting}
              onClick={() => setShowSubmitModal(true)}
              className="py-3.5 px-8 rounded-xl font-heading font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>SUBMITTING...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT QUIZ</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={!currentSelection}
              onClick={handleNextQuestion}
              className="py-3.5 px-8 rounded-xl font-heading font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer group"
            >
              <span>NEXT QUESTION</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-6 sm:p-8 rounded-3xl space-y-5 text-center shadow-2xl animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-emerald-950 dark:text-white font-heading">
                Submit Quiz Responses?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You have reached Question 25. Once submitted, your answers will be locked and securely evaluated on the server.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 dark:bg-[#082218] rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-slate-200 font-mono text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Questions:</span>
                <span className="font-bold text-emerald-950 dark:text-white">25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Participant:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{participant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Time Remaining:</span>
                <span className="font-bold text-emerald-950 dark:text-white">{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="py-3 px-4 rounded-xl font-medium text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-emerald-950 hover:bg-slate-200 dark:hover:bg-emerald-900 border border-slate-300 dark:border-emerald-800 transition-all cursor-pointer"
              >
                RETURN
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={submitting}
                className="py-3 px-4 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? 'RECORDING...' : 'CONFIRM SUBMIT'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
