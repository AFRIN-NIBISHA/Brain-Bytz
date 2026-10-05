import React, { useEffect, useState } from 'react';
import { 
  Check, 
  Clock, 
  ExternalLink, 
  GraduationCap, 
  HelpCircle, 
  School, 
  Trophy, 
  User, 
  X 
} from 'lucide-react';
import { fetchParticipantDetails } from '../services/api';

export default function ParticipantDetailModal({ participantId, token, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchParticipantDetails(token, participantId);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    }
    if (participantId) load();
  }, [participantId, token]);

  if (!participantId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-in">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-emerald-100 dark:border-emerald-800/80 flex items-center justify-between bg-emerald-50/60 dark:bg-[#082218]">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-white font-heading">
                Participant Evaluation Audit
              </h2>
              {data?.attempt?.rank && (
                <span className="px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>RANK #{data.attempt.rank}</span>
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
              XENORAZZ 2K26 • 25-Question Submission Breakdown (Admin Only)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-200 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-emerald-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">Loading audit records...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm rounded-2xl">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Participant Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Participant:</span>
                  <span className="text-emerald-950 dark:text-white font-bold text-sm">{data.participant.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">College:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{data.participant.college}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Department & Year:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{data.participant.department} ({data.participant.year})</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Final Score:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    {data.attempt ? `${data.attempt.score}/25 (${data.attempt.percentage}%)` : 'Not Completed'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Correct / Wrong:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{data.attempt?.correct_count ?? 0}</span> / <span className="text-rose-600 dark:text-rose-400 font-bold">{data.attempt?.wrong_count ?? 0}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Time Taken:</span>
                  <span className="text-emerald-950 dark:text-white font-bold">{data.attempt?.formattedTimeTaken || '-'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block">Submitted At:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {data.attempt?.submitted_at ? new Date(data.attempt.submitted_at).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : '-'}
                  </span>
                </div>
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-950 dark:text-slate-200 font-heading tracking-wide uppercase">
                  All 25 Question Responses
                </h3>

                <div className="space-y-3">
                  {data.answersBreakdown.map((item) => {
                    return (
                      <div
                        key={item.questionNumber}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                            : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200">
                              Q{String(item.questionNumber).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                              [{item.category}]
                            </span>
                          </div>

                          <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                            item.isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                          }`}>
                            {item.isCorrect ? '✓ CORRECT' : '✗ WRONG'}
                          </div>
                        </div>

                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                          {item.question}
                        </p>

                        {item.codeSnippet && (
                          <pre className="p-3 mb-3 rounded-xl bg-[#06130d] text-xs font-mono text-emerald-300 overflow-x-auto">
                            <code>{item.codeSnippet}</code>
                          </pre>
                        )}

                        {/* Options Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-900">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#061912] border border-slate-200 dark:border-emerald-900">
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Participant Selected:</span>
                            <span className={`font-bold ${item.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                              Option {item.selectedAnswer}: {item.options[item.selectedAnswer] || 'None'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                            <span className="text-emerald-900/60 dark:text-slate-400 block text-[10px]">Official Correct Answer:</span>
                            <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                              Option {item.correctAnswer}: {item.options[item.correctAnswer]}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-100 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-[#082218] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl font-mono text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
}
