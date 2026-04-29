
import React, { useState, useEffect } from 'react';
import { 
  Calculator, FileText, CheckCircle2, AlertCircle, 
  Save, RefreshCw, ArrowRight, Printer, History,
  DollarSign, CreditCard, Smartphone, RotateCcw,
  ShieldCheck, Lock, Unlock, Zap
} from 'lucide-react';
import { ShopNode, LedgerEntry } from '../../types';
import { supabase, isSupabaseConfigured, localDb } from '../../services/supabaseClient';

interface SageRegisterReconProps {
  shop: ShopNode;
}

const SageRegisterRecon: React.FC<SageRegisterReconProps> = ({ shop }) => {
  const [activeView, setActiveView] = useState<'SUMMARY' | 'Z_REPORT' | 'HISTORY'>('SUMMARY');
  const [isLoading, setIsLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  
  // Reconciliation State
  const [actualCash, setActualCash] = useState<number>(0);
  const [isClosing, setIsClosing] = useState(false);
  const [reconResult, setReconResult] = useState<any>(null);

  const fetchShopData = async () => {
    setIsLoading(true);
    let data: LedgerEntry[] = [];
    if (isSupabaseConfigured()) {
      const { data: res } = await supabase
        .from('sage_ledger_entries')
        .select('*')
        .eq('shop_node', shop.id);
      data = res || [];
    } else {
      data = localDb.get('sage_ledger_entries').filter((e: any) => e.shop_node === shop.id);
    }
    setLedgerEntries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchShopData();
  }, [shop.id]);

  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = ledgerEntries.filter(e => e.date === today);
    
    let cashSales = 0;
    let cardSales = 0;
    let mobileSales = 0;
    let refunds = 0;
    let discounts = 0;

    todaysEntries.forEach(e => {
      const amount = e.credit - e.debit; // Revenue is credit normal
      if (e.account_code.startsWith('4')) {
        if (e.description.toLowerCase().includes('cash')) cashSales += amount;
        else if (e.description.toLowerCase().includes('card')) cardSales += amount;
        else if (e.description.toLowerCase().includes('mobile')) mobileSales += amount;
        else cashSales += amount; // Default to cash if unspecified
      }
      if (e.description.toLowerCase().includes('refund')) refunds += Math.abs(amount);
      if (e.description.toLowerCase().includes('discount')) discounts += Math.abs(amount);
    });

    return {
      totalSales: cashSales + cardSales + mobileSales,
      cashSales,
      cardSales,
      mobileSales,
      refunds,
      discounts,
      transactionCount: todaysEntries.length
    };
  }, [ledgerEntries]);

  const handleRunRecon = () => {
    const expected = stats.cashSales;
    const actual = actualCash;
    const difference = actual - expected;
    
    setReconResult({
      expected,
      actual,
      difference,
      status: difference === 0 ? 'BALANCED' : difference < 0 ? 'SHORT' : 'OVER'
    });
  };

  const handleFinalizeZReport = async () => {
    if (!reconResult) return;
    setIsClosing(true);
    
    // Simulate Journal Entry for Over/Short
    if (reconResult.difference !== 0) {
      const entry = {
        date: new Date().toISOString().split('T')[0],
        description: `Z-REPORT ADJUSTMENT [${shop.name}]: ${reconResult.status}`,
        debit: reconResult.difference < 0 ? Math.abs(reconResult.difference) : 0,
        credit: reconResult.difference > 0 ? reconResult.difference : 0,
        account_code: reconResult.difference < 0 ? '6100-00' : '4200-00',
        shop_node: shop.id,
        currency: 'ETB'
      };

      if (isSupabaseConfigured()) {
        await supabase.from('sage_ledger_entries').insert([entry]);
      } else {
        localDb.insert('sage_ledger_entries', [entry]);
      }
    }

    setTimeout(() => {
      setIsClosing(false);
      alert(`Z-Report Finalized for ${shop.name}. Register totals archived.`);
      fetchShopData();
      setReconResult(null);
      setActualCash(0);
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {[
            { id: 'SUMMARY', label: 'Summary Report', icon: <FileText size={14} /> },
            { id: 'Z_REPORT', label: 'Z-Report Close', icon: <Calculator size={14} /> },
            { id: 'HISTORY', label: 'Close History', icon: <History size={14} /> },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveView(t.id as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                activeView === t.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <button onClick={fetchShopData} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {activeView === 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic italic">Current Shift Summary</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Running totals • No register reset</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Expected Sales</p>
                    <p className="text-4xl font-black text-indigo-600 font-mono tracking-tighter italic">Br {stats.totalSales.toLocaleString()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <SummaryCard label="Cash Sales" value={stats.cashSales} icon={<DollarSign size={16} />} color="text-emerald-600" />
                  <SummaryCard label="Card Sales" value={stats.cardSales} icon={<CreditCard size={16} />} color="text-blue-600" />
                  <SummaryCard label="Mobile Money" value={stats.mobileSales} icon={<Smartphone size={16} />} color="text-orange-600" />
                  <SummaryCard label="Transactions" value={stats.transactionCount} icon={<Zap size={16} />} color="text-indigo-600" isCount />
               </div>

               <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-10">
                  <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                     <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-900/20">
                        <RotateCcw size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Refunds Issued</p>
                        <p className="text-xl font-black text-red-600 font-mono tracking-tighter">Br {stats.refunds.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discounts Applied</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">Br {stats.discounts.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
             <div className="bg-slate-900 text-white border-2 border-slate-800 rounded-[40px] p-10 luxury-shadow h-full flex flex-col justify-between">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-indigo-400">
                      <ShieldCheck size={20} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Operational Status</h4>
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight italic leading-tight">Register Node is Currently Active</h3>
                   <p className="text-xs font-medium opacity-60 leading-relaxed italic">
                      "Summary reports provide real-time visibility into shift performance without affecting the ledger state. Use the Z-Report tab to finalize and seal today's transactions."
                   </p>
                </div>
                <button 
                  onClick={() => setActiveView('Z_REPORT')}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                   Prepare Z-Report <ArrowRight size={18} />
                </button>
             </div>
          </div>
        </div>
      )}

      {activeView === 'Z_REPORT' && (
        <div className="max-w-4xl mx-auto space-y-10">
           <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-12 luxury-shadow space-y-12">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Z-Report Reconciliation</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Final Shift Handshake • Register Seal</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Lock size={24} className="text-indigo-600" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <FileText size={14} className="text-indigo-600" /> System Expected Totals
                       </h4>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-500 uppercase">Expected Cash</span>
                             <span className="text-sm font-black font-mono text-slate-900 dark:text-white">Br {stats.cashSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-500 uppercase">Expected Card</span>
                             <span className="text-sm font-black font-mono text-slate-900 dark:text-white">Br {stats.cardSales.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-500 uppercase">Expected Mobile</span>
                             <span className="text-sm font-black font-mono text-slate-900 dark:text-white">Br {stats.mobileSales.toLocaleString()}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                             <span className="text-[10px] font-black text-indigo-600 uppercase">Total Expected</span>
                             <span className="text-lg font-black font-mono text-indigo-600">Br {stats.totalSales.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Physical Cash Counted (Actual)</label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">Br</div>
                          <input 
                            type="number" 
                            value={actualCash}
                            onChange={e => setActualCash(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 pl-14 text-2xl font-black font-mono outline-none focus:border-indigo-500 transition-all dark:text-white"
                          />
                       </div>
                       <button 
                         onClick={handleRunRecon}
                         className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3"
                       >
                          <Calculator size={16} /> Run Over/Short Calculation
                       </button>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    {reconResult ? (
                       <div className={`flex-1 rounded-[40px] p-10 border-2 flex flex-col justify-between animate-in zoom-in-95 ${
                          reconResult.status === 'BALANCED' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/30' :
                          reconResult.status === 'SHORT' ? 'bg-red-50 dark:bg-red-900/10 border-red-500/30' :
                          'bg-amber-50 dark:bg-amber-900/10 border-amber-500/30'
                       }`}>
                          <div className="space-y-6">
                             <div className="flex justify-between items-center">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${
                                   reconResult.status === 'BALANCED' ? 'text-emerald-600' :
                                   reconResult.status === 'SHORT' ? 'text-red-600' :
                                   'text-amber-600'
                                }`}>Reconciliation Result</h4>
                                {reconResult.status === 'BALANCED' ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertCircle size={24} className={reconResult.status === 'SHORT' ? 'text-red-600' : 'text-amber-600'} />}
                             </div>
                             
                             <div className="space-y-2">
                                <p className="text-4xl font-black uppercase tracking-tighter italic">{reconResult.status}</p>
                                <p className="text-xs font-medium opacity-60 italic leading-relaxed">
                                   {reconResult.status === 'BALANCED' ? '"Physical cash matches system expectations perfectly. Register node is ready for period seal."' :
                                    reconResult.status === 'SHORT' ? `"Cash shortage detected. A journal entry of Br ${Math.abs(reconResult.difference).toLocaleString()} will be posted to the Over/Short expense node."` :
                                    `"Cash overage detected. A journal entry of Br ${reconResult.difference.toLocaleString()} will be posted to the Over/Short income node."`}
                                </p>
                             </div>

                             <div className="pt-8 border-t border-black/5 space-y-4">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black uppercase opacity-40">Expected</span>
                                   <span className="text-sm font-black font-mono">Br {reconResult.expected.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black uppercase opacity-40">Actual</span>
                                   <span className="text-sm font-black font-mono">Br {reconResult.actual.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                   <span className="text-[10px] font-black uppercase">Variance</span>
                                   <span className={`text-xl font-black font-mono ${reconResult.difference < 0 ? 'text-red-600' : reconResult.difference > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                      {reconResult.difference > 0 ? '+' : ''}{reconResult.difference.toLocaleString()}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <button 
                            onClick={handleFinalizeZReport}
                            disabled={isClosing}
                            className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                             {isClosing ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                             {isClosing ? 'Sealing Ledger...' : 'Finalize & Seal Register'}
                          </button>
                       </div>
                    ) : (
                       <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-10 text-center space-y-6">
                          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-inner">
                             <Unlock size={32} />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-slate-400 uppercase italic">Awaiting Calculation</h4>
                             <p className="text-xs text-slate-500 mt-2 leading-relaxed">Enter the physical cash count and run the calculation to unlock the reconciliation handshake.</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeView === 'HISTORY' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
           <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Register Close History</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Archived Z-Reports • Audit Trail</p>
              </div>
              <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                 <Printer size={14} /> Export Archive
              </button>
           </div>
           <div className="p-10">
              <table className="w-full text-left text-xs">
                 <thead className="text-slate-500 font-black uppercase text-[10px] tracking-widest border-b pb-4">
                    <tr>
                       <th className="py-4 px-4">Date/Time</th>
                       <th className="py-4 px-4">Operator</th>
                       <th className="py-4 px-4 text-right">Expected</th>
                       <th className="py-4 px-4 text-right">Actual</th>
                       <th className="py-4 px-4 text-right">Variance</th>
                       <th className="py-4 px-4 text-center">Status</th>
                       <th className="py-4 px-4"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {ledgerEntries.filter(e => e.description.includes('Z-REPORT')).map((entry, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                          <td className="py-6 px-4 font-bold text-slate-500">{entry.date}</td>
                          <td className="py-6 px-4 font-black text-slate-900 dark:text-white uppercase italic">SYSTEM_AUTO</td>
                          <td className="py-6 px-4 text-right font-mono font-bold">Br {(entry.credit || entry.debit).toLocaleString()}</td>
                          <td className="py-6 px-4 text-right font-mono font-bold">Br {(entry.credit || entry.debit).toLocaleString()}</td>
                          <td className={`py-6 px-4 text-right font-mono font-black ${entry.debit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                             {entry.debit > 0 ? '-' : '+'}{Math.abs(entry.debit || entry.credit).toLocaleString()}
                          </td>
                          <td className="py-6 px-4 text-center">
                             <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${
                                entry.description.includes('SHORT') ? 'bg-red-500/10 text-red-600 border-red-200' : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                             }`}>
                                {entry.description.includes('SHORT') ? 'SHORT' : 'OVER'}
                             </span>
                          </td>
                          <td className="py-6 px-4 text-right">
                             <button className="p-2 text-slate-300 hover:text-indigo-600"><FileText size={16} /></button>
                          </td>
                       </tr>
                    ))}
                    {ledgerEntries.filter(e => e.description.includes('Z-REPORT')).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest italic opacity-40">No archived Z-Reports found for this node</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ label: string, value: number, icon: React.ReactNode, color: string, isCount?: boolean }> = ({ label, value, icon, color, isCount }) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all shadow-sm">
     <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 ${color} w-fit mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
     </div>
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-xl font-black font-mono tracking-tighter ${color}`}>
        {isCount ? value : `Br ${value.toLocaleString()}`}
     </p>
  </div>
);

export default SageRegisterRecon;
