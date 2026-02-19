import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRaces, getRaceProgress, getUser, formatDuration, getRaceLogs, getActiveTimer, startTimer, stopTimer, addLog } from '../services/data';
import { Icons, Card, Button, cn } from '../components/Shared';
import { Race, UserSettings, TimeLog } from '../types';

const RaceCard: React.FC<{ race: Race, userSettings: UserSettings, onRefresh: () => void }> = ({ race, userSettings, onRefresh }) => {
  const navigate = useNavigate();
  const logs = getRaceLogs(race.id);
  const progress = getRaceProgress(race, logs, userSettings);
  
  // Timer Logic
  const activeTimerStart = getActiveTimer(race.id);
  const [elapsed, setElapsed] = useState(0);

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

  const toggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTimerStart) {
      // Stop
      const mins = stopTimer(race.id);
      const today = new Date().toISOString().split('T')[0];
      const newLog: TimeLog = {
        id: crypto.randomUUID(),
        raceId: race.id,
        date: today,
        minutes: mins,
        loggedAt: Date.now(),
      };
      addLog(newLog);
      onRefresh(); // Refresh logs and UI
    } else {
      // Start
      startTimer(race.id);
      onRefresh(); // Refresh UI to show active state
    }
  };
  
  // Find top 3
  const top3 = progress.runners.slice(0, 3);
  const userRunner = progress.runners.find(r => r.id === 'user');
  const leader = progress.runners[0];
  const percent = Math.min(100, (progress.userHours / race.goalHours) * 100);
  
  return (
    <Card onClick={() => navigate(`/race/${race.id}`)} className="group active:scale-[0.99] transition-all cursor-pointer hover:border-brand-500/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.1)]">
      {/* Background Gradient Effect - subtle neon sweep */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="font-bold text-xl text-slate-100 tracking-tight group-hover:text-brand-300 transition-colors">{race.name}</h3>
          <p className="text-[10px] text-brand-400/80 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
             <span className={`w-1.5 h-1.5 rounded-full ${progress.isFinished ? 'bg-brand-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            {progress.isFinished ? 'Finished' : `Day ${progress.elapsedDays} / ${progress.totalDays}`}
          </p>
        </div>
        <div className="text-right">
           <div className="text-2xl font-black text-slate-100 tabular-nums tracking-tighter">
             {Math.floor(progress.userHours)}<span className="text-sm font-semibold text-slate-500 ml-1">/{race.goalHours}h</span>
           </div>
        </div>
      </div>

      {/* Cyber Progress Bar */}
      <div className="h-2 w-full bg-slate-950 rounded-full mb-6 overflow-hidden border border-white/5 relative">
        <div 
          className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-300 rounded-full transition-all duration-1000 relative shadow-[0_0_10px_theme(colors.brand.500)]"
          style={{ width: `${percent}%` }}
        >
           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] w-full opacity-30" />
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-slate-950/40 rounded-xl p-4 mb-5 space-y-3 border border-white/5">
        {top3.map((r, i) => {
           const gap = i === 0 ? 0 : leader.hours - r.hours;
           return (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className={cn("font-bold w-4 text-xs tabular-nums", 
                  i === 0 ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" : 
                  i === 1 ? "text-slate-400" : "text-orange-700"
                )}>{i+1}</span>
                <span className={cn("truncate max-w-[120px] font-medium", r.id === 'user' ? "text-brand-400" : "text-slate-400")}>
                  {r.name}
                </span>
              </div>
              <span className="text-xs text-slate-600 font-mono tracking-wider">
                {i === 0 ? 'LEADER' : `-${formatDuration(gap * 60)}`}
              </span>
            </div>
           );
        })}
        {userRunner && userRunner.position > 3 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5 mt-2">
             <div className="flex items-center gap-3">
                <span className="font-bold w-4 text-slate-600 text-xs">{userRunner.position}</span>
                <span className="font-bold text-brand-400">You</span>
              </div>
              <span className="text-xs text-slate-600 font-mono">
                -{formatDuration((leader.hours - userRunner.hours) * 60)}
              </span>
          </div>
        )}
      </div>

      {/* Actions (50/50 columns) */}
      <div className="flex gap-3 relative z-10">
        <Button 
           variant="secondary" 
           size="sm" 
           className="flex-1 h-12 bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-white/20"
           onClick={(e) => {
             e.stopPropagation();
             navigate(`/race/${race.id}`, { state: { openLog: true } });
           }}
        >
          <Icons.plus className="w-4 h-4 mr-2 text-brand-400" /> Log Time
        </Button>
        <Button 
           variant={activeTimerStart ? "primary" : "outline"} 
           size="sm"
           className={cn("flex-1 h-12", activeTimerStart ? "animate-pulse" : "border-slate-700 bg-transparent text-slate-300")}
           onClick={toggleTimer}
        >
          {activeTimerStart ? (
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                <span className="font-mono font-bold text-slate-950">
                  {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
                </span>
             </div>
          ) : (
            <>
              <Icons.timer className="w-4 h-4 mr-2 opacity-70" /> Start Timer
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default function Home() {
  const [races, setRaces] = useState<Race[]>([]);
  const [user, setUser] = useState(getUser());
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Hack to force refresh
  const navigate = useNavigate();

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const r = getRaces();
    r.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.createdAt - a.createdAt;
    });
    setRaces(r);
  }, [refreshTrigger]);

  const activeRaces = races.filter(r => r.status === 'active');
  const archivedRaces = races.filter(r => r.status !== 'active');

  return (
    <div className="p-6 pt-10 pb-32 min-h-screen relative">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tighter">Race Yourself<span className="text-brand-500">.</span></h1>
           <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Status: Online</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-brand-400 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
           {user.name[0]?.toUpperCase()}
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {activeRaces.length === 0 && archivedRaces.length === 0 && (
           <div className="text-center py-16 bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800 backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Icons.flag className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-200">No active races</h3>
              <p className="text-slate-500 mb-8 max-w-[200px] mx-auto leading-relaxed text-sm">Initiate a new protocol to challenge your limits.</p>
              <Link to="/add">
                <Button>Create Race</Button>
              </Link>
           </div>
        )}

        {activeRaces.map(race => (
          <RaceCard key={race.id} race={race} userSettings={user.settings} onRefresh={refresh} />
        ))}

        {archivedRaces.length > 0 && (
          <div className="pt-8 border-t border-slate-800/50">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">Archive</h2>
            <div className="opacity-60 hover:opacity-100 transition-all duration-300 space-y-6 grayscale-[30%]">
              {archivedRaces.map(race => (
                 <RaceCard key={race.id} race={race} userSettings={user.settings} onRefresh={refresh} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}