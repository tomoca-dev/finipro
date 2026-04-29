
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Zap, ShoppingCart, CheckCircle2, ShieldCheck, Plus, 
  Filter, Search, Grid, List, Loader2, Play, Power, PowerOff,
  Terminal, History, Settings2, X, Save, ArrowRight, Activity,
  Database, Network, Fingerprint, Code2
} from 'lucide-react';
import { WorkflowAutomation } from '../../types';

const SageAutomationMarket: React.FC = () => {
  const [automations, setAutomations] = useState<WorkflowAutomation[]>([
    { id: 'wa-1', name: 'Master GL Mapper', category: 'RECON', isActive: true, successRate: 99.8 },
    { id: 'wa-2', name: 'Retail POS Ingress', category: 'SYNC', isActive: false, successRate: 94.2 }
  ]);

  const [isConstructing, setIsConstructing] = useState(false);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', source: 'EXCEL_COLUMN', target: 'GL_ACCOUNT', logic: 'DETERMINISTIC' });

  useEffect(() => {
    const interval = setInterval(() => {
      setAutomations(prev => prev.map(a => ({
        ...a,
        successRate: a.isActive ? Math.max(90, Math.min(100, a.successRate + (Math.random() * 0.2 - 0.1))) : a.successRate
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDeploy = (id: string) => {
    setDeployingId(id);
    setTimeout(() => {
      setAutomations(prev => prev.map(wa => wa.id === id ? { ...wa, isActive: !wa.isActive } : wa));
      setDeployingId(null);
    }, 1800);
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) return;
    const wa: WorkflowAutomation = {
      id: `wa-${Date.now()}`,
      name: newWorkflow.name,
      category: 'RECON',
      isActive: true,
      successRate: 100
    };
    setAutomations([wa, ...automations]);
    setIsConstructing(false);
    setNewWorkflow({ name: '', source: 'EXCEL_COLUMN', target: 'GL_ACCOUNT', logic: 'DETERMINISTIC' });
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Automation Marketplace</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Provision Institutional Sync Nodes & Mapping Heuristics</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsConstructing(true)}
             className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-2"
           >
              <Plus size={18} /> Construct Workflow
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {automations.map(wa => (
            <div key={wa.id} className={`bg-white dark:bg-slate-900 border-2 rounded-[40px] p-8 flex flex-col group transition-all luxury-shadow overflow-hidden relative ${
              wa.isActive ? 'border-indigo-500 shadow-indigo-900/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
               <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-600 group-hover:scale-125 transition-transform duration-700"><Zap size={80} /></div>
               
               <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${
                    wa.isActive ? 'bg-indigo-600 text-white shadow-indigo-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                     <Cpu size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${
                      wa.isActive ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}>
                      {deployingId === wa.id ? 'VERIFYING...' : wa.isActive ? 'DEPLOYED' : 'IDLE'}
                    </div>
                  </div>
               </div>

               <div className="flex-1 space-y-3">
                  <h4 className={`text-base font-black uppercase tracking-tight leading-tight transition-colors ${wa.isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {wa.name}
                  </h4>
                  <div className="flex items-center gap-2">
                     <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">v4.2.1-PROD</span>
                     <span className="text-[8px] font-black bg-blue-500/10 px-2 py-1 rounded text-blue-600 uppercase tracking-widest">Protocol: HTTPS</span>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Reliability Index</p>
                     <p className={`text-xl font-black font-mono transition-colors ${wa.isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{wa.successRate.toFixed(2)}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveLogId(activeLogId === wa.id ? null : wa.id)}
                      className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                       <History size={20} />
                    </button>
                    <button 
                      onClick={() => handleToggleDeploy(wa.id)}
                      disabled={deployingId === wa.id}
                      className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                        deployingId === wa.id ? 'bg-slate-100 dark:bg-slate-800 animate-pulse' :
                        wa.isActive ? 'bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white' : 
                        'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/30'
                      }`}
                    >
                       {deployingId === wa.id ? <Loader2 size={20} className="animate-spin" /> : 
                        wa.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                    </button>
                  </div>
               </div>

               {activeLogId === wa.id && (
                  <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 animate-in slide-in-from-top-4">
                     <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={10} /> Execution Trace
                     </p>
                     <div className="space-y-2 font-mono text-[9px]">
                        <div className="flex justify-between text-slate-500 border-b border-white/5 pb-1">
                           <span>{new Date().toLocaleTimeString()}</span>
                           <span className="text-green-500">HANDSHAKE_OK</span>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         ))}

         <div 
           onClick={() => setIsConstructing(true)}
           className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] p-8 flex flex-col items-center justify-center text-center group hover:border-indigo-500/50 transition-all bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer"
         >
            <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:rotate-12 transition-all mb-4 shadow-sm">
               <Plus size={32} />
            </div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Construct Logic Node</h4>
         </div>
      </div>

      {isConstructing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-900/30"><Code2 size={28} /></div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Workflow Architect</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Define automated mapping heuristic</p>
                    </div>
                 </div>
                 <button onClick={() => setIsConstructing(false)} className="p-4 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm"><X size={24} /></button>
              </div>
              
              <div className="p-12 space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Workflow Descriptor</label>
                    <input 
                      type="text" 
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      placeholder="e.g. Retail POS Mapping..."
                    />
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-black/40 border-t-2 border-slate-100 dark:border-slate-800 flex gap-6">
                 <button onClick={() => setIsConstructing(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Abort</button>
                 <button 
                  onClick={handleCreateWorkflow}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 shadow-indigo-900/40"
                 >
                    <Save size={20} /> Deploy to Sync Environment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageAutomationMarket;
