import React, { useState } from 'react';
import { Icons, Button, Input, cn } from '../components/Shared';
import { saveUser, getUser } from '../services/data';

// Custom visualizations for specific slides
const VizRivals = () => (
  <div className="flex justify-center gap-4 items-end h-24 mb-2">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-16 bg-emerald-500/20 rounded-t-lg border border-emerald-500/50 relative overflow-hidden">
        <div className="absolute bottom-0 w-full h-[60%] bg-emerald-500/40 animate-pulse"></div>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Plan</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-24 bg-amber-500/20 rounded-t-lg border border-amber-500/50 relative overflow-hidden">
        <div className="absolute bottom-0 w-full h-[80%] bg-amber-500/40 animate-[pulse_1.5s_infinite]"></div>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Ambitious</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-20 bg-slate-500/20 rounded-t-lg border border-slate-500/50 relative overflow-hidden">
        <div className="absolute bottom-0 w-full h-[40%] bg-slate-500/40 animate-[pulse_2s_infinite]"></div>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Shadow</span>
    </div>
  </div>
);

const VizShadow = () => (
  <div className="relative w-full max-w-[200px] h-24 flex items-center justify-center mx-auto">
    <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
    <Icons.ghost className="w-16 h-16 text-slate-300 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
    <div className="absolute -right-4 top-0 bg-red-500/20 border border-red-500/40 text-red-200 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold animate-bounce">
      Adapting...
    </div>
  </div>
);

const VizStages = () => (
  <div className="flex items-center justify-center gap-2 mb-2">
    {[1, 2, 3].map((s) => (
      <div key={s} className="flex flex-col items-center">
        <div className="w-px h-8 bg-slate-700 mb-2 border-l border-dashed border-slate-500/50"></div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border shadow-[0_0_10px_rgba(0,0,0,0.5)]",
          s === 1 ? "bg-amber-500/20 border-amber-500 text-amber-400" :
          s === 2 ? "bg-slate-300/20 border-slate-300 text-slate-300" :
          "bg-orange-700/20 border-orange-700 text-orange-600"
        )}>
          <Icons.award className="w-4 h-4" />
        </div>
      </div>
    ))}
  </div>
);

const slides = [
  {
    id: 'intro',
    title: "Protocol Initiated",
    desc: "Welcome to the Race. This isn't just a habit tracker. It's a competitive arena where your only opponent is yourself.",
    icon: Icons.flag,
    color: "from-brand-500/20 to-blue-600/20"
  },
  {
    id: 'mechanic',
    title: "Time is Distance",
    desc: "Set a goal (e.g., 'Read 50 hours'). Every minute you log pushes you forward on the track. Stop logging, and you fall behind.",
    icon: Icons.timer,
    color: "from-blue-500/20 to-indigo-600/20"
  },
  {
    id: 'rivals',
    title: "Meet Your Rivals",
    desc: "You race against AI versions of yourself: 'The Plan' (steady pace) and 'Ambitious You' (120% pace). Can you beat them?",
    customViz: <VizRivals />,
    color: "from-amber-500/10 to-orange-600/10"
  },
  {
    id: 'shadow',
    title: "Beware The Shadow",
    desc: "The Shadow mimics your worst habits. If you skip days, it learns. It accelerates. It waits for you to fail. Don't let it win.",
    customViz: <VizShadow />,
    color: "from-slate-800 to-red-900/40"
  },
  {
    id: 'stages',
    title: "Stages & Glory",
    desc: "Long races are broken into weekly or monthly Stages. Win medals (Gold, Silver, Bronze) for each stage based on your rank.",
    customViz: <VizStages />,
    color: "from-purple-500/20 to-pink-600/20"
  },
  {
    id: 'rewards',
    title: "Real World Loot",
    desc: "Use your hard-earned medals to buy custom rewards you define. Sweat equity for real-life treats.",
    icon: Icons.trophy,
    color: "from-yellow-500/20 to-amber-600/20"
  }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const handleNext = () => {
    if (step < slides.length) {
      setStep(step + 1);
    } else {
      const u = getUser();
      u.name = name || 'Racer';
      u.onboardingCompleted = true;
      saveUser(u);
      window.location.hash = '/';
      onComplete();
    }
  };

  // Render Name Input Screen
  if (step === slides.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 bg-background text-white max-w-md mx-auto relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,_var(--tw-gradient-stops))] from-brand-900/40 via-background to-background pointer-events-none" />
        
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-900/80 rounded-[2rem] flex items-center justify-center mb-8 text-brand-400 shadow-[0_0_40px_rgba(45,212,191,0.2)] border border-brand-500/30 animate-in zoom-in duration-500">
             <Icons.user className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-center">Identify Yourself</h1>
          <p className="text-slate-500 text-center mb-10 text-sm">Enter your callsign for the leaderboards.</p>
          
          <div className="w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <Input 
              autoFocus
              placeholder="Racer Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="relative text-center text-xl font-bold h-16 bg-slate-950 border-slate-800 focus:bg-slate-900"
            />
          </div>
          
          <div className="h-12"></div>

          <Button onClick={handleNext} className="w-full h-14 text-lg shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)]" disabled={!name.trim()}>
            Initialize System
          </Button>
        </div>
      </div>
    );
  }

  const Slide = slides[step];
  const Icon = Slide.icon;

  return (
    <div className="h-screen flex flex-col bg-background text-white max-w-md mx-auto relative overflow-hidden transition-colors duration-1000">
      
      {/* Dynamic Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br transition-all duration-700 ease-in-out pointer-events-none opacity-40",
        Slide.color
      )} />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 bg-[length:100%_4px,6px_100%] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
        
        {/* Visual/Icon Container */}
        <div key={step} className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
          {Slide.customViz ? (
             Slide.customViz
          ) : (
            <div className="w-32 h-32 bg-slate-900/60 backdrop-blur-sm rounded-[2rem] flex items-center justify-center text-slate-200 shadow-2xl border border-white/10 relative">
               <div className="absolute inset-0 bg-white/5 rounded-[2rem] animate-pulse"></div>
               {Icon && <Icon className="w-14 h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />}
            </div>
          )}
        </div>

        <div key={`text-${step}`} className="animate-in fade-in zoom-in-95 duration-500 delay-150">
          <h1 className="text-3xl font-black mb-4 tracking-tighter uppercase drop-shadow-lg">{Slide.title}</h1>
          <p className="text-base text-slate-300 leading-relaxed font-medium max-w-[280px] mx-auto">
            {Slide.desc}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-12 w-full flex flex-col gap-8 relative z-10">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === step ? "w-8 bg-white shadow-[0_0_10px_white]" : "w-2 bg-slate-800"
              )} 
            />
          ))}
          {/* Final Dot for Input */}
          <div className="w-2 h-1.5 rounded-full bg-slate-800" /> 
        </div>
        
        <Button onClick={handleNext} className="w-full h-14 text-lg bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md">
          {step === slides.length - 1 ? "Get Started" : "Continue"}
        </Button>
      </div>
    </div>
  );
}