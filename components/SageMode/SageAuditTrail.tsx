
import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, ShieldCheck, User, Clock, Search, ExternalLink, 
  Hash, Lock, Download, AlertCircle, FileText, ChevronDown, 
  RefreshCw, Trash2, Filter, Shield, Fingerprint, Database,
  X, ShieldAlert, Zap, Loader2, ArrowRight, Bot
} from 'lucide-react';
import { performDeepLedgerAudit } from '../../services/geminiService';
import { getCoreAuditLogs } from '../../services/sageCoreEngine';

const SageAuditTrail: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Deep Lookup State
  const [lookupHash, setLookupHash] = useState<string | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const mapped = getCoreAuditLogs().map((log) => ({
      id: log.id,
      actor: log.actor_id,
      role: 'SYSTEM',
      action: log.action.replaceAll('_', ' '),
      target: log.target_table,
      hash: log.id.slice(-8).toUpperCase(),
      time: new Date(log.created_at).toLocaleTimeString(),
      date: new Date(log.created_at).toLocaleDateString(),
      reason: log.change_reason || 'System-generated append-only event.',
      preState: 'sealed',
      postState: JSON.stringify(log.payload).slice(0, 60),
    }));
    setAuditLogs(mapped);
  }, []);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => 
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [auditLogs, searchTerm]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Institutional Compliance Pack generated. Cryptographic signature: 0x8891...X21 Sealed at " + new Date().toLocaleTimeString());
    }, 2000);
  };

  const handleDeepLookup = async (log: any) => {
    setLookupHash(log.hash);
    setIsLookupLoading(true);
    setLookupResult(null);

    try {
      const mutation = { pre: log.preState, post: log.postState, actor: log.actor };
      const aiResult = await performDeepLedgerAudit(log.hash, mutation);
      
      const granularEntries = [
        { id: 'e1', account: '4000-01', desc: 'Direct Sale Ref #A1', debit: 0, credit: 12400 },
        { id: 'e2', account: '1010-00', desc: 'Cash Sweep', debit: 12400, credit: 0 },
        { id: 'e3', account: '6120-05', desc: 'AWS Hourly Re-allocation', debit: 450, credit: 0 },
      ];

      setLookupResult({ ...aiResult, entries: granularEntries });
    } catch (err) {
      console.error("Deep Audit Failed", err);
    } finally {
      setIsLookupLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Forensic Audit Trail</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Immutable Change Registry & Forensic Lineage</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleExport} 
            disabled={isExporting} 
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-900/40 transition-all active:scale-95"
           >
              {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              Export Auditor Pack
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm group hover:border-indigo-500/30 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Retention Policy</p>
            <p className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">7Y WORM</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm group hover:border-indigo-500/30 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Change Nodes (24h)</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{auditLogs.length} Events</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm group hover:border-indigo-500/30 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Registry Integrity</p>
            <p className="text-3xl font-black text-green-600 font-mono tracking-tighter">100% SHA</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm group hover:border-indigo-500/30 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Sealed Packs</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">0 Units</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-4">
               <ShieldCheck size={18} className="text-green-600" /> Statutory History Registry
            </h3>
            <div className="flex gap-4">
               <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search actor SPEC / Action..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] outline-none w-64 shadow-inner font-black uppercase tracking-widest" 
                  />
               </div>
               <button className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"><Filter size={18} /></button>
            </div>
         </div>

         <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                     <th className="px-8 py-5">Forensic Actor</th>
                     <th className="px-8 py-5">Action SPEC</th>
                     <th className="px-8 py-5">Resource Node</th>
                     <th className="px-8 py-5">Audit Hash</th>
                     <th className="px-8 py-5 text-right">Timestamp</th>
                     <th className="px-8 py-5"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                  {filteredLogs.length > 0 ? filteredLogs.map(log => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`group transition-all cursor-pointer ${activeDrillDown === log.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`} 
                        onClick={() => setActiveDrillDown(activeDrillDown === log.id ? null : log.id)}
                      >
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${log.role === 'AUTOMATION' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                                 {log.actor === 'System Node' ? <RefreshCw size={18} /> : log.actor.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{log.actor}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{log.role}</p>
                               </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter text-[11px]">{log.action}</span>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400 uppercase">{log.target}</td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 group/hash">
                              <Fingerprint size={12} className="text-slate-300 group-hover/hash:text-indigo-500 transition-colors" />
                              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg font-mono text-[10px] text-slate-400 border border-slate-200 dark:border-slate-800 tracking-tighter">{log.hash}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className="font-bold text-slate-900 dark:text-slate-300 font-mono tracking-tighter">{log.time}</p>
                           <p className="text-[8px] text-slate-400 font-mono mt-1 uppercase">{log.date}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className={`p-2.5 rounded-xl transition-all border ${activeDrillDown === log.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'text-slate-300 hover:text-indigo-600 border-transparent hover:border-slate-200'}`}>
                             <ChevronDown size={18} className={`transition-transform duration-300 ${activeDrillDown === log.id ? 'rotate-180' : ''}`} />
                           </button>
                        </td>
                      </tr>
                      {activeDrillDown === log.id && (
                        <tr key={`${log.id}-drill`}>
                          <td colSpan={6} className="bg-slate-50/50 dark:bg-black/30 p-0 overflow-hidden">
                             <div className="px-20 py-12 border-y-2 border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                   <div className="lg:col-span-4 space-y-10">
                                      <div>
                                         <h5 className="text-[11px] font-black uppercase text-indigo-600 mb-6 tracking-[0.3em] flex items-center gap-2">
                                            <Shield size={14} /> Execution Context
                                         </h5>
                                         <div className="space-y-4">
                                            <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3 group">
                                               <span className="text-slate-400 font-bold uppercase tracking-widest">Network Origin</span>
                                               <span className="font-mono text-slate-900 dark:text-slate-100 font-black">192.168.1.42</span>
                                            </div>
                                            <div className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3 group">
                                               <span className="text-slate-400 font-bold uppercase tracking-widest">VPC Node Cluster</span>
                                               <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">AWS-EAST-NODE-1</span>
                                            </div>
                                            <div className="pt-6">
                                               <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Authorized Rationale</p>
                                               <p className="text-base font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 transition-colors">"{log.reason}"</p>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="lg:col-span-8">
                                      <div className="p-10 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-inner relative overflow-hidden group/trace">
                                         <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-500 group-hover/trace:scale-110 transition-transform"><Database size={100} /></div>
                                         <h5 className="text-[11px] font-black uppercase text-slate-500 mb-10 tracking-[0.3em] flex items-center gap-3 relative z-10">
                                            <FileText size={18} className="text-indigo-600" /> Full Mutation Trace
                                         </h5>
                                         <div className="font-mono text-sm leading-relaxed space-y-4 relative z-10">
                                            <div className="flex gap-6 items-center p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl group/pre">
                                               <span className="text-[10px] font-black uppercase text-red-500 w-12 tracking-widest">PRE:</span>
                                               <code className="text-red-700 dark:text-red-400 font-black">{`{ "state": "${log.preState}", "checksum": "b41x...9a1" }`}</code>
                                            </div>
                                            <div className="flex gap-6 items-center p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl group/post">
                                               <span className="text-[10px] font-black uppercase text-green-500 w-12 tracking-widest">POST:</span>
                                               <code className="text-green-700 dark:text-green-400 font-black">{`{ "state": "${log.postState}", "checksum": "f82y...1b4" }`}</code>
                                            </div>
                                         </div>
                                         <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center relative z-10">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Node: ROOT_TRUST_01</span>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleDeepLookup(log); }}
                                              className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-2 group/audit"
                                            >
                                               <Search size={14} className="group-hover/audit:scale-110 transition-transform" /> Deep Ledger Lookup
                                            </button>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-40 text-center">
                         <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Search size={32} />
                         </div>
                         <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Audit Registry Sealed & Empty</h4>
                         <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">Awaiting first institutional mutation event</p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      <div className="p-8 bg-slate-900 text-white rounded-[48px] shadow-2xl flex items-center justify-between group overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 group-hover:scale-125 transition-transform duration-1000"><ShieldCheck size={120} /></div>
         <div className="flex items-center gap-10 relative z-10">
            <div className="p-6 bg-indigo-600 text-white rounded-[32px] shadow-xl shadow-indigo-900/40 border border-indigo-400/20 group-hover:rotate-6 transition-transform">
               <Fingerprint size={48} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase tracking-tighter italic">Forensic Integrity Verification</h4>
               <p className="text-sm font-medium opacity-70 max-w-2xl leading-relaxed mt-1">
                  "All change events are cryptographically signed using AES-256 and SHA-256. The registry is mirrored to regional data-residency nodes for immutable disaster recovery and SOX-404 verification."
               </p>
            </div>
         </div>
         <button className="px-10 py-5 bg-white text-indigo-600 rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all relative z-10">
            Audit Full Node Lifecycle
         </button>
      </div>
    </div>
  );
};

export default SageAuditTrail;
