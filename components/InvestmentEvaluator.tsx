
import React, { useState } from 'react';
import { Briefcase, TrendingUp, DollarSign, Activity, Play, RefreshCcw, Layout, Target, PieChart, AlertCircle } from 'lucide-react';
import { evaluateInvestmentProject } from '../services/geminiService';

const InvestmentEvaluator: React.FC = () => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [project, setProject] = useState({
    name: 'New Logistics Hub Expansion',
    initialOutlay: 1200000,
    annualCashFlows: [200000, 450000, 600000, 800000, 950000],
    discountRate: 10
  });

  const runEvaluation = async () => {
    setIsEvaluating(true);
    const data = await evaluateInvestmentProject(project);
    setResult(data);
    setIsEvaluating(false);
  };

  const handleFlowChange = (index: number, value: string) => {
    const newFlows = [...project.annualCashFlows];
    newFlows[index] = parseInt(value) || 0;
    setProject({ ...project, annualCashFlows: newFlows });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <Briefcase className="text-indigo-600" /> CapEx Evaluator
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">NPV, IRR, and AI strategic prioritization for major institutional capital projects.</p>
        </div>
        <button onClick={runEvaluation} disabled={isEvaluating} className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-900/30">
          {/* Fix: Replaced undefined RefreshCw icon with RefreshCcw which is imported from lucide-react */}
          {isEvaluating ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          {isEvaluating ? 'Evaluating...' : 'Run Valuation Engine'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 space-y-10 luxury-shadow h-fit shadow-xl">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-6">Project Schematics</h3>
           
           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Investment Name</label>
                <input 
                  type="text" value={project.name}
                  onChange={(e) => setProject({...project, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none font-bold dark:text-white shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">Outlay ($)</label>
                    <input 
                      type="number" value={project.initialOutlay}
                      onChange={(e) => setProject({...project, initialOutlay: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none font-black dark:text-white shadow-inner"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">WACC / Discount (%)</label>
                    <input 
                      type="number" value={project.discountRate}
                      onChange={(e) => setProject({...project, discountRate: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none font-black dark:text-white shadow-inner"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-6 tracking-widest">Projected Annual Cash Flows (5Y)</label>
                 <div className="space-y-4">
                    {project.annualCashFlows.map((flow, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-400 w-10 uppercase tracking-widest">YR {i+1}</span>
                          <input 
                            type="number" value={flow}
                            onChange={(e) => handleFlowChange(i, e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none font-bold dark:text-white shadow-inner"
                          />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-10">
           {result ? (
             <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {[
                    { label: 'Net Present Value', val: `$${result.npv.toLocaleString()}`, color: result.npv > 0 ? 'text-green-600' : 'text-red-600' },
                    { label: 'Internal Rate (%)', val: `${result.irr}%`, color: 'text-indigo-600 dark:text-indigo-400' },
                    { label: 'Strategic Fit', val: `${result.strategicFitScore}/100`, color: 'text-slate-900 dark:text-white' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/20 dark:shadow-none">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                       <p className={`text-2xl font-black font-mono tracking-tighter ${stat.color}`}>
                          {stat.val}
                       </p>
                    </div>
                  ))}
               </div>

               <div className={`p-10 rounded-[48px] border-2 shadow-2xl transition-all luxury-shadow ${
                 result.decision === 'APPROVE' ? 'bg-green-500/5 border-green-500/20 shadow-green-900/10' : 
                 result.decision === 'REJECT' ? 'bg-red-500/5 border-red-500/20 shadow-red-900/10' : 
                 'bg-amber-500/5 border-amber-500/20 shadow-amber-900/10'
               }`}>
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-[28px] shadow-lg ${
                          result.decision === 'APPROVE' ? 'bg-green-600 text-white shadow-green-900/40' : 
                          'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}>
                           <Target size={32} />
                        </div>
                        <div>
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Board Recommendation</h4>
                           <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{result.decision}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hidden sm:block">Engine v4.2 Trace</span>
                  </div>
                  <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic border-l-4 border-slate-200 dark:border-slate-800 pl-8">
                     "{result.rationale}"
                  </p>
                  <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <button className="px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                        Edit Assumptions
                     </button>
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit State: SEALED</span>
                     </div>
                  </div>
               </div>
             </>
           ) : (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-[64px] h-full flex flex-col items-center justify-center text-center p-20 space-y-10 luxury-shadow">
                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[56px] flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-inner animate-float shadow-xl">
                   <Briefcase size={64} />
                </div>
                <div>
                   <h4 className="text-3xl font-black text-slate-800 dark:text-slate-400 tracking-tighter uppercase">CapEx Valuation Sink</h4>
                   <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">Enter initial outlay and 5-year cash flow projections to trigger the institutional NPV and IRR analysis engine.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentEvaluator;
