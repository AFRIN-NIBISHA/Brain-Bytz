import React, { useState } from 'react';
import { 
  ArrowRight, 
  Building2, 
  Clock, 
  Layers, 
  Lock, 
  School, 
  Sparkles, 
  Timer, 
  User 
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Computer Science & Business Systems (CSBS)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Master of Computer Applications (MCA)',
  'Other / Interdisciplinary'
];

const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

export default function RegistrationPage({ config, onStartQuiz, loading, error }) {
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    department: '',
    year: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!formData.college.trim()) {
      setValidationError('Please enter your college name.');
      return;
    }
    if (!formData.department) {
      setValidationError('Please select your department.');
      return;
    }
    if (!formData.year) {
      setValidationError('Please select your year of study.');
      return;
    }

    onStartQuiz(formData);
  };

  const isRegistrationOpen = config ? config.registrationOpen : true;
  const isQuizLive = config ? config.quizLive : true;
  const quizDuration = config?.durationMinutes || 15;

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 luxury-bg transition-colors duration-200 animate-fade-in">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Event & Symposium Showcase */}
        <div className="lg:col-span-6 space-y-5 text-left animate-fade-in-up">
          
          {/* Institutional Header Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800/80 shadow-xs flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 p-1 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="DMI Foundations Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="text-emerald-950 dark:text-emerald-300 font-bold text-xs tracking-wide truncate">
                DMI ENGINEERING COLLEGE
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                Aralvaimozhi, Kanyakumari District • Ph: 04652-262744
              </p>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Department of Computer Science & Engineering
              </div>
            </div>
          </div>

          {/* Event Title and Symposium Tag */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>XENORAZZ 2K26 • NATIONAL LEVEL SYMPOSIUM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-emerald-950 dark:text-white leading-none">
              BRAIN <span className="text-emerald-600 dark:text-emerald-400">BYTZ</span>
            </h1>

            {/* Language Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold">
                Python
              </span>
              <span className="px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-xs font-mono font-bold">
                C Language
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold">
                C++
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-mono font-bold">
                Java
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
              Welcome to the official technical quiz challenge at <strong className="text-emerald-900 dark:text-emerald-300">XENORAZZ 2K26</strong>. Solve 25 core programming questions testing your foundational logic, memory pointers, OOP paradigms, and runtime execution.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 shadow-xs flex items-center gap-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Competition Size</p>
                <p className="text-lg font-bold text-emerald-950 dark:text-white font-heading">25 Questions</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 shadow-xs flex items-center gap-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Time Limit</p>
                <p className="text-lg font-bold text-emerald-950 dark:text-emerald-300 font-heading">
                  {quizDuration} Minutes
                </p>
              </div>
            </div>
          </div>

          {/* Competition Rules Pill */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2 text-xs text-slate-700 dark:text-slate-300 transition-colors">
            <div className="flex items-center gap-2 text-emerald-950 dark:text-white font-bold uppercase tracking-wider font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Strict Competition Directives</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
              <li>Automatic submission occurs immediately upon timer expiration.</li>
              <li>Questions are solved one by one. Skipping is disabled.</li>
              <li><strong className="text-rose-700 dark:text-rose-400">Leaving the quiz window or switching tabs immediately terminates and invalidates the session.</strong></li>
            </ul>
          </div>

        </div>

        {/* Right Column: High-End Registration Card */}
        <div className="lg:col-span-6 animate-scale-in">
          <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-7 sm:p-9 relative shadow-xl transition-colors">
            
            {/* Header */}
            <div className="mb-6 space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold tracking-wide border border-emerald-300 dark:border-emerald-800">
                  PARTICIPANT REGISTRATION
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{quizDuration} MINS</span>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-emerald-950 dark:text-white font-heading pt-2">
                Participant Registration
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fill in your details below to initialize your {quizDuration}-minute quiz session
              </p>
            </div>

            {/* Error Notification */}
            {(error || validationError) && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium leading-relaxed animate-fade-in">
                {error || validationError}
              </div>
            )}

            {/* Inactive / Closed Notice */}
            {(!isRegistrationOpen || !isQuizLive) && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium">
                ⚠️ Registration or quiz is currently paused by the coordinators.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-emerald-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Arun Kumar"
                    disabled={loading || !isRegistrationOpen || !isQuizLive}
                    className="w-full pl-10 pr-4 py-3 rounded-xl input-elegant text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* College Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                  College / Institution <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-emerald-500">
                    <School className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. DMI Engineering College"
                    disabled={loading || !isRegistrationOpen || !isQuizLive}
                    className="w-full pl-10 pr-4 py-3 rounded-xl input-elegant text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Department & Year Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Department */}
                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                    Department <span className="text-emerald-600 dark:text-emerald-400">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={loading || !isRegistrationOpen || !isQuizLive}
                    className="w-full px-3.5 py-3 rounded-xl input-elegant text-sm font-medium text-slate-900 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                    Year of Study <span className="text-emerald-600 dark:text-emerald-400">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={loading || !isRegistrationOpen || !isQuizLive}
                    className="w-full px-3.5 py-3 rounded-xl input-elegant text-sm font-medium text-slate-900 dark:text-white"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Start Quiz Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading || !isRegistrationOpen || !isQuizLive}
                  className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2 font-mono text-sm">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      PREPARING QUIZ ENGINE...
                    </span>
                  ) : (
                    <>
                      <span>START QUIZ ({quizDuration} MINS)</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="mt-5 text-center">
              <p className="text-[11px] font-mono text-emerald-900/80 dark:text-emerald-400 flex items-center justify-center gap-1 font-medium">
                🔒 <span>Protected Competition Session • Zero Answer Exposure</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
