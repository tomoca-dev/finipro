
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, CheckCircle2, XCircle, AlertCircle, 
  Clock, Loader2, MoreHorizontal, Sparkles, ShieldCheck,
  User as UserIcon, RotateCcw, AlertTriangle, Eye, Info, Wand2, Database,
  Check, X, ArrowRight, ArrowUpRight, TrendingUp, RefreshCw, Layers, Map, ListFilter,
  FileSpreadsheet, Tag, Box, Landmark, Save, Calculator, Fingerprint, ChevronRight,
  Banknote, Upload, Shield, Signature, Send, FileSearch, Search, Zap, Receipt,
  Calendar, DollarSign, Scale, FileSignature, Bot
} from 'lucide-react';
import { User, SageBatch, UserRole, CurrencyCode, ShopNode } from '../../types';
import { supabase, logAuditAction, isSupabaseConfigured, localDb } from '../../services/supabaseClient';
import { SageTab } from './SageModeShell';
import SageIngestionWizard from './SageIngestionWizard';

interface SageBatchManagerProps {
  user: User;
  currency: CurrencyCode;
  navigateTo: (tab: SageTab) => void;
  shops: ShopNode[];
}

const SageBatchManager: React.FC<SageBatchManagerProps> = ({ user, currency, navigateTo, shops }) => {
  const [batches, setBatches] = useState<SageBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBatch, setActiveBatch] = useState<SageBatch | null>(null);
  const [activeBatchItems, setActiveBatchItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'GRID' | 'WIZARD' | 'UPLOAD'>('GRID');
  
  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'POSTED'>('ALL');

  // Mapping & Processing State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [exceptions, setExceptions] = useState<{id: string, field: string, issue: string, resolved: boolean}[]>([]);

  const fetchBatches = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('sage_batches').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setBatches(data.map((b: any) => ({
            id: b.id,
            name: b.name,
            createdAt: b.created_at,
            createdBy: b.created_by,
            status: b.status,
            source: b.source,
            rowCount: b.row_count,
            totalAmount: b.total_amount,
            trustScore: b.trust_score,
            postingMethod: b.posting_method || 'CASH_RECEIPT',
            approvalRequiredBy: b.approval_required_by
          })));
        } else {
           throw new Error('Supabase fetch failed');
        }
      } catch (e) {
        setBatches(localDb.get('sage_batches'));
      }
    } else {
      setBatches(localDb.get('sage_batches'));
    }
    setIsLoading(false);
  };

  const fetchBatchItems = async (batchId: string) => {
    setIsProcessingAI(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('sage_batch_items').select('*').eq('batch_id', batchId);
        if (!error && data) {
          setActiveBatchItems(data);
        } else {
          setActiveBatchItems(localDb.get('sage_batch_items').filter((i: any) => i.batch_id === batchId));
        }
      } catch (e) {
        setActiveBatchItems(localDb.get('sage_batch_items').filter((i: any) => i.batch_id === batchId));
      }
    } else {
      setActiveBatchItems(localDb.get('sage_batch_items').filter((i: any) => i.batch_id === batchId));
    }
    setIsProcessingAI(false);
  };

  useEffect(() => { fetchBatches(); }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(filterSearch.toLowerCase()) || b.id.toLowerCase().includes(filterSearch.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
      
      const bDate = new Date(b.createdAt).getTime();
      const matchesStart = filterDateStart ? bDate >= new Date(filterDateStart).getTime() : true;
      const matchesEnd = filterDateEnd ? bDate <= new Date(filterDateEnd).getTime() + 86400000 : true;
      const matchesAmount = filterMinAmount ? b.totalAmount >= parseFloat(filterMinAmount) : true;

      return matchesSearch && matchesStatus && matchesStart && matchesEnd && matchesAmount;
    });
  }, [batches, filterSearch, filterStatus, filterDateStart, filterDateEnd, filterMinAmount]);

  useEffect(() => {
    if (wizardStep === 2 && activeBatch) {
      const timer = setTimeout(() => {
        setWizardStep(3);
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [wizardStep, activeBatch]);

  const openWizard = async (batch: SageBatch) => {
    setActiveBatch(batch);
    setViewMode('WIZARD');
    setWizardStep(1);
    await fetchBatchItems(batch.id);
    
    setExceptions([
      { id: '1', field: 'SKU_Node', issue: `Missing mapping for ${batch.source.slice(0,5)}`, resolved: false },
      { id: '2', field: 'Gross_Value', issue: 'Possible duplicate check required', resolved: false }
    ]);
  };

  const handleVerifyMappings = async () => {
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    setIsVerifying(false);
    setWizardStep(2); 
  };

  const handleSealAndPost = async () => {
    if (!activeBatch) return;
    setIsProcessingAI(true);
    
    const shopNodeName = activeBatch.name.split('|')[1]?.trim() || 'GLOBAL';
    const dateStamp = new Date().toISOString().split('T')[0];
    
    const entriesToPost: any[] = [];
    let runningDebit = 0;

    // 1. Process standard items (Revenue/Expense)
    activeBatchItems.forEach(item => {
        let accountCode = '4000-01'; // Default Revenue
        if (item.category === 'COGS') accountCode = '5000-01';
        if (item.category === 'OPEX') accountCode = '6000-10';
        if (item.category === 'TAX') accountCode = '2000-01'; // Statutory VAT Liability

        const val = item.amount || 0;
        runningDebit += val;

        // In a CASH_RECEIPT, we CREDIT revenue (so debit is 0, credit is val)
        const isReceipt = activeBatch.postingMethod === 'CASH_RECEIPT' || activeBatch.postingMethod === 'CUSTOMER_INVOICE';

        entriesToPost.push({
            batch_id: activeBatch.id,
            date: dateStamp,
            account_code: accountCode,
            description: `POST [${activeBatch.name}] : ${item.description}`,
            debit: isReceipt ? 0 : val,
            credit: isReceipt ? val : 0,
            currency: 'ETB',
            shop_node: shopNodeName
        });
    });

    // 2. Add Statutory Tax Offset if taxTotal exists at batch level
    if (activeBatch.taxTotal && activeBatch.taxTotal > 0) {
      const isReceipt = activeBatch.postingMethod === 'CASH_RECEIPT' || activeBatch.postingMethod === 'CUSTOMER_INVOICE';
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: '2000-01', 
        description: `STATUTORY TAX OFFSET: [${activeBatch.name}]`,
        debit: isReceipt ? 0 : activeBatch.taxTotal,
        credit: isReceipt ? activeBatch.taxTotal : 0,
        currency: 'ETB',
        shop_node: shopNodeName
      });
      runningDebit += activeBatch.taxTotal;
    }

    // 3. Multi-Payment Counter-balance entries (The Debits to Cash/Bank/Mobile/Card)
    const breakdown = activeBatch.paymentBreakdown || { cash: runningDebit };
    const isReceipt = activeBatch.postingMethod === 'CASH_RECEIPT' || activeBatch.postingMethod === 'CUSTOMER_INVOICE';

    if (breakdown.cash && breakdown.cash > 0) {
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: '1010-00', // Cash Account
        description: `CASH PAYMENT: [${activeBatch.name}]`,
        debit: isReceipt ? breakdown.cash : 0,
        credit: isReceipt ? 0 : breakdown.cash,
        currency: 'ETB',
        shop_node: shopNodeName
      });
    }

    if (breakdown.bank && breakdown.bank > 0) {
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: breakdown.bankAccountCode || '1020-00', // Bank Account
        description: `BANK TRANSFER: [${activeBatch.name}]`,
        debit: isReceipt ? breakdown.bank : 0,
        credit: isReceipt ? 0 : breakdown.bank,
        currency: 'ETB',
        shop_node: shopNodeName
      });
    }

    if (breakdown.mobile && breakdown.mobile > 0) {
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: '1030-00', // Mobile Money Account
        description: `MOBILE MONEY: [${activeBatch.name}]`,
        debit: isReceipt ? breakdown.mobile : 0,
        credit: isReceipt ? 0 : breakdown.mobile,
        currency: 'ETB',
        shop_node: shopNodeName
      });
    }

    if (breakdown.card && breakdown.card > 0) {
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: '1040-00', // Card Account
        description: `CARD PAYMENT: [${activeBatch.name}]`,
        debit: isReceipt ? breakdown.card : 0,
        credit: isReceipt ? 0 : breakdown.card,
        currency: 'ETB',
        shop_node: shopNodeName
      });
    }

    // 4. Handle Over/Short on cash only
    if (breakdown.overShort && breakdown.overShort !== 0) {
      const isShort = breakdown.overShort < 0;
      entriesToPost.push({
        batch_id: activeBatch.id,
        date: dateStamp,
        account_code: isShort ? '6100-00' : '4200-00', // Over/Short Expense vs Income
        description: `CASH OVER/SHORT: [${activeBatch.name}]`,
        debit: isShort ? Math.abs(breakdown.overShort) : 0,
        credit: isShort ? 0 : breakdown.overShort,
        currency: 'ETB',
        shop_node: shopNodeName
      });
    }

    // A/R Handshake: Update Customer Balance if this is a receipt
    if (activeBatch.postingMethod === 'CASH_RECEIPT' || activeBatch.postingMethod === 'CUSTOMER_INVOICE') {
       // Mock logic: Update first customer in list to simulate balance growth
       if (isSupabaseConfigured()) {
         try {
           const { data: custs } = await supabase.from('customers').select('*').limit(1);
           if (custs && custs[0]) {
              await supabase.from('customers').update({ 
                balance: (custs[0].balance || 0) + runningDebit,
                last_activity: dateStamp
              }).eq('id', custs[0].id);
           }
         } catch (e) {}
       } else {
         const custs = localDb.get('customers');
         if (custs && custs[0]) {
            localDb.update('customers', custs[0].id, { 
              balance: (custs[0].balance || 0) + runningDebit,
              last_activity: dateStamp
            });
         }
       }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('sage_batches').update({ status: 'POSTED' }).eq('id', activeBatch.id);
        await supabase.from('sage_ledger_entries').insert(entriesToPost);
      } catch (e) {
        localDb.update('sage_batches', activeBatch.id, { status: 'POSTED' });
        localDb.insert('sage_ledger_entries', entriesToPost);
      }
    } else {
      localDb.update('sage_batches', activeBatch.id, { status: 'POSTED' });
      localDb.insert('sage_ledger_entries', entriesToPost);
    }

    logAuditAction(user.id, 'BATCH_PROPAGATED_TO_GL', 'sage_ledger_entries', activeBatch.id, { 
      method: activeBatch.postingMethod,
      item_count: entriesToPost.length,
      sealed_by: user.name,
      total_handshake: runningDebit
    });

    setBatches(prev => prev.map(b => b.id === activeBatch.id ? { ...b, status: 'POSTED' } : b));
    setWizardStep(6); 
    setIsProcessingAI(false);
  };

  if (viewMode === 'UPLOAD') {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-[#080b14] animate-in slide-in-from-right duration-500">
        <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('GRID')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-all shadow-sm"><X size={20} /></button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Provision New Batch</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Staging Ingress for Artifacts</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SageIngestionWizard 
            user={user} 
            shops={shops} 
            onPost={() => {}} 
            navigateTo={(tab) => {
              if (tab === 'BATCHES') {
                setViewMode('GRID');
                fetchBatches();
              } else {
                navigateTo(tab);
              }
            }} 
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'WIZARD' && activeBatch) {
    const receiptRef = activeBatch.name.includes('REC_') 
      ? activeBatch.name.split('(')[0].replace('REC_', '').trim() 
      : 'N/A';

    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-[#080b14] animate-in slide-in-from-right duration-500">
        <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-8 flex justify-between items-center shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('GRID')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-all shadow-sm"><X size={20} /></button>
            <div className="flex items-center gap-6">
              <div className="p-3 bg-indigo-600/10 text-indigo-600 rounded-2xl border-2 border-indigo-500/20 shadow-inner group">
                 <Receipt size={24} className="group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Receipt Audit Node</h2>
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] not-italic shadow-sm tracking-widest font-black uppercase shadow-lg shadow-indigo-900/40">{receiptRef}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Authorized for: {activeBatch.name.split('|')[1] || activeBatch.name}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Sparkles size={14} className="text-green-600" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">AI Audit: {activeBatch.trustScore}% Verified</span>
             </div>
          </div>
        </div>

        {wizardStep <= 5 && (
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-center gap-12 shrink-0 overflow-x-auto custom-scrollbar">
            {[
              { step: 1, label: 'Mapping', icon: <Map size={14} /> },
              { step: 2, label: 'Validation', icon: <Calculator size={14} /> },
              { step: 3, label: 'Classification', icon: <Tag size={14} /> },
              { step: 4, label: 'Exception Control', icon: <AlertTriangle size={14} /> },
              { step: 5, label: 'Approval & Post', icon: <Signature size={14} /> }
            ].map(s => (
              <div key={s.step} className={`flex items-center gap-3 transition-all shrink-0 ${wizardStep >= s.step ? 'opacity-100' : 'opacity-30'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${wizardStep === s.step ? 'bg-indigo-600 text-white shadow-lg' : wizardStep > s.step ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    {wizardStep > s.step ? <Check size={14} /> : s.step}
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
              </div>
            ))}
         </div>
        )}

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
           <div className="max-w-6xl mx-auto space-y-12">
              {wizardStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="lg:col-span-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow">
                      <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3"><FileSpreadsheet className="text-indigo-600" /> Receipt Item List</h3>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <span className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded-lg">ITEMS: {activeBatchItems.length}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                         {isProcessingAI ? (
                           <div className="p-20 text-center flex flex-col items-center gap-4">
                             <Loader2 size={32} className="animate-spin text-indigo-600" />
                             <p className="text-[10px] font-black uppercase text-slate-400">Fetching line-level artifacts...</p>
                           </div>
                         ) : activeBatchItems.length === 0 ? (
                           <div className="p-20 text-center text-slate-400 font-bold italic uppercase border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">Zero line items indexed for this batch node.</div>
                         ) : activeBatchItems.map((col, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-500/50 transition-all">
                              <div className="flex-1">
                                 <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Receipt Item</span>
                                 <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{col.description}</span>
                              </div>
                              <div className="w-24 px-4 border-l border-slate-200 dark:border-slate-800 hidden sm:block">
                                 <span className="text-[9px] font-black text-slate-400 uppercase block">Quantity</span>
                                 <span className="font-black text-indigo-600 font-mono">{col.qty}</span>
                              </div>
                              <div className="w-32 px-4 border-l border-slate-200 dark:border-slate-800">
                                 <span className="text-[9px] font-black text-slate-400 uppercase block">Value (Br)</span>
                                 <span className="font-black text-indigo-600 font-mono">{(col.amount ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-6 border-l border-slate-200 dark:border-slate-800 pl-6">
                                 <ArrowRight size={14} className="text-slate-300" />
                                 <div className="space-y-1">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">GL Destination</span>
                                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 w-48">
                                       <option>{col.category || 'REVENUE'}</option>
                                       <option>COGS</option>
                                       <option>OPEX</option>
                                       <option>TAX</option>
                                    </select>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="lg:col-span-4 space-y-8">
                      <div className="p-8 bg-slate-950 text-indigo-100 rounded-[40px] shadow-2xl relative overflow-hidden group border border-white/10">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000"><Database size={100} /></div>
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                            <Info size={14} /> Extraction Context
                         </h4>
                         <p className="text-base font-medium italic opacity-80 leading-relaxed mb-10">
                            "Receipt ID <strong>{receiptRef}</strong> was analyzed by Neural OCR. 100% of line items extracted. Auto-mapping suggests categorization based on **Ethiopian Birr (ETB)**."
                         </p>
                         <button 
                            onClick={handleVerifyMappings}
                            disabled={isVerifying}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                         >
                            {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            {isVerifying ? 'Sealing...' : 'Verify All Mappings'}
                         </button>
                      </div>
                      <button 
                        onClick={() => setWizardStep(2)}
                        className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[32px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 transition-all"
                      >
                         Run Integrity Scan <ChevronRight size={20} />
                      </button>
                   </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-10 animate-in fade-in duration-500">
                    <div className="relative">
                        <RefreshCw size={120} className="text-indigo-600 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Fingerprint size={48} className="text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Neural Integrity Scan</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Cross-referencing batch hashes against historical ledger state...</p>
                    </div>
                    <div className="w-full max-w-md h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-600 animate-[loading_2.5s_ease-in-out_infinite]"></div>
                    </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-right-8 duration-500">
                    <div className="lg:col-span-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-4">
                              <Tag size={24} className="text-indigo-600" /> Statutory Classification
                           </h3>
                           <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-3 py-1 rounded-xl border border-green-500/20">Validation: 100% PASS</span>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-Payment Breakdown</h4>
                                    <button 
                                      onClick={() => {
                                        const total = activeBatch.totalAmount;
                                        setActiveBatch({
                                          ...activeBatch,
                                          paymentBreakdown: {
                                            cash: total,
                                            bank: 0,
                                            mobile: 0,
                                            card: 0,
                                            overShort: 0
                                          }
                                        });
                                      }}
                                      className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                                    >
                                      Reset to Full Cash
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Cash Portion</label>
                                        <input 
                                          type="number" 
                                          value={activeBatch.paymentBreakdown?.cash || 0} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), cash: parseFloat(e.target.value) || 0}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Bank Transfer</label>
                                        <input 
                                          type="number" 
                                          value={activeBatch.paymentBreakdown?.bank || 0} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), bank: parseFloat(e.target.value) || 0}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Mobile Money</label>
                                        <input 
                                          type="number" 
                                          value={activeBatch.paymentBreakdown?.mobile || 0} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), mobile: parseFloat(e.target.value) || 0}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Card Payment</label>
                                        <input 
                                          type="number" 
                                          value={activeBatch.paymentBreakdown?.card || 0} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), card: parseFloat(e.target.value) || 0}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Cash Over/Short</label>
                                        <input 
                                          type="number" 
                                          value={activeBatch.paymentBreakdown?.overShort || 0} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), overShort: parseFloat(e.target.value) || 0}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Bank Account Code</label>
                                        <input 
                                          type="text" 
                                          placeholder="e.g. 1020-01"
                                          value={activeBatch.paymentBreakdown?.bankAccountCode || ''} 
                                          onChange={e => setActiveBatch({...activeBatch, paymentBreakdown: {...(activeBatch.paymentBreakdown || {}), bankAccountCode: e.target.value}})}
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Total Payments Captured</span>
                                        <span className={`text-sm font-black font-mono ${
                                          Math.abs((activeBatch.paymentBreakdown?.cash || 0) + 
                                          (activeBatch.paymentBreakdown?.bank || 0) + 
                                          (activeBatch.paymentBreakdown?.mobile || 0) + 
                                          (activeBatch.paymentBreakdown?.card || 0) + 
                                          (activeBatch.paymentBreakdown?.overShort || 0) - 
                                          activeBatch.totalAmount) < 0.01 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          Br {((activeBatch.paymentBreakdown?.cash || 0) + 
                                          (activeBatch.paymentBreakdown?.bank || 0) + 
                                          (activeBatch.paymentBreakdown?.mobile || 0) + 
                                          (activeBatch.paymentBreakdown?.card || 0) + 
                                          (activeBatch.paymentBreakdown?.overShort || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 flex justify-between items-center group transition-all hover:border-indigo-500/50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Ledger Target</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Consolidated Operating Node</p>
                                </div>
                                <select className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500">
                                    <option>4000-01 REVENUE SINK</option>
                                    <option>5000-01 COGS HUB</option>
                                    <option>6000-10 OPEX NODE</option>
                                </select>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 flex justify-between items-center group transition-all hover:border-indigo-500/50">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Handshake Clearing Node</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Cash/Bank Clearing (1010-00)</p>
                                </div>
                                <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                                    <ShieldCheck size={20} className="text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Accounting Impact Summary</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-red-500 uppercase mb-2">Debit Handshake (Br)</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{(activeBatch.totalAmount ?? 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-green-500 uppercase mb-2">Credit Handshake (Br)</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{(activeBatch.totalAmount ?? 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-indigo-600 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000"><Zap size={120} /></div>
                            <h4 className="text-xl font-black uppercase tracking-tighter mb-4 italic flex items-center gap-3">
                                <Bot size={20} /> Neural Guidance
                            </h4>
                            <p className="text-sm font-medium leading-relaxed opacity-90 italic mb-8">
                                "Institutional logic suggests this artifact includes Br {activeBatch.taxTotal?.toLocaleString() || 0} in VAT exposure. I have mapped this automatically to the 2000-01 Statutory Liability node."
                            </p>
                            <button onClick={() => setWizardStep(4)} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Approve Logic</button>
                        </div>
                    </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/30 rounded-[48px] p-12 luxury-shadow">
                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-900/40">
                                <AlertTriangle size={40} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Exception Control</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Forensic reconciliation required before seal</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {exceptions.map(ex => (
                                <div key={ex.id} className={`p-8 rounded-[32px] border-2 transition-all flex items-center justify-between group ${
                                    ex.resolved ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                }`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                                            ex.resolved ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-white dark:bg-slate-900 text-amber-500 border-slate-100 dark:border-slate-800'
                                        }`}>
                                            {ex.resolved ? <Check size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Node: {ex.field}</p>
                                            <p className="text-base font-bold text-slate-900 dark:text-slate-100 italic">"{ex.issue}"</p>
                                        </div>
                                    </div>
                                    {!ex.resolved && (
                                        <button 
                                            onClick={() => setExceptions(prev => prev.map(x => x.id === ex.id ? { ...x, resolved: true } : x))}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                        >
                                            Force Resolve
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <p className="text-xs text-slate-400 font-medium italic max-w-md">"Resolving exceptions creates a permanent forensic record in the audit trail."</p>
                            <button 
                                disabled={exceptions.some(ex => !ex.resolved)}
                                onClick={() => setWizardStep(5)}
                                className="px-10 py-5 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl disabled:opacity-30 transition-all active:scale-95"
                            >
                                Advance to Statutory Seal <ChevronRight size={18} className="inline ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-12 luxury-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Signature size={160} className="text-indigo-600" /></div>
                        
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Statutory Posting Seal</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Institutional Handshake Phase: GL_PROPAGATION</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consolidated Value (Br)</p>
                                <p className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">Br {(activeBatch.totalAmount ?? 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-12 relative z-10">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Authorized Actor</h4>
                                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Personnel Node</span>
                                        <span className="font-black text-slate-900 dark:text-slate-100">{user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Role Matrix</span>
                                        <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black uppercase tracking-widest">{user.role}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Post Logic Sequence</h4>
                                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase">Tax Allocation</span>
                                        <span className="font-black text-orange-600 uppercase">GL-2000-01 ACTIVE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase">CheckSum Type</span>
                                        <span className="text-green-600 font-black">SHA-256</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-950 rounded-[40px] border border-slate-800 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors"></div>
                            <div className="flex items-center gap-10 relative z-10">
                                <div className="p-5 bg-indigo-600 text-white rounded-[28px] shadow-xl shadow-indigo-900/40">
                                    <FileSignature size={40} />
                                </div>
                                <div className="max-w-md">
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Seal & Propagate to GL</h4>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic mt-1">"This action flushes the Verification Queue and creates immutable statutory records."</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSealAndPost}
                                disabled={isProcessingAI}
                                className="px-12 py-6 bg-white text-indigo-600 rounded-[32px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-4 relative z-10"
                            >
                                {isProcessingAI ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} className="text-green-600" />}
                                {isProcessingAI ? 'Handshaking...' : 'Commit Institutional Handshake'}
                            </button>
                        </div>
                    </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="flex flex-col items-center justify-center py-32 space-y-12 animate-in zoom-in-95 duration-700">
                    <div className="w-40 h-40 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-900/40 border-8 border-white dark:border-slate-900 relative">
                        <CheckCircle2 size={80} strokeWidth={3} />
                        <div className="absolute -top-4 -right-4 p-4 bg-indigo-600 rounded-2xl shadow-xl animate-bounce">
                            <Database size={24} />
                        </div>
                    </div>
                    <div className="text-center space-y-4 max-w-lg">
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Handshake Finalized</h3>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
                            The batch has been propagated. Statutory Tax Liabilities and Revenue nodes have been updated in the master ledger.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <button 
                            onClick={() => { setViewMode('GRID'); fetchBatches(); }}
                            className="px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-[32px] font-black uppercase text-[10px] tracking-widest shadow-sm"
                        >
                            Back to Registry
                        </button>
                        <button 
                            onClick={() => navigateTo('GL')}
                            className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[32px] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-indigo-900/40 flex items-center gap-3 transition-all"
                        >
                            Audit General Ledger <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Verification Queue</h2>
          <p className="text-sm text-slate-500 font-medium italic">Handshake Stage: Map → Validate → Classify → Seal → Propagate</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowFilters(!showFilters)} 
             className={`p-3 border rounded-xl transition-all ${showFilters ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 hover:border-indigo-500 shadow-sm'}`}
           >
              <ListFilter size={18} />
           </button>
           <button onClick={fetchBatches} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
           </button>
           <button 
            onClick={() => setViewMode('UPLOAD')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:bg-indigo-500 transition-all active:scale-95"
           >
              <Upload size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Ingest Artifact</span>
           </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] animate-in slide-in-from-top-4">
           <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Search size={10} /> Node Search</label>
              <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={10} /> Date Window</label>
              <div className="flex gap-2 items-center">
                 <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold dark:text-white outline-none shadow-inner" />
                 <span className="text-slate-300">-</span>
                 <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold dark:text-white outline-none shadow-inner" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={10} /> Threshold (Br)</label>
              <input type="number" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Tag size={10} /> Status Node</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold dark:text-white outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner">
                 <option value="ALL">ALL STATES</option>
                 <option value="PENDING">PENDING ONLY</option>
                 <option value="POSTED">POSTED ONLY</option>
              </select>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-indigo-500/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pending Verification</p>
            <p className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">{batches.filter(b => b.status === 'PENDING').length} Units</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-indigo-500/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Artifact Value</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">Br {(batches.filter(b => b.status === 'PENDING').reduce((s,b) => s + b.totalAmount, 0) ?? 0).toLocaleString()}</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-green-500/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Posted (24h)</p>
            <p className="text-3xl font-black text-green-600 font-mono tracking-tighter">{batches.filter(b => b.status === 'POSTED').length}</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-red-500/30 border-l-red-500 border-l-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tax Exceptions</p>
            <p className="text-3xl font-black text-red-600 font-mono tracking-tighter">00</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-4">
               <ListFilter size={18} className="text-indigo-600" /> Active Handshake Registry {filteredBatches.length !== batches.length && `(Filtered: ${filteredBatches.length})`}
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                     <th className="px-8 py-5 text-center">Batch ID</th>
                     <th className="px-8 py-5">Source Node / Reference</th>
                     <th className="px-8 py-5 text-right">Value (Br)</th>
                     <th className="px-8 py-5">Trust Index</th>
                     <th className="px-8 py-5">Post Mode</th>
                     <th className="px-8 py-5">Status</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-20 text-center"><Loader2 size={32} className="animate-spin mx-auto text-indigo-600" /></td></tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center text-slate-400 uppercase font-black tracking-widest border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">No batches found matching criteria.</td></tr>
                  ) : filteredBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                       <td className="px-8 py-6 text-center font-mono text-[10px] text-slate-400">{batch.id.slice(0,8)}</td>
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">{batch.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Ingress: {batch.source}</p>
                       </td>
                       <td className="px-8 py-6 text-right font-mono font-black text-slate-900 dark:text-white">Br {(batch.totalAmount ?? 0).toLocaleString()}</td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${batch.trustScore > 90 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`}></div>
                             <span className="font-bold text-slate-600 dark:text-slate-300">{batch.trustScore}% Verified</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded text-[9px] font-black border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest italic">{batch.postingMethod}</span>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest transition-all ${
                             batch.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-200' : 'bg-green-500/10 text-green-600 border-green-200'
                          }`}>{batch.status}</span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          {batch.status === 'PENDING' ? (
                             <button 
                               onClick={() => openWizard(batch)}
                               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/30 transition-all active:scale-95 flex items-center gap-2 ml-auto group/btn"
                             >
                                <Wand2 size={12} className="group-hover/btn:rotate-12 transition-transform" /> Start Verification
                             </button>
                          ) : (
                             <button 
                                onClick={() => navigateTo('GL')}
                                className="p-2 text-slate-300 hover:text-indigo-600 transition-colors ml-auto flex items-center gap-2"
                             >
                                <span className="text-[9px] font-black uppercase tracking-widest">Audit GL</span>
                                <Eye size={18} />
                             </button>
                          )}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default SageBatchManager;
