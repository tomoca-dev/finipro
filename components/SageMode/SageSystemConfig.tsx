

import React, { useState } from 'react';
import { Lock, ShieldAlert, Zap, Calculator, Plus, Trash2, Save, Target, ShieldCheck, Globe, Clock, DollarSign, History, Shield, RefreshCw, Loader2, Key } from 'lucide-react';
// Fix: Corrected ValidationIssue import and removed unused ROIMetric
import { User, ValidationIssue, UserRole, SecurityPolicy } from '../../types';

interface SageSystemConfigProps {
  user: User;
}

const SageSystemConfig: React.FC<SageSystemConfigProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'LOCAL' | 'RETENTION'>('MATRIX');
  const [isPersisting, setIsPersisting] = useState(false);
  const [policy, setPolicy] = useState<SecurityPolicy>({
    samlEnabled: true,
    mfaRequired: true,
    wormAuditActive: true,
    dataResidency: 'EU',
    retentionYears: 7
  });

  const [thresholds, setThresholds] = useState<Record<string, number>>({
    'CEO': 1000000,
    'FINANCE': 150000,
    'MANAGER': 50000,
    'STAFF': 5000
  });

  const handleUpdateThreshold = (role: string, val: number) => {
    setThresholds(prev => ({ ...prev, [role]: val }));
  };

  const handlePersistRegistry = () => {
    setIsPersisting(true);
    setTimeout(() => {
      setIsPersisting(false);
      alert("Institutional Logic Persisted. Registry Hash: 0x99A...B82 Sealed.");
    }, 2000);
  };

  if (user.role !== 'FINANCE' && user.role !== 'CEO' && user.role !== 'ADMIN') {
    return (
      <div className="p-20 text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner border border-red-500/20">
           <ShieldAlert size={48} />
        </div>
        <div>
           <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Institutional Lock Active</h3>
           <p className="text-slate-500 max-w-sm mx-auto font-medium mt-2 leading-relaxed">Configuring institutional rules is restricted to Root Admin and Finance Lead nodes.</p>
        </div>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Request Temporary Auth</button>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Policy Matrix</h2>
          <p className="text-sm text-slate-500 font-medium">Institutional Logic & Global Defaults</p>
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-inner">
           {[
             { id: 'MATRIX', label: 'Approval Matrix', icon: <Lock size={12} /> },
             { id: 'LOCAL', label: 'Localization', icon: <Globe size={12} /> },
             { id: 'RETENTION', label: 'Retention Window', icon: <Clock size={12} /> },
           ].map(t => (
             <button 
               key={t.id} 
               onClick={() => setActiveTab(t.id as any)} 
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
               {t.icon} {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {activeTab === 'MATRIX' && (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10 animate-in slide-in-from-left-4 duration-500">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                       <Lock size={24} className="text-indigo-600" /> Statutory Approval Matrix
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase">
                       <ShieldCheck size={14} /> Matrix Enforced
                    </div>
                 </div>
                 <div className="space-y-4">
                    {Object.entries(thresholds).map(([role, amount]) => (
                       <div key={role} className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-500/40 transition-all shadow-sm">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner">
                                <Key size={20} />
                             </div>
                             <div>
                                <span className="font-black uppercase tracking-widest text-slate-500 text-[10px]">{role} Node Level</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Institutional Signing Authority</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <DollarSign size={16} className="text-slate-400" />
                             <input 
                              type="number" 
                              value={amount} 
                              onChange={(e) => handleUpdateThreshold(role, parseInt(e.target.value) || 0)}
                              className="w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-mono font-black text-right text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20" 
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {activeTab === 'LOCAL' && (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10 animate-in slide-in-from-left-4 duration-500">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                    <Globe size={24} className="text-indigo-600" /> Regional Localization
                 </h3>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Base Currency ISO</label>
                       <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-black uppercase text-sm shadow-inner focus:ring-2 focus:ring-indigo-500/20 outline-none">
                          <option>USD - US Dollar</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date Representation</label>
                       <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-black uppercase text-sm shadow-inner focus:ring-2 focus:ring-indigo-500/20 outline-none">
                          <option>MM/DD/YYYY (US Standard)</option>
                          <option>DD/MM/YYYY (ISO Standard)</option>
                          <option>YYYY-MM-DD (Database Standard)</option>
                       </select>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'RETENTION' && (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10 animate-in slide-in-from-left-4 duration-500">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                    <Clock size={24} className="text-indigo-600" /> Forensic Lifecycle Control
                 </h3>
                 <div className="p-10 bg-slate-900 text-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 text-white"><Shield size={160} /></div>
                    <div className="relative z-10 space-y-10">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Statutory WORM Window (Years)</p>
                          <input 
                            type="range" min="1" max="20" 
                            value={policy.retentionYears}
                            onChange={(e) => setPolicy({...policy, retentionYears: parseInt(e.target.value)})}
                            className="w-full h-2 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-white" 
                          />
                          <div className="mt-6 flex items-baseline gap-4">
                             <p className="text-5xl font-black text-white font-mono tracking-tighter">{policy.retentionYears}</p>
                             <p className="text-sm font-black uppercase tracking-widest opacity-60">Years Mandatory Retention</p>
                          </div>
                       </div>
                       <p className="text-base text-indigo-100/70 font-medium italic leading-relaxed border-l-4 border-indigo-500 pl-8">
                          "Data is cryptographically sealed and immutable for the selected window to comply with regional SOX-404 and IFRS requirements. Re-setting this window requires Board-level authorization."
                       </p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="p-10 bg-indigo-600 text-white rounded-[48px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700"><ShieldCheck size={140} /></div>
              <h4 className="text-xl font-black uppercase tracking-widest mb-6 italic leading-tight">Institutional Registry Lock</h4>
              <p className="text-sm font-medium leading-relaxed opacity-90 relative z-10 italic mb-10">
                "All configuration changes trigger a system-wide re-validation of historical hashes. Unauthorized mutation will suspend ledger operations."
              </p>
              <button 
                onClick={handlePersistRegistry}
                disabled={isPersisting}
                className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isPersisting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Persist Registry Logic
              </button>
           </div>

           <div className="p-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] luxury-shadow">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Registry Versioning</h3>
              <div className="space-y-6">
                 {[
                   { date: '2023-11-20', actor: 'Sarah Miller', action: 'Update Matrix' },
                   { date: '2023-11-01', actor: 'Alex Chen', action: 'Provision Node' },
                 ].map((v, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px]">
                       <div className="flex flex-col">
                          <span className="text-slate-400 font-mono">{v.date}</span>
                          <span className="font-black text-slate-900 dark:text-white uppercase mt-1">{v.action}</span>
                       </div>
                       <span className="text-slate-400 font-bold uppercase tracking-widest">{v.actor}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SageSystemConfig;
