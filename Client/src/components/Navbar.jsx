import React from 'react';
import { 
  Building2, 
  Clock, 
  Moon, 
  Shield, 
  Sparkles, 
  Sun, 
  Terminal 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ currentView, onNavigate, participant, timerDisplay, isLowTime }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#050d0a]/95 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 transition-colors shadow-xs">
      
      {/* Top Institutional Header Ribbon */}
      <div className="bg-[#064e3b] dark:bg-[#031c15] text-white py-1.5 px-3 sm:px-8 text-xs flex items-center justify-between font-sans border-b border-emerald-900/60">
        <div className="flex items-center gap-2 truncate">
          <img src="/logo.png" alt="DMI Logo" className="w-4 h-4 object-contain shrink-0" />
          <span className="font-semibold tracking-wide text-emerald-50 hidden sm:inline truncate">
            DMI ENGINEERING COLLEGE, ARALVAIMOZHI
          </span>
          <span className="text-emerald-400/60 hidden sm:inline">•</span>
          <span className="text-emerald-200 font-medium truncate">
            Department of Computer Science & Engineering
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/70 text-[11px] font-mono text-amber-300 font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>XENORAZZ 2K26</span>
          </div>
          <span className="text-emerald-200/80 text-[11px] font-mono hidden md:inline">
            07 OCT 2026
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Event Identification */}
        <div 
          onClick={() => {
            if (currentView !== 'quiz') {
              onNavigate('register');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Official DMI College Logo */}
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/80 dark:bg-emerald-950/80 p-1 border border-emerald-200 dark:border-emerald-800 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <img src="/logo.png" alt="DMI Foundations Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-emerald-950 dark:text-white">
                BRAIN <span className="text-emerald-600 dark:text-emerald-400">BYTZ</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase tracking-wide">
                LIVE
              </span>
            </div>
            <p className="text-[11px] font-mono font-medium text-emerald-800/80 dark:text-emerald-400/80">
              Python • C • C++ • Java
            </p>
          </div>
        </div>

        {/* Center / Timer during Quiz */}
        {currentView === 'quiz' && timerDisplay && (
          <div className="flex items-center animate-scale-in">
            <div className={`px-3 sm:px-4 py-1.5 rounded-xl border flex items-center gap-2 transition-all shadow-xs ${
              isLowTime 
                ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse' 
                : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isLowTime ? 'bg-rose-500 animate-ping' : 'bg-emerald-600 dark:bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 hidden xs:inline">
                TIME LEFT:
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-emerald-950 dark:text-white">
                {timerDisplay}
              </span>
            </div>
          </div>
        )}

        {/* Right Actions, Theme Toggle & Admin Link */}
        <div className="flex items-center gap-2.5">
          
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {currentView !== 'quiz' && (
            <>
              {currentView === 'admin' ? (
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-emerald-950 hover:bg-emerald-50 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 transition-all cursor-pointer shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Participant Portal</span>
                  <span className="sm:hidden">Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 transition-all shadow-xs cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Admin Access</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </>
          )}

          {currentView === 'quiz' && participant && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-emerald-900 dark:text-emerald-300">
              <span className="text-emerald-950 dark:text-white font-bold truncate max-w-[130px]">{participant.name}</span>
              <span className="text-emerald-500 font-bold">•</span>
              <span className="text-emerald-700 dark:text-emerald-400">{participant.department}</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
