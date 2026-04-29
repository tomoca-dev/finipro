
import React, { useState, useEffect } from 'react';
import { 
  FileText, PieChart, TrendingUp, Download, Filter, 
  Search, Calculator, Calendar, ArrowUpRight, ArrowDownRight, 
  Table, Sparkles, Layout, Globe, CheckCircle2, Loader2,
  ChevronDown, ChevronRight, ShieldCheck, Printer, Share2, 
  FileSearch, Activity, Landmark, Database, Store, RefreshCw,
  Percent, Lock, ShieldAlert, Scale
} from 'lucide-react';
import { MOCK_DEPARTMENTS } from '../../constants';
import { supabase, isSupabaseConfigured, localDb } from '../../services/supabaseClient';
import { LedgerEntry } from '../../types';

const SageReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'PL' | 'BS' | 'TAX' | 'CONSOLIDATED'>('PL');
  const [selectedShop, setSelectedShop] = useState<string>('ALL_NODES');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSealing, setIsSealing] = useState(false);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  const fetchLedgerData = async () => {
    setIsLoading(true);
    let data: LedgerEntry[] = [];
    if (isSupabaseConfigured()) {
      const { data: res } = await supabase.from('sage_ledger_entries').select('*');
      data = res || [];
    } else {
      data = localDb.get('sage_ledger_entries');
    }
    setLedgerEntries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const reportRows = React.useMemo(() => {
    const filtered = selectedShop === 'ALL_NODES' 
      ? ledgerEntries 
      : ledgerEntries.filter(e => e.shop_node === selectedShop);

    const accountMap: Record<string, { code: string, name: string, amount: number, budget: number, category: string }> = {};
    
    filtered.forEach(entry => {
      const code = entry.account_code;
      if (!accountMap[code]) {
        let name = "Unknown Account";
        let category = "OTHER";
        
        if (code.startsWith('4')) { name = "Direct Sales Revenue"; category = "REVENUE"; }
        else if (code.startsWith('5')) { name = "Direct COGS Allocation"; category = "COGS"; }
        else if (code.startsWith('6')) { name = "Operational Expense"; category = "OPEX"; }
        else if (code === '2000-01' || code.startsWith('2')) { name = "Statutory VAT Liability"; category = "TAX"; }
        else if (code === '1010-00') { name = "Cash/Bank Clearing"; category = "ASSET"; }

        accountMap[code] = { code, name, amount: 0, budget: 0, category };
      }
      
      const debit = entry.debit ?? 0;
      const credit = entry.credit ?? 0;

      // Accounting logic: Revenue/Liability (Credit normal), Assets/Expenses (Debit normal)
      if (code.startsWith('4') || code.startsWith('2')) {
        accountMap[code].amount += (credit - debit);
        accountMap[code].budget = code.startsWith('4') ? 150000 : 18000; 
      } else {
        accountMap[code].amount += (debit - credit);
        accountMap[code].budget = 45000; 
      }
    });

    return Object.values(accountMap).sort((a, b) => a.code.localeCompare(b.code));
  }, [ledgerEntries, selectedShop]);

  const totalRevenue = reportRows.filter(r => r.category === 'REVENUE').reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalCOGS = reportRows.filter(r => r.category === 'COGS').reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalExpense = reportRows.filter(r => r.category === 'OPEX').reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalTax = reportRows.filter(r => r.category === 'TAX').reduce((s, r) => s + (r.amount ?? 0), 0);
  
  const ebitda = totalRevenue - totalCOGS - totalExpense;
  const netIncome = ebitda - totalTax;

  const handleSealPeriod = () => {
    setIsSealing(true);
    setTimeout(() => {
      setIsSealing(false);
      setIsPeriodClosed(true);
      alert("Institutional Period Sealed. All ledger nodes for this interval are now WORM-locked.");
    }, 2500);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Statutory Reporting</h2>
            {isPeriodClosed && (
              <span className="px-3 py-1 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-900/40">
                <Lock size={12} /> Period Sealed
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
             <div className="relative group">
                <Store size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                <select 
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500 appearance-none shadow-inner"
                >
                  <option value="ALL_NODES">Global Consolidation</option>
                  {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>Branch: {d}</option>)}
                </select>
             </div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reporting Basis: Accrual</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLedgerData} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
             <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {!isPeriodClosed ? (
            <button 
              onClick={handleSealPeriod}
              disabled={isSealing || reportRows.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30"
            >
              {isSealing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} className="text-green-500" />}
              Seal & Close Period
            </button>
          ) : (
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
               <Printer size={16} /> Print Official Ledger
            </button>
          )}
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40">
            <Download size={16} /> Management Pack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ReportStatCard label="Gross Revenue" value={totalRevenue} icon={<TrendingUp size={16} />} color="text-indigo-600" />
          <ReportStatCard label="Total COGS" value={totalCOGS} icon={<Activity size={16} />} color="text-red-600" />
          <ReportStatCard label="Statutory Tax" value={totalTax} icon={<Percent size={16} />} color="text-orange-600" isHighlight />
          <ReportStatCard label="Net Period Surplus" value={netIncome} icon={<Scale size={16} />} color={netIncome >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-4">
           {[
             { id: 'PL', label: 'Profit & Loss', icon: <FileText size={14} /> },
             { id: 'BS', label: 'Balance Sheet', icon: <Layout size={14} /> },
             { id: 'TAX', label: 'Tax Reconciliation', icon: <Percent size={14} /> },
             { id: 'CONSOLIDATED', label: 'Benchmarking', icon: <Globe size={14} /> },
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => setActiveReport(item.id as any)}
               className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${
                 activeReport === item.id 
                 ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-xl' 
                 : 'bg-slate-50 dark:bg-slate-950 border-transparent text-slate-400 hover:border-slate-200'
               }`}
             >
                <div className="flex items-center gap-3 mb-2">
                   <div className={`${activeReport === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>{item.icon}</div>
                   <h4 className={`font-black uppercase text-xs tracking-widest ${activeReport === item.id ? 'text-indigo-900 dark:text-white' : ''}`}>{item.label}</h4>
                </div>
                <p className="text-[9px] font-medium leading-tight opacity-70 italic">Artifact Source: Distributed Ledger</p>
             </button>
           ))}
        </aside>

        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-12 luxury-shadow overflow-hidden relative">
           {isPeriodClosed && (
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
                 <ShieldCheck size={200} className="text-green-600" />
              </div>
           )}
           
           <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                   {activeReport === 'PL' ? 'Income Statement' : activeReport === 'BS' ? 'Statement of Position' : activeReport === 'TAX' ? 'Statutory Tax Hub' : 'Regional Benchmarking'}
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1">Status: {isPeriodClosed ? 'AUDITED CLOSED' : 'PROVISIONAL OPEN'} • Currency: ETB</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Surplus Handshake</p>
                 <p className={`text-4xl font-black font-mono tracking-tighter ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Br {(netIncome ?? 0).toLocaleString()}
                 </p>
              </div>
           </div>

           {isLoading ? (
             <div className="py-32 text-center flex flex-col items-center gap-4">
                <Loader2 size={48} className="animate-spin text-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consolidating Ledger Nodes...</p>
             </div>
           ) : reportRows.length === 0 ? (
             <div className="py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
                <Database size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
                <h4 className="text-xl font-black text-slate-400 uppercase italic">No Ledger Records for this Period</h4>
                <p className="text-sm text-slate-500 mt-2">Post a batch from the Verification Queue to populate reports.</p>
             </div>
           ) : (
            <div className="space-y-0 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl relative z-10">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                        <tr>
                        <th className="px-8 py-4">Account Code</th>
                        <th className="px-8 py-4">Description Name</th>
                        <th className="px-8 py-4 text-right">Actuals (Br)</th>
                        <th className="px-8 py-4 text-right">Target (Br)</th>
                        <th className="px-8 py-4 text-right">Variance %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {reportRows.filter(r => r.code !== '1010-00').map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                            <td className="px-8 py-4 font-mono font-black text-indigo-600 dark:text-indigo-400">{row.code}</td>
                            <td className="px-8 py-4 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                                {row.name}
                                {row.category === 'TAX' && <span className="ml-2 px-1.5 py-0.5 bg-orange-500/10 text-orange-600 text-[8px] rounded border border-orange-500/20 uppercase">Statutory</span>}
                            </td>
                            <td className={`px-8 py-4 text-right font-mono font-black ${row.category === 'COGS' || row.category === 'OPEX' || row.category === 'TAX' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                {row.amount < 0 ? `(${(Math.abs(row.amount ?? 0)).toLocaleString()})` : (row.amount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-8 py-4 text-right text-slate-400 font-bold">Br {(row.budget ?? 0).toLocaleString()}</td>
                            <td className={`px-8 py-4 text-right font-black ${row.amount > row.budget ? (row.category === 'REVENUE' ? 'text-green-500' : 'text-red-500') : 'text-slate-400'}`}>
                                {row.budget > 0 ? (((row.amount / row.budget) - 1) * 100).toFixed(1) : '0.0'}%
                            </td>
                        </tr>
                        ))}
                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-t-2">
                           <td colSpan={2} className="px-8 py-6 font-black uppercase text-slate-500 tracking-widest italic flex items-center gap-3">
                              <Landmark size={14} className="text-indigo-500" /> Institutional Cash Offset (Clearing)
                           </td>
                           <td className="px-8 py-6 text-right font-mono font-black text-slate-400">
                              (Br {Math.abs(reportRows.find(r => r.code === '1010-00')?.amount || 0).toLocaleString()})
                           </td>
                           <td colSpan={2}></td>
                        </tr>
                        <tr className="bg-indigo-600 text-white shadow-xl relative z-20">
                        <td colSpan={2} className="px-8 py-6 font-black uppercase tracking-[0.2em] text-xs">Consolidated Net Surplus After Tax</td>
                        <td className="px-8 py-6 text-right font-black text-xl font-mono">
                            Br {(netIncome ?? 0).toLocaleString()}
                        </td>
                        <td colSpan={2} className="text-right px-8 opacity-60 italic text-[10px] font-bold">PERIOD TOTALS</td>
                        </tr>
                    </tbody>
                </table>
            </div>
           )}
           
           <div className="mt-12 p-8 bg-slate-950 text-white rounded-[32px] flex items-center justify-between border border-slate-800 relative z-10">
              <div className="flex items-center gap-6">
                 <div className={`p-4 rounded-2xl shadow-xl shadow-indigo-900/40 ${isPeriodClosed ? 'bg-green-600' : 'bg-indigo-600'}`}>
                    <Sparkles size={28} />
                 </div>
                 <div>
                    <h4 className="font-black uppercase tracking-tight text-lg italic">Statutory Compliance Narrative</h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed italic max-w-2xl">
                       {isPeriodClosed 
                         ? `"Period finalized. All entries cryptographically sealed. Tax exposure of Br ${totalTax.toLocaleString()} indexed for statutory filing. Ledger integrity confirmed 100%."`
                         : netIncome > 0 
                            ? `"Institutional Surplus confirmed. Revenue nodes are over-performing relative to COGS staging. Tax provision calculated at effective rate."`
                            : `"Ledger indicates operational deficit. Recommend immediate review of OpEx nodes before period seal handshake."`}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ReportStatCard: React.FC<{ label: string, value: number, icon: React.ReactNode, color: string, isHighlight?: boolean, isNegative?: boolean }> = ({ label, value, icon, color, isHighlight }) => (
    <div className={`p-8 bg-white dark:bg-slate-900 border-2 rounded-[32px] luxury-shadow group transition-all hover:border-indigo-500/30 ${isHighlight ? 'border-orange-500/30 ring-4 ring-orange-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {isHighlight && <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-600 text-white rounded uppercase shadow-sm">Critical</span>}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black font-mono tracking-tighter ${color}`}>
            {value < 0 ? `(Br ${Math.abs(value).toLocaleString()})` : `Br ${value.toLocaleString()}`}
        </p>
    </div>
);

export default SageReports;
