
import React, { useState, useEffect } from 'react';
import { 
  Server, Zap, Globe, Link, Share2, ShieldCheck, RefreshCw, 
  Plus, ExternalLink, Database, Key, Activity, Cpu, 
  ArrowUpRight, Heart, HardDrive, Layout, ChevronRight, Terminal,
  Loader2, X, ShieldAlert, Monitor, Signal
} from 'lucide-react';
import { Connector } from '../../types';
// Added SageTab import to support navigateTo prop type
import { SageTab } from './SageModeShell';

interface SageConnectorCenterProps {
  // Added navigateTo prop to interface
  navigateTo: (tab: SageTab) => void;
}

// Added navigateTo to destructured props to fix potential reference error
const SageConnectorCenter: React.FC<SageConnectorCenterProps> = ({ navigateTo }) => {
  const [connectors, setConnectors] = useState<Connector[]>([
    { id: 'od-1', name: 'Sage 50 Pervasive DB', provider: 'On-Prem Agent', type: 'ODBC', status: 'CONNECTED', health: 94, lastSync: 'Live' },
    { id: 'sdk-1', name: 'Sage Peachtree SDK', provider: 'Official Integration', type: 'SDK', status: 'CONNECTED', health: 100, lastSync: 'Live' },
    { id: 'ap-1', name: 'Institutional Inbound API', provider: 'Internal Node', type: 'API', status: 'CONNECTED', health: 100, lastSync: 'Live' },
  ]);

  const [syncMetric, setSyncMetric] = useState(12.4);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncMetric(prev => +(prev + (Math.random() - 0.5)).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshSDK = (id: string) => {
    setRefreshingId(id);
    setTimeout(() => {
      setRefreshingId(null);
      alert("Institutional Handshake Re-verified. SDK Tokens Rotated.");
    }, 1800);
  };

  const handleToggleStatus = (id: string) => {
    setConnectors(prev => prev.map(c => 
      c.id === id ? { ...c, status: c.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED', health: c.status === 'CONNECTED' ? 0 : 100 } : c
    ));
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Institutional Connectors</h2>
          <p className="text-sm text-slate-500 font-medium">SDK Integration & Real-time Delta-Sync Agents</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Throughput</span>
                <span className="text-xl font-black text-indigo-600 font-mono tracking-tighter">{syncMetric} MB/s</span>
             </div>
             <Activity size={24} className="text-indigo-500 animate-pulse" />
          </div>
          <button 
            onClick={() => setIsProvisioning(true)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={18} /> Provision New Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {connectors.map(conn => (
          <div key={conn.id} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500/50">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 text-indigo-600">
               {conn.type === 'SDK' ? <Cpu size={120} /> : conn.type === 'API' ? <Globe size={120} /> : <Database size={120} />}
             </div>
             
             <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-lg ${conn.status === 'CONNECTED' ? 'bg-indigo-600 text-white shadow-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {conn.type === 'SDK' ? <Cpu size={24} /> : conn.type === 'API' ? <Zap size={24} /> : <HardDrive size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{conn.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{conn.provider}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  conn.status === 'CONNECTED' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-200'
                }`}>
                  {conn.status}
                </div>
             </div>
             
             <div className="space-y-6 flex-1 relative z-10">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-[28px] border border-slate-200 dark:border-slate-800">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type: {conn.type}</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono">Sync: {conn.lastSync}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${conn.status === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-300'}`}></div>
                      <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        {conn.status === 'CONNECTED' ? 'Institutional Handshake Active' : 'Node Handshake Suspended'}
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>Integrity Score</span>
                      <span>{conn.health}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full transition-all duration-1000 ${conn.health > 90 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${conn.health}%` }}></div>
                   </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                    onClick={() => handleRefreshSDK(conn.id)}
                    disabled={refreshingId === conn.id}
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all"
                   >
                      {refreshingId === conn.id ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                      Rotate Keys
                   </button>
                   <button 
                    onClick={() => handleToggleStatus(conn.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      conn.status === 'CONNECTED' ? 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'border-indigo-500/20 text-indigo-500 hover:bg-indigo-600 hover:text-white'
                    }`}
                   >
                     {conn.status === 'CONNECTED' ? <Monitor size={18} /> : <Signal size={18} />}
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 flex items-center gap-10 luxury-shadow shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Terminal size={120} /></div>
         <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 dark:border-white/5 relative z-10">
            <Globe size={32} />
         </div>
         <div className="flex-1 relative z-10">
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Pluggable Ingestion Framework</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
              Our SDK framework supports **Custom Plugin Parsers** for exotic ERP exports and proprietary logistics data schemas. Custom transformation hooks allow for complex dual-entry logic to be executed before a batch reaches the verification queue.
            </p>
         </div>
         {/* Fix: Passed navigateTo function is now available in scope */}
         <button onClick={() => navigateTo('AUDIT')} className="px-8 py-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm relative z-10">Manage Plugins</button>
      </div>

      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Provision New Node</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect external ERP data source</p>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connection Protocol</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['ODBC / SQL Agent', 'REST API Hook', 'Binary SDK Sink', 'Secure CSV FTP'].map(p => (
                         <button key={p} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[28px] border-2 border-transparent hover:border-indigo-500 transition-all text-left group">
                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors uppercase">{p}</p>
                            <p className="text-[9px] text-slate-500 font-medium italic mt-2">v4.2 Logic Compliant</p>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/20 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsProvisioning(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                 <button 
                  onClick={() => setIsProvisioning(false)}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3"
                 >
                    <RefreshCw size={18} /> Initialize Handshake
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageConnectorCenter;
