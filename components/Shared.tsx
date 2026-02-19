import React from 'react';
import { Footprints, Flag, Zap, Trophy, Ghost, User as UserIcon, Activity, Timer, Plus, ChevronRight, X, Play, Pause, Save, Award, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Icons = {
  walk: Footprints,
  run: Activity,
  flag: Flag,
  zap: Zap,
  trophy: Trophy,
  ghost: Ghost,
  user: UserIcon,
  timer: Timer,
  plus: Plus,
  right: ChevronRight,
  close: X,
  play: Play,
  pause: Pause,
  save: Save,
  award: Award,
  info: Info,
};

export const Button = ({ className, variant = 'primary', size = 'md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' | 'icon' }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    // Cyber Primary: Teal/Cyan gradient with glow
    primary: "bg-gradient-to-r from-brand-500 to-brand-400 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] border border-brand-300/20",
    // Cyber Secondary: Dark surface with light border reflection
    secondary: "bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-white/10 shadow-lg",
    // Outline: Thin border, cyber text
    outline: "border border-slate-700 bg-transparent hover:bg-slate-800/50 text-slate-300 hover:border-slate-500",
    ghost: "hover:bg-slate-800/50 text-slate-400 hover:text-brand-300",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs uppercase",
    md: "h-12 px-6 text-sm uppercase",
    lg: "h-14 px-8 text-base uppercase",
    icon: "h-10 w-10 p-2",
  };
  
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
};

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div onClick={onClick} className={cn(
    // Glassmorphism Base
    "bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden",
    // 1px Border with Gradient Transparency simulation (Top light, bottom dark)
    "border-t border-l border-r border-b border-white/10",
    // Inner reflection for sleekness
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    // Outer shadow
    "shadow-xl shadow-black/40",
    className
  )}>
    {children}
  </div>
);

export const Input = ({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-bold text-brand-400/80 uppercase tracking-widest ml-1">{label}</label>}
    <input 
      className={cn(
        "h-14 rounded-xl border border-slate-800 bg-slate-950/50 px-5 text-slate-100 placeholder:text-slate-600",
        "focus:border-brand-500/50 focus:bg-slate-950/80 focus:ring-1 focus:ring-brand-500/50 focus:shadow-[0_0_15px_rgba(45,212,191,0.1)]",
        "outline-none transition-all duration-300",
        className
      )} 
      {...props} 
    />
  </div>
);

export const MedalIcon = ({ type, size = 'md' }: { type: 'platinum' | 'gold' | 'silver' | 'bronze', size?: 'sm' | 'md' | 'lg' }) => {
  const colors = {
    platinum: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]',
    gold: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]',
    silver: 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)]',
    bronze: 'text-orange-600 drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]',
  };
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-12 h-12',
  };
  return <Icons.award className={cn("fill-current", colors[type], sizes[size])} />;
};