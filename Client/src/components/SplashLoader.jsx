import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export default function SplashLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to evaluation engine...');
  const [fadeAway, setFadeAway] = useState(false);

  useEffect(() => {
    const steps = [
      { p: 25, text: 'Establishing secure backend connection...' },
      { p: 55, text: 'Loading 25 questions across Python, C, C++, Java...' },
      { p: 85, text: 'Initializing real-time anti-cheat monitor...' },
      { p: 100, text: 'System ready! Welcome to BRAIN BYTZ.' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatusText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => setFadeAway(true), 300);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 800);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#021d15] via-[#052e23] to-[#041a14] text-white transition-opacity duration-700 select-none ${
      fadeAway ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
    }`}>
      
      {/* Background ambient glowing orb */}
      <div className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      
      <div className="relative max-w-md w-full px-6 text-center space-y-6 animate-scale-in">
        
        {/* Animated College Logo Core */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/25 animate-ping opacity-60" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-600 opacity-75 blur-sm animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-2xl bg-[#031c15] border border-emerald-400/60 p-3 shadow-2xl flex items-center justify-center">
            <img src="/logo.png" alt="DMI Foundations" className="w-full h-full object-contain drop-shadow-md animate-float" />
          </div>
        </div>

        {/* Symposium & Event Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>DMI ENGINEERING COLLEGE • XENORAZZ 2K26</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider font-heading text-white">
            BRAIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">BYTZ</span>
          </h1>

          <p className="text-xs font-mono text-emerald-200/80 tracking-widest uppercase">
            Python • C • C++ • Java
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-emerald-950/90 h-2 rounded-full overflow-hidden border border-emerald-800/80 shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 h-full transition-all duration-300 rounded-full shadow-md shadow-emerald-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-emerald-200/70">
            <span className="truncate max-w-[240px] text-emerald-300 text-left">{statusText}</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
        </div>

      </div>

    </div>
  );
}
