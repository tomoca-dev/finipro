
import React, { useState, useEffect } from 'react';
import { 
  Store, MapPin, Calendar, Clock, ShieldCheck, 
  ArrowLeft, Edit3, X, Save, FileText, Upload, 
  Trash2, Download, CheckCircle2, AlertCircle, 
  ExternalLink, Database, Search, Filter, Hash,
  Zap, Info, History, Bookmark, Fingerprint,
  Activity, Loader2, RefreshCw, Package, ArrowRight,
  Check, Calculator
} from 'lucide-react';
import { ShopNode, ShopDocument } from '../../types';
import { supabase, isSupabaseConfigured, localDb } from '../../services/supabaseClient';
import SageRegisterRecon from './SageRegisterRecon';

interface SageShopProfileProps {
  shop: ShopNode;
  onUpdateShop: (shop: ShopNode) => void;
  onBack: () => void;
}

const SageShopProfile: React.FC<SageShopProfileProps> = ({ shop, onUpdateShop, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedShop, setEditedShop] = useState<ShopNode>(shop);
  const [activeTab, setActiveTab] = useState<'VAULT' | 'REGISTER'>('VAULT');
  const [activeVaultFilter, setActiveVaultFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [artifactItems, setArtifactItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<any>(null);

  const fetchDocs = async () => {
    setIsLoadingDocs(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('sage_shop_documents')
          .select('*')
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false });
        if (!error && data) setDocuments(data);
      } catch (e) {
        setDocuments(localDb.get('sage_shop_documents').filter((d: any) => d.shop_id === shop.id));
      }
    } else {
      setDocuments(localDb.get('sage_shop_documents').filter((d: any) => d.shop_id === shop.id));
    }
    setIsLoadingDocs(false);
  };

  const fetchItemsForArtifact = async (batchId: string) => {
    setSelectedArtifactId(batchId);
    setIsLoadingItems(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('sage_batch_items')
          .select('*')
          .eq('batch_id', batchId);
        if (!error && data) setArtifactItems(data);
      } catch (e) {
        setArtifactItems(localDb.get('sage_batch_items').filter((i: any) => i.batch_id === batchId));
      }
    } else {
      setArtifactItems(localDb.get('sage_batch_items').filter((i: any) => i.batch_id === batchId));
    }
    setIsLoadingItems(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [shop.id]);

  const handleSave = () => {
    onUpdateShop(editedShop);
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingDocs(true);
    const docData = {
      shop_id: shop.id,
      name: `MANUAL_INGRESS - ${file.name}`,
      category: 'OTHER',
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'PENDING'
    };

    if (isSupabaseConfigured()) {
      await supabase.from('sage_shop_documents').insert([docData]);
    } else {
      localDb.insert('sage_shop_documents', [docData]);
    }

    await fetchDocs();
    setIsLoadingDocs(false);
  };

  const deleteDoc = async (id: string) => {
    if (isSupabaseConfigured()) {
      await supabase.from('sage_shop_documents').delete().eq('id', id);
    } else {
      localDb.delete('sage_shop_documents', id);
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const startEditingItem = (item: any) => {
    setEditingItemId(item.id);
    setEditingItemData({ ...item });
  };

  const handleSaveItem = async () => {
    if (!editingItemId || !editingItemData) return;

    const { id, ...updates } = editingItemData;

    if (isSupabaseConfigured()) {
      await supabase.from('sage_batch_items').update(updates).eq('id', id);
    } else {
      localDb.update('sage_batch_items', id, updates);
    }

    setArtifactItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    setEditingItemId(null);
    setEditingItemData(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#080b14] animate-in slide-in-from-right duration-500">
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-8 flex justify-between items-center z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/30">
               <Store size={28} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{shop.name}</h2>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={12} className="text-indigo-500" /> Node Spec: {shop.id}
               </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={fetchDocs}
             className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
           >
              <RefreshCw size={18} className={isLoadingDocs ? 'animate-spin' : ''} />
           </button>
           {!isEditing ? (
             <button 
               onClick={() => setIsEditing(true)}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
             >
                <Edit3 size={16} /> Edit Dossier
             </button>
           ) : (
             <>
               <button 
                 onClick={() => setIsEditing(false)}
                 className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all border border-slate-200 dark:border-slate-700"
               >
                  Discard
               </button>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
               >
                  <Save size={16} /> Commit Changes
               </button>
             </>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-10">
               <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
                     <Bookmark size={14} className="text-indigo-600" /> Profile Schematics
                  </h3>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Descriptor</label>
                        <input 
                          disabled={!isEditing}
                          type="text" 
                          value={editedShop.name}
                          onChange={(e) => setEditedShop({...editedShop, name: e.target.value})}
                          className={`w-full bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl p-5 text-sm font-bold transition-all outline-none ${
                             isEditing ? 'border-indigo-500 ring-4 ring-indigo-500/10 dark:text-white' : 'border-transparent text-slate-600 cursor-not-allowed shadow-inner'
                          }`}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regional Cluster</label>
                        <select 
                          disabled={!isEditing}
                          value={editedShop.region}
                          onChange={(e) => setEditedShop({...editedShop, region: e.target.value as any})}
                          className={`w-full bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl p-5 text-sm font-bold transition-all outline-none appearance-none ${
                             isEditing ? 'border-indigo-500 ring-4 ring-indigo-500/10 dark:text-white' : 'border-transparent text-slate-600 cursor-not-allowed shadow-inner'
                          }`}
                        >
                           <option value="NORTH">NORTH REGION</option>
                           <option value="CENTRAL">CENTRAL HUB</option>
                           <option value="SOUTH">SOUTH CLUSTER</option>
                           <option value="INTERNATIONAL">GLOBAL NODE</option>
                        </select>
                     </div>
                     <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase">Provisioned</span>
                           <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase mt-1">{shop.createdAt}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest ${
                          shop.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'
                        }`}>{shop.status}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-10">
               <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden shadow-2xl luxury-shadow flex flex-col h-full min-h-[600px]">
                  <div className="p-10 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <div className="flex items-center gap-8">
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                              {activeTab === 'VAULT' ? (selectedArtifactId ? 'Artifact Line Items' : 'Document Vault') : 'Register Operations'}
                           </h3>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                              {activeTab === 'VAULT' ? (selectedArtifactId ? `Batch Fragment Node: ${selectedArtifactId.slice(0,8)}` : 'Statutory WORM-compliant storage') : 'Daily Shift Reconciliation Hub'}
                           </p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 dark:border-slate-800"></div>
                        <div className="flex gap-2">
                           {[
                              { id: 'VAULT', label: 'Vault', icon: <Database size={12} /> },
                              { id: 'REGISTER', label: 'Register Ops', icon: <Calculator size={12} /> },
                           ].map(t => (
                              <button 
                                 key={t.id}
                                 onClick={() => setActiveTab(t.id as any)}
                                 className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                                 }`}
                              >
                                 {t.icon} {t.label}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex gap-4">
                        {activeTab === 'VAULT' && (
                           selectedArtifactId ? (
                              <button 
                                 onClick={() => { setSelectedArtifactId(null); setEditingItemId(null); }}
                                 className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 hover:bg-white transition-all"
                              >
                                 <ArrowLeft size={14} /> Back to Vault
                              </button>
                           ) : (
                              <>
                                 <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
                                    {['ALL', 'VERIFIED', 'PENDING'].map(f => (
                                    <button
                                       key={f}
                                       onClick={() => setActiveVaultFilter(f as any)}
                                       className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                          activeVaultFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                                       }`}
                                    >
                                       {f}
                                    </button>
                                    ))}
                                 </div>
                                 <label className="cursor-pointer px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all">
                                    <Upload size={14} /> Ingest File
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                 </label>
                              </>
                           )
                        )}
                     </div>
                  </div>

                  <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                     {activeTab === 'VAULT' ? (
                        !selectedArtifactId ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                              {documents
                                .filter(d => activeVaultFilter === 'ALL' || d.status === activeVaultFilter)
                                .map(doc => (
                                 <div key={doc.id} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-500/50 transition-all flex items-start gap-5 shadow-sm relative overflow-hidden">
                                    <div className={`p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform ${
                                       doc.artifact_ref ? 'bg-indigo-600 text-white shadow-indigo-900/30' : 'bg-white dark:bg-slate-900 text-indigo-600'
                                    }`}>
                                       {doc.artifact_ref ? <Package size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase text-xs tracking-tight truncate pr-8">{doc.name}</h4>
                                       <div className="flex flex-col gap-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1"><Calendar size={10} className="text-indigo-500" /> PERIOD: {doc.metadata?.startDate || 'N/A'}</span>
                                          <span className="flex items-center gap-1"><Hash size={10} className="text-indigo-500" /> REC: {doc.metadata?.receiptId || 'N/A'}</span>
                                       </div>
                                       <div className="mt-4 flex justify-between items-center">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest ${
                                             doc.status === 'VERIFIED' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'
                                          }`}>{doc.status}</span>
                                          <div className="flex gap-2">
                                             {doc.artifact_ref && (
                                               <button 
                                                   onClick={() => fetchItemsForArtifact(doc.artifact_ref)}
                                                   className="px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                                                >
                                                 <Database size={10} /> View Items <ArrowRight size={10} />
                                               </button>
                                             )}
                                             <button onClick={() => deleteDoc(doc.id)} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="animate-in slide-in-from-bottom-4">
                              {isLoadingItems ? (
                                 <div className="h-96 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 size={48} className="text-indigo-600 animate-spin" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Decompressing Atomic Items...</p>
                                 </div>
                              ) : (
                                 <div className="space-y-4">
                                    <table className="w-full text-left text-xs">
                                       <thead className="text-slate-500 font-black uppercase text-[10px] tracking-widest border-b pb-4">
                                          <tr>
                                             <th className="py-4 px-4">Item Descriptor</th>
                                             <th className="py-4 px-4">Category</th>
                                             <th className="py-4 px-4 text-center">Qty</th>
                                             <th className="py-4 px-4 text-right">Tax (Br)</th>
                                             <th className="py-4 px-4 text-right">Value (Br)</th>
                                             <th className="py-4 px-4"></th>
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                          {artifactItems.map((item, idx) => {
                                             const isEditingItem = editingItemId === item.id;
                                             return (
                                                <tr key={idx} className={`group transition-all ${isEditingItem ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}>
                                                   <td className="py-6 px-4">
                                                      {isEditingItem ? (
                                                         <input 
                                                            type="text" 
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-black uppercase dark:text-white"
                                                            value={editingItemData.description}
                                                            onChange={(e) => setEditingItemData({...editingItemData, description: e.target.value})}
                                                         />
                                                      ) : (
                                                         <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">
                                                            {item.description}
                                                         </p>
                                                      )}
                                                   </td>
                                                   <td className="py-6 px-4">
                                                      {isEditingItem ? (
                                                         <select 
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-[10px] font-black uppercase dark:text-white"
                                                            value={editingItemData.category}
                                                            onChange={(e) => setEditingItemData({...editingItemData, category: e.target.value})}
                                                         >
                                                            <option value="REVENUE">REVENUE</option>
                                                            <option value="COGS">COGS</option>
                                                            <option value="OPEX">OPEX</option>
                                                            <option value="TAX">TAX</option>
                                                            <option value="UNCATEGORIZED">UNCATEGORIZED</option>
                                                         </select>
                                                      ) : (
                                                         <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-100 dark:border-indigo-800">
                                                            {item.category}
                                                         </span>
                                                      )}
                                                   </td>
                                                   <td className="py-6 px-4 text-center">
                                                      {isEditingItem ? (
                                                         <input 
                                                            type="number" 
                                                            className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-black text-center dark:text-white"
                                                            value={editingItemData.qty}
                                                            onChange={(e) => setEditingItemData({...editingItemData, qty: parseInt(e.target.value) || 1})}
                                                         />
                                                      ) : (
                                                         <span className="font-bold text-slate-500">{item.qty}</span>
                                                      )}
                                                   </td>
                                                   <td className="py-6 px-4 text-right">
                                                      {isEditingItem ? (
                                                         <input 
                                                            type="number" 
                                                            className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-black text-right dark:text-white"
                                                            value={editingItemData.tax}
                                                            onChange={(e) => setEditingItemData({...editingItemData, tax: parseFloat(e.target.value) || 0})}
                                                         />
                                                      ) : (
                                                         <span className="font-mono font-black text-orange-600 dark:text-orange-400">
                                                            {(item.tax ?? 0).toLocaleString()}
                                                         </span>
                                                      )}
                                                   </td>
                                                   <td className="py-6 px-4 text-right">
                                                      {isEditingItem ? (
                                                         <input 
                                                            type="number" 
                                                            className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-black text-right dark:text-white"
                                                            value={editingItemData.amount}
                                                            onChange={(e) => setEditingItemData({...editingItemData, amount: parseFloat(e.target.value) || 0})}
                                                         />
                                                      ) : (
                                                         <span className="font-mono font-black text-slate-900 dark:text-white">
                                                            {(item.amount ?? 0).toLocaleString()}
                                                         </span>
                                                      )}
                                                   </td>
                                                   <td className="py-6 px-4 text-right">
                                                      <div className="flex justify-end gap-2">
                                                         {isEditingItem ? (
                                                            <>
                                                               <button 
                                                                  onClick={handleSaveItem}
                                                                  className="p-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all"
                                                                  title="Save Changes"
                                                               >
                                                                  <Check size={14} />
                                                               </button>
                                                               <button 
                                                                  onClick={() => { setEditingItemId(null); setEditingItemData(null); }}
                                                                  className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-300 transition-all"
                                                                  title="Cancel"
                                                               >
                                                                  <X size={14} />
                                                               </button>
                                                            </>
                                                         ) : (
                                                            <button 
                                                               onClick={() => startEditingItem(item)}
                                                               className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                               <Edit3 size={14} />
                                                            </button>
                                                         )}
                                                      </div>
                                                   </td>
                                                </tr>
                                             );
                                          })}
                                       </tbody>
                                    </table>
                                 </div>
                              )}
                           </div>
                        )
                     ) : (
                        <SageRegisterRecon shop={shop} />
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SageShopProfile;
