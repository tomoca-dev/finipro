
import React, { useState } from 'react';
import { 
  Globe, ArrowRightLeft, ShieldCheck, Plus, RefreshCw, 
  Layers, Database, Landmark, X, Save, CheckCircle2, Loader2,
  Trash2, AlertTriangle, Fingerprint, Zap
} from 'lucide-react';
import { Company } from '../../types';

const SageConsolidationCenter: React.FC = () => {
  const [entities, setEntities] = useState<Company[]>([
    { id: 'en-1', name: 'Retail North Corp', region: 'NORTH', currency: 'ETB', isConsolidated: true, status: 'ACTIVE' },
    { id: 'en-2', name: 'Logistics Central Ltd', region: 'CENTRAL', currency: 'USD', isConsolidated: true, status: 'ACTIVE' }
  ]);

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSimulatingClose, setIsSimulatingClose] = useState(false);
  const [newEntity, setNewEntity] = useState<Partial<Company>>({ name: '', region: '', currency: 'USD' });

  const toggleConsolidation = (id: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, isConsolidated: !e.isConsolidated } : e));
  };

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      alert("Institutional Regional Handshake Complete. 0xAF...92 Verified.");
    }, 1500);
  };

  const handleGroupClose = () => {
    setIsSimulatingClose(true);
    setTimeout(() => {
      setIsSimulatingClose(false);
      alert("Group Close Simulation Finalized: Br 142,000 in Intercompany Eliminations identified.");
    }, 2500);
  };

  const handleAddEntity = () => {
    if (!newEntity.name?.trim()) return;
    const entity: Company = {
      id: `en-${Date.now()}`,
      name: newEntity.name!,
      region: newEntity.region || 'NORTH',
      currency: newEntity.currency!,
      isConsolidated: true,
      status: 'ACTIVE'
    };
    setEntities([entity, ...entities]);
    setIsProvisioning(false);
    setNewEntity({ name: '', region: '', currency: 'USD' });
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Consolidation Hub</h2>
          <p className="text-sm text-slate-500 font-medium">Multi-Tenant Hierarchy & Intercompany Eliminations</p>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 active:scale-95"
        >
          <Plus size={16} /> Provision New Entity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-4">
                    <Layers size={18} className="text-indigo-600" /> Statutory Group Structure
                 </h3>
                 <span className="text-[9px] font-black bg-green-500/10 text-green-600 px-3 py-1 rounded-xl border border-green-500/20 uppercase tracking-widest">Hierarchy Sync: Valid</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {entities.map(entity => (
                    <div key={entity.id} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all shadow-inner">
                             <Landmark size={28} />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{entity.name}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Region: {entity.region} • Local CCY: {entity.currency}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Include</p>
                             <button 
                               onClick={() => toggleConsolidation(entity.id)}
                               className={`w-12 h-6 rounded-full relative transition-all ${entity.isConsolidated ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                             >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${entity.isConsolidated ? 'left-7' : 'left-1'}`}></div>
                             </button>
                          </div>
                          <button 
                            onClick={() => handleSync(entity.id)}
                            disabled={syncingId === entity.id}
                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                          >
                            {syncingId === entity.id ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-10 bg-indigo-600 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700"><ArrowRightLeft size={120} /></div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Elimination Automation Engine</h3>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-xl">
                 AI logic identifies symmetrical balances across subsidiary nodes and suggests auto-elimination entries during the group close sequence. 
              </p>
              <button 
                onClick={handleGroupClose}
                disabled={isSimulatingClose}
                className="mt-8 px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                {isSimulatingClose ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Execute Group Close Simulation
              </button>
           </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] luxury-shadow">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                 <Database size={16} className="text-blue-500" /> Residency Controls
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Cloud Node', val: 'AWS US-EAST-1' },
                   { label: 'Data Sovereignty', val: 'GDPR / CPRA COMPLIANT' },
                   { label: 'Encryption', val: 'BYOK (ACTIVE)' },
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-slate-900 text-indigo-100 rounded-[40px] border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Globe size={140} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Institutional Reach</h4>
              <p className="text-sm font-medium italic opacity-70 leading-relaxed relative z-10">
                 "Our multi-entity hub supports streaming ingestion from regional Pervasive SQL agents, ensuring the group ledger is always within 5 seconds of truth."
              </p>
           </div>
        </div>
      </div>

      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Entity Provisioning</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add statutory entity to consolidation tree</p>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Company Name</label>
                    <input 
                      type="text" 
                      value={newEntity.name} 
                      onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      placeholder="Institutional Trading Name..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Statutory Region</label>
                       <input 
                         type="text"
                         value={newEntity.region}
                         onChange={(e) => setNewEntity({...newEntity, region: e.target.value})}
                         placeholder="e.g. Ethiopia, UK, US..."
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Base ISO Currency</label>
                       <select 
                         value={newEntity.currency}
                         onChange={(e) => setNewEntity({...newEntity, currency: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                       >
                          <option value="USD">USD - Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - Pound</option>
                          <option value="ETB">ETB - Ethiopian Birr</option>
                       </select>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/20 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsProvisioning(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                 <button 
                  onClick={handleAddEntity}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3"
                 >
                    <Save size={18} /> Seal Entity Node
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageConsolidationCenter;
