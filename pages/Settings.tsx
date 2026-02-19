import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser } from '../services/data';
import { Button, Input, Card, Icons } from '../components/Shared';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());

  const handleSave = () => {
    saveUser(user);
    // Simple toast or alert replacement
    const btn = document.getElementById('save-btn');
    if(btn) btn.innerText = 'Saved!';
    setTimeout(() => { if(btn) btn.innerText = 'Save Changes' }, 2000);
  };

  const updateSetting = (key: string, val: any) => {
    setUser({ ...user, settings: { ...user.settings, [key]: val } });
  };

  return (
    <div className="p-6 pt-10 pb-32">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Settings</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Profile</h2>
          <Input 
            label="Name" 
            value={user.name} 
            onChange={e => setUser({ ...user, name: e.target.value })} 
          />
        </section>

        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Icons.ghost className="w-4 h-4" /> Shadow Configuration
          </h2>
          <Card className="space-y-4 bg-zinc-900/40">
            <p className="text-xs text-zinc-500 mb-2 leading-relaxed">Adjust how aggressively Shadow chases you. Higher values track inactivity more strictly.</p>
            <Input 
              label="Base Tempo (%)" 
              type="number"
              value={user.settings.shadowBaseTempo} 
              onChange={e => updateSetting('shadowBaseTempo', parseInt(e.target.value))} 
            />
            <Input 
              label="Growth per Inactive Day (%)" 
              type="number"
              value={user.settings.shadowTempoIncrement} 
              onChange={e => updateSetting('shadowTempoIncrement', parseInt(e.target.value))} 
            />
            <Input 
              label="Max Tempo Cap (%)" 
              type="number"
              value={user.settings.shadowMaxTempo} 
              onChange={e => updateSetting('shadowMaxTempo', parseInt(e.target.value))} 
            />
          </Card>
        </section>

        <section>
           <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Opponents</h2>
           <Card className="space-y-4 bg-zinc-900/40">
             <Input 
                label="Ambitious You Tempo (%)" 
                type="number"
                value={user.settings.ambitiousTempo} 
                onChange={e => updateSetting('ambitiousTempo', parseInt(e.target.value))} 
              />
              <Input 
                label="Dedicated You Tempo (%)" 
                type="number"
                value={user.settings.dedicatedTempo} 
                onChange={e => updateSetting('dedicatedTempo', parseInt(e.target.value))} 
              />
           </Card>
        </section>
        
        <Button id="save-btn" onClick={handleSave} className="w-full h-14 text-lg mt-4">Save Changes</Button>
        
        <div 
          onClick={() => navigate('/credits')}
          className="text-center text-xs text-zinc-700 mt-12 font-mono hover:text-brand-500 cursor-pointer transition-colors p-4"
        >
           RACE YOURSELF v1.0.0
        </div>
      </div>
    </div>
  );
}