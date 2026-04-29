
import React, { useState, useEffect } from 'react';
import { 
  SearchCode, ShieldCheck, AlertCircle, FileSpreadsheet, 
  History, Fingerprint, CheckCircle2, XCircle, RefreshCw, 
  Gavel, Download, LayoutTemplate, Briefcase, ExternalLink,
  ShieldAlert, UserCheck, Scale, Database, Loader2
} from 'lucide-react';
import { CompletenessCheck, ForensicAlert } from '../types';
import { checkFinancialCompleteness, performForensicAnalysis } from '../services/geminiService';

const ComplianceWorkspace: React.FC<{ records: any[] }> = ({ records }) => {
  const [checks, setChecks] = useState<CompletenessCheck[]>([]);
  const [forensics, setForensics] = useState<ForensicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<'AUDIT' | 'FORENSICS'>('AUDIT');

  const runComplianceAudit = async () => {
    if (records.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const [comp, foren] = await Promise.all([
        checkFinancialCompleteness({ records: records.slice(0, 15) }),
        performForensicAnalysis(records.slice(0, 20))
      ]);
      setChecks(comp || []);
      setForensics(foren || []);
    } catch (err: any) {
      setError("Compliance analysis node temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runComplianceAudit();
  }, [records]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-3xl border border-indigo-200 dark:border-indigo-500/20 shadow-lg">
            <SearchCode size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Forensic Workspace</h2>
            <p className="text-slate-500 text-sm font-medium">Scanning institutional artifacts for structural gaps.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <button onClick={() => setActivePane('AUDIT')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePane === 'AUDIT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
               Audit Lineage
             </button>
             <button onClick={() => setActivePane('FORENSICS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePane === 'FORENSICS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
               Forensic Vault
             </button>
          </div>
          <button onClick={runComplianceAudit} disabled={isLoading || records.length === 0} className="flex items-center gap-3 px-8 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 disabled:opacity-30">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} className="text-indigo-400" />}
            Refresh Scan
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center p-12 luxury-shadow opacity-60">
           <ShieldCheck size={100} className="text-slate-200 dark:text-slate-800 mb-8" />
           <h4 className="text-2xl font-black text-slate-900 dark:text-slate-300 mb-2 uppercase italic tracking-tighter">Awaiting Artifact Ingress</h4>
           <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">No records found in the canonical store. Compliance audits will initialize automatically once financial data is ingested.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3">
             {activePane === 'AUDIT' ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden luxury-shadow">
                   <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-4">
                        <CheckCircle2 size={18} className="text-green-600" /> Control Lineage Audit
                     </h3>
                   </div>
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {checks.map(check => (
                        <div key={check.id} className="p-10 flex items-start gap-10 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                           <div className={`mt-1 p-5 rounded-3xl border shadow-lg group-hover:scale-110 transition-transform ${
                              check.status === 'PRESENT' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'
                           }`}>
                              {check.status === 'PRESENT' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                           </div>
                           <div className="flex-1">
                              <h4 className="font-black text-2xl text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-2">{check.area}</h4>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">"{check.description}"</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 luxury-shadow">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-10 flex items-center gap-4">
                      <History size={20} className="text-indigo-600" /> Forensic Vault
                   </h3>
                   <div className="space-y-6">
                      {forensics.map(alert => (
                        <div key={alert.id} className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/50 transition-all shadow-sm">
                           <div className="flex items-center gap-8">
                              <div className={`p-5 rounded-[24px] border shadow-md group-hover:scale-110 transition-transform ${
                                 alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
                              }`}>
                                 <Fingerprint size={32} />
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-lg">{alert.type}</p>
                                 <p className="text-base font-medium text-slate-500 italic">"{alert.description}"</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
          <div className="lg:col-span-1 space-y-10">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 relative overflow-hidden shadow-2xl luxury-shadow">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-600 pointer-events-none group-hover:scale-125 transition-transform duration-1000"><Gavel size={120} /></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Auditor Readiness</h3>
                <div className="space-y-4">
                   <button className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white transition-all group">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">GL Schema</span>
                      <span className="text-[9px] font-black text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border">XLSX</span>
                   </button>
                   <button className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white transition-all group">
                      <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Evidence Pack</span>
                      <span className="text-[9px] font-black text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border">PDF</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceWorkspace;
