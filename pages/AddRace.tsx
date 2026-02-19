import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons, Button, Input, Card, cn } from '../components/Shared';
import { addRace } from '../services/data';
import { Race, StageInterval } from '../types';

type DurationMode = 'days' | 'date';

export default function AddRace() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [isInfinity, setIsInfinity] = useState(false);
  const [stageInterval, setStageInterval] = useState<StageInterval>(null);
  
  // Date & Duration Logic
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  
  const [mode, setMode] = useState<DurationMode>('days');
  const [durationDays, setDurationDays] = useState('30');
  const [endDate, setEndDate] = useState('');

  // Initialize EndDate based on default duration
  useEffect(() => {
    if (!endDate && startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 30);
      setEndDate(d.toISOString().split('T')[0]);
    }
  }, []);

  // Handler when changing Duration Days input
  const handleDurationChange = (val: string) => {
    setDurationDays(val);
    if (val && startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + parseInt(val));
      setEndDate(d.toISOString().split('T')[0]);
    }
  };

  // Handler when changing End Date input
  const handleDateChange = (val: string) => {
    setEndDate(val);
    if (val && startDate) {
      const start = new Date(startDate);
      const end = new Date(val);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setDurationDays(diffDays.toString());
    }
  };

  const handleSubmit = () => {
    if (!name || !goal || !endDate) return;

    const newRace: Race = {
      id: crypto.randomUUID(),
      name,
      goalHours: parseFloat(goal),
      startDate: startDate,
      endDate: endDate,
      stageInterval: stageInterval, 
      repeat: isInfinity,
      iteration: 1,
      status: 'active',
      createdAt: Date.now(),
    };

    addRace(newRace);
    navigate('/');
  };

  const IntervalButton = ({ value, label, icon: Icon }: { value: StageInterval, label: string, icon: any }) => (
    <button
      onClick={() => setStageInterval(value)}
      className={cn(
        "flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all border",
        stageInterval === value 
          ? "bg-brand-500/20 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]" 
          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
      )}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="p-6 pt-8 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 text-zinc-400">
          <Icons.close className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">New Race</h1>
      </div>

      <div className="space-y-8">
        <Input 
          label="Race Name" 
          placeholder="e.g. Read 50 Hours" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          autoFocus
        />

        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
             <Input 
              label="Goal (Hours)" 
              type="number" 
              placeholder="50" 
              value={goal} 
              onChange={e => setGoal(e.target.value)} 
              className="font-mono"
            />
          </div>
          <div className="flex-1 min-w-0">
             <Input 
              label="Start Date" 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="dark:[color-scheme:dark]" 
            />
          </div>
        </div>

        {/* Duration / End Date Toggle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Timeline</label>
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button 
                onClick={() => setMode('days')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", mode === 'days' ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
              >
                Duration
              </button>
              <button 
                onClick={() => setMode('date')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", mode === 'date' ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
              >
                End Date
              </button>
            </div>
          </div>
          
          {mode === 'days' ? (
            <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
               <Input 
                type="number" 
                placeholder="30" 
                value={durationDays} 
                onChange={e => handleDurationChange(e.target.value)} 
                className="font-mono"
              />
              <div className="absolute right-4 top-3.5 text-zinc-500 text-sm font-medium pointer-events-none">Days</div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
               <Input 
                type="date" 
                value={endDate} 
                onChange={e => handleDateChange(e.target.value)} 
                className="dark:[color-scheme:dark]"
              />
            </div>
          )}
          
          <div className="text-[10px] text-zinc-500 mt-2 px-1 flex justify-between">
             <span>Ends on: <span className="text-zinc-300 font-mono">{endDate}</span></span>
             <span>Total: <span className="text-zinc-300 font-mono">{durationDays} days</span></span>
          </div>
        </div>

        {/* Stage Interval Selector */}
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 mb-2 block">Stage Interval</label>
          <div className="flex gap-3">
            <IntervalButton value={null} label="None" icon={Icons.flag} />
            <IntervalButton value="weekly" label="Weekly" icon={Icons.run} />
            <IntervalButton value="monthly" label="Monthly" icon={Icons.trophy} />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 px-1">
            {stageInterval === null && "One continuous race from start to finish."}
            {stageInterval === 'weekly' && "Medals awarded every week based on pace."}
            {stageInterval === 'monthly' && "Medals awarded every month based on pace."}
          </p>
        </div>

        <Card className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-800/50 transition-colors" onClick={() => setIsInfinity(!isInfinity)}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isInfinity ? 'bg-brand-500/20 text-brand-400' : 'bg-zinc-800 text-zinc-600'}`}>
              <Icons.run className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-zinc-200">Infinity Race</div>
              <div className="text-xs text-zinc-500 mt-0.5">Auto-repeat when finished</div>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isInfinity ? 'border-brand-500 bg-brand-500' : 'border-zinc-700 bg-transparent'}`}>
            {isInfinity && <Icons.close className="w-3 h-3 text-white rotate-45" />}
          </div>
        </Card>

        <div className="pt-8">
          <Button onClick={handleSubmit} className="w-full h-14 text-lg" disabled={!name || !goal}>
            Create Race
          </Button>
        </div>
      </div>
    </div>
  );
}