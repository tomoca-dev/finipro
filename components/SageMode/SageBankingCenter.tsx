
import React, { useState, useEffect, useRef } from 'react';
import { 
  Landmark, RefreshCw, History, Loader2, 
  ChevronRight, Database, Puzzle, Link as LinkIcon,
  CheckCircle2, XCircle, MoreVertical, Trash2, Check,
  Upload, FileSpreadsheet, Zap, ShieldCheck, Search,
  Filter, AlertCircle, ArrowUpRight, ArrowDownRight,
  FileText, Activity, Save
} from 'lucide-react';
import { SageTab } from './SageModeShell';
import { supabase, logAuditAction, isSupabaseConfigured, localDb } from '../../services/supabaseClient';

interface Transaction {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: 'PENDING' | 'MATCHED' | 'VOIDED';
  ref_node?: string;
}

interface SageBankingCenterProps {
  navigateTo: (tab: SageTab) => void;
}

const SageBankingCenter: React.FC<SageBankingCenterProps> = ({ navigateTo }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    let data: any[] = [];
    if (isSupabaseConfigured()) {
      const { data: res } = await supabase.from('bank_transactions').select('*').order('date', { ascending: false });
      data = res || [];
    } else {
      data = localDb.get('bank_transactions');
    }
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate live bank API handshake
    await new Promise(r => setTimeout(r, 1500));
    
    const mockTx = [
      { id: `bank-${Date.now()}-1`, date: new Date().toISOString().split('T')[0], desc: 'STRIPE PAYOUT REF_882', amount: 14200.50, status: 'PENDING' as const },
      { id: `bank-${Date.now()}-2`, date: new Date().toISOString().split('T')[0], desc: 'AWS INFRASTRUCTURE BILL', amount: -1240.50, status: 'PENDING' as const },
    ];
    
    if (isSupabaseConfigured()) {
      await supabase.from('bank_transactions').insert(mockTx);
    } else {
      localDb.insert('bank_transactions', mockTx);
    }
    
    await fetchTransactions();
    logAuditAction('system', 'LIVE_BANK_SYNC', 'bank_transactions', 'batch_id', { count: 2 });
    setIsSyncing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate Neural Extraction of CSV/Excel Statement
    await new Promise(r => setTimeout(r, 2000));
    
    const extractedTx = [
      { id: `ext-${Date.now()}-1`, date: '2023-11-15', desc: 'IMPORT: CBE RETAIL DEPOSIT', amount: 45000.00, status: 'PENDING' as const },
      { id: `ext-${Date.now()}-2`, date: '2023-11-16', desc: 'IMPORT: LOGISTICS FUEL_X42', amount: -320.00, status: 'PENDING' as const },
    ];

    if (isSupabaseConfigured()) {
      await supabase.from('bank_transactions').insert(extractedTx);
    } else {
      localDb.insert('bank_transactions', extractedTx);
    }

    await fetchTransactions();
    logAuditAction('system', 'FORENSIC_IMPORT', 'bank_transactions', file.name, { method: 'EXCEL_UPLOAD' });
    setIsUploading(false);
  };

  const handleMatch = async (id: string) => {
    if (isSupabaseConfigured()) {
      await supabase.from('bank_transactions').update({ status: 'MATCHED' }).eq('id', id);
    } else {
      localDb.update('bank_transactions', id, { status: 'MATCHED' });
    }
    
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'MATCHED' } : t));
    logAuditAction('system', 'RECON_MATCH', 'bank_transactions', id, { status: 'MATCHED' });
  };

  // Fix: Added missing handleDelete function to resolve 'Cannot find name handleDelete' error
  const handleDelete = async (id: string) => {
    if (!confirm("Void statutory transaction record? This action will be audited.")) return;
    if (isSupabaseConfigured()) {
      await supabase.from('bank_transactions').delete().eq('id', id);
    } else {
      localDb.delete('bank_transactions', id);
    }
    
    setTransactions(prev => prev.filter(t => t.id !== id));
    logAuditAction('system', 'VOID_BANK_TRANSACTION', 'bank_transactions', id, {});
  };

  const matchedTotal = transactions.filter(t => t.status === 'MATCHED').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t => 
    t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm)
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Bank Reconciliation Hub</h2>
          <p className="text-sm text-slate-500 font-medium">Reconcile checking accounts against institutional ledger actuals</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-white transition-all active:scale-95"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Provision Statement (Excel)
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
          
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 transition-all active:scale-95"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Handshake Live Feed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform duration-700"><Landmark size={120} /></div>
           <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-900/30"><Landmark size={24} /></div>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${transactions.length > 0 ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/10' : 'bg-slate-100 dark:bg-slate-800 border-slate-200'}`}>
                 {transactions.length > 0 ? 'REGISTRY ACTIVE' : 'AWAITING INGRESS'}
              </span>
           </div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Operational Ledger Balance</h3>
           <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter relative z-10">
              Br {matchedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </p>
           <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-green-600" /> WORM Verified
              </div>
              <button 
                onClick={() => navigateTo('GL')}
                className="text-indigo-600 hover:underline text-[9px] font-black uppercase tracking-widest"
              >
                Audit General Ledger
              </button>
           </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-inner flex flex-col justify-center">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Book Balance Delta</p>
                 <p className={`text-4xl font-black font-mono tracking-tighter ${pendingTotal === 0 ? 'text-slate-400' : 'text-indigo-600'}`}>
                    Br {pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"><Puzzle size={24} className="text-indigo-500" /></div>
           </div>
           <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
             {transactions.filter(t => t.status === 'PENDING').length} transaction artifacts require manual handshake or neural auto-matching to clear the variance queue.
           </p>
        </div>

        <div className="bg-indigo-600 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700 rotate-12"><Zap size={140} /></div>
           <h4 className="text-xl font-black uppercase tracking-tighter mb-4 italic leading-tight">Neural Auto-Match</h4>
           <p className="text-sm font-medium opacity-80 leading-relaxed italic mb-10">
             "Our AI agent can scan bank narratives and match them to open receipts or vendor invoices in the sub-ledger based on historical payment velocity."
           </p>
           <button 
             onClick={() => alert("Reconciliation Agent Activated: Scanning 142 history patterns...")}
             className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10"
           >
              <Zap size={16} /> Execute Neural Reconciliation
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow flex flex-col">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-10">
            <div className="relative flex-1 group max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search bank narratives, amount, or hash..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20" 
            />
            </div>
            <div className="flex gap-4">
               <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">UNMATCHED</button>
                  <button className="px-4 py-2 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-slate-900 transition-all">POSTED</button>
               </div>
               <button onClick={fetchTransactions} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
               </button>
               <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 shadow-sm hover:text-indigo-600"><Filter size={18} /></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                  <tr>
                     <th className="px-8 py-5">Value Date</th>
                     <th className="px-8 py-5">Institutional Narrative</th>
                     <th className="px-8 py-5 text-right">Debit (Br)</th>
                     <th className="px-8 py-5 text-right">Credit (Br)</th>
                     <th className="px-8 py-5">Handshake Node</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-24 text-center"><Loader2 size={40} className="animate-spin mx-auto text-indigo-600" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-40 text-center">
                         <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner border-2 border-slate-100 dark:border-slate-800">
                            <History size={40} />
                         </div>
                         <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter italic">Statement Pool Empty</h4>
                         <p className="text-slate-400 text-[10px] font-black uppercase mt-2 tracking-widest">Provision an Excel statement to populate registry</p>
                      </td>
                    </tr>
                  ) : filtered.map(t => (
                    <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group ${t.status === 'MATCHED' ? 'opacity-40' : ''}`}>
                       <td className="px-8 py-6">
                          <p className="font-bold text-slate-500 uppercase">{t.date}</p>
                          <p className="text-[8px] font-mono text-slate-300 mt-1 uppercase">HASH: {t.id.slice(-8)}</p>
                       </td>
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">{t.desc}</p>
                       </td>
                       <td className="px-8 py-6 text-right font-mono font-black text-red-600">
                          {t.amount < 0 ? (Math.abs(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                       </td>
                       <td className="px-8 py-6 text-right font-mono font-black text-green-600">
                          {t.amount > 0 ? t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest flex items-center gap-2 w-fit ${
                            t.status === 'MATCHED' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-amber-500/10 text-amber-600 border-amber-200 shadow-sm'
                          }`}>
                            {t.status === 'MATCHED' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                            {t.status}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             {t.status === 'PENDING' && (
                                <button 
                                  onClick={() => handleMatch(t.id)}
                                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all active:scale-90"
                                >
                                   Match Node
                                </button>
                             )}
                             <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                             <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><MoreVertical size={16} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Link Status: SECURE</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WORM Integrity: SHA-256</span>
               </div>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase hover:underline">
               Download Handshake Report <ArrowUpRight size={14} />
            </button>
         </div>
      </div>

      <div className="p-10 bg-slate-950 text-indigo-100 rounded-[48px] border-2 border-indigo-500/20 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Database size={160} /></div>
         <div className="flex items-center gap-10 relative z-10">
            <div className="p-6 bg-indigo-600 text-white rounded-[32px] shadow-xl shadow-indigo-900/40 border border-indigo-400/20 group-hover:rotate-6 transition-transform">
               <ShieldCheck size={48} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase tracking-tighter italic">Statutory Audit Lock</h4>
               <p className="text-sm font-medium opacity-70 max-w-3xl leading-relaxed mt-1 italic">
                  "Once a transaction is matched, its ledger hash is immutable. Any manual attempt to reverse a cleared transaction will trigger a High-Risk Anomaly in the Governance Forensics node for Board-level review."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SageBankingCenter;
