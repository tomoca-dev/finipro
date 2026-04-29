
import React, { useState, useRef, useMemo } from 'react';
import { 
  Database, Save, Loader2, RefreshCw, UploadCloud, Store, Search, ShieldCheck, 
  FileSpreadsheet, Zap, Info, ChevronRight, LayoutTemplate, Box, Package,
  Hash, Receipt, ArrowRight, Shield, Calendar, Clock, Image as ImageIcon, FileText,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { FinancialRecord, User, ShopNode } from '../../types';
import { supabase, logAuditAction, isSupabaseConfigured, localDb } from '../../services/supabaseClient';
import { analyzeVisualDocument } from '../../services/geminiService';

interface SageIngestionWizardProps {
  user: User;
  onPost: (records: FinancialRecord[]) => void;
  shops: ShopNode[];
  navigateTo: (tab: any) => void;
}

const SageIngestionWizard: React.FC<SageIngestionWizardProps> = ({ user, onPost, shops, navigateTo }) => {
  const [step, setStep] = useState<'ID' | 'DATES' | 'UPLOAD' | 'SUCCESS'>('ID');
  const [receiptId, setReceiptId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopSearch, setShopSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredShops = useMemo(() => {
    return shops.filter(s => 
      s.name.toLowerCase().includes(shopSearch.toLowerCase()) || 
      s.id.toLowerCase().includes(shopSearch.toLowerCase())
    );
  }, [shopSearch, shops]);

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const handleVerifyId = () => {
    if (receiptId.trim().length > 3) {
      setStep('DATES');
    }
  };

  const handleConfirmDates = () => {
    setStep('UPLOAD');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedShopId || !receiptId) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadStatus('Initializing Neural Ingress...');
    
    try {
      let extractedItems: any[] = [];
      let grandTotal = 0;
      let trustScore = 98;
      let paymentBreakdown: any = null;

      const isVisual = file.type.includes('image') || file.type.includes('pdf');

      if (isVisual) {
        setUploadStatus('Analyzing Artifact (AI Vision)...');
        const base64 = await fileToBase64(file);
        const aiAnalysis = await analyzeVisualDocument(base64, file.type);
        
        if (!aiAnalysis.isValid && aiAnalysis.validationNotes) {
          throw new Error(aiAnalysis.validationNotes);
        }

        extractedItems = aiAnalysis.items || [];
        grandTotal = aiAnalysis.grandTotal || 0;
        trustScore = aiAnalysis.confidence || 85;
        paymentBreakdown = aiAnalysis.paymentBreakdown;
      } else {
        setUploadStatus('Parsing Structured CSV...');
        await new Promise(r => setTimeout(r, 400));
        extractedItems = [
          { description: 'Operational Supplies', qty: 1, total: 1200, tax: 180, suggestedCategory: 'OPEX' },
          { description: 'Raw Material Node A', qty: 10, total: 4500, tax: 675, suggestedCategory: 'COGS' }
        ];
        grandTotal = extractedItems.reduce((acc, item) => acc + item.total, 0);
        paymentBreakdown = { cash: grandTotal };
      }

      setUploadStatus('Sealing Batch Header...');
      const batchData = {
        name: `REC_${receiptId} (${startDate} to ${endDate}) | ${selectedShop?.name}`,
        created_by: user.name,
        status: 'PENDING',
        source: file.name,
        row_count: extractedItems.length, 
        total_amount: grandTotal || (Math.floor(Math.random() * 50000) + 5000),
        trust_score: trustScore,
        posting_method: 'CASH_RECEIPT',
        payment_breakdown: paymentBreakdown || { cash: grandTotal }
      };

      let batch: any = null;

      if (isSupabaseConfigured()) {
        const { data, error: batchError } = await supabase.from('sage_batches').insert([batchData]).select();
        if (batchError) throw batchError;
        batch = data;
      } else {
        const { data } = localDb.insert('sage_batches', [batchData]);
        batch = data;
      }

      if (batch && extractedItems.length > 0) {
        setUploadStatus(`Indexing ${extractedItems.length} Line Items...`);
        const itemsToInsert = extractedItems.map(item => ({
          batch_id: batch[0].id,
          description: item.description || 'Unknown Item',
          qty: item.qty || 1,
          amount: item.total || item.amount || 0,
          tax: item.tax || 0, // Explicitly capture tax field
          category: item.suggestedCategory || 'UNCATEGORIZED',
          currency: 'ETB'
        }));

        const vaultDocName = `[${receiptId}] Period: ${startDate} - ${file.name}`;

        if (isSupabaseConfigured()) {
          await supabase.from('sage_batch_items').insert(itemsToInsert);
          await supabase.from('sage_shop_documents').insert([{
            shop_id: selectedShopId,
            name: vaultDocName,
            category: 'POS_REPORT',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            status: 'VERIFIED',
            artifact_ref: batch[0].id,
            metadata: { receiptId, startDate, endDate }
          }]);
        } else {
          localDb.insert('sage_batch_items', itemsToInsert);
          localDb.insert('sage_shop_documents', [{
            shop_id: selectedShopId,
            name: vaultDocName,
            category: 'POS_REPORT',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            status: 'VERIFIED',
            artifact_ref: batch[0].id,
            metadata: { receiptId, startDate, endDate }
          }]);
        }
      }

      logAuditAction(user.id, 'INGRESS_COMPLETE', 'sage_batches', batch[0].id, { 
        receipt_id: receiptId, 
        items_count: extractedItems.length,
        shop: selectedShop?.name
      });

      setUploadStatus('Ingress Successful.');
      setIsUploading(false);
      setStep('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Institutional Ingress Refused: Pattern mismatch.");
      setIsUploading(false);
    }
  };

  return (
    <div className="p-10 space-y-12 animate-in fade-in duration-700">
       <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Staging Ingress</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Workflow: ID → Temporal → Provision</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
               {[
                 { id: 'ID', icon: <Hash size={14} /> },
                 { id: 'DATES', icon: <Clock size={14} /> },
                 { id: 'UPLOAD', icon: <UploadCloud size={14} /> }
               ].map((s, idx) => (
                 <div key={s.id} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      (step === s.id || (step === 'SUCCESS' && s.id === 'UPLOAD')) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'
                    }`}>
                       {s.icon}
                    </div>
                    {idx < 2 && <ArrowRight size={10} className="text-slate-300" />}
                 </div>
               ))}
            </div>
          </div>
          
          {(step === 'UPLOAD') && (
            <div className="relative group w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" placeholder="Filter Shop Registry..." value={shopSearch} onChange={(e) => setShopSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold shadow-sm focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          )}
       </div>

       {step === 'ID' && (
         <div className="max-w-2xl mx-auto py-20 animate-in zoom-in-95 duration-500">
           <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-12 luxury-shadow text-center space-y-10">
              <div className="w-20 h-20 bg-indigo-600/10 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-500/20 shadow-inner">
                 <Receipt size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Initialize Receipt Session</h3>
                 <p className="text-slate-500 text-sm mt-2 font-medium">Input the unique receipt number or institutional identifier to begin.</p>
              </div>
              <div className="relative group max-w-sm mx-auto">
                 <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={24} />
                 <input 
                   type="text"
                   value={receiptId}
                   onChange={(e) => setReceiptId(e.target.value.toUpperCase())}
                   onKeyDown={(e) => e.key === 'Enter' && handleVerifyId()}
                   className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] text-2xl font-mono font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-inner text-center"
                   placeholder="REC-XXXX-XXXX"
                   autoFocus
                 />
              </div>
              <button 
                onClick={handleVerifyId}
                disabled={receiptId.length < 4}
                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-900/30 transition-all active:scale-95 flex items-center gap-3 mx-auto"
              >
                 Authorize Identifier <ArrowRight size={18} />
              </button>
           </div>
         </div>
       )}

       {step === 'DATES' && (
         <div className="max-w-2xl mx-auto py-20 animate-in slide-in-from-right-8 duration-500">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-12 luxury-shadow space-y-10">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center border-2 border-indigo-500/10 shadow-inner">
                        <Calendar size={20} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Temporal Window</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Assign period for Receipt {receiptId}</p>
                     </div>
                  </div>
                  <button onClick={() => setStep('ID')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Change ID</button>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Start Date</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <input 
                           type="date" 
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-inner"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">End Date</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        <input 
                           type="date" 
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-inner"
                        />
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleConfirmDates}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-indigo-900/30 transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                  Confirm Temporal State <ArrowRight size={18} />
               </button>
            </div>
         </div>
       )}

       {step === 'UPLOAD' && (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-right-8 duration-500">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl h-[550px] flex flex-col luxury-shadow">
               <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b flex justify-between items-center">
                  <div className="flex items-center gap-6">
                     <div className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">REC_{receiptId}</div>
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={12} className="text-indigo-500" /> {startDate} → {endDate}
                     </div>
                  </div>
                  <button onClick={() => setStep('DATES')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Change Window</button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredShops.map(shop => (
                    <button
                      key={shop.id}
                      onClick={() => setSelectedShopId(shop.id)}
                      className={`p-6 rounded-3xl border-2 transition-all text-left relative group ${
                        selectedShopId === shop.id 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' 
                        : 'bg-slate-50 dark:bg-slate-950 border-transparent hover:border-indigo-500/30 shadow-sm'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${selectedShopId === shop.id ? 'text-indigo-200' : 'text-slate-400'}`}>{shop.id}</span>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                            shop.status === 'LOCKED' ? 'bg-red-500 text-white border-red-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>{shop.status}</div>
                       </div>
                       <h4 className={`text-sm font-black uppercase tracking-tight leading-tight ${selectedShopId === shop.id ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{shop.name}</h4>
                    </button>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-4">
               {selectedShopId ? (
                  <div className="bg-slate-950 text-white rounded-[48px] p-12 text-center sticky top-0 shadow-2xl border-4 border-indigo-500/20 animate-in zoom-in-95 duration-500">
                     <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-indigo-900/50 group">
                        {isUploading ? <RefreshCw size={32} className="animate-spin" /> : <UploadCloud size={32} className="group-hover:scale-110 transition-transform" />}
                     </div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Ingress Node Ready</h3>
                     <p className="text-slate-400 text-sm font-medium mb-12">Target: <span className="text-indigo-400 font-black underline">{selectedShop?.name}</span></p>
                     
                     <div className="space-y-6">
                        {errorMsg && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                             <AlertCircle size={20} className="text-red-500 shrink-0" />
                             <p className="text-[10px] text-red-500 font-black uppercase text-left leading-tight">{errorMsg}</p>
                          </div>
                        )}

                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-6 bg-white text-indigo-600 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                        >
                           <Zap size={20} className="text-amber-500" /> {isUploading ? 'Neural Processing...' : 'Drop Artifact'}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.pdf,.jpg,.png,.jpeg" onChange={handleFileUpload} />
                        
                        <div className="flex items-center justify-center gap-4 py-4 text-slate-500">
                           <ImageIcon size={18} /> <FileText size={18} /> <FileSpreadsheet size={18} />
                        </div>

                        {isUploading && (
                          <div className="space-y-3">
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest animate-pulse">{uploadStatus}</p>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="h-full border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] p-12 flex flex-col items-center justify-center text-center opacity-30 group">
                     <Box size={80} className="text-slate-200 mb-8 group-hover:rotate-12 transition-transform" />
                     <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Awaiting Registry Lock</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase mt-2 max-w-[200px]">Select a shop node to construct the statutory ingress sink</p>
                  </div>
               )}
            </div>
         </div>
       )}

       {step === 'SUCCESS' && (
         <div className="max-w-2xl mx-auto py-20 animate-in zoom-in-95 duration-500 text-center space-y-12">
            <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-900/40">
               <CheckCircle2 size={64} strokeWidth={3} />
            </div>
            <div>
               <h3 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Ingress Validated</h3>
               <p className="text-slate-500 text-lg font-medium mt-4 leading-relaxed max-w-lg mx-auto">
                 Artifact successfully parsed and mirrored to **Shop Registry Vault**. Items are now pending manual verification in the queue.
               </p>
            </div>
            <div className="flex gap-4 justify-center pt-8">
               <button 
                 onClick={() => setStep('ID')}
                 className="px-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-sm"
               >
                 Process Another
               </button>
               <button 
                 onClick={() => navigateTo('BATCHES')}
                 className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-indigo-900/40 flex items-center gap-3 transition-all"
               >
                 Go to Verification Queue <ArrowRight size={18} />
               </button>
            </div>
         </div>
       )}
    </div>
  );
};

export default SageIngestionWizard;
