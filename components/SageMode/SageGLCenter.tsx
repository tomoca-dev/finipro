
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, Database, Plus, Search, Filter, ArrowRightLeft, 
  History, ShieldCheck, Zap, Calculator, Table, X, Save,
  CheckCircle2, Loader2, Info, ChevronRight, Wand2, Bot,
  TrendingUp, Activity, Terminal, ClipboardCheck, Trash2, Store, RefreshCw,
  FolderPlus, ShieldAlert, AlertCircle, Calendar
} from 'lucide-react';
import { FinancialRecord, User, ShopNode, LedgerEntry } from '../../types';
import { SageTab } from './SageModeShell';
import { supabase, isSupabaseConfigured, localDb } from '../../services/supabaseClient';

interface GLAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

interface SageGLCenterProps {
  user: User;
  onPost: (records: FinancialRecord[]) => void;
  navigateTo: (tab: SageTab) => void;
  currency: string;
  shops: ShopNode[];
}

const SageGLCenter: React.FC<SageGLCenterProps> = ({ user, onPost, navigateTo, shops }) => {
  const [activePane, setActivePane] = useState<'COA' | 'JOURNALS'>('COA');
  
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // Journal Filters
  const [journalSearch, setJournalSearch] = useState('');
  const [journalDateStart, setJournalDateStart] = useState('');
  const [journalDateEnd, setJournalDateEnd] = useState('');

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAcc, setNewAcc] = useState<Partial<GLAccount>>({ code: '', name: '', type: 'Asset' });
  
  const [isCreatingJournal, setIsCreatingJournal] = useState(false);
  const [isCalculatingCash, setIsCalculatingCash] = useState(false);
  const [cashCalc, setCashCalc] = useState({
    expected: 0,
    actual: 0,
    cashAcc: '1010-00',
    expenseAcc: '6000-10',
    incomeAcc: '4000-01'
  });
  const [cashCalcResult, setCashCalcResult] = useState<any>(null);

  const [newJournal, setNewJournal] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    desc: '', 
    debit: 0, 
    credit: 0, 
    account: '',
    shopNode: shops[0]?.id || ''
  });

  const handleCalculateCash = () => {
    const difference = cashCalc.actual - cashCalc.expected;
    let status = 'balanced';
    let journalLines: any[] = [];

    if (difference === 0) {
      status = 'balanced';
    } else if (difference < 0) {
      status = 'short';
      journalLines = [
        { account: cashCalc.expenseAcc, debit: Math.abs(difference), credit: 0, desc: 'Cash Shortage Adjustment' },
        { account: cashCalc.cashAcc, debit: 0, credit: Math.abs(difference), desc: 'Cash Shortage Adjustment' }
      ];
    } else {
      status = 'over';
      journalLines = [
        { account: cashCalc.cashAcc, debit: Math.abs(difference), credit: 0, desc: 'Cash Overage Adjustment' },
        { account: cashCalc.incomeAcc, debit: 0, credit: Math.abs(difference), desc: 'Cash Overage Adjustment' }
      ];
    }

    setCashCalcResult({
      status,
      difference,
      journal_lines: journalLines
    });
  };

  const handlePostCashAdjustment = async () => {
    if (!cashCalcResult || cashCalcResult.status === 'balanced') return;

    const entries = cashCalcResult.journal_lines.map((line: any) => ({
      date: new Date().toISOString().split('T')[0],
      description: line.desc,
      debit: line.debit,
      credit: line.credit,
      account_code: line.account,
      shop_node: shops[0]?.id || '',
      currency: 'ETB'
    }));

    if (isSupabaseConfigured()) {
      await supabase.from('sage_ledger_entries').insert(entries);
    } else {
      localDb.insert('sage_ledger_entries', entries);
    }

    await fetchLedger();
    setIsCalculatingCash(false);
    setCashCalcResult(null);
  };

  const fetchLedger = async () => {
    setIsLoadingLedger(true);
    let entries: LedgerEntry[] = [];

    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase.from('sage_ledger_entries').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                entries = data;
            } else {
                entries = localDb.get('sage_ledger_entries');
            }
        } catch (e) {
            entries = localDb.get('sage_ledger_entries');
        }
    } else {
        entries = localDb.get('sage_ledger_entries');
    }

    setLedgerEntries(entries);
    discoverAndCalculateAccounts(entries);
    setIsLoadingLedger(false);
  };

  const discoverAndCalculateAccounts = (entries: LedgerEntry[]) => {
    const uniqueCodes = Array.from(new Set(entries.map(e => e.account_code)));
    const discoveredAccounts: GLAccount[] = uniqueCodes.map(code => {
        const accEntries = entries.filter(e => e.account_code === code);
        const totalDebit = accEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredit = accEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
        
        let type: GLAccount['type'] = 'Asset';
        let name = `Discovered Account ${code}`;

        if (code.startsWith('1')) { type = 'Asset'; name = code === '1010-00' ? 'Institutional Checking' : 'General Asset'; }
        else if (code.startsWith('2')) { type = 'Liability'; name = 'Statutory Tax Liability'; }
        else if (code.startsWith('3')) { type = 'Equity'; name = 'Retained Earnings Node'; }
        else if (code.startsWith('4')) { type = 'Revenue'; name = 'Posted Revenue Sink'; }
        else if (code.startsWith('5')) { type = 'Expense'; name = 'COGS Allocation'; }
        else if (code.startsWith('6')) { type = 'Expense'; name = 'Operating Expenditure'; }

        let balance = 0;
        if (type === 'Asset' || type === 'Expense') {
            balance = totalDebit - totalCredit;
        } else {
            balance = totalCredit - totalDebit;
        }

        return { code, name, type, balance };
    });

    setAccounts(discoveredAccounts);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredJournals = useMemo(() => {
    return ledgerEntries.filter(e => {
        const matchesSearch = (e.description || '').toLowerCase().includes(journalSearch.toLowerCase()) || (e.account_code || '').includes(journalSearch);
        const eDate = new Date(e.date).getTime();
        const matchesStart = journalDateStart ? eDate >= new Date(journalDateStart).getTime() : true;
        const matchesEnd = journalDateEnd ? eDate <= new Date(journalDateEnd).getTime() + 86400000 : true;
        return matchesSearch && matchesStart && matchesEnd;
    });
  }, [ledgerEntries, journalSearch, journalDateStart, journalDateEnd]);

  const handlePurgeLedger = async () => {
    if (!confirm("CRITICAL: Wipe entire General Ledger registry? This cannot be undone.")) return;
    setIsLoadingLedger(true);
    if (isSupabaseConfigured()) {
        await supabase.from('sage_ledger_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    localStorage.removeItem('finops_sage_ledger_entries');
    setAccounts([]);
    setLedgerEntries([]);
    setIsLoadingLedger(false);
  };

  const handleAddAccount = () => {
    if (!newAcc.code || !newAcc.name) return;
    setAccounts([...accounts, { ...newAcc, balance: 0 } as GLAccount]);
    setIsAddingAccount(false);
    setNewAcc({ code: '', name: '', type: 'Asset' });
  };

  const handleAddJournal = async () => {
    const entry = { 
        date: newJournal.date, 
        description: newJournal.desc, 
        debit: newJournal.debit, 
        credit: newJournal.credit, 
        account_code: newJournal.account, 
        shop_node: newJournal.shopNode,
        currency: 'ETB'
    };

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('sage_ledger_entries').insert([entry]).select();
        if (!error && data) {
            await fetchLedger();
            setIsCreatingJournal(false);
            setNewJournal({ date: new Date().toISOString().split('T')[0], desc: '', debit: 0, credit: 0, account: '', shopNode: shops[0]?.id || '' });
        }
    } else {
        localDb.insert('sage_ledger_entries', [entry]);
        await fetchLedger();
        setIsCreatingJournal(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (isSupabaseConfigured()) {
        await supabase.from('sage_ledger_entries').delete().eq('id', id);
    } else {
        localDb.delete('sage_ledger_entries', id);
    }
    await fetchLedger();
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-8 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-900/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">General Ledger Center</h2>
            <div className="flex gap-4 mt-2">
               {[
                 { id: 'COA', label: 'Master Chart', icon: <Table size={12} /> },
                 { id: 'JOURNALS', label: 'Ledger Audit', icon: <ArrowRightLeft size={12} /> },
               ].map(t => (
                 <button 
                  key={t.id} 
                  onClick={() => setActivePane(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activePane === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                 >
                   {t.icon} {t.label}
                 </button>
               ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {ledgerEntries.length > 0 && (
             <button 
               onClick={handlePurgeLedger}
               title="Wipe Entire Ledger"
               className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all shadow-sm"
             >
                <Trash2 size={18} />
             </button>
           )}
           <button 
             onClick={fetchLedger}
             className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
           >
              <RefreshCw size={18} className={isLoadingLedger ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={() => navigateTo('BATCHES')}
             className="flex flex-col items-end group px-6 py-2 border-2 border-indigo-500/20 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
           >
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                <ClipboardCheck size={10} /> Verification Queue
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono leading-none mt-1 group-hover:scale-105 transition-transform">INBOUND SINK</p>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activePane === 'COA' && (
          <div className="p-10 space-y-10 animate-in slide-in-from-left-4 duration-500">
             {accounts.length > 0 ? (
               <>
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-8 luxury-shadow">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="Search account codes/names..." className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm" />
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setIsAddingAccount(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">+ Provision Account</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-8 py-5">Account Node</th>
                            <th className="px-8 py-5">Description Name</th>
                            <th className="px-8 py-5">Type Segment</th>
                            <th className="px-8 py-5 text-right">Book Balance (Br)</th>
                            <th className="px-8 py-5"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                          {accounts.map(acc => (
                            <tr key={acc.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                              <td className="px-8 py-6 font-mono font-black text-indigo-600 dark:text-indigo-400">{acc.code}</td>
                              <td className="px-8 py-6 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{acc.name}</td>
                              <td className="px-8 py-6">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                                    acc.type === 'Asset' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                                    acc.type === 'Liability' ? 'bg-orange-500/10 text-orange-600 border-orange-200' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>{acc.type}</span>
                              </td>
                              <td className={`px-8 py-6 text-right font-mono font-black ${acc.balance < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                  {(acc.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-8 py-6 text-right">
                                  <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors uppercase text-[9px] font-black tracking-widest border border-slate-200 rounded-lg">Audit Node</button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                </div>
               </>
             ) : (
               <div className="py-24 text-center space-y-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] luxury-shadow">
                  <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[48px] flex items-center justify-center mx-auto text-slate-200 dark:text-slate-800 animate-float shadow-inner">
                     <Layers size={64} />
                  </div>
                  <div className="max-w-md mx-auto space-y-4">
                     <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Registry Empty</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        "Your Chart of Accounts is currently blank. Upload data from the Verification Queue to discover institutional account nodes."
                     </p>
                  </div>
                  <div className="flex gap-6 justify-center">
                     <button 
                        onClick={() => navigateTo('BATCHES')}
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-3"
                     >
                        <Wand2 size={16} /> Open Verification Queue
                     </button>
                  </div>
               </div>
             )}
          </div>
        )}

        {activePane === 'JOURNALS' && (
          <div className="p-10 space-y-10 animate-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm">
                <div className="flex flex-1 gap-6">
                   <div className="relative flex-1 max-w-xs group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input type="text" value={journalSearch} onChange={e => setJournalSearch(e.target.value)} placeholder="Search Ledger..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none" />
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <input type="date" value={journalDateStart} onChange={e => setJournalDateStart(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold dark:text-white outline-none" />
                      <span className="text-slate-300">to</span>
                      <input type="date" value={journalDateEnd} onChange={e => setJournalDateEnd(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold dark:text-white outline-none" />
                   </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsCalculatingCash(true)}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
                    >
                      Cash Audit
                    </button>
                    <button 
                      onClick={() => setIsCreatingJournal(true)}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                    >
                      + Manual Entry
                    </button>
                 </div>
             </div>

              {isCalculatingCash && (
                <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-[32px] p-10 luxury-shadow animate-in zoom-in-95 mb-10">
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                         <Calculator size={20} className="text-indigo-600" /> Cash Over/Short Reconciliation
                      </h4>
                      <button onClick={() => { setIsCalculatingCash(false); setCashCalcResult(null); }}><X size={20} className="text-slate-400" /></button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Cash Total</label>
                               <input type="number" value={cashCalc.expected} onChange={e => setCashCalc({...cashCalc, expected: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual Counted Cash</label>
                               <input type="number" value={cashCalc.actual} onChange={e => setCashCalc({...cashCalc, actual: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cash Account Code</label>
                               <input type="text" value={cashCalc.cashAcc} onChange={e => setCashCalc({...cashCalc, cashAcc: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Over/Short Expense Account</label>
                               <input type="text" value={cashCalc.expenseAcc} onChange={e => setCashCalc({...cashCalc, expenseAcc: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Over/Short Income Account</label>
                               <input type="text" value={cashCalc.incomeAcc} onChange={e => setCashCalc({...cashCalc, incomeAcc: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                            </div>
                         </div>
                         <button onClick={handleCalculateCash} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Run Calculation</button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Calculation Output (JSON)</h5>
                         <pre className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 overflow-auto max-h-[300px] custom-scrollbar">
                            {cashCalcResult ? JSON.stringify(cashCalcResult, null, 2) : '// Result will appear here...'}
                         </pre>
                         {cashCalcResult && cashCalcResult.status !== 'balanced' && (
                            <button 
                              onClick={handlePostCashAdjustment}
                              className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2"
                            >
                               <Save size={14} /> Post Journal Adjustment
                            </button>
                         )}
                      </div>
                   </div>
                </div>
              )}

             {isCreatingJournal && (
                <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-[32px] p-10 luxury-shadow animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                         <Calculator size={20} className="text-indigo-600" /> Statutory Ledger Entry
                      </h4>
                      <button onClick={() => setIsCreatingJournal(false)}><X size={20} className="text-slate-400" /></button>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Node</label>
                        <select 
                          value={newJournal.shopNode} 
                          onChange={e => setNewJournal({...newJournal, shopNode: e.target.value})} 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                        >
                           {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Effective Date</label>
                        <input type="date" value={newJournal.date} onChange={e => setNewJournal({...newJournal, date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Node</label>
                        <select value={newJournal.account} onChange={e => setNewJournal({...newJournal, account: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white">
                           <option value="">Select Code...</option>
                           <option value="1010-00">1010-00 Checking</option>
                           <option value="2000-01">2000-01 VAT Liability</option>
                           <option value="2000-10">2000-10 Corporate Tax</option>
                           <option value="4000-01">4000-01 Revenue</option>
                           <option value="5000-01">5000-01 COGS</option>
                           <option value="6000-10">6000-10 OpEx</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Debit (Br)</label>
                        <input type="number" value={newJournal.debit} onChange={e => setNewJournal({...newJournal, debit: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credit (Br)</label>
                        <input type="number" value={newJournal.credit} onChange={e => setNewJournal({...newJournal, credit: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                      </div>
                   </div>
                   <div className="space-y-2 mb-8">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Narrative</label>
                      <input type="text" value={newJournal.desc} onChange={e => setNewJournal({...newJournal, desc: e.target.value})} placeholder="Explain logic for adjusting entry (e.g. Accrual for merchant fees)..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white" />
                   </div>
                   <button onClick={handleAddJournal} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3">
                      <Save size={18} /> Seal & Post Adjusting Entry
                   </button>
                </div>
             )}

             <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                      <tr>
                         <th className="px-8 py-5">Date</th>
                         <th className="px-8 py-5">Node Cluster</th>
                         <th className="px-8 py-5">Account SPEC</th>
                         <th className="px-8 py-5">Forensic Narrative</th>
                         <th className="px-8 py-5 text-right">Debit (Br)</th>
                         <th className="px-8 py-5 text-right">Credit (Br)</th>
                         <th className="px-8 py-5"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {isLoadingLedger ? (
                         <tr><td colSpan={7} className="py-20 text-center"><Loader2 size={32} className="animate-spin mx-auto text-indigo-600" /></td></tr>
                      ) : filteredJournals.length === 0 ? (
                         <tr><td colSpan={7} className="p-20 text-center text-slate-400 font-black uppercase tracking-widest italic opacity-40">No entries found for selected criteria</td></tr>
                      ) : filteredJournals.map(j => (
                        <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                           <td className="px-8 py-6 text-slate-500 font-bold">{j.date}</td>
                           <td className="px-8 py-6">
                              <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-100">{j.shop_node || 'GLOBAL'}</span>
                           </td>
                           <td className="px-8 py-6 font-black text-indigo-600">{j.account_code}</td>
                           <td className="px-8 py-6 font-bold uppercase tracking-tight italic">"{j.description}"</td>
                           <td className={`px-8 py-6 text-right font-mono font-black text-red-600`}>{j.debit > 0 ? `(${(j.debit ?? 0).toLocaleString()})` : '-'}</td>
                           <td className={`px-8 py-6 text-right font-mono font-black text-green-600`}>{j.credit > 0 ? (j.credit ?? 0).toLocaleString() : '-'}</td>
                           <td className="px-8 py-6 text-right">
                              <button onClick={() => deleteEntry(j.id)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {isAddingAccount && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Provision Account Node</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Define new bucket in the Chart of Accounts</p>
                 </div>
                 <button onClick={() => setIsAddingAccount(false)} className="p-4 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all shadow-sm border border-slate-200 dark:border-slate-700"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Code</label>
                       <input 
                         type="text" value={newAcc.code} onChange={e => setNewAcc({...newAcc, code: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                         placeholder="e.g. 1000-01"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Name</label>
                       <input 
                         type="text" value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                         placeholder="Description..."
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type Segment</label>
                    <select 
                        value={newAcc.type} 
                        onChange={e => setNewAcc({...newAcc, type: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                    >
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                        <option value="Equity">Equity</option>
                    </select>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/20 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsAddingAccount(false)} className="flex-1 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Abort</button>
                 <button onClick={handleAddAccount} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Seal Account Node</button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default SageGLCenter;
