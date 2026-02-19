import React, { useState, useEffect } from 'react';
import { getMedals, getRewards, saveRewards, addMedal, saveMedals } from '../services/data';
import { MedalIcon, Button, Card, Icons, Input, cn } from '../components/Shared';
import { Medal, Reward, MedalType } from '../types';

export default function Rewards() {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState<{type: MedalType, count: number}[]>([{ type: 'gold', count: 1 }]);

  useEffect(() => {
    setMedals(getMedals());
    setRewards(getRewards());
  }, []);

  const getBalance = (type: MedalType) => medals.filter(m => m.type === type && !m.spent).length;

  const handleAddReward = () => {
    if (!newRewardName) return;
    const reward: Reward = {
      id: crypto.randomUUID(),
      name: newRewardName,
      price: newRewardCost,
      createdAt: Date.now()
    };
    const updated = [reward, ...rewards];
    setRewards(updated);
    saveRewards(updated);
    setShowAdd(false);
    setNewRewardName('');
  };

  const handleRedeem = (reward: Reward) => {
    let canAfford = true;
    for (const cost of reward.price) {
      if (getBalance(cost.type) < cost.count) canAfford = false;
    }

    if (canAfford) {
      if (window.confirm(`Redeem "${reward.name}"?`)) {
        const newMedals = [...medals];
        for (const cost of reward.price) {
          let spentCount = 0;
          for (let i = 0; i < newMedals.length; i++) {
            if (newMedals[i].type === cost.type && !newMedals[i].spent && spentCount < cost.count) {
              newMedals[i].spent = true;
              spentCount++;
            }
          }
        }
        setMedals(newMedals);
        saveMedals(newMedals);
      }
    } else {
      alert("Not enough medals!");
    }
  };

  return (
    <div className="p-6 pt-10 pb-32">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Rewards</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[2rem] p-6 text-white mb-10 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Your Balance</h2>
        <div className="flex justify-between items-center px-2 relative z-10">
          {['platinum', 'gold', 'silver', 'bronze'].map(type => (
            <div key={type} className="flex flex-col items-center gap-3">
              <MedalIcon type={type as MedalType} size="lg" />
              <span className="font-bold text-xl tabular-nums">{getBalance(type as MedalType)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl text-zinc-200">Shop</h2>
        <Button size="sm" variant="ghost" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add'}
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-8 border-brand-500/30 bg-zinc-900/80">
          <Input 
            placeholder="Reward Name (e.g. Pizza Night)" 
            value={newRewardName} 
            onChange={e => setNewRewardName(e.target.value)} 
            className="mb-4"
          />
          <div className="flex items-center gap-3 mb-6 p-4 bg-zinc-950/50 rounded-2xl">
            <span className="text-xs font-bold text-zinc-500 uppercase">Price:</span>
            <select 
              className="bg-transparent text-white border-none text-sm focus:ring-0 font-bold"
              value={newRewardCost[0].count}
              onChange={e => setNewRewardCost([{ ...newRewardCost[0], count: parseInt(e.target.value) }])}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-zinc-800">{n}</option>)}
            </select>
            <select 
              className="bg-transparent text-white border-none text-sm capitalize focus:ring-0 font-bold"
              value={newRewardCost[0].type}
              onChange={e => setNewRewardCost([{ ...newRewardCost[0], type: e.target.value as MedalType }])}
            >
              {['platinum', 'gold', 'silver', 'bronze'].map(t => <option key={t} value={t} className="bg-zinc-800">{t}</option>)}
            </select>
          </div>
          <Button onClick={handleAddReward} className="w-full">Save Reward</Button>
        </Card>
      )}

      <div className="space-y-4">
        {rewards.length === 0 && (
          <div className="text-center text-zinc-600 py-12 bg-zinc-900/30 rounded-[2rem] border border-dashed border-zinc-800">
             <Icons.trophy className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p>No rewards yet.</p>
          </div>
        )}
        {rewards.map(reward => {
          let canAfford = true;
          reward.price.forEach(p => {
            if (getBalance(p.type) < p.count) canAfford = false;
          });

          return (
            <Card key={reward.id} className="flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
              <span className="font-medium text-zinc-200">{reward.name}</span>
              <Button 
                size="sm" 
                variant={canAfford ? "primary" : "secondary"} 
                disabled={!canAfford}
                onClick={() => handleRedeem(reward)}
                className={cn("gap-2 h-10", !canAfford && "opacity-50")}
              >
                {reward.price.map((p, i) => (
                   <span key={i} className="flex items-center gap-1.5">
                     <span className="font-bold">{p.count}</span> <MedalIcon type={p.type} size="sm" />
                   </span>
                ))}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}