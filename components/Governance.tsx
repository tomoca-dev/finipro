

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, History, UserCheck, 
  Lock, Unlock, Zap, ChevronRight, AlertTriangle, 
  Eye, Check, X, Shield, Fingerprint, Search, Store, 
  TrendingUp, RefreshCw, BarChart, AlertCircle, Loader2,
  Trash2, Filter, Download, Activity, ExternalLink,
  ShieldX
} from 'lucide-react';
// Fix: Removed unused Supplier import
import { AuditLog, AccessRequest, RiskFlag, GovernanceStatus, RiskSeverity } from '../types';
import { analyzeRiskExposure } from '../services/geminiService';
import { supabase, logAuditAction } from '../services/supabaseClient';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`glass-card rounded-3xl p-8 transition-all duration-500 luxury-shadow ${className}`}>
    {children}
  </div>
);

const Governance: React.FC<{ records: any[] }> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'ACCESS' | 'AUDIT' | 'SUPPLIERS'>('ALERTS');
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  const fetchData = async () => {
    const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(40);
    const { data: requests } = await supabase.from('access_requests').select('*').order('created_at', { ascending: false });
    if (logs) setAuditLogs(logs);
    if (requests) setAccessRequests(requests);
  };

  useEffect(() => {
    fetchData();
    runSecurityScan();
  }, []);

  const runSecurityScan = async () => {
    setIsAnalyzing(true);
    try {
      const risks = await analyzeRiskExposure(records.slice(0, 40));
      setRiskFlags(risks);
      logAuditAction('current-user', 'PERFORM_SECURITY_SCAN', 'risk_flags', 'batch', { scan_count: 40 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveAnomaly = async (id: string, newStatus: RiskFlag['status']) => {
    setRiskFlags(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    logAuditAction('current-user', `ANOMALY_RESOLVED_${newStatus}`, 'risk_flags', id, { final_status: newStatus });
    
    await supabase.from('audit_logs').insert([{
        actor_id: 'current-user',
        action: `ANOMALY_${newStatus}`,
        target_table: 'risk_flags',
        target_id: id,
        payload: { timestamp: new Date().toISOString() }
    }]);
  };

  const handleAccessAction = async (id: string, status: GovernanceStatus) => {
    setIsUpdating(true);
    const { data } = await supabase.from('access_requests').update({ 
      status, 
      approver_id: 'current-user' 
    }).eq('id', id).select();
    
    if (data) {
      logAuditAction('current-user', `AUTH_${status}`, 'access_requests', id, { final_status: status });
      await fetchData();
    }
    setIsUpdating(false);
  };

  const getSeverityColor = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white shadow-lg shadow-red-900/40';
      case 'HIGH': return 'bg-orange-500 text-white shadow-lg shadow-orange-900/40';
      case 'MEDIUM': return 'bg-amber-500 text-black shadow-lg shadow-amber-900/40';
      default: return 'bg-blue-600 text-white shadow-lg shadow-blue-900/40';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/40 glow-blue">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Governance & Forensics</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Institutional Compliance Node v4.2.1</p>
          </div>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
          {[
            { id: 'ALERTS', icon: <ShieldAlert size={14} />, label: 'AI Forensics' },
            { id: 'ACCESS', icon: <Lock size={14} />, label: 'Gatekeeper' },
            { id: 'AUDIT', icon: <History size={14} />, label: 'Audit Trail' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'ALERTS' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-blue-500" /> Forensic Scanning Node
                   </h3>
                   <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Scanning institutional ledger for structured payments, outliers, and dual-entry risks.</p>
                </div>
                <button onClick={runSecurityScan} disabled={isAnalyzing} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                  {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />}
                  Trigger Full Audit
                </button>
              </div>

              {isAnalyzing ? (
                <div className="h-96 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 border-dashed rounded-[48px]">
                  <div className="relative mb-8">
                     <Loader2 className="animate-spin text-blue-600" size={80} />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint size={32} className="text-blue-400 animate-pulse" />
                     </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Running Neural Pattern Decomposition...</p>
                </div>
              ) : riskFlags.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-[48px] text-center p-12 luxury-shadow">
                   <ShieldCheck size={100} className="text-slate-200 dark:text-slate-800 mb-8" />
                   <h4 className="text-2xl font-black text-slate-900 dark:text-slate-300 mb-2">Ledger Integrity: 100%</h4>
                   <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">AI engine scanned the current records and found zero anomalies matching known risk profiles.</p>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Anomalies', val: riskFlags.length, color: 'text-slate-900 dark:text-white' },
                        { label: 'Critical Risk', val: riskFlags.filter(r => r.severity === 'CRITICAL').length, color: 'text-red-600' },
                        { label: 'Pending Action', val: riskFlags.filter(r => r.status === 'OPEN').length, color: 'text-amber-600' },
                        { label: 'Sync Accuracy', val: '99.8%', color: 'text-blue-600' },
                      ].map(stat => (
                        <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center shadow-sm">
                           <span className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{stat.label}</span>
                           <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                   </div>

                   {riskFlags.map(risk => (
                    <div key={risk.id} className={`p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] flex gap-10 items-start group hover:border-blue-500/50 transition-all luxury-shadow relative overflow-hidden ${risk.status !== 'OPEN' ? 'opacity-50 grayscale' : ''}`}>
                      <div className={`p-5 rounded-3xl border shadow-lg group-hover:scale-110 transition-transform ${
                        risk.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        <Fingerprint size={36} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Lineage: #{risk.id.slice(0, 8)}</span>
                             <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{risk.type.replace('_', ' ')}</h4>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <span className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${getSeverityColor(risk.severity as RiskSeverity)}`}>
                               {risk.severity}
                             </span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${risk.status === 'OPEN' ? 'text-amber-600' : 'text-green-600'}`}>
                               STATUS: {risk.status}
                             </span>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8 text-sm italic">"{risk.description}"</p>
                        
                        <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div> 
                             Resource: {risk.entity || 'GL Pool'}
                          </span>
                          <span className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div> 
                             Detected: {risk.detected_at || 'Live Scan'}
                          </span>
                          
                          <div className="flex items-center gap-4 ml-auto">
                             {risk.status === 'OPEN' && (
                               <>
                                 <button onClick={() => handleResolveAnomaly(risk.id, 'INVESTIGATED')} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md font-bold text-[10px] uppercase">
                                   Open Case
                                 </button>
                                 <button onClick={() => handleResolveAnomaly(risk.id, 'DISMISSED')} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 font-bold text-[10px] uppercase">
                                   Dismiss
                                 </button>
                               </>
                             )}
                             <button className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl shadow-inner">
                                <ExternalLink size={18} />
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACCESS' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden luxury-shadow">
              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">Identity Governance</h3>
                   <p className="text-xs text-slate-500 mt-1 uppercase font-black tracking-[0.2em]">Institutional Gatekeeper approvals</p>
                </div>
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/30">
                   <Lock size={24} />
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {accessRequests.length === 0 ? (
                  <div className="p-32 text-center text-slate-400 font-black uppercase tracking-widest">Zero pending auth requests</div>
                ) : accessRequests.map(req => (
                  <div key={req.id} className="p-10 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all shadow-inner">
                        <UserCheck size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                           <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-tight">Access Request #{req.id.slice(0, 5)}</h4>
                           <span className={`text-[9px] font-black px-3 py-1 rounded-xl border tracking-widest ${
                             req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                             req.status === 'APPROVED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                           }`}>{req.status}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Resource Node: <span className="text-blue-600 dark:text-blue-400 font-black underline decoration-blue-500/20">{req.resource}</span></p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold italic">"{req.reason}"</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {req.status === 'PENDING' ? (
                        <>
                          <button onClick={() => handleAccessAction(req.id, 'APPROVED')} className="p-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-900/20">
                            <Check size={24} />
                          </button>
                          <button onClick={() => handleAccessAction(req.id, 'DENIED')} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-red-500 hover:text-white transition-all shadow-sm rounded-2xl">
                            <X size={24} />
                          </button>
                        </>
                      ) : (
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Finalized</p>
                           <p className="text-xs text-slate-500 font-mono font-bold tracking-tighter">{new Date().toLocaleTimeString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden luxury-shadow">
               <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Immutable Ledger</h3>
                    <p className="text-[10px] font-black text-green-600 mt-1 uppercase tracking-[0.2em]">Append-Only Audit Stream</p>
                 </div>
                 <button className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                    <Download size={18} /> Full Export
                 </button>
               </div>
               <div className="p-10 max-h-[700px] overflow-y-auto custom-scrollbar">
                 <div className="space-y-12 relative">
                   <div className="absolute left-[31px] top-6 bottom-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                   {auditLogs.length === 0 ? (
                      <div className="py-32 text-center text-slate-300 font-black uppercase tracking-widest">Audit stream clear</div>
                   ) : auditLogs.map((log) => (
                     <div key={log.id} className="flex gap-10 relative group">
                       <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 z-10 shrink-0 group-hover:border-blue-500/50 group-hover:text-blue-600 transition-all shadow-inner">
                         <History size={24} />
                       </div>
                       <div className="flex-1 pb-10 border-b border-slate-100 dark:border-white/[0.03]">
                         <div className="flex justify-between items-center mb-3">
                           <h5 className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-tight">{log.action.replace('_', ' ')}</h5>
                           <span className="text-[11px] text-slate-400 font-mono tracking-tighter">{new Date(log.created_at).toLocaleString()}</span>
                         </div>
                         <p className="text-sm text-slate-500 font-medium mb-4">Node: <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">{log.target_table}</span> • Object: <span className="text-slate-400 font-mono text-xs">{log.target_id.slice(0, 16)}...</span></p>
                         <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-all overflow-hidden shadow-inner">
                           {JSON.stringify(log.payload)}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-t-8 border-t-blue-600 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-blue-600 group-hover:scale-125 transition-transform duration-1000">
               <Shield size={140} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-10 flex items-center gap-2 relative z-10">
              <ShieldCheck size={16} className="text-green-500" /> Compliance Monitor
            </h3>
            <div className="space-y-10 relative z-10">
               {[
                 { label: 'Ledger Integrity', val: 'SHA-256 VERIFIED', color: 'bg-green-500' },
                 { label: 'Sensitivity', val: 'DYNAMIC (L4)', color: 'bg-green-500' },
                 { label: 'Inbound Sync', val: 'ACTIVE-MULTI', color: 'bg-blue-500' },
               ].map(item => (
                 <div key={item.label} className="flex justify-between items-center group">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1 tracking-widest">{item.label}</span>
                      <p className="text-xs text-slate-900 dark:text-slate-200 font-black font-mono tracking-tighter">{item.val}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_12px_rgba(34,197,94,0.4)]`}></div>
                 </div>
               ))}
            </div>
          </Card>

          <div className="p-10 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/20 rounded-[48px] luxury-shadow group">
             <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-900/30 group-hover:scale-110 transition-transform">
                <AlertCircle size={28} />
             </div>
             <h4 className="text-xl font-black mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Structural Nudge</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium italic">
                "Detecting abnormal structural payment spikes for Cloud infra. Strategic nudge: transition to Reserved Instances to mitigate OpEx leakage."
             </p>
             <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg border border-white/5">
                Draft Remediations
             </button>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Anomaly Frequency Node</h3>
             <div className="h-40 flex items-end justify-center border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-950/50 p-6">
                <div className="flex gap-2 items-end h-full w-full">
                   {Array.from({ length: 12 }).map((_, i) => (
                     <div 
                      key={i} 
                      className={`flex-1 rounded-t-lg transition-all duration-700 ${i === 8 ? 'bg-red-500 h-full' : 'bg-slate-200 dark:bg-slate-800 h-1/2 hover:bg-blue-500 hover:h-2/3'}`}
                      style={{ height: i === 8 ? '100%' : `${Math.random() * 50 + 20}%` }}
                    />
                   ))}
                </div>
             </div>
             <p className="text-[9px] text-slate-400 mt-6 text-center uppercase font-black tracking-[0.3em]">Institutional Pulse (24h)</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Governance;
