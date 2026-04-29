
import React, { useState, useMemo } from 'react';
import { 
  Zap, TrendingUp, AlertTriangle, ArrowUpRight, DollarSign, 
  Calendar, Search, ShieldCheck, Activity, AreaChart as ChartIcon,
  RefreshCw, Play, Settings2, ShieldAlert, CheckCircle2, Loader2,
  Mail, Send, Bell
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';

const SagePredictiveHub: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMode, setSimulationMode] = useState<'CONSERVATIVE' | 'BASE' | 'AGGRESSIVE'>('BASE');
  const [volatility, setVolatility] = useState(12);
  const [collectionVelocity, setCollectionVelocity] = useState(14);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  // DATA RESET: Initial risk data is empty
  const [riskData, setRiskData] = useState<any[]>([]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  const handleTriggerDunning = (id: string) => {
    setNotifyingId(id);
    setTimeout(() => {
      setNotifyingId(null);
      alert("Institutional Dunning Sequence 01 Dispatched. Audit Trail Updated.");
    }, 1200);
  };

  const forecastData = useMemo(() => {
    const base = [
      { month: 'Jan', cash: 0 },
      { month: 'Feb', cash: 0 },
      { month: 'Mar', cash: 0 },
      { month: 'Apr', cash: 0 },
      { month: 'May', cash: 0 },
      { month: 'Jun', cash: 0 },
    ];
    
    if (isSimulating) {
        const multiplier = simulationMode === 'AGGRESSIVE' ? 1.2 : simulationMode === 'CONSERVATIVE' ? 0.85 : 1;
        return base.map((d, i) => ({
            ...d,
            cash: (100000 * (i + 1)) * multiplier + (Math.random() * volatility * 1000)
        }));
    }
    return base;
  }, [simulationMode, volatility, isSimulating]);

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Predictive Intelligence</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Probabilistic Trajectories & Recievable Risk Modeling</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                {['CONSERVATIVE', 'BASE', 'AGGRESSIVE'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setSimulationMode(m as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${simulationMode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                  >
                    {m}
                  </button>
                ))}
             </div>
           <button 
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-3 px-8 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/5 transition-all"
           >
              {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
              Re-run Monte Carlo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-10 luxury-shadow relative overflow-hidden">
              <div className="flex justify-between items-center mb-12 relative z-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                       <DollarSign size={20} className="text-green-600" /> Cash Liquidity Pathing (Next 6M)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Projection Model: {simulationMode} Engine v4.2</p>
                 </div>
                 <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Confidence Index: 92.4%</span>
                 </div>
              </div>

              <div className="h-[400px] relative z-10">
                 {isSimulating ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                       <RefreshCw className="animate-spin text-indigo-600" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Running 10,000 Iterations...</p>
                    </div>
                 ) : forecastData.every(d => d.cash === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <ChartIcon size={64} className="text-slate-100 dark:text-slate-800" />
                        <p className="text-slate-400 uppercase font-black tracking-widest text-xs">Run Monte Carlo to generate probabilistic path</p>
                    </div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={forecastData}>
                          <defs>
                             <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                          <Tooltip 
                            contentStyle={
                               theme === 'dark'
                                 ? { backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }
                                 : { backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                             }
                            
                          />
                          <Area type="monotone" dataKey="cash" stroke="#6366f1" fillOpacity={1} fill="url(#colorCash)" strokeWidth={4} />
                       </AreaChart>
                    </ResponsiveContainer>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-8 luxury-shadow space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                    <Settings2 size={16} className="text-indigo-600" /> Simulation Parameters
                 </h4>
                 <div className="space-y-10">
                    <div>
                       <div className="flex justify-between mb-4">
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Market Volatility Index</span>
                          <span className="text-xs font-mono font-black text-indigo-600">{volatility}%</span>
                       </div>
                       <input 
                        type="range" min="0" max="30" 
                        value={volatility}
                        onChange={(e) => setVolatility(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                       />
                    </div>
                    <div>
                       <div className="flex justify-between mb-4">
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Avg Collection Delay (Days)</span>
                          <span className="text-xs font-mono font-black text-indigo-600">{collectionVelocity}d</span>
                       </div>
                       <input 
                        type="range" min="1" max="45" 
                        value={collectionVelocity}
                        onChange={(e) => setCollectionVelocity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                       />
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-indigo-600 text-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-center group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Zap size={140} /></div>
                 <h4 className="text-xl font-black uppercase tracking-tighter mb-4 italic leading-tight">Neural Trajectory Insight</h4>
                 <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                    "Awaiting institutional ledger ingestion to calculate projected headroom increases and auto-dunning optimization strategies."
                 </p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-8 luxury-shadow overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                   <AlertTriangle size={16} className="text-red-500" /> Risk Exposure Node
                </h3>
                <span className="text-[9px] font-black px-2 py-0.5 bg-green-500/10 text-green-600 border border-green-200 rounded">0 ALERTS</span>
              </div>
              
              <div className="space-y-4">
                 {riskData.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-40">
                       <ShieldCheck className="mx-auto mb-4" size={32} />
                       <p className="text-[9px] font-black uppercase tracking-[0.2em]">Risk scan clear</p>
                    </div>
                 ) : riskData.map(r => (
                    <div key={r.id} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-500/50 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{r.name}</h4>
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded border mt-2 inline-block ${r.risk > 70 ? 'bg-red-500 text-white border-red-400' : 'bg-green-500/10 text-green-600 border-green-200'}`}>
                               PROBABILITY: {r.risk}%
                             </span>
                          </div>
                          <button 
                            onClick={() => handleTriggerDunning(r.id)}
                            disabled={notifyingId === r.id}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
                          >
                             {notifyingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                          </button>
                       </div>
                       <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase">Exposure</p>
                             <p className="text-sm font-black text-slate-900 dark:text-slate-200 font-mono">${r.balance.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase">Recovery Chance</p>
                             <p className={`text-sm font-black ${r.risk > 70 ? 'text-red-500' : 'text-green-600'}`}>{100 - r.risk}%</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 p-6 bg-slate-950 rounded-[32px] border border-slate-800 relative overflow-hidden">
                 <div className="absolute -bottom-6 -right-6 opacity-5"><Activity size={100} className="text-indigo-400" /></div>
                 <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2">Automated Policy</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">L3 Collection Node active. High-risk balances &gt; $50k automatically routed to legal review after 60 days aging.</p>
              </div>
           </div>
           
           <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] luxury-shadow">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Scenario Accuracy History</h3>
              <div className="h-40 flex items-end gap-2 px-2">
                 {[40, 60, 85, 92, 94, 98, 92].map((v, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-lg transition-all duration-1000 ${i === 6 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`}
                      style={{ height: `${v}%` }}
                    />
                 ))}
              </div>
              <div className="mt-4 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 <span>T-7 Days</span>
                 <span>LIVE</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SagePredictiveHub;
