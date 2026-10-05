import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ArrowUpDown, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Database, 
  Download, 
  Eye, 
  Filter, 
  Flame, 
  LogOut, 
  Medal, 
  Play, 
  RefreshCw, 
  RotateCcw, 
  Search, 
  Settings, 
  Shield, 
  Sliders, 
  StopCircle, 
  Trash2, 
  Trophy, 
  UserCheck, 
  Users, 
  XCircle 
} from 'lucide-react';
import { 
  fetchAdminStats, 
  fetchAdminRankings, 
  fetchAdminParticipants, 
  fetchAdminAnalytics, 
  updateAdminSettings, 
  resetActiveAttemptsApi, 
  clearAllDataApi, 
  downloadResultsCsv,
  deleteParticipantApi
} from '../services/api';
import ParticipantDetailModal from '../components/ParticipantDetailModal';

export default function AdminDashboardPage({ token, admin, onLogout }) {
  const [activeTab, setActiveTab] = useState('rankings'); // 'rankings' | 'participants' | 'analytics' | 'controls'
  const [statsData, setStatsData] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ departments: [], colleges: [], years: [] });
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal & Actions State
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Confirmation Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });

  // Load all dashboard data
  const loadDashboardData = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [statsRes, rankingsRes, participantsRes, analyticsRes] = await Promise.all([
        fetchAdminStats(token),
        fetchAdminRankings(token, {
          search: searchQuery,
          department: selectedDept,
          college: selectedCollege,
          year: selectedYear
        }),
        fetchAdminParticipants(token, {
          search: searchQuery,
          department: selectedDept,
          college: selectedCollege,
          year: selectedYear,
          status: selectedStatus
        }),
        fetchAdminAnalytics(token)
      ]);

      setStatsData(statsRes);
      setRankings(rankingsRes.rankings || []);
      setParticipants(participantsRes.participants || []);
      if (participantsRes.filterOptions) {
        setFilterOptions(participantsRes.filterOptions);
      }
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to sync dashboard data.' });
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  };

  // Initial load and filter change trigger
  useEffect(() => {
    loadDashboardData();
  }, [searchQuery, selectedDept, selectedCollege, selectedYear, selectedStatus]);

  // Live Auto-Refresh every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [searchQuery, selectedDept, selectedCollege, selectedYear, selectedStatus]);

  // Handlers for settings updates
  const handleToggleRegistration = async () => {
    if (!statsData) return;
    const current = statsData.settings.registrationOpen;
    try {
      await updateAdminSettings(token, { registrationOpen: !current });
      setActionMessage({ type: 'success', text: `Registration is now ${!current ? 'OPEN' : 'CLOSED'}.` });
      loadDashboardData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleToggleQuizLive = async () => {
    if (!statsData) return;
    const current = statsData.settings.quizLive;
    try {
      await updateAdminSettings(token, { quizLive: !current });
      setActionMessage({ type: 'success', text: `Quiz competition is now ${!current ? 'LIVE' : 'STOPPED'}.` });
      loadDashboardData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleDurationChange = async (newDuration) => {
    try {
      await updateAdminSettings(token, { durationMinutes: newDuration });
      setActionMessage({ type: 'success', text: `Quiz duration set to ${newDuration} minutes.` });
      loadDashboardData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleResetActiveAttempts = () => {
    setConfirmModal({
      open: true,
      title: 'Reset Active Incomplete Attempts?',
      message: 'This will mark all currently in-progress attempts as abandoned. Completed quiz scores will NOT be affected.',
      action: async () => {
        try {
          const res = await resetActiveAttemptsApi(token);
          setActionMessage({ type: 'success', text: res.message });
          loadDashboardData();
        } catch (err) {
          setActionMessage({ type: 'error', text: err.message });
        }
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmModal({
      open: true,
      title: 'DANGER: Clear All Participant & Quiz Data?',
      message: 'This will permanently DELETE all participant registrations, attempts, answers, and scores from the database. This action CANNOT be undone.',
      action: async () => {
        try {
          const res = await clearAllDataApi(token);
          setActionMessage({ type: 'success', text: res.message });
          loadDashboardData();
        } catch (err) {
          setActionMessage({ type: 'error', text: err.message });
        }
      }
    });
  };

  const handleDeleteParticipant = (participantId, participantName) => {
    setConfirmModal({
      open: true,
      title: `Delete Participant: ${participantName}?`,
      message: `Are you sure you want to delete "${participantName}" and all associated quiz attempt data? This will remove them from the Leaderboard and Participants list permanently.`,
      action: async () => {
        try {
          const res = await deleteParticipantApi(token, participantId);
          setActionMessage({ type: 'success', text: res.message || `Deleted participant "${participantName}".` });
          loadDashboardData();
        } catch (err) {
          setActionMessage({ type: 'error', text: err.message || 'Failed to delete participant.' });
        }
      }
    });
  };

  const handleExportCsv = async () => {
    try {
      await downloadResultsCsv(token);
      setActionMessage({ type: 'success', text: 'Official Results CSV downloaded successfully.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to download CSV.' });
    }
  };

  const stats = statsData?.stats;
  const settings = statsData?.settings;

  return (
    <div className="min-h-[calc(100vh-6.5rem)] pb-12 pt-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 luxury-bg transition-colors duration-300">
      
      {/* Top Banner: Status & Live Controls */}
      <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg transition-colors">
        
        {/* Left Title & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-lg sm:text-2xl font-bold text-emerald-950 dark:text-white font-heading tracking-wide">
              ADMIN CONTROL PANEL
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-mono font-bold">
              XENORAZZ 2K26
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${settings?.registrationOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              Registration: <strong className={settings?.registrationOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {settings?.registrationOpen ? 'OPEN' : 'CLOSED'}
              </strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${settings?.quizLive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              Quiz Engine: <strong className={settings?.quizLive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {settings?.quizLive ? 'LIVE' : 'STOPPED'}
              </strong>
            </span>
            <span>•</span>
            <span>Duration: <strong className="text-emerald-800 dark:text-emerald-300">{settings?.durationMinutes || 15} Min</strong></span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white border border-slate-300 dark:border-emerald-800 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-bold">Sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="py-2 px-3.5 sm:py-2 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold border border-emerald-500/40 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-all flex items-center gap-1 text-xs font-mono font-bold cursor-pointer shadow-xs"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div className={`p-3.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-between border ${
          actionMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage({ type: '', text: '' })} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Overview Metric Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        
        <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-1.5">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 dark:text-white font-heading">{stats?.totalParticipants ?? 0}</p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">Participants</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-[#082218] border border-emerald-300 dark:border-emerald-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 text-xs font-mono mb-1.5">
            <span>Completed</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 font-heading">{stats?.totalCompleted ?? 0}</p>
          <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">Submitted</p>
        </div>

        <div className="bg-teal-50/70 dark:bg-[#06241a] border border-teal-300 dark:border-teal-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-teal-800 dark:text-teal-400 text-xs font-mono mb-1.5">
            <span>Active Live</span>
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-teal-900 dark:text-teal-300 font-heading">{stats?.totalActive ?? 0}</p>
          <p className="text-[11px] font-mono text-teal-700 dark:text-teal-400 mt-1">In Progress</p>
        </div>

        <div className="bg-amber-50/70 dark:bg-[#201806] border border-amber-300 dark:border-amber-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-mono mb-1.5">
            <span>Highest Score</span>
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-950 dark:text-amber-300 font-heading">{stats?.highestScore ?? 0} <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">/ 25</span></p>
          <p className="text-[11px] font-mono text-amber-800 dark:text-amber-400 mt-1">Top Performer</p>
        </div>

        <div className="bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 text-xs font-mono mb-1.5">
            <span>Average Score</span>
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-300 font-heading">{stats?.averageScore ?? 0} <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">/ 25</span></p>
          <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 mt-1">Competition Avg</p>
        </div>

        <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-1.5">
            <span>Avg Duration</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-200 font-heading">{stats?.formattedAverageTime ?? '00:00'}</p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">MM:SS</p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'rankings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-950 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Final Rankings ({rankings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'participants'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-950 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-950 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-2xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-950 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Controls</span>
        </button>
      </div>

      {/* Global Filter Bar (for Rankings & Participants) */}
      {(activeTab === 'rankings' || activeTab === 'participants') && (
        <div className="bg-white dark:bg-[#061912] rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participant or college..."
              className="w-full pl-9 pr-3 py-2 rounded-xl input-elegant text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl input-elegant text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="All">All Departments</option>
              {filterOptions.departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* College Filter */}
          <div>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-3 py-2 rounded-xl input-elegant text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="All">All Colleges</option>
              {filterOptions.colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Year / Status Filter */}
          {activeTab === 'rankings' ? (
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl input-elegant text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value="All">All Years</option>
                {filterOptions.years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl input-elegant text-xs font-mono text-slate-900 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="invalidated">Invalidated</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
          )}

        </div>
      )}

      {/* TAB 1: FINAL RANKINGS LEADERBOARD */}
      {activeTab === 'rankings' && (
        <div className="bg-white dark:bg-[#061912] rounded-3xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-lg">
          
          <div className="p-4 sm:p-5 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-[#082218] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-heading font-bold text-base sm:text-lg text-emerald-950 dark:text-white">
                Live Leaderboard (Ranked: Score Descending & Fastest Time)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Total Ranked: <strong className="text-emerald-700 dark:text-emerald-400">{rankings.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-[#082218]/80 text-[11px] font-mono text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">Rank</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Dept / Year</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Time Taken</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/60 text-xs font-mono">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-600 dark:text-slate-400 font-mono">
                      No completed submissions match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  rankings.map((r) => {
                    const isTop1 = r.rank === 1;
                    const isTop2 = r.rank === 2;
                    const isTop3 = r.rank === 3;

                    return (
                      <tr
                        key={r.attemptId}
                        className={`hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 transition-colors ${
                          isTop1
                            ? 'bg-amber-50/60 dark:bg-amber-950/20'
                            : isTop2
                            ? 'bg-slate-100/40 dark:bg-slate-800/20'
                            : isTop3
                            ? 'bg-orange-50/40 dark:bg-orange-950/20'
                            : ''
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/30">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-extrabold text-xs shadow-md shadow-slate-300/30">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-700/30">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-400 font-bold">#{r.rank}</span>
                          )}
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-950 dark:text-white font-bold text-sm block font-sans">
                            {r.name}
                          </span>
                        </td>

                        {/* College */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          {r.college}
                        </td>

                        {/* Dept / Year */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {r.department} <span className="text-slate-500 dark:text-slate-500">({r.year})</span>
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-sm border border-emerald-300 dark:border-emerald-800">
                            {r.scoreDisplay}
                          </span>
                        </td>

                        {/* Accuracy */}
                        <td className="py-3.5 px-4 text-center text-slate-800 dark:text-slate-300 font-bold">
                          {r.percentage}%
                        </td>

                        {/* Time Taken */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{r.formattedTimeTaken}</span>
                          </span>
                        </td>

                        {/* Action Audit & Delete */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedParticipantId(r.participantId)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                              title="View Question Audit Breakdown"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(r.participantId, r.name)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                              title={`Delete ${r.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: ALL PARTICIPANTS */}
      {activeTab === 'participants' && (
        <div className="bg-white dark:bg-[#061912] rounded-3xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-lg">
          <div className="p-4 sm:p-5 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-[#082218] flex items-center justify-between">
            <h2 className="font-heading font-bold text-base sm:text-lg text-emerald-950 dark:text-white">
              Participant Registry & Attempt Status
            </h2>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Total Records: <strong className="text-emerald-700 dark:text-emerald-400">{participants.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-[#082218]/80 text-[11px] font-mono text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Time Taken</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/60 text-xs font-mono">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-600 dark:text-slate-400">
                      No participants registered yet.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => {
                    const isCompleted = p.status === 'completed';
                    const isInProgress = p.status === 'in_progress';
                    const isInvalidated = p.status === 'invalidated' || p.status === 'abandoned';

                    return (
                      <tr key={p.participantId} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-bold text-emerald-950 dark:text-white">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {p.college}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {p.department} ({p.year})
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold">
                              COMPLETED
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-[10px] font-bold animate-pulse">
                              ACTIVE QUIZ
                            </span>
                          )}
                          {isInvalidated && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold">
                              {p.status.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-800 dark:text-emerald-300">
                          {p.scoreDisplay}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                          {p.formattedTimeTaken}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedParticipantId(p.participantId)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                              title="Inspect participant responses"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.participantId, p.name)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                              title={`Delete ${p.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & QUESTION INSIGHTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          
          {/* Top Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Score Distribution */}
            <div className="lg:col-span-6 bg-white dark:bg-[#061912] rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-white font-heading uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Score Distribution (Completed Submissions)</span>
              </h3>

              <div className="space-y-3 pt-2">
                {Object.entries(analytics.distribution).map(([bucket, count]) => {
                  const percent = analytics.totalCompleted > 0
                    ? Math.round((count / analytics.totalCompleted) * 100)
                    : 0;

                  return (
                    <div key={bucket} className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>Score: {bucket} {bucket === '25' ? '(Perfect Score)' : 'Marks'}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-emerald-100/70 dark:bg-[#082218] h-2.5 rounded-full overflow-hidden border border-emerald-200 dark:border-emerald-900">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="lg:col-span-6 bg-white dark:bg-[#061912] rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-white font-heading uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Department Participation & Average Score</span>
              </h3>

              <div className="space-y-3 pt-2 max-h-64 overflow-y-auto pr-1">
                {analytics.departmentStats.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono py-8 text-center">No participant data recorded yet.</p>
                ) : (
                  analytics.departmentStats.map((d) => (
                    <div key={d.department} className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs font-mono">
                      <div className="max-w-[240px] truncate">
                        <span className="font-bold text-emerald-950 dark:text-white block truncate">{d.department}</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">{d.total_participants} participants ({d.completed_count} completed)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-600 dark:text-slate-400 block">Avg Score</span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{d.avg_score}/25</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Question-wise Performance Breakdown */}
          <div className="bg-white dark:bg-[#061912] rounded-3xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 shadow-lg space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-white font-heading">
                  Question-Wise Performance & Difficulty Matrix
                </h3>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  Total 25 questions evaluated for accuracy and difficulty
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Easy (&gt;80%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (50-80%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard (&lt;50%)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-[#082218]/80 text-[11px] font-mono text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                    <th className="py-3 px-3 w-14">Q#</th>
                    <th className="py-3 px-3">Question & Category</th>
                    <th className="py-3 px-3 text-center">Correct Answer</th>
                    <th className="py-3 px-3 text-center">Attempts</th>
                    <th className="py-3 px-3 text-center">Correct</th>
                    <th className="py-3 px-3 text-center">Wrong</th>
                    <th className="py-3 px-3 text-center">Accuracy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/60 text-xs font-mono">
                  {analytics.questionAnalytics.map((q) => {
                    const acc = q.correctPercentage;
                    const isHard = q.totalAttempts > 0 && acc < 50;
                    const isMedium = q.totalAttempts > 0 && acc >= 50 && acc <= 80;
                    const isEasy = q.totalAttempts > 0 && acc > 80;

                    return (
                      <tr key={q.questionId} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20">
                        <td className="py-3 px-3 font-bold text-emerald-950 dark:text-white">
                          Q{String(q.questionNumber).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] font-bold block">[{q.category}]</span>
                          <span className="text-slate-800 dark:text-slate-200 font-sans font-medium line-clamp-1">{q.question}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                            Option {q.correctAnswer}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                          {q.totalAttempts}
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-700 dark:text-emerald-400 font-bold">
                          {q.correctCount}
                        </td>
                        <td className="py-3 px-3 text-center text-rose-600 dark:text-rose-400 font-bold">
                          {q.wrongCount}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            isEasy
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : isMedium
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : isHard
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {q.totalAttempts > 0 ? `${acc}%` : '0%'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: COMPETITION CONTROLS & SETTINGS */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Quiz Engine Configuration */}
          <div className="bg-white dark:bg-[#061912] rounded-3xl p-5 sm:p-6 border border-emerald-200 dark:border-emerald-800 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-emerald-950 dark:text-white font-heading flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Quiz Engine Controls</span>
            </h3>

            {/* Toggle Registration */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-emerald-950 dark:text-white block">Participant Registration</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Allow participants to register for quiz</span>
              </div>
              <button
                onClick={handleToggleRegistration}
                className={`py-2 px-4 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  settings?.registrationOpen
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900'
                }`}
              >
                {settings?.registrationOpen ? 'OPEN (CLICK TO CLOSE)' : 'CLOSED (CLICK TO OPEN)'}
              </button>
            </div>

            {/* Toggle Quiz Live */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-emerald-950 dark:text-white block">Competition Status</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Control active quiz access</span>
              </div>
              <button
                onClick={handleToggleQuizLive}
                className={`py-2 px-4 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  settings?.quizLive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {settings?.quizLive ? 'LIVE (CLICK TO PAUSE)' : 'PAUSED (CLICK TO GO LIVE)'}
              </button>
            </div>

            {/* Quiz Duration Selector */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-950 dark:text-white">Quiz Duration</span>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  Current: {settings?.durationMinutes || 15} Minutes
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[10, 15, 20, 25, 30, 45, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      settings?.durationMinutes === dur
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Maintenance Operations */}
          <div className="bg-white dark:bg-[#061912] rounded-3xl p-5 sm:p-6 border border-rose-200 dark:border-rose-900/50 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 font-heading flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Event Maintenance & Reset</span>
            </h3>

            {/* Reset Active Incomplete Attempts */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#082218] border border-slate-200 dark:border-emerald-900 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Reset Active Attempts</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Marks hung or abandoned attempts as expired
                  </span>
                </div>
                <button
                  onClick={handleResetActiveAttempts}
                  className="py-2 px-3.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Active</span>
                </button>
              </div>
            </div>

            {/* Clear All Participant Data */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div>
                <span className="text-sm font-bold text-rose-900 dark:text-rose-200 block">Clear All Test / Competition Data</span>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-mono">
                  Purges all participant records, answers, and scores. Questions and admin accounts will be preserved.
                </span>
              </div>
              <button
                onClick={handleClearAllData}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>PURGE ALL PARTICIPANT RECORDS</span>
              </button>
            </div>

            {/* Direct Export Results */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#082218] border border-slate-200 dark:border-emerald-900 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Export Competition Results</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  Download CSV file with ranks, scores, & timestamps
                </span>
              </div>
              <button
                onClick={handleExportCsv}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Audit Modal */}
      {selectedParticipantId && (
        <ParticipantDetailModal
          participantId={selectedParticipantId}
          token={token}
          onClose={() => setSelectedParticipantId(null)}
        />
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#061912] border border-rose-300 dark:border-rose-800 max-w-md w-full p-6 rounded-3xl space-y-4 shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {confirmModal.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmModal({ open: false, title: '', message: '', action: null })}
                className="py-2.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.action) confirmModal.action();
                  setConfirmModal({ open: false, title: '', message: '', action: null });
                }}
                className="py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
