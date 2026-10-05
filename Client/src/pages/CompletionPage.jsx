import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  CheckCircle2, 
  Cpu, 
  GraduationCap, 
  Home, 
  Layers, 
  School, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  User 
} from 'lucide-react';

export default function CompletionPage({ participant, onReturnHome }) {
  
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#0284c7', '#f59e0b']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 luxury-bg transition-colors duration-300 animate-fade-in">
      
      <div className="w-full max-w-xl animate-scale-in">
        
        <div className="bg-white dark:bg-[#061912] border border-emerald-200 dark:border-emerald-800 rounded-3xl p-7 sm:p-10 text-center space-y-6 shadow-2xl relative transition-colors">
          
          {/* Symposium Subtitle */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 tracking-wider uppercase block">
              DMI ENGINEERING COLLEGE • CSE DEPARTMENT
            </span>
            <span className="text-xs font-heading font-extrabold text-emerald-950 dark:text-emerald-300 tracking-wide">
              XENORAZZ 2K26 NATIONAL LEVEL TECHNICAL SYMPOSIUM
            </span>
          </div>

          {/* Animated Success Badge with Official Logo */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-200 dark:bg-emerald-900/50 animate-ping opacity-75" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 p-[3px] shadow-lg shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-[#06130d] rounded-full p-2 flex items-center justify-center">
                <img src="/logo.png" alt="DMI Foundations" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>OFFICIAL SUBMISSION CONFIRMED</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-emerald-950 dark:text-white">
              QUIZ COMPLETED
            </h1>

            <p className="text-sm font-sans text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you for participating in <span className="font-bold text-emerald-800 dark:text-emerald-400 font-heading">BRAIN BYTZ</span> at <strong className="text-emerald-950 dark:text-emerald-200">XENORAZZ 2K26</strong>. 
              Your responses have been recorded successfully.
            </p>
          </div>

          {/* Participant Verification Card */}
          {participant && (
            <div className="rounded-2xl bg-emerald-50/60 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 p-4 sm:p-5 text-left space-y-3 font-mono text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-400/80 border-b border-emerald-200 dark:border-emerald-800 pb-2 flex items-center justify-between">
                <span>Recorded Participant Details</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Logged In System</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Name:</span>
                  <span className="text-emerald-950 dark:text-white font-bold text-sm">{participant.name}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">College:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{participant.college}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Department:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{participant.department}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Year:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{participant.year}</span>
                </div>
              </div>
            </div>
          )}

          {/* Organizing Committee Note */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="text-emerald-900 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Results & Overall Cup Announcement</span>
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Official rankings and winner announcements for BRAIN BYTZ will be declared on the main auditorium stage during the valedictory function.
            </p>
          </div>

          {/* Exit / Return Action */}
          <div>
            <button
              type="button"
              onClick={onReturnHome}
              className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>RETURN TO EVENT PORTAL</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
