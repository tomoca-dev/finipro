import React from 'react';
import { 
  TrendingUp, ShieldCheck, Activity, Landmark, 
  ArrowUpRight, ArrowDownRight, AlertCircle, 
  FileText, Clock, BarChart3, Zap, Lock, ChevronRight, Sparkles, Database, History, Bot
} from 'lucide-react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`sage-glass rounded-[40px] p-8 border-0 luxury-shadow relative overflow-hidden group ${className}`}>
    {children}
  </div>
);

const SageDashboard: React.FC = () => {
  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-1000 max-w-[1700px] mx-auto pb-24">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Governance Node</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Company Snapshot</h2>
          <div className="flex items-center gap-6 mt-6">
             <p className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-3 tracking-widest italic leading-none">
               <ShieldCheck size={16} className="text-indigo-600" /> Statutory Integrity: <span className="text-indigo-600">100% SEALED</span>
             </p>
             <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10"></div>
             <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest italic leading-none focus-within:">
               Period: <span className="text-slate-900 dark:text-white">April 2026 Fiscal</span>
             </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-8 py-4 bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[28px] luxury-shadow flex flex-col justify-center">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1.5">Last Audit Heartbeat</p>
            <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock size={12} className="text-indigo-500" /> 14:59:18 UTC+3
            </p>
          </div>
          <button className="px-10 py-5 bg-indigo-600 text-white rounded-[28px] font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3">
             <Bot size={18} /> Neural Sanity Check
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <SnapshotCard 
          label="Institutional Liquidity" 
          value="Br 4,821,000" 
          trend="+12.4%" 
          isPositive={true}
          icon={<Landmark size={24} />}
          color="text-indigo-600"
          bg="bg-indigo-500/5 dark:bg-indigo-500/10"
        />
        <SnapshotCard 
          label="Unposted Liabilities" 
          value="Br 124,500" 
          trend="-2.1%" 
          isPositive={true}
          icon={<Activity size={24} />}
          color="text-amber-500"
          bg="bg-amber-500/5 dark:bg-amber-500/10"
        />
        <SnapshotCard 
          label="Tax Provision (MTD)" 
          value="Br 842,000" 
          trend="+5.0%" 
          isPositive={false}
          icon={<FileText size={24} />}
          color="text-red-500"
          bg="bg-red-500/5 dark:bg-red-500/10"
        />
        <SnapshotCard 
          label="Net Operating Surplus" 
          value="Br 1,290,400" 
          trend="+18.2%" 
          isPositive={true}
          icon={<BarChart3 size={24} />}
          color="text-emerald-500"
          bg="bg-emerald-500/5 dark:bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <Card className="p-12">
             <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <TrendingUp size={300} className="text-slate-900 dark:text-white" />
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-16 px-2">
                   <div className="flex items-center gap-5">
                      <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600 border border-indigo-500/20">
                         <TrendingUp size={24} />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Consolidated Yield Curve</h3>
                   </div>
                   <div className="flex gap-3">
                      <span className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly</span>
                      <span className="px-5 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/10">Institutional</span>
                   </div>
                </div>
                <div className="h-80 flex items-end justify-between gap-6 px-4">
                   {[40, 65, 45, 90, 75, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 group relative h-full flex items-end">
                         <div 
                           className="w-full bg-slate-50 dark:bg-white/[0.01] rounded-t-[20px] transition-all group-hover:bg-indigo-500/[0.03]" 
                           style={{ height: '100%' }}
                         ></div>
                         <div 
                           className="absolute bottom-0 w-full bg-indigo-600 rounded-t-[20px] transition-all group-hover:bg-indigo-400 group-hover:scale-y-[1.02] origin-bottom shadow-2xl shadow-indigo-900/30" 
                           style={{ height: `${h}%` }}
                         ></div>
                         <div className="absolute -top-12 left-1/2 -track-wide -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-2 whitespace-nowrap z-20">
                            <span className="bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl text-[11px] font-black data-cell shadow-2xl">Br {h*10}k</span>
                            <div className="w-2 h-2 bg-slate-900 dark:bg-white rotate-45 mx-auto -mt-1 shadow-2xl"></div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-10 px-6">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60 italic">{d}</span>
                   ))}
                </div>
             </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <Card className="bg-slate-950 text-white border-0 shadow-[0_0_100px_rgba(79,70,229,0.15)]">
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                   <Lock size={180} strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="flex items-center gap-4 mb-8">
                         <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <ShieldCheck size={28} />
                         </div>
                         <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">WORM Integrity</h4>
                      </div>
                      <p className="text-sm text-slate-400 font-bold italic uppercase tracking-tight leading-loose mb-10 opacity-80">
                        "No unauthorized modifications detected in sealed journals for active fiscal interval. All cryptographic hash signatures are institutional-grade aligned."
                      </p>
                   </div>
                   <button className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 hover:text-indigo-300 flex items-center gap-3 transition-colors group">
                      Open Forensic Log Registry <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </Card>
             <Card className="bg-white/50 dark:bg-white/[0.01]">
                <div className="flex flex-col h-full justify-between relative z-10">
                   <div>
                      <div className="flex justify-between items-start mb-10">
                         <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 shadow-inner">
                               <AlertCircle size={28} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Neural Outlier</h4>
                         </div>
                         <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-xl shadow-red-900/20 animate-pulse">Critical</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight leading-loose opacity-80">
                        <span className="text-red-500 font-black">Bole Flagship Node</span> detected 4.2% negative variance in COGS/Revenue ratio vs established 12-month baseline.
                      </p>
                   </div>
                   <button className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mt-10 hover:scale-[1.02] transition-all shadow-2xl active:scale-95">
                      Initialize Mitigation Sequence
                   </button>
                </div>
             </Card>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
           <Card className="bg-white/30 dark:bg-white/[0.01] p-10">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 italic">
                    <Clock size={18} className="text-indigo-500" /> Event Egress Node
                 </h3>
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="space-y-12 relative">
                 <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-white/5"></div>
                 <EventRow time="14:59" label="Neural Handshake" detail="CBE Institutional Feeds successfully indexed." status="COMPLETE" />
                 <EventRow time="13:14" label="Payroll Sealed" detail="Statutory filing PR-2026-04 archived." status="COMPLETE" />
                 <EventRow time="11:45" label="Variance Detected" detail="Manual adjustment in 'Kazanchis' branch node." status="WARNING" />
                 <EventRow time="09:00" label="Fiscal Period Open" detail="Institutional interval April 2026 initialized." status="STABLE" />
              </div>
              <button className="w-full py-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-600 transition-all shadow-xl mt-12 group">
                 View Immutable Audit Trail <ChevronRight size={14} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
           </Card>

           <Card className="bg-indigo-600 text-white shadow-[0_40px_100px_rgba(79,70,229,0.4)] border-0">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                 <Activity size={180} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <div className="p-4 bg-white/10 rounded-3xl border border-white/20 shadow-inner">
                      <Sparkles size={28} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-70">Strategic Trust</p>
                      <p className="text-5xl font-black font-mono tracking-tighter leading-none data-cell">98.2%</p>
                   </div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-10">Institutional Health Matrix</h4>
                <div className="space-y-6 pt-10 border-t border-white/10">
                   <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] italic">
                      <span className="opacity-70">Cash Coverage Ratio</span>
                      <span className="text-emerald-300">EXCELLENT</span>
                   </div>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className="bg-white h-full w-[88%] shadow-[0_0_15px_white]"></div>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] italic mt-4">
                      <span className="opacity-70">Liability Delta Index</span>
                      <span className="text-white">OPTIMIZED</span>
                   </div>
                </div>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  );
};

const SnapshotCard: React.FC<{ label: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, color: string, bg: string }> = ({ label, value, trend, isPositive, icon, color, bg }) => (
  <Card className="hover:scale-[1.02] transition-all p-10 cursor-pointer">
    <div className="flex justify-between items-start mb-8">
      <div className={`p-4 rounded-[24px] ${color} ${bg} shadow-inner group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black data-cell ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {trend}
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 opacity-60 italic">{label}</p>
    <p className="text-3xl font-black text-slate-900 dark:text-white data-cell tracking-tighter leading-none">{value}</p>
  </Card>
);

const EventRow: React.FC<{ time: string, label: string, detail: string, status: 'COMPLETE' | 'WARNING' | 'STABLE' }> = ({ time, label, detail, status }) => (
  <div className="group flex gap-8">
    <div className="flex flex-col items-center">
      <div className={`w-3.5 h-3.5 rounded-full mt-1.5 z-10 border-4 border-white dark:border-[#0b0f1a] shadow-[0_0_15px_rgba(99,102,241,0.5)] ${status === 'COMPLETE' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-indigo-500 font-mono tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase">{time}</span>
        <h5 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none italic">{label}</h5>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight leading-relaxed opacity-70 italic max-w-[200px]">{detail}</p>
    </div>
  </div>
);

export default SageDashboard;
