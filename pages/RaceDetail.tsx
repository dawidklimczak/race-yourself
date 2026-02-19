import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRaces, getLogs, getRaceProgress, getUser, addLog, formatDuration, updateRace, awardMedalsIfNeeded, getActiveTimer, startTimer, stopTimer } from '../services/data';
import { Icons, Button, Input, Card, cn } from '../components/Shared';
import { Race, TimeLog } from '../types';

const RunnerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className={className} fill="currentColor">
    <path d="M520-40v-240l-84-80-40 176-276-56 16-80 192 40 64-324-72 28v136h-80v-188l158-68q35-15 51.5-19.5T480-720q21 0 39 11t29 29l40 64q26 42 70.5 69T760-520v80q-66 0-123.5-27.5T540-540l-24 120 84 80v300h-80Zm-36.5-723.5Q460-787 460-820t23.5-56.5Q507-900 540-900t56.5 23.5Q620-853 620-820t-23.5 56.5Q573-740 540-740t-56.5-23.5Z"/>
  </svg>
);

const ProVisualizer = ({ progress, race }: { progress: any, race: Race }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const goalHours = progress.goalHours;
  
  // Logic: Max 20 hours visible on one screen width.
  const HOURS_PER_SCREEN = 20;
  
  const maxRunnerHours = Math.max(...progress.runners.map((r: any) => r.hours));
  const totalTrackHours = Math.max(goalHours, maxRunnerHours * 1.1); 

  // Calculate container width percentage
  const widthPercent = Math.max(100, (totalTrackHours / HOURS_PER_SCREEN) * 100);
  const isScrollable = totalTrackHours > HOURS_PER_SCREEN;

  // Layout Constants
  const LEFT_GUTTER_PX = 112; // left-28
  const RIGHT_GUTTER_PX = 32; // right-8

  // Auto-scroll to User's position on mount
  useLayoutEffect(() => {
    if (scrollContainerRef.current && isScrollable) {
      const user = progress.runners.find((r: any) => r.id === 'user');
      if (user) {
        const userPercent = user.hours / totalTrackHours;
        const containerWidth = scrollContainerRef.current.scrollWidth;
        const viewportWidth = scrollContainerRef.current.clientWidth;
        
        const timelineWidth = containerWidth - LEFT_GUTTER_PX - RIGHT_GUTTER_PX;
        const userPx = LEFT_GUTTER_PX + (timelineWidth * userPercent);

        const scrollTarget = userPx - (viewportWidth / 2);
        scrollContainerRef.current.scrollLeft = scrollTarget;
      }
    }
  }, [totalTrackHours, isScrollable]);

  // --- RULER: HOURS (TOP) ---
  const generateHourTicks = () => {
    const ticks = [];
    let majorInterval = 5; 
    if (totalTrackHours <= 20) majorInterval = 1;
    if (totalTrackHours > 120) majorInterval = 10;
    if (totalTrackHours > 500) majorInterval = 50;

    const minorInterval = majorInterval === 1 ? 0.5 : (majorInterval / 5);
    const numberOfTicks = Math.floor(totalTrackHours / minorInterval);

    for (let i = 0; i <= numberOfTicks; i++) {
      const val = i * minorInterval;
      const pct = (val / totalTrackHours) * 100;
      const isMajor = Math.abs(val % majorInterval) < 0.001;

      ticks.push(
        <div key={`h-${i}`} className="absolute top-0 w-px pointer-events-none h-full" style={{ left: `${pct}%` }}>
           {/* Top Label (Hours) */}
           {isMajor && (
             <span className="absolute top-2 -translate-x-1/2 text-[10px] font-mono text-brand-400 font-bold tabular-nums z-20 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">
               {val}h
             </span>
           )}
           {/* Top Tick */}
           <div className={cn("absolute top-0 w-px transition-all z-10", isMajor ? "h-3 bg-brand-500/40" : "h-1.5 bg-brand-500/10")} />
           
           {/* Subtle Grid Line for Hours */}
           {isMajor && (
             <div className="absolute top-8 bottom-8 w-px bg-brand-500/[0.03] -z-10" />
           )}
        </div>
      );
    }
    return ticks;
  };

  // --- RULER: DATES (BOTTOM) ---
  const generateDateTicks = () => {
    const ticks = [];
    const totalDays = progress.totalDays;
    const startDate = new Date(race.startDate);
    
    // Interval Logic
    const isWeekly = race.stageInterval === 'weekly';
    const isMonthly = race.stageInterval === 'monthly';

    // Determine Interval for Dates to avoid crowding
    let dayInterval = 1;
    if (totalDays > 14) dayInterval = 7;
    if (totalDays > 60) dayInterval = 30;

    for (let d = 0; d <= totalDays; d++) {
      // Logic: Map the Date to the "Plan" Hours.
      const idealHoursAtDate = (d / totalDays) * goalHours;
      const pct = (idealHoursAtDate / totalTrackHours) * 100;
      
      const currentDate = new Date(startDate.getTime() + d * (24 * 60 * 60 * 1000));
      const dateLabel = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      // Determine if this day is a Stage Boundary
      let stageLabel = null;
      let isStageBoundary = false;

      if (d > 0 && d < totalDays) {
        if (isWeekly && d % 7 === 0) {
           isStageBoundary = true;
           stageLabel = `STAGE ${d/7}`;
        } else if (isMonthly && d % 30 === 0) {
           isStageBoundary = true;
           stageLabel = `STAGE ${d/30}`;
        }
      }

      // Show tick if it's the regular interval OR a stage boundary OR start/end
      const isMajor = d % dayInterval === 0 || d === totalDays || isStageBoundary; 
      const isStartOrEnd = d === 0 || d === totalDays;

      if (isMajor) {
        ticks.push(
          <div key={`d-${d}`} className="absolute bottom-0 top-0 w-px pointer-events-none" style={{ left: `${pct}%` }}>
             
             {/* Stage Label (Above Date) */}
             {stageLabel && (
                <div className="absolute bottom-7 -translate-x-1/2 bg-slate-900/90 border border-brand-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold text-brand-400 uppercase tracking-wider z-20 whitespace-nowrap backdrop-blur-md shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                  {stageLabel}
                </div>
             )}

             {/* Bottom Label (Date) */}
             <span className={cn(
                "absolute bottom-2 -translate-x-1/2 text-[9px] font-mono font-medium tabular-nums z-20 whitespace-nowrap",
                isStartOrEnd ? "text-slate-200 font-bold" : "text-slate-500"
              )}>
               {dateLabel}
             </span>
             
             {/* Bottom Tick */}
             <div className={cn("absolute bottom-0 w-px h-3 z-10", isStageBoundary ? "bg-brand-500/50" : "bg-slate-500/40")} />

             {/* Vertical Stage Line (Full Height) */}
             <div className={cn(
               "absolute top-8 bottom-8 w-px -z-10", 
               isStartOrEnd ? "bg-white/10" : "bg-slate-500/10 border-l border-dashed border-slate-700/30",
               isStageBoundary && "border-brand-500/20 bg-brand-500/5"
             )} />
          </div>
        );
      }
    }
    return ticks;
  };

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width; 
    
    const containerWidth = scrollContainerRef.current.scrollWidth;
    const viewportWidth = scrollContainerRef.current.clientWidth;
    
    const timelineWidth = containerWidth - LEFT_GUTTER_PX - RIGHT_GUTTER_PX;
    const targetPx = LEFT_GUTTER_PX + (timelineWidth * pct);
    
    const scrollTarget = targetPx - (viewportWidth / 2);
    scrollContainerRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  };

  return (
    <div className="-mx-6 bg-slate-950/60 relative flex flex-col h-auto mb-8 border-y border-white/5 backdrop-blur-sm shadow-inner">
      
      {/* Scrollable Area */}
      <div 
        ref={scrollContainerRef}
        className={cn("relative w-full overflow-x-auto overflow-y-hidden no-scrollbar", isScrollable ? "cursor-grab active:cursor-grabbing" : "")}
      >
        <div style={{ width: `${widthPercent}%` }} className="relative min-h-[140px]">
          
          {/* Main Content Wrapper */}
          <div className="relative ml-28 mr-8 h-full">

            {/* 1. LAYOUT LAYER: RULERS */}
            <div className="absolute inset-0 pointer-events-none">
              {generateHourTicks()}
              {generateDateTicks()}
              
              {/* Goal Line (Gold) */}
              <div 
                  className="absolute top-0 bottom-0 w-px bg-yellow-500/20 z-0"
                  style={{ left: `${(goalHours / totalTrackHours) * 100}%` }} 
              >
                  <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center">
                    <div className="bg-slate-950 border border-yellow-500/30 p-1.5 rounded-b-lg mb-1 z-20 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                      <Icons.flag className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="h-full w-px border-r border-dashed border-yellow-500/50"></div>
                  </div>
                  {/* Bottom Goal Label */}
                   <span className="absolute bottom-8 -translate-x-1/2 text-[9px] font-bold text-yellow-500/80 uppercase tracking-wider bg-slate-950/80 px-1 rounded">
                     Goal
                   </span>
              </div>
            </div>

            {/* 2. LAYOUT LAYER: TRACKS */}
            <div className="relative z-10 pt-16 pb-12 space-y-3">
              {progress.runners.map((runner: any) => {
                const isUser = runner.id === 'user';
                const screenPercent = Math.min(100, (runner.hours / totalTrackHours) * 100);
                
                return (
                  <div key={runner.id} className={cn("h-6 relative flex items-center group", runner.color)}>
                    {/* Lane Guide */}
                    <div className="absolute left-0 right-0 h-px bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors" />
                    
                    {/* Progress Bar (Trail) */}
                    <div 
                      className={cn(
                        "absolute top-1/2 -mt-[1px] left-0 transition-all duration-1000 rounded-r-full",
                        isUser 
                          ? "h-[2px] bg-brand-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] opacity-100 z-10" 
                          : "h-[1px] bg-current opacity-60 shadow-[0_0_5px_currentColor] z-0"
                      )}
                      style={{ width: `${screenPercent}%` }}
                    />

                    {/* Runner Marker */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-20"
                      style={{ left: `${screenPercent}%` }}
                    >
                      {/* Label (Name) */}
                      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 flex flex-col items-end whitespace-nowrap pr-1 pointer-events-none">
                        <span className={cn(
                          "text-[9px] font-bold leading-none px-1.5 py-0.5 rounded transition-transform origin-right backdrop-blur-md border",
                          isUser 
                            ? "scale-110 text-brand-300 border-brand-500/40 bg-slate-950/80 shadow-[0_0_10px_rgba(45,212,191,0.2)]" 
                            : "scale-90 border-transparent bg-transparent group-hover:bg-slate-950/60 group-hover:border-white/10"
                        )}>
                           <span className={isUser ? "" : runner.color}>{runner.name}</span>
                        </span>
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        "relative -ml-3 flex items-center justify-center transition-transform",
                        isUser 
                          ? "scale-125 z-30 drop-shadow-[0_0_8px_rgba(45,212,191,0.9)] text-brand-300" 
                          : cn("scale-90 z-20 opacity-90 drop-shadow-[0_0_5px_currentColor]", runner.color)
                      )}>
                        <RunnerIcon className={cn(isUser ? "w-6 h-6 animate-pulse-slow" : "w-5 h-5")} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Mini Map */}
      {isScrollable && (
        <div className="px-6 pb-4 pt-0 animate-in fade-in slide-in-from-top-2">
           <div 
              className="h-1.5 w-full bg-slate-900 rounded-full relative cursor-pointer hover:bg-slate-800 transition-colors group overflow-hidden border border-white/5"
              onClick={handleMiniMapClick}
           >
              {/* Dots */}
              {progress.runners.map((runner: any) => {
                 const pct = Math.min(100, (runner.hours / totalTrackHours) * 100);
                 const isUser = runner.id === 'user';
                 // Convert text color to bg color
                 const bgClass = runner.color.replace('text-', 'bg-');
                 
                 return (
                   <div 
                     key={runner.id}
                     className={cn(
                       "absolute top-0 bottom-0 w-1 transition-all duration-1000 rounded-full",
                       isUser 
                        ? "bg-brand-400 z-10 w-2 shadow-[0_0_10px_theme(colors.brand.500)]" 
                        : cn(bgClass, "opacity-100 z-0")
                     )}
                     style={{ left: `${pct}%` }}
                   />
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );
};

export default function RaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { openLog?: boolean, startTimer?: boolean } | undefined;

  const [race, setRace] = useState<Race | null>(null);
  const [user, setUser] = useState(getUser());
  const [progress, setProgress] = useState<any>(null);
  
  // Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMinutes, setLogMinutes] = useState('');
  
  // Timer State (driven by global)
  const [activeTimerStart, setActiveTimerStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const loadData = () => {
    const races = getRaces();
    const r = races.find(r => r.id === id);
    if (r) {
      setRace(r);
      const l = getLogs().filter(lg => lg.raceId === r.id);
      setProgress(getRaceProgress(r, l, user.settings));
      const medal = awardMedalsIfNeeded(r, l, user.settings);
      if (medal) alert(`You earned a ${medal.toUpperCase()} medal!`);
      
      // Check timer
      const t = getActiveTimer(r.id);
      setActiveTimerStart(t);
    }
  };

  useEffect(() => {
    loadData();
    if (state?.openLog) setShowLogModal(true);
    if (state?.startTimer && id && !getActiveTimer(id)) {
       toggleTimer();
    }
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (activeTimerStart) {
      const update = () => setElapsed(Math.floor((Date.now() - activeTimerStart) / 1000));
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTimerStart]);

  const toggleTimer = () => {
    if (!race) return;
    if (activeTimerStart) {
      // Stop
      const minutes = stopTimer(race.id);
      setActiveTimerStart(null);
      setElapsed(0);
      handleLogTime(minutes);
    } else {
      // Start
      startTimer(race.id);
      setActiveTimerStart(Date.now());
    }
  };

  const handleLogTime = (mins: number) => {
    if (!race) return;
    const today = new Date().toISOString().split('T')[0];
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      raceId: race.id,
      date: today,
      minutes: mins,
      loggedAt: Date.now(),
    };
    addLog(newLog);
    setShowLogModal(false);
    setLogMinutes('');
    loadData();
  };
  
  const handleWithdraw = () => {
    if (window.confirm("Are you sure? You will forfeit any progress.")) {
      if (race) {
        updateRace({...race, status: 'withdrawn'});
        navigate('/');
      }
    }
  };

  if (!race || !progress) return <div className="p-8 text-slate-500">Loading race data...</div>;

  return (
    <div className="min-h-screen relative">
      <div className="bg-slate-950/80 backdrop-blur-md p-6 sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2">
            <Icons.close className="w-6 h-6" />
          </Button>
          <div className="text-center">
             <div className="font-bold text-slate-100 tracking-tight">{race.name}</div>
             <div className="text-[10px] text-brand-400 font-mono uppercase tracking-widest">{progress.elapsedDays} / {progress.totalDays} Days</div>
          </div>
          <div className="w-10"></div>
        </div>
        
        {activeTimerStart && (
          <div className="mt-4 bg-slate-900/80 border border-brand-500/30 rounded-2xl p-4 text-white flex items-center justify-between shadow-[0_0_20px_rgba(45,212,191,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shadow-[0_0_10px_theme(colors.brand.500)]" />
              <div className="font-mono text-2xl font-bold tracking-widest text-slate-100">
                {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTimer} className="h-9 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 border-brand-500/20">
              Stop
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 pb-32">
        <ProVisualizer progress={progress} race={race} />

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-5 flex flex-col gap-1 bg-slate-900/60">
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Pace</div>
             <div className="text-2xl font-bold text-slate-100">
               {progress.elapsedDays > 0 ? (progress.userHours / progress.elapsedDays).toFixed(1) : '0.0'} <span className="text-sm text-slate-600 font-normal">h/day</span>
             </div>
          </Card>
          <Card className="p-5 flex flex-col gap-1 bg-slate-900/60">
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rank</div>
             <div className="text-2xl font-bold text-slate-100">
               <span className="text-brand-400">#{progress.userRank}</span> <span className="text-sm text-slate-600 font-normal">/ 7</span>
             </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
           <Button variant="outline" className="h-16 flex-col gap-1 bg-slate-900/50 border-slate-800" onClick={() => setShowLogModal(true)}>
             <Icons.plus className="w-5 h-5 mb-1" />
             <span className="text-xs font-medium">Log Time</span>
           </Button>
           <Button variant={activeTimerStart ? "secondary" : "primary"} className="h-16 flex-col gap-1" onClick={toggleTimer}>
             {activeTimerStart ? <Icons.pause className="w-5 h-5 mb-1" /> : <Icons.play className="w-5 h-5 mb-1" />}
             <span className="text-xs font-medium">{activeTimerStart ? "Stop & Log" : "Start Timer"}</span>
           </Button>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-slate-800">
           <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">Zone of Danger</h4>
           <Button variant="danger" onClick={handleWithdraw} className="w-full">
              Withdraw Protocol
           </Button>
           <p className="text-[10px] text-slate-600 text-center mt-3">Warning: All progress data will be purged.</p>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-white/10 animate-[scale-in_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-slate-100 mb-6 uppercase tracking-wider">Log Activity</h3>
            <Input 
              type="number" 
              label="Minutes" 
              value={logMinutes} 
              onChange={e => setLogMinutes(e.target.value)} 
              autoFocus 
              className="mb-8 text-3xl h-20 text-center font-mono tracking-tighter"
              placeholder="0"
            />
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowLogModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => handleLogTime(parseFloat(logMinutes))}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}