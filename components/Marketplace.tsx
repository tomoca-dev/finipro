
import React, { useState } from 'react';
import { 
  Puzzle, Search, RefreshCw, CheckCircle2, 
  XCircle, AlertCircle, Link, Plus, ExternalLink,
  CreditCard, Store, Database, Map, Settings2,
  Loader2, Power, PowerOff, ShieldCheck
} from 'lucide-react';
import { Connector } from '../types';

const INITIAL_CONNECTORS: Connector[] = [
  { id: 'c1', name: 'QuickBooks Online', provider: 'Intuit', type: 'ERP', status: 'CONNECTED', lastSync: new Date(Date.now() - 3600000).toISOString(), health: 98 },
  { id: 'c2', name: 'Stripe Payments', provider: 'Stripe', type: 'PSP', status: 'CONNECTED', lastSync: new Date(Date.now() - 600000).toISOString(), health: 100 },
  { id: 'c3', name: 'Shopify POS', provider: 'Shopify', type: 'POS', status: 'DISCONNECTED', health: 0 },
  { id: 'c4', name: 'NetSuite', provider: 'Oracle', type: 'ERP', status: 'ERROR', health: 45 },
  { id: 'c5', name: 'Xero', provider: 'Xero', type: 'ERP', status: 'DISCONNECTED', health: 0 },
  { id: 'c6', name: 'Braintree', provider: 'PayPal', type: 'PSP', status: 'CONNECTED', lastSync: new Date(Date.now() - 12000000).toISOString(), health: 92 },
];

const Marketplace: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ERP' | 'PSP' | 'POS'>('ALL');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const filtered = connectors.filter(c => 
    (filter === 'ALL' || c.type === filter) &&
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSync = (id: string) => {
    setSyncingId(id);
    // Simulate data ingestion handshake
    setTimeout(() => {
      setConnectors(prev => prev.map(c => 
        c.id === id 
          ? { ...c, lastSync: new Date().toISOString(), health: Math.min(100, (c.health || 90) + 2) } 
          : c
      ));
      setSyncingId(null);
    }, 1500);
  };

  const handleConnect = (id: string) => {
    setConnectingId(id);
    // Simulate OAuth2 authorization flow
    setTimeout(() => {
      setConnectors(prev => prev.map(c => 
        c.id === id 
          ? { ...c, status: 'CONNECTED', lastSync: new Date().toISOString(), health: 100 } 
          : c
      ));
      setConnectingId(null);
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    if (confirm("Sever institutional link? This will stop all active ledger syncing.")) {
      setConnectors(prev => prev.map(c => 
        c.id === id 
          ? { ...c, status: 'DISCONNECTED', health: 0, lastSync: undefined } 
          : c
      ));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <Puzzle size={24} />
            </div>
            Institutional Marketplace
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Plug high-fidelity live feeds into your canonical financial ledger.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
           {['ALL', 'ERP', 'PSP', 'POS'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all tracking-widest ${
                 filter === f 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                 : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 flex items-center gap-4 luxury-shadow focus-within:border-blue-500/50 transition-all">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search ERPs, Bank feeds, POS or logistics nodes..."
          className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length > 0 ? filtered.map(connector => (
          <div key={connector.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 hover:border-blue-500/50 transition-all group flex flex-col relative overflow-hidden luxury-shadow">
            {/* Status Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all group-hover:scale-110 shadow-inner">
                {connector.type === 'ERP' && <Database size={28} />}
                {connector.type === 'PSP' && <CreditCard size={28} />}
                {connector.type === 'POS' && <Store size={28} />}
                {connector.type === 'LOGISTICS' && <Map size={28} />}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                connector.status === 'CONNECTED' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                connector.status === 'ERROR' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {connector.status === 'CONNECTED' && <CheckCircle2 size={12} />}
                {connector.status === 'ERROR' && <AlertCircle size={12} />}
                {connector.status === 'DISCONNECTED' && <XCircle size={12} />}
                {connector.status}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight mb-1">{connector.name}</h4>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{connector.provider}</p>
              
              {connector.status === 'CONNECTED' ? (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 mb-3 uppercase tracking-tighter">
                    <span>Sync Health</span>
                    <span className={connector.health > 90 ? 'text-green-500' : 'text-yellow-500'}>{connector.health}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-1000 ${connector.health > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${connector.health}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-4 flex items-center gap-2 font-bold uppercase tracking-widest">
                    <RefreshCw size={10} className={syncingId === connector.id ? 'animate-spin text-blue-500' : ''} /> 
                    Last Sync: {connector.lastSync ? new Date(connector.lastSync).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-6 leading-relaxed font-medium">
                  Integrate {connector.name} to automate reconciliation and populate your real-time Profit & Loss statement.
                </p>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/[0.03] flex gap-3">
              {connector.status === 'CONNECTED' ? (
                <>
                  <button 
                    onClick={() => handleSync(connector.id)}
                    disabled={syncingId === connector.id}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                  >
                    {syncingId === connector.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Sync Now
                  </button>
                  <button 
                    onClick={() => handleDisconnect(connector.id)}
                    className="p-3 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20"
                    title="Disconnect"
                  >
                    <Power size={18} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleConnect(connector.id)}
                  disabled={connectingId === connector.id}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 disabled:bg-slate-800"
                >
                  {connectingId === connector.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <Link size={16} />
                      Authorize Session
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] text-center">
             <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
               <Search size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Connectors Found</h3>
             <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">We couldn't find any nodes matching "<span className="text-blue-500 font-bold">{searchTerm}</span>". Try adjusting your filter.</p>
             <button onClick={() => {setSearchTerm(''); setFilter('ALL');}} className="mt-8 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] hover:underline">Clear Search Parameters</button>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] p-8 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/20">
           <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm">
             <Plus size={32} />
           </div>
           <h4 className="font-black text-lg text-slate-400 dark:text-slate-600 uppercase tracking-tight">Request Integration</h4>
           <p className="text-[10px] text-slate-500 mt-2 max-w-[200px] font-bold leading-relaxed">Can't find your tool? Our engineers build new institutional connectors in 48 hours.</p>
           <button className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Submit API Request</button>
        </div>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-[32px] p-8 flex items-center gap-8 luxury-shadow">
         <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/30">
            <ShieldCheck size={32} />
         </div>
         <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">AES-256 Multi-Zone Security</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
              All active connectors utilize OAuth2 Scoped tokens. Raw credentials are never stored. Data is cryptographically signed at the origin node before being ingested into your canonical store.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Marketplace;
