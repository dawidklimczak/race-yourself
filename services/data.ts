import { Race, TimeLog, User, Medal, Reward, UserSettings, Participant, AI_ROSTER, MedalType } from '../types';

const DB_KEY_USER = 'ry_user';
const DB_KEY_RACES = 'ry_races';
const DB_KEY_LOGS = 'ry_logs';
const DB_KEY_MEDALS = 'ry_medals';
const DB_KEY_REWARDS = 'ry_rewards';
const DB_KEY_TIMERS = 'ry_timers';

// --- Storage Helpers ---

const get = <T>(key: string, def: T): T => {
  const val = localStorage.getItem(key);
  if (!val) return def;
  try {
    return JSON.parse(val);
  } catch {
    return def;
  }
};

const set = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- User ---

const DEFAULT_SETTINGS: UserSettings = {
  name: '',
  shadowBaseTempo: 10,
  shadowTempoIncrement: 1,
  shadowMaxTempo: 200,
  ambitiousTempo: 120,
  dedicatedTempo: 150,
  notificationsEnabled: true,
  notificationTime: '20:00',
};

export const getUser = (): User => get<User>(DB_KEY_USER, { name: '', onboardingCompleted: false, settings: DEFAULT_SETTINGS });
export const saveUser = (user: User) => set(DB_KEY_USER, user);

// --- Races ---

export const getRaces = (): Race[] => get<Race[]>(DB_KEY_RACES, []);
export const saveRaces = (races: Race[]) => set(DB_KEY_RACES, races);
export const addRace = (race: Race) => {
  const races = getRaces();
  saveRaces([race, ...races]);
};
export const updateRace = (race: Race) => {
  const races = getRaces().map(r => r.id === race.id ? race : r);
  saveRaces(races);
};

// --- Logs ---

export const getLogs = (): TimeLog[] => get<TimeLog[]>(DB_KEY_LOGS, []);
export const saveLogs = (logs: TimeLog[]) => set(DB_KEY_LOGS, logs);
export const addLog = (log: TimeLog) => {
  const logs = getLogs();
  // Check if log for this day already exists, if so merge
  const existingIndex = logs.findIndex(l => l.raceId === log.raceId && l.date === log.date);
  if (existingIndex >= 0) {
    logs[existingIndex].minutes += log.minutes;
    logs[existingIndex].loggedAt = Date.now();
  } else {
    logs.push(log);
  }
  saveLogs(logs);
};
export const getRaceLogs = (raceId: string) => getLogs().filter(l => l.raceId === raceId);

// --- Timers (Global) ---

export const getActiveTimer = (raceId: string): number | null => {
  const timers = get<Record<string, number>>(DB_KEY_TIMERS, {});
  return timers[raceId] || null;
};

export const startTimer = (raceId: string) => {
  const timers = get<Record<string, number>>(DB_KEY_TIMERS, {});
  timers[raceId] = Date.now();
  set(DB_KEY_TIMERS, timers);
};

export const stopTimer = (raceId: string): number => {
  const timers = get<Record<string, number>>(DB_KEY_TIMERS, {});
  const start = timers[raceId];
  if (!start) return 0;
  
  delete timers[raceId];
  set(DB_KEY_TIMERS, timers);
  
  const diff = Date.now() - start;
  // Use floating point for precision (e.g. 0.5 minutes) instead of rounding up to 1m immediately
  const minutes = diff / 1000 / 60;
  return parseFloat(minutes.toFixed(2));
};

// --- Medals & Rewards ---

export const getMedals = (): Medal[] => get<Medal[]>(DB_KEY_MEDALS, []);
export const saveMedals = (medals: Medal[]) => set(DB_KEY_MEDALS, medals);
export const addMedal = (medal: Medal) => saveMedals([...getMedals(), medal]);

export const getRewards = (): Reward[] => get<Reward[]>(DB_KEY_REWARDS, []);
export const saveRewards = (rewards: Reward[]) => set(DB_KEY_REWARDS, rewards);

// --- Logic Calculation ---

export const getRaceProgress = (race: Race, logs: TimeLog[], userSettings: UserSettings) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(race.startDate);
  start.setHours(0,0,0,0);
  const end = new Date(race.endDate);
  end.setHours(0,0,0,0);

  const totalDurationMs = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)));
  
  // Cap elapsed time at race end
  const effectiveNow = today > end ? end : today;
  const elapsedDurationMs = effectiveNow.getTime() - start.getTime();
  const elapsedDays = Math.max(0, Math.ceil(elapsedDurationMs / (1000 * 60 * 60 * 24))); // Days inclusive of start date if we consider day 1

  // User Progress
  const totalUserMinutes = logs.reduce((acc, l) => acc + l.minutes, 0);
  const userHours = totalUserMinutes / 60;
  
  // Calculate Shadow
  let shadowHours = 0;
  let currentShadowTempo = userSettings.shadowBaseTempo;
  
  const logMap = new Set(logs.map(l => l.date)); 
  
  for (let d = 0; d < elapsedDays; d++) {
    const checkDate = new Date(start.getTime() + d * (24 * 60 * 60 * 1000));
    const dateStr = checkDate.toISOString().split('T')[0];
    
    // Shadow accumulation logic
    if (logMap.has(dateStr)) {
      // User logged, tempo freezes
    } else {
      // User inactive
      currentShadowTempo += userSettings.shadowTempoIncrement;
      if (currentShadowTempo > userSettings.shadowMaxTempo) currentShadowTempo = userSettings.shadowMaxTempo;
    }
    
    // Calculate daily contribution for Shadow
    const baseDailyHours = (race.goalHours / totalDays);
    let shadowDailyHours = baseDailyHours * (currentShadowTempo / 100);
    
    // Chasing behavior check
    const userHoursAtDayStart = logs
      .filter(l => new Date(l.date) < checkDate)
      .reduce((acc, l) => acc + (l.minutes / 60), 0);
      
    if (shadowHours > userHoursAtDayStart) {
       const daysSoFar = Math.max(1, d);
       const userAvgPace = userHoursAtDayStart / daysSoFar;
       const effectiveShadowPace = userAvgPace * 1.05;
       shadowDailyHours = Math.min(shadowDailyHours, effectiveShadowPace);
    }
    
    shadowHours += shadowDailyHours;
  }

  // Participants
  const participants = AI_ROSTER.map(p => {
    let hours = 0;
    if (p.id === 'shadow') {
      hours = shadowHours;
    } else {
      let tempo = p.baseTempo;
      if (p.id === 'ambitious') tempo = userSettings.ambitiousTempo;
      if (p.id === 'dedicated') tempo = userSettings.dedicatedTempo;
      const dailyHours = (race.goalHours / totalDays) * (tempo / 100);
      hours = dailyHours * elapsedDays;
    }

    return { ...p, hours, position: 0 };
  });

  // Add User
  const userParticipant = {
    id: 'user',
    name: userSettings.name || 'You',
    iconName: 'user' as const,
    color: 'text-brand-600',
    baseTempo: 0,
    isDynamic: false,
    hours: userHours,
    position: 0,
  };

  const allRunners = [...participants, userParticipant].sort((a, b) => b.hours - a.hours);
  
  // Assign ranks
  allRunners.forEach((r, idx) => {
    r.position = idx + 1;
  });

  return {
    runners: allRunners,
    totalDays,
    elapsedDays,
    userHours,
    goalHours: race.goalHours,
    isFinished: userHours >= race.goalHours || elapsedDays >= totalDays,
    userRank: allRunners.find(r => r.id === 'user')?.position || 8
  };
};

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const awardMedalsIfNeeded = (race: Race, logs: TimeLog[], userSettings: UserSettings) => {
  const progress = getRaceProgress(race, logs, userSettings);
  const existingMedals = getMedals().filter(m => m.raceId === race.id);
  
  if (progress.isFinished) {
    const hasOverall = existingMedals.some(m => m.stageNumber === null);
    if (!hasOverall) {
      const userRunner = progress.runners.find(r => r.id === 'user');
      const planRunner = progress.runners.find(r => r.id === 'plan');
      
      if (userRunner && planRunner && userRunner.hours >= planRunner.hours) {
        const rank = userRunner.position;
        let type: MedalType | null = null;
        if (race.stageInterval) {
           if (rank === 1) type = 'platinum';
           else if (rank === 2) type = 'gold';
           else if (rank === 3) type = 'silver';
           else if (rank === 4) type = 'bronze';
        } else {
           if (rank === 1) type = 'gold';
           else if (rank === 2) type = 'silver';
           else if (rank === 3) type = 'bronze';
        }

        if (type) {
          addMedal({
            id: crypto.randomUUID(),
            raceId: race.id,
            stageNumber: null,
            iteration: race.iteration,
            type,
            spent: false,
            earnedAt: Date.now(),
          });
          updateRace({ ...race, status: 'completed' });
          return type;
        }
      } else {
         updateRace({ ...race, status: 'completed' });
      }
    }
  }
  return null;
};