import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { getUser } from './services/data';
import { Icons, cn } from './components/Shared';

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import AddRace from './pages/AddRace';
import RaceDetail from './pages/RaceDetail';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import Credits from './pages/Credits';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Floating Action Button (Centered) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <Link to="/add">
          <div className="w-14 h-14 rounded-full bg-gradient-to-t from-brand-600 to-brand-400 shadow-[0_0_25px_rgba(45,212,191,0.4)] flex items-center justify-center text-slate-950 active:scale-95 transition-transform border border-brand-300/30 group">
            <div className="absolute inset-0 rounded-full bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icons.plus className="w-7 h-7 relative z-10" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* Bar Background & Items */}
      <nav className="pointer-events-auto bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 pb-8 pt-4 px-6 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-5 items-center">
          
          {/* Left Side */}
          <Link to="/" className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group">
             <div className={cn("relative p-1 rounded-lg transition-all", isActive('/') ? "bg-white/5" : "")}>
                <Icons.flag className={cn("w-6 h-6 transition-colors", isActive('/') ? "text-brand-400 fill-brand-400/10 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" : "text-slate-500 group-hover:text-slate-300")} strokeWidth={1.5} />
             </div>
             <span className={cn("text-[10px] font-semibold tracking-wide uppercase", isActive('/') ? "text-brand-400" : "text-slate-600")}>Races</span>
          </Link>

          <Link to="/rewards" className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group">
             <div className={cn("relative p-1 rounded-lg transition-all", isActive('/rewards') ? "bg-white/5" : "")}>
                <Icons.trophy className={cn("w-6 h-6 transition-colors", isActive('/rewards') ? "text-brand-400 fill-brand-400/10 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" : "text-slate-500 group-hover:text-slate-300")} strokeWidth={1.5} />
             </div>
             <span className={cn("text-[10px] font-semibold tracking-wide uppercase", isActive('/rewards') ? "text-brand-400" : "text-slate-600")}>Rewards</span>
          </Link>

          {/* Spacer for FAB */}
          <div></div>

          {/* Right Side */}
          <Link to="/credits" className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group">
             <div className={cn("relative p-1 rounded-lg transition-all", isActive('/credits') ? "bg-white/5" : "")}>
                <Icons.info className={cn("w-6 h-6 transition-colors", isActive('/credits') ? "text-brand-400 fill-brand-400/10 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" : "text-slate-500 group-hover:text-slate-300")} strokeWidth={1.5} />
             </div>
             <span className={cn("text-[10px] font-semibold tracking-wide uppercase", isActive('/credits') ? "text-brand-400" : "text-slate-600")}>Info</span>
          </Link>

          <Link to="/settings" className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group">
             <div className={cn("relative p-1 rounded-lg transition-all", isActive('/settings') ? "bg-white/5" : "")}>
                <Icons.user className={cn("w-6 h-6 transition-colors", isActive('/settings') ? "text-brand-400 fill-brand-400/10 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" : "text-slate-500 group-hover:text-slate-300")} strokeWidth={1.5} />
             </div>
             <span className={cn("text-[10px] font-semibold tracking-wide uppercase", isActive('/settings') ? "text-brand-400" : "text-slate-600")}>Profile</span>
          </Link>

        </div>
      </nav>
    </div>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const hideNav = location.pathname.includes('/race/') || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-brand-500/30">
      <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden border-x border-white/5 shadow-2xl shadow-black">
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(getUser());

  if (!user.onboardingCompleted) {
    return <Onboarding onComplete={() => setUser(getUser())} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddRace />} />
          <Route path="/race/:id" element={<RaceDetail />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}