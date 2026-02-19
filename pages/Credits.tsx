import React from 'react';
import { Icons, Button, Card } from '../components/Shared';

export default function Credits() {
  return (
    <div className="p-6 pt-10 pb-32 min-h-screen relative">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">System Info</h1>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Creator Section */}
        <Card className="bg-slate-900/40 border-brand-500/20">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-brand-950 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <Icons.user className="w-6 h-6" />
             </div>
             <div>
               <div className="text-[10px] font-mono text-brand-500 uppercase tracking-widest mb-0.5">Architect</div>
               <div className="text-lg font-bold text-slate-100">Race Yourself Dev</div>
             </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Forged in the depths of late-night coding sessions. Designed to hack your dopamine system and override procrastination protocols.
          </p>
        </Card>

        {/* Mission Statement */}
        <div className="p-4 border-l-2 border-slate-800 ml-2">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Directive</h3>
           <p className="text-slate-300 text-sm italic font-mono">
             "The only opponent that matters is the version of you that didn't do the work today."
           </p>
        </div>

        {/* Donation / Support */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200">Fuel the System</h3>
              <Icons.zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
           </div>
           <p className="text-xs text-slate-500 mb-6 leading-relaxed">
             Server costs and caffeine intake are the only things keeping the Shadow at bay. If this protocol helped you, consider fueling the machine.
           </p>
           
           <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="block">
             <Button variant="secondary" className="w-full gap-2 border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-200 transition-all group">
                <Icons.zap className="w-4 h-4 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
                <span>Buy me a Coffee</span>
             </Button>
           </a>
        </Card>

        {/* Tech Stack */}
        <div className="pt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
           <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">Powered By</p>
           <div className="flex justify-center gap-6 text-slate-600">
              <span className="font-mono text-xs">React 19</span>
              <span className="font-mono text-xs">Tailwind</span>
              <span className="font-mono text-xs">Lucide</span>
           </div>
        </div>

      </div>
    </div>
  );
}