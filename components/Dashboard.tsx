
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Target, ShieldCheck, 
  FileText, Zap, AlertCircle, RefreshCw, Save, Calendar, Shield, Sparkles,
  Database, Loader2
} from 'lucide-react';
import { FinancialRecord, KPIStats, CurrencyCode, CEOTarget } from '../types';
import { getAggregates, calculateHealthIndex, getRankedDrivers, getRankedKillers, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../services/dataEngine';
import { generateCFOBrief } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import GlobeSalesMap from './GlobeSalesMap';
import AudioBrief from './AudioBrief';

const Card: React.FC<{ children: React.ReactNode; className?: string; depth?: boolean }> = ({ children, className = "", depth = false }) => (
  <div className={`glass-card rounded-2xl p-6 transition-all duration-500 luxury-shadow ${depth ? 'perspective-1000' : ''} ${className}`}>
    <div className={depth ? 'preserve-3d tilt-card' : ''}>
      {children}
    </div>
  </div>
);

const KPICard: React.FC<{ stat: KPIStats, currency: CurrencyCode }> = ({ stat, currency }) => {
  const isPositive = stat.trend === 'up';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const symbol = CURRENCY_SYMBOLS[currency];
  
  return (
    <Card depth className="group overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          {stat.label.includes('Revenue') && <DollarSign size={20} />}
          {stat.label.includes('Burn') && <Activity size={20} />}
          {stat.label.includes('Margin') && <Target size={20} />}
          {!stat.label.includes('Revenue') && !stat.label.includes('Burn') && !stat.label.includes('Margin') && <Activity size={20} />}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500 dark:text-green-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
          <Icon size={12} />
          {stat.prevValue > 0 ? Math.abs(((stat.value - stat.prevValue) / stat.prevValue) * 100).toFixed(1) : '0'}%
        </div>
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
      <h3 className="text-3xl font-black tracking-tighter relative z-10 group-hover:translate-x-1 transition-transform dark:text-white text-slate-900">
        {stat.unit === 'currency' && symbol}
        {stat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        {stat.unit === 'percent' && '%'}
      </h3>
    </Card>
  );
};

const Dashboard: React.FC<{ records: FinancialRecord[]; theme: 'dark' | 'light' }> = ({ records, theme }) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [targets, setTargets] = useState<CEOTarget>({
    fiscal_year: 2024,
    revenue_target: 15000000,
    ebitda_target_pct: 22,
    runway_months: 24,
    effective_from: new Date().toISOString()
  });
  const [isSavingTargets, setIsSavingTargets] = useState(false);

  useEffect(() => {
    const fetchTargets = async () => {
      const { data } = await supabase.from('ceo_targets').select('*').order('effective_from', { ascending: false }).limit(1);
      if (data && data[0]) setTargets(data[0]);
    };
    fetchTargets();
  }, []);

  const handleSaveTargets = async () => {
    setIsSavingTargets(true);
    await supabase.from('ceo_targets').insert([targets]);
    setIsSavingTargets(false);
  };
  
  const currentCurrency = (records[0]?.currency as CurrencyCode) || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currentCurrency];
  const rate = EXCHANGE_RATES[currentCurrency] || 1;
  
  const chartData = getAggregates(records, 'month');
  const healthScore = calculateHealthIndex(records);
  const drivers = getRankedDrivers(records);
  const killers = getRankedKillers(records);

  const handleGenerateBrief = async () => {
    if (records.length === 0) {
      alert("Institutional Ledger is empty. Ingest data to generate an AI performance synthesis.");
      return;
    }
    setIsBriefLoading(true);
    setBriefError(null);
    try {
      const summary = {
        revenue: records.filter(r => r.type === 'REVENUE').reduce((s, r) => s + r.amount, 0),
        currency: currentCurrency,
        healthScore,
        targets,
        topDriver: drivers[0]?.name,
        topKiller: killers[0]?.name
      };
      const result = await generateCFOBrief(summary);
      setBrief(result || 'Unable to generate brief at this time.');
    } catch (err: any) {
      setBriefError("Synthesis temporarily unavailable. Please retry in a moment.");
    } finally {
      setIsBriefLoading(false);
    }
  };

  const revenueTotal = records.filter(r => r.type === 'REVENUE').reduce((s, r) => s + r.amount, 0);
  const burnTotal = records.filter(r => r.type !== 'REVENUE').reduce((s, r) => s + r.amount, 0);
  const burnRate = burnTotal / 10;

  const stats: KPIStats[] = [
    { label: 'EBITDA Goal %', value: targets.ebitda_target_pct, prevValue: 21.2, unit: 'percent', trend: 'up' },
    { label: 'Avg Burn Rate', value: burnRate, prevValue: burnRate * 1.1, unit: 'currency', trend: 'down' },
    { label: 'Gross Margin', value: revenueTotal > 0 ? ((revenueTotal - burnTotal) / revenueTotal) * 100 : 0, prevValue: 65.1, unit: 'percent', trend: 'up' },
    { label: 'Actual Revenue YTD', value: revenueTotal, prevValue: revenueTotal * 0.9, unit: 'currency', trend: 'up' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CEO Target Controls */}
        <Card className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Shield size={14} className="text-blue-500" /> Strategic Baseline (USD)
          </h3>
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase mb-2">Revenue Target</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                <input 
                  type="number" 
                  value={targets.revenue_target}
                  onChange={(e) => setTargets({...targets, revenue_target: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
                />
              </div>
              <p className="mt-2 text-[9px] font-bold text-blue-500 uppercase tracking-tighter italic">
                Currently Viewable as {currencySymbol}{(targets.revenue_target * rate).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase mb-2">EBITDA Goal (%)</label>
              <input 
                type="number" 
                value={targets.ebitda_target_pct}
                onChange={(e) => setTargets({...targets, ebitda_target_pct: parseInt(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase mb-2">Minimum Runway (Mo)</label>
              <input 
                type="number" 
                value={targets.runway_months}
                onChange={(e) => setTargets({...targets, runway_months: parseInt(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
              />
            </div>
          </div>
          <button 
            onClick={handleSaveTargets}
            disabled={isSavingTargets}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {/* Added missing Loader2 from lucide-react */}
            {isSavingTargets ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Commit Baseline Targets
          </button>
        </Card>

        {/* AI Narrative */}
        <Card className="lg:col-span-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/20 border-slate-200 dark:border-slate-700/30 overflow-hidden group min-h-[300px] flex flex-col shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
            <Zap className="text-blue-400" size={120} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 flex items-center gap-2">
              <FileText size={14} /> AI Performance Synthesis
            </h3>
            {(brief || briefError) && !isBriefLoading && (
              <button onClick={handleGenerateBrief} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-500 transition-all">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            {isBriefLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">Scanning {currentCurrency} Records...</p>
              </div>
            ) : briefError ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <AlertCircle className="text-red-500" size={32} />
                <p className="text-sm text-red-500 dark:text-red-400 font-medium leading-relaxed">{briefError}</p>
                <button onClick={handleGenerateBrief} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 transition-all">Retry</button>
              </div>
            ) : brief ? (
              <div className="text-slate-700 dark:text-slate-300 text-sm leading-loose whitespace-pre-line font-medium animate-in slide-in-from-bottom-2 duration-500">
                {brief}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700/50">
                   <Sparkles size={32} />
                </div>
                <div className="max-w-xs space-y-2">
                   <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Executive Briefing Node</h4>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">Cross-referencing institutional targets against actual performance in <strong>{currentCurrency}</strong>.</p>
                </div>
                <button onClick={handleGenerateBrief} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                  <Sparkles size={14} /> Run Performance Audit
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Health */}
        <Card className="lg:col-span-3 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/10 border-blue-500/20 group overflow-hidden shadow-sm">
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 flex items-center gap-2">
              <ShieldCheck size={14} /> Operational Health
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center py-4">
             <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - healthScore/100)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{healthScore}</span>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                </div>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium max-w-[180px]">Ledger integrity is optimal relative to strategic benchmarks.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => <KPICard key={stat.label} stat={stat} currency={currentCurrency} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 dark:bg-slate-900/20 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Institutional Growth Matrix ({currentCurrency})</h3>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">YTD Actuals Trajectory</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Profit</span>
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            {records.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark:stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontBold="bold" />
                  <YAxis stroke="#94a3b8" fontSize={10} fontBold="bold" tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
                  <Tooltip 
                    formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toLocaleString()}`, '']}
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#020617' : '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '16px',
                      color: theme === 'dark' ? '#ffffff' : '#000000'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} strokeDasharray="6 4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                 <Database size={48} className="opacity-20" />
                 <p className="text-xs font-black uppercase tracking-widest">Registry Empty: Ingest artifacts to populate growth node</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900/40 p-0 overflow-hidden min-h-[400px] shadow-sm">
           <div className="p-6 pb-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Target size={14} /> Multi-Node Sales Ingestion
              </h3>
           </div>
           <GlobeSalesMap />
        </Card>
      </div>
      
      {brief && !isBriefLoading && <AudioBrief summary={brief} />}
    </div>
  );
};

export default Dashboard;
