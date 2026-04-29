
import React, { useState, useEffect } from 'react';
import { Leaf, Wind, ShieldCheck, Globe, TrendingUp, Zap, HelpCircle, AlertCircle, RefreshCw, Sparkles, Database, ArrowRight } from 'lucide-react';
import { synthesizeESGImpact } from '../services/geminiService';

const ImpactDashboard: React.FC<{ records: any[] }> = ({ records }) => {
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<'QUOTA' | 'GENERAL' | null>(null);

  const fetchImpact = async () => {
    if (records.length === 0) return;
    setIsLoading(true);
    setErrorType(null);
    try {
      const data = await synthesizeESGImpact({ 
        opex: records.filter(r => r.type === 'OPEX').slice(0, 15),
        revenue: records.filter(r => r.type === 'REVENUE').reduce((s, r) => s + r.amount, 0)
      });
      setImpactData(data);
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setErrorType('QUOTA');
      } else {
        setErrorType('GENERAL');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, [records]);

  const useFallback = () => {
    setImpactData({
      carbonTons: 142.5,
      impactScore: 78,
      governanceRating: 'A-',
      offsetEstimate: 12400,
      initiatives: [
        { name: 'Cloud Node Consolidation', impact: 'Reduce server footprint by 15%', cost: 4500 },
        { name: 'Travel Offset Program', impact: '100% carbon neutral flights', cost: 8000 },
        { name: 'Supply Chain Optimization', impact: 'Transition to Grade-A low-carbon vendors', cost: 12000 }
      ]
    });
    setErrorType(null);
  };

  if (records.length === 0) return (
    <div className="h-[600px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center p-12 luxury-shadow animate-in fade-in duration-700">
       <div className="w-24 h-24 bg-green-500/10 text-green-600 rounded-[40px] flex items-center justify-center mb-8 shadow-inner animate-float">
          <Leaf size={48} />
       </div>
       <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic">ESG Node Inactive</h3>
       <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 font-medium leading-relaxed mb-10">
         Institutional impact analytics require ledger data to initialize. Provision a sales artifact or expense report in the **Ingestion Node** to compute your sustainability profile.
       </p>
       <div className="flex gap-4">
          <button onClick={useFallback} className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-50">View Sample Snapshot</button>
       </div>
    </div>
  );

  if (isLoading) return (
    <div className="h-[600px] flex flex-col items-center justify-center space-y-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[48px] luxury-shadow">
      <div className="relative">
        <RefreshCw className="animate-spin text-green-600 opacity-20" size={120} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={48} className="text-green-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-3">
         <p className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">Mapping Ledger to ESG Benchmarks</p>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Running Institutional Sustainability Synthesis...</p>
      </div>
    </div>
  );

  if (errorType === 'QUOTA') return (
    <div className="h-[500px] flex flex-col items-center justify-center space-y-10 text-center animate-in zoom-in-95">
      <div className="p-8 bg-amber-500/10 rounded-[48px] border border-amber-500/20 shadow-xl shadow-amber-900/10">
        <AlertCircle className="text-amber-600" size={80} />
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase">API Node Quota Hit</h3>
        <p className="text-slate-500 font-medium text-base mt-3 max-w-sm mx-auto leading-relaxed">Your institutional Gemini quota has been reached. Use a simulated ESG snapshot for local modeling.</p>
      </div>
      <div className="flex gap-6">
        <button onClick={fetchImpact} className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-50">Retry Live Sync</button>
        <button onClick={useFallback} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-900/30 transition-all">Generate Mock Snapshot</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Carbon Footprint', val: `${impactData?.carbonTons}t`, color: 'text-green-600 dark:text-green-400', icon: <Wind size={14} /> },
          { label: 'Institutional Score', val: `${impactData?.impactScore}/100`, color: 'text-blue-600 dark:text-blue-400', icon: <TrendingUp size={14} /> },
          { label: 'Governance Grade', val: impactData?.governanceRating, color: 'text-indigo-600 dark:text-indigo-400', icon: <ShieldCheck size={14} /> },
          { label: 'Projected Offset (Br)', val: `${impactData?.offsetEstimate?.toLocaleString()}`, color: 'text-emerald-600 dark:text-emerald-400', icon: <Database size={14} /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[32px] luxury-shadow shadow-xl group hover:border-green-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
               <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            </div>
            <p className={`text-3xl font-black font-mono tracking-tighter ${stat.color} group-hover:translate-x-1 transition-transform`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-12 luxury-shadow shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-green-600 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Leaf size={240} /></div>
        
        <div className="flex justify-between items-start mb-12 relative z-10">
           <div>
              <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white uppercase tracking-tight italic">
                <Zap className="text-amber-500" /> Strategic Impact Initiatives
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">Neural recommendations for footprint optimization and offset efficiency.</p>
           </div>
           <button onClick={fetchImpact} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-green-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"><RefreshCw size={20} /></button>
        </div>

        <div className="space-y-6 relative z-10">
          {impactData?.initiatives?.map((item: any, i: number) => (
            <div key={i} className="p-8 bg-slate-50/50 dark:bg-slate-950/40 rounded-[32px] border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-green-500/40 transition-all shadow-sm">
              <div className="flex gap-8 items-center">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-[24px] shadow-md border border-slate-100 dark:border-slate-800 text-green-600 group-hover:rotate-6 transition-transform">
                   <Leaf size={32} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-xl uppercase tracking-tight leading-none">{item.name}</h4>
                  <p className="text-base text-slate-500 font-medium italic mt-2 leading-relaxed">"{item.impact}"</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter font-mono">Br {item.cost.toLocaleString()}</p>
                <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-[0.2em]">Allocated OpEx Node</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center relative z-10">
           <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2"><Globe size={16} className="text-blue-500" /> Global North Monitoring: ACTIVE</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Audit Integrity: SHA-256</span>
           </div>
           <button className="px-12 py-5 bg-green-600 hover:bg-green-500 text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-green-900/40 transition-all flex items-center gap-3">
              Generate Official Sustainability Deck <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
