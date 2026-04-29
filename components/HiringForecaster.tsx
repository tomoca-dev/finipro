
import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Play, RefreshCcw, Layout, ChevronRight, Briefcase } from 'lucide-react';
import { forecastHiringROI } from '../services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../services/dataEngine';
import { CurrencyCode } from '../types';

const HiringForecaster: React.FC<{ currency?: CurrencyCode, theme?: 'dark' | 'light' }> = ({ currency = 'USD', theme = 'dark' }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const rate = EXCHANGE_RATES[currency] || 1;

  const [scenario, setScenario] = useState({
    role: 'Senior Software Engineer',
    salary: 160000,
    type: 'FULL_TIME',
    rampUpMonths: 3,
    productivityLift: 25000
  });

  const runSimulation = async () => {
    setIsSimulating(true);
    // Convert current salary to USD for the backend if needed, or pass current context
    const data = await forecastHiringROI({
        ...scenario,
        salary: scenario.salary / rate, // Always simulate based on USD baseline
    });
    
    // Scale results back to display currency
    const scaledResult = {
        ...data,
        netAnnualGain: data.netAnnualGain * rate,
    };
    setResult(scaledResult);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <Users className="text-blue-600" /> Hiring ROI Node
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Model headcount decisions and their projected productivity impact in <strong>{currency}</strong>.</p>
        </div>
        <button onClick={runSimulation} disabled={isSimulating} className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/40">
          {isSimulating ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          {isSimulating ? 'Forecasting...' : 'Execute Model'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 space-y-10 luxury-shadow shadow-xl h-fit">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-6">Role Configuration</h3>
           
           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Target Role Spec</label>
                <input 
                  type="text" value={scenario.role}
                  onChange={(e) => setScenario({...scenario, role: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none font-bold dark:text-white shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Base Compensation ({currency})</label>
                <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">{symbol}</span>
                   <input 
                    type="number" value={scenario.salary}
                    onChange={(e) => setScenario({...scenario, salary: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none font-black dark:text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setScenario({...scenario, type: 'FULL_TIME'})}
                   className={`p-6 rounded-[24px] border text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 shadow-sm ${
                     scenario.type === 'FULL_TIME' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                   }`}
                 >
                   <Briefcase size={24} />
                   Institutional FT
                 </button>
                 <button 
                   onClick={() => setScenario({...scenario, type: 'CONTRACTOR'})}
                   className={`p-6 rounded-[24px] border text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-3 shadow-sm ${
                     scenario.type === 'CONTRACTOR' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                   }`}
                 >
                   <Layout size={24} />
                   Contractor Node
                 </button>
              </div>

              <div>
                <label className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-4 tracking-widest">
                  Ramp-Up Duration
                  <span className="text-blue-600 dark:text-blue-400">{scenario.rampUpMonths} Months</span>
                </label>
                <input 
                  type="range" min="1" max="12" step="1" 
                  value={scenario.rampUpMonths}
                  onChange={(e) => setScenario({...scenario, rampUpMonths: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
           {result ? (
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 group hover:border-blue-500/50 transition-all luxury-shadow shadow-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Payback Period (Mo)</p>
                     <p className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter font-mono">{result.paybackMonths}</p>
                     <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit Lift</span>
                        <span className="text-lg font-black text-green-600 dark:text-green-400 tracking-tight">+{symbol}{result.netAnnualGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                     </div>
                  </div>
                  <div className="bg-blue-600 border border-blue-500 rounded-3xl p-8 shadow-2xl shadow-blue-900/30 flex flex-col justify-between">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-4 opacity-70">Institutional Recommendation</p>
                        <p className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{result.recommendation}</p>
                        <p className="text-sm text-blue-50 font-medium leading-relaxed italic opacity-90">"{result.rationale}"</p>
                     </div>
                     <div className="pt-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Strategy Finalized</span>
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-12 luxury-shadow shadow-2xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-12">Productivity Ramp Sensitivity</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.productivityGraph}>
                        <defs>
                          <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                        <Tooltip 
                          contentStyle={
                            theme === 'dark' 
                              ? { backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }
                              : { backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '16px' }
                          }
                        />
                        <Area type="monotone" dataKey="productivity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProd)" strokeWidth={5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
             </>
           ) : (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-[48px] h-full flex flex-col items-center justify-center text-center p-20 space-y-10 luxury-shadow">
                <div className="w-28 h-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[48px] flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-inner animate-float">
                   <Users size={64} />
                </div>
                <div>
                   <h4 className="text-3xl font-black text-slate-800 dark:text-slate-400 tracking-tighter uppercase">ROI Simulator Node</h4>
                   <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">Input role specifications in <strong>{currency}</strong> to project institutional payback periods and ramp-up sensitivity.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HiringForecaster;
