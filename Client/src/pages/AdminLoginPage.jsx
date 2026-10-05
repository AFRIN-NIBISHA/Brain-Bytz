import React, { useState } from 'react';
import { KeyRound, Lock, Shield, Sparkles, Terminal, User } from 'lucide-react';
import { adminLoginApi } from '../services/api';

export default function AdminLoginPage({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await adminLoginApi({ username, password });
      onLoginSuccess(data.token, data.admin);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex items-center justify-center p-4 sm:p-6 luxury-bg transition-colors duration-300 animate-fade-in">
      
      <div className="w-full max-w-md animate-scale-in">
        
        <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-7 sm:p-10 space-y-6 shadow-2xl relative transition-colors">
          
          {/* Top Admin Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#061912] p-2 mx-auto border border-emerald-200 dark:border-emerald-800 shadow-md shadow-emerald-600/15 flex items-center justify-center">
              <img src="/logo.png" alt="DMI Foundations" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-2xl font-bold text-emerald-950 dark:text-white font-heading tracking-tight">
              ADMIN ACCESS
            </h1>
            <p className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400">
              DMI Engineering College • XENORAZZ 2K26
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-mono font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-emerald-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-elegant text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-emerald-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl input-elegant text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl font-heading font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>AUTHENTICATE & ENTER</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl text-xs font-mono text-emerald-900/70 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors cursor-pointer"
              >
                ← Back to Participant Portal
              </button>
            </div>

          </form>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-900/80 dark:text-emerald-400 text-center">
            Default credentials: <span className="text-emerald-700 dark:text-emerald-300 font-bold">admin</span> / <span className="text-emerald-700 dark:text-emerald-300 font-bold">admin123</span>
          </div>

        </div>

      </div>

    </div>
  );
}
