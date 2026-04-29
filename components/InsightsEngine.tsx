
import React, { useState } from 'react';
import { BrainCircuit, Search, ChevronRight, Zap, Target, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { analyzeRootCause } from '../services/geminiService';

const InsightsEngine: React.FC = () => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState<any>(null);

  const insights = [
    { id: '1', title: 'Marketing ROI Decay', impact: '-$12,400 Monthly', type: 'NEGATIVE', category: 'Efficiency', status: 'High Confidence' },
    { id: '2', title: 'Infrastructure Savings Opportunity', impact: '+$8,200 Monthly', type: 'POSITIVE', category: 'Optimization', status: 'Policy Driven' },
    { id: '3', title: 'Unexpected Payroll Spike', impact: '+$45,000 Total', type: 'NEGATIVE', category: 'Anomaly', status: 'Investigation Needed' },
  ];

  const handleRootCause = async (ins: any) => {
    setAnalyzingId(ins.id);
    const result = await analyzeRootCause({ variance: ins.impact, label: ins.title });
    setRootCause(result);
    setAnalyzingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Activity size={14} /> Active Pattern Detection
          </h3>
          {insights.map(ins => (
            <button 
              key={ins.id}
              onClick={() => handleRootCause(ins)}
              className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden group luxury-shadow ${
                analyzingId === ins.id ? 'bg-blue-600/10 border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  ins.type === 'POSITIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {ins.category}
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{ins.title}</h4>
              <p className={`text-sm font-black ${ins.type === 'POSITIVE' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {ins.impact}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                <Zap size={10} className="text-yellow-500" />
                {ins.status}
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden luxury-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
            
            {!rootCause && !analyzingId ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center mx-auto text-blue-500 shadow-inner">
                  <BrainCircuit size={48} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pattern Diagnosis Node</h4>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">Select a detected pattern to trace its lineage. Our AI will suggest root causes and tactical responses.</p>
                </div>
              </div>
            ) : analyzingId ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest animate-pulse text-xs">Running Neural Performance Synthesis...</p>
              </div>
            ) : (
              <div className="w-full space-y-10 animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-purple-600/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
                    <Target size={40} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">Institutional Diagnosis</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Confidence Score: <span className="text-blue-500">{(rootCause.confidence * 100).toFixed(0)}%</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-blue-500/30 transition-all">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Search size={14} className="text-blue-500" /> Probable Root Cause
                    </h5>
                    <p className="text-lg text-slate-900 dark:text-slate-100 font-medium leading-relaxed italic">
                      "{rootCause.cause}"
                    </p>
                  </div>

                  <div className="p-8 bg-blue-600/5 rounded-3xl border border-blue-200 dark:border-blue-500/20 space-y-4 shadow-sm group hover:border-blue-500/50 transition-all">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Zap size={14} /> Tactical Response
                    </h5>
                    <p className="text-lg text-blue-900 dark:text-blue-100 font-bold leading-relaxed">
                      {rootCause.recommendation}
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Lineage & Data Trace</h5>
                   <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center gap-4 text-xs font-mono">
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                         <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                         <span className="text-slate-400 dark:text-slate-500">CANONICAL_LOG_BLOCK_{i*142}_EXTRACT</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsEngine;
