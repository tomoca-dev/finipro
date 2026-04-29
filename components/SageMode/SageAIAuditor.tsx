import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, 
  Search, Cpu, ArrowRight, Activity, Zap, Lock,
  History, Eye, FileSearch, Terminal, Bot, Shield, ChevronRight
} from 'lucide-react';

interface ForensicFlag {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  module: string;
  timestamp: string;
  isResolved: boolean;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`sage-glass rounded-[40px] p-10 border-0 luxury-shadow relative overflow-hidden group ${className}`}>
    {children}
  </div>
);

const SageAIAuditor: React.FC = () => {
  const [flags, setFlags] = useState<ForensicFlag[]>([
    {
      id: 'F-001',
      type: 'CRITICAL',
      message: 'Unusual Debit/Credit ratio detected in Cash Clearing node. Possible fragmentation artifact.',
      module: 'General Ledger',
      timestamp: '14:02:11',
      isResolved: false
    },
    {
      id: 'F-002',
      type: 'WARNING',
      message: 'Statutory VAT (15%) missing from 3 inventory acquisition batches. Requires reconciliation.',
      module: 'Procurement Hub',
      timestamp: '13:45:02',
      isResolved: false
    },
    {
      id: 'F-003',
      type: 'INFO',
      message: 'Neural model suggests optimizing COGS allocation strategy for Bole Flagship Branch.',
      module: 'Strategic Overlay',
      timestamp: '12:00:00',
      isResolved: true
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleResolve = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, isResolved: true } : f));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white animate-in slide-in-from-right duration-1000 overflow-hidden">
      {/* Header */}
      <div className="p-16 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 via-transparent to-transparent relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-indigo-600/20 border border-indigo-500/20 rounded-[32px] text-indigo-400 shadow-inner">
              <Bot size={48} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Neural Forensic Engine • Protocol V4.2</span>
              </div>
              <h3 className="text-6xl font-black uppercase tracking-tighter italic leading-none">Sage AI Auditor</h3>
            </div>
          </div>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="px-12 py-6 bg-indigo-600 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.5em] shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center gap-5"
          >
            {isScanning ? <Activity size={22} className="animate-spin" /> : <Zap size={22} />}
            {isScanning ? 'Synchronizing Neural Shards...' : 'Initialize Forensic Scan'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-16 grid grid-cols-3 gap-8 shrink-0 border-b border-white/5">
        <StatsNode label="Institutional Trust Score" value="98.2%" icon={<Shield size={28} strokeWidth={1.5} />} color="text-emerald-400" glow="shadow-[0_0_40px_rgba(16,185,129,0.2)]" />
        <StatsNode label="Active Forensic Flags" value={`${flags.filter(f => !f.isResolved).length} OPEN`} icon={<AlertTriangle size={28} strokeWidth={1.5} />} color="text-amber-400" glow="shadow-[0_0_40px_rgba(245,158,11,0.2)]" />
        <StatsNode label="Cryptographic Integrity" value="SHA-VALID" icon={<Lock size={28} strokeWidth={1.5} />} color="text-indigo-400" glow="shadow-[0_0_40px_rgba(99,102,241,0.2)]" />
      </div>

      {/* Flags */}
      <div className="flex-1 overflow-y-auto p-16 custom-scrollbar space-y-16">
        <div className="space-y-8">
          <div className="flex items-center gap-5 mb-12">
            <History size={20} className="text-slate-500" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Active Forensic Anomaly Flags</h4>
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500">{flags.filter(f => !f.isResolved).length} UNRESOLVED</span>
          </div>
          
          <div className="space-y-6">
            {flags.map((flag) => (
              <div 
                key={flag.id} 
                className={`p-10 rounded-[48px] border-2 transition-all group relative overflow-hidden ${
                  flag.isResolved 
                    ? 'bg-slate-900/30 border-white/5 opacity-40 grayscale' 
                    : flag.type === 'CRITICAL' 
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.1)]' 
                      : flag.type === 'WARNING'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-white/[0.02] border-white/10 hover:border-indigo-500/30'
                }`}
              >
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000"><FileSearch size={200} /></div>
                <div className="relative z-10 flex justify-between items-start gap-8">
                  <div className="flex gap-8 flex-1">
                    <div className={`p-5 rounded-[24px] shrink-0 ${
                      flag.type === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                      flag.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 
                      'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {flag.type === 'CRITICAL' ? <ShieldAlert size={36} /> : flag.type === 'WARNING' ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-5 mb-4">
                        <span className="text-[11px] font-black text-indigo-400 tracking-widest uppercase italic bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/10">{flag.module}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest data-cell italic">{flag.timestamp} UTC+3</span>
                      </div>
                      <p className="text-3xl font-black tracking-tight leading-tight uppercase italic mb-6">{flag.message}</p>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-3 ${
                          flag.type === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          flag.type === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-800 text-slate-400 border-white/5'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${flag.type === 'CRITICAL' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]' : flag.type === 'WARNING' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                          {flag.type === 'CRITICAL' ? 'ESCALATE_REQUIRED' : flag.type === 'WARNING' ? 'ADVISORY_HOLD' : 'INFORMATIONAL'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">FLAG_{flag.id}</span>
                      </div>
                    </div>
                  </div>
                  {!flag.isResolved && (
                    <div className="flex flex-col gap-4 shrink-0">
                      <button 
                        className="p-5 bg-white/5 hover:bg-indigo-600 rounded-[20px] transition-all border border-white/10 hover:border-indigo-500 flex items-center gap-3 group/btn shadow-2xl"
                        onClick={() => {}}
                      >  
                        <Eye size={22} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity w-0 group-hover/btn:w-24 overflow-hidden">Investigate</span>
                      </button>
                      <button 
                        className="p-5 bg-white/5 hover:bg-emerald-600 rounded-[20px] transition-all border border-white/10 hover:border-emerald-500 flex items-center gap-3 group/res shadow-2xl"
                        onClick={() => handleResolve(flag.id)}
                      >
                        <CheckCircle2 size={22} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/res:opacity-100 transition-opacity w-0 group-hover/res:w-20 overflow-hidden">Resolve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine Card */}
        <div className="p-16 bg-indigo-600 text-white rounded-[56px] shadow-[0_40px_120px_rgba(79,70,229,0.5)] relative overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000"><Terminal size={300} strokeWidth={1} /></div>
          <div className="relative z-10 flex items-center gap-16">
            <div className="p-10 bg-white/10 border border-white/20 rounded-[48px] backdrop-blur-md shadow-inner shrink-0 group-hover:rotate-12 transition-transform duration-1000">
              <Cpu size={80} strokeWidth={1} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.6em] opacity-70 italic">Autonomous Detection Active</span>
              </div>
              <h4 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-8">Fraud Mitigation Engine</h4>
              <p className="text-2xl font-medium italic opacity-70 leading-relaxed pr-20 max-w-4xl">
                "AI Auditor is actively isolating duplicate transaction artifacts and detecting structural variances in real-time across all ledger shards. Manual override required for final settlement authority."
              </p>
              <div className="mt-12 flex gap-6 flex-wrap">
                <span className="px-6 py-3 bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 inline-flex items-center gap-4 shadow-inner">
                  <Activity size={16} className="text-emerald-400" /> Pattern Recognition: ACTIVE
                </span>
                <span className="px-6 py-3 bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 inline-flex items-center gap-4 shadow-inner">
                  <Terminal size={16} className="text-indigo-300" /> Webhook Nodes: 12 CONNECTED
                </span>
                <span className="px-6 py-3 bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] border border-white/10 inline-flex items-center gap-4 shadow-inner">
                  <Zap size={16} className="text-amber-400" /> Neural Latency: 4ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-10 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 data-cell italic">Neural ID: AA-2026-X9-AUDIT</span>
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 italic animate-pulse">Scanning Distributed Shards...</span>
        </div>
      </div>
    </div>
  );
};

const StatsNode: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string, glow: string }> = ({ label, value, icon, color, glow }) => (
  <div className={`p-10 bg-white/[0.02] border border-white/5 rounded-[40px] group hover:border-indigo-500/20 transition-all luxury-shadow ${glow}`}>
    <div className={`p-5 bg-white/5 rounded-[24px] ${color} w-fit mb-8 group-hover:scale-110 transition-transform shadow-inner border border-white/5`}>
      {icon}
    </div>
    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 italic">{label}</p>
    <p className={`text-4xl font-black data-cell tracking-tighter leading-none ${color}`}>{value}</p>
  </div>
);

export default SageAIAuditor;
