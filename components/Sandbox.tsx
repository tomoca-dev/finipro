
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Play, RotateCcw, Target, TrendingUp, HelpCircle, Save, Layers, Loader2 } from 'lucide-react';
import { generateScenarioForecast } from '../services/geminiService';

const Sandbox: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [forecast, setForecast] = useState<any[]>([]);
  const [params, setParams] = useState({
    growthRate: 15,
    churnRate: 3,
    burnRate: 180000,
  });

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const results = await generateScenarioForecast(params);
      setForecast(results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [params]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Strategic Sandbox</h2>
          <p className="text-slate-500 text-sm font-medium">Modeling three-scenario trajectories for growth optimization.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setParams({ growthRate: 15, churnRate: 3, burnRate: 180000 })}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={runSimulation} disabled={isSimulating} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
            {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
            {isSimulating ? 'Computing...' : 'Recalculate Node'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 h-fit luxury-shadow">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
            <Layers size={14} className="text-blue-500" /> Scenario Controls
          </h3>
          
          <div className="space-y-8">
            <div>
              <label className="flex justify-between text-[11px] font-black text-slate-500 uppercase mb-4 tracking-tighter">
                Growth (%)
                <span className="text-blue-600 dark:text-blue-400 font-black">{params.growthRate}%</span>
              </label>
              <input 
                type="range" min="0" max="50" step="1" 
                value={params.growthRate}
                onChange={(e) => setParams({...params, growthRate: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="flex justify-between text-[11px] font-black text-slate-500 uppercase mb-4 tracking-tighter">
                Churn (%)
                <span className="text-red-600 dark:text-red-400 font-black">{params.churnRate}%</span>
              </label>
              <input 
                type="range" min="0" max="15" step="0.5" 
                value={params.churnRate}
                onChange={(e) => setParams({...params, churnRate: parseFloat(e.target.value)})}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
            <div>
              <label className="flex justify-between text-[11px] font-black text-slate-500 uppercase mb-4 tracking-tighter">
                Fixed Burn ($)
                <span className="text-slate-900 dark:text-slate-100 font-black">${params.burnRate.toLocaleString()}</span>
              </label>
              <input 
                type="range" min="50000" max="500000" step="5000" 
                value={params.burnRate}
                onChange={(e) => setParams({...params, burnRate: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 relative luxury-shadow h-[600px] flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 tracking-tight uppercase italic flex items-center gap-4">
             <TrendingUp size={24} className="text-blue-500" /> Probabilistic Trajectory
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={
                    theme === 'dark'
                      ? { backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }
                      : { backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#000' }
                  }
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }} />
                <Line type="monotone" dataKey="best" name="Upside Case" stroke="#10b981" strokeWidth={4} dot={false} strokeDasharray="6 6" />
                <Line type="monotone" dataKey="base" name="Deterministic Base" stroke="#3b82f6" strokeWidth={5} dot={false} />
                <Line type="monotone" dataKey="downside" name="Market Downside" stroke="#ef4444" strokeWidth={4} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;
