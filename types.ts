
export interface UserSettings {
  name: string;
  shadowBaseTempo: number; // default 10
  shadowTempoIncrement: number; // default 1
  shadowMaxTempo: number; // default 200
  ambitiousTempo: number; // default 120
  dedicatedTempo: number; // default 150
  notificationsEnabled: boolean;
  notificationTime: string;
}

export interface User {
  name: string;
  onboardingCompleted: boolean;
  settings: UserSettings;
}

export type RaceStatus = 'active' | 'completed' | 'withdrawn';
export type StageInterval = 'weekly' | 'monthly' | null;

export interface Race {
  id: string;
  name: string;
  goalHours: number;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  stageInterval: StageInterval;
  repeat: boolean;
  iteration: number;
  status: RaceStatus;
  createdAt: number;
}

export interface TimeLog {
  id: string;
  raceId: string;
  date: string; // ISO Date YYYY-MM-DD
  minutes: number;
  loggedAt: number;
}

export type MedalType = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface Medal {
  id: string;
  raceId: string;
  stageNumber: number | null; // null for overall
  iteration: number;
  type: MedalType;
  spent: boolean;
  earnedAt: number;
}

export interface Reward {
  id: string;
  name: string;
  price: {
    type: MedalType;
    count: number;
  }[];
  createdAt: number;
}

// AI Participant Configuration
export interface Participant {
  id: string;
  name: string;
  iconName: 'walk' | 'run' | 'flag' | 'zap' | 'trophy' | 'ghost' | 'user';
  color: string;
  baseTempo: number; // Percentage
  isDynamic: boolean; // True for Shadow
}

export const AI_ROSTER: Participant[] = [
  { id: 'lazy', name: 'Lazy You', iconName: 'walk', color: 'text-gray-400', baseTempo: 50, isDynamic: false },
  { id: 'busy', name: 'Busy You', iconName: 'run', color: 'text-blue-400', baseTempo: 80, isDynamic: false },
  { id: 'plan', name: 'The Plan', iconName: 'flag', color: 'text-emerald-500', baseTempo: 100, isDynamic: false },
  { id: 'ambitious', name: 'Ambitious', iconName: 'zap', color: 'text-amber-500', baseTempo: 120, isDynamic: false }, // Dynamic base from settings
  { id: 'dedicated', name: 'Dedicated', iconName: 'trophy', color: 'text-purple-500', baseTempo: 150, isDynamic: false }, // Dynamic base from settings
  { id: 'shadow', name: 'Shadow', iconName: 'ghost', color: 'text-slate-500', baseTempo: 10, isDynamic: true }, // Highly dynamic
];
