
import React, { useState, useEffect } from 'react';
import { 
  Truck, Plus, Search, Filter, 
  X, Save, Landmark,
  MoreVertical, CreditCard, Loader2, RefreshCw, Trash2
} from 'lucide-react';
import { SageTab } from './SageModeShell';
import { supabase, logAuditAction } from '../../services/supabaseClient';

interface Vendor {
  id: string;
  name: string;
  category: string;
  balance: number;
  payment_terms: string;
  status: 'Active' | 'Inactive' | 'On Hold';
}

interface SageVendorCenterProps {
  navigateTo: (tab: SageTab) => void;
}

const SageVendorCenter: React.FC<SageVendorCenterProps> = ({ navigateTo }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({ name: '', category: 'Infrastructure', payment_terms: 'Net 30' });

  const fetchVendors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('vendors').select('*').order('name');
    if (!error && data) setVendors(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = async () => {
    if (!newVendor.name) return;
    setIsSaving(true);
    const vendor = {
      name: newVendor.name,
      category: newVendor.category || 'General',
      balance: 0,
      payment_terms: newVendor.payment_terms || 'Net 30',
      status: 'Active'
    };

    const { data, error } = await supabase.from('vendors').insert([vendor]).select();
    
    if (!error && data) {
      logAuditAction('system', 'PROVISION_VENDOR', 'vendors', data[0].id, vendor);
      setVendors([data[0], ...vendors]);
      setIsProvisioning(false);
      setNewVendor({ name: '', category: 'Infrastructure', payment_terms: 'Net 30' });
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Void vendor record?")) return;
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (!error) {
      setVendors(prev => prev.filter(v => v.id !== id));
      logAuditAction('system', 'VOID_VENDOR', 'vendors', id, {});
    }
  };

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPayable = vendors.reduce((s, v) => s + v.balance, 0);

  return (
    <div className="p-10 space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Vendors & Purchases</h2>
          <p className="text-sm text-slate-500 font-medium">Manage Accounts Payable (A/P) and Procurement sinks</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsProvisioning(true)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 transition-all active:scale-95"
          >
            <Plus size={16} /> Provision New Vendor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Accounts Payable</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Sinks</p>
          <p className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">{vendors.length} Nodes</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow flex flex-col justify-center">
          <button 
            onClick={() => navigateTo('BANKING')}
            className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-3 group"
          >
            <CreditCard size={18} className="group-hover:rotate-12 transition-transform" /> Disburse Node Funds
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search procurement registry..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm" 
               />
            </div>
            <div className="flex gap-3">
               <button onClick={fetchVendors} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 shadow-sm hover:text-indigo-600 transition-colors">
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
               </button>
               <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
            </div>
         </div>
         <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-8 py-5">Vendor Entity</th>
                  <th className="px-8 py-5">Cost Category</th>
                  <th className="px-8 py-5 text-right">A/P Balance</th>
                  <th className="px-8 py-5">Standard Terms</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
               {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                       <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Querying Cloud Registry...</p>
                    </td>
                  </tr>
               ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 italic">No vendor nodes found.</td>
                  </tr>
               ) : filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                     <td className="px-8 py-6">
                        <div>
                           <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{v.name}</p>
                           <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">V-ID: {v.id.slice(0,8)}</p>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-slate-500 uppercase text-[10px] font-bold">{v.category}</td>
                     <td className="px-8 py-6 text-right font-mono font-black text-red-600">(${v.balance.toLocaleString()})</td>
                     <td className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest">{v.payment_terms}</td>
                     <td className="px-8 py-6">
                        <span className="px-2.5 py-1 rounded-xl text-[9px] font-black bg-green-500/10 text-green-600 border border-green-200 uppercase tracking-widest">{v.status}</span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => navigateTo('BANKING')}
                             className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                             title="Disburse"
                           >
                             <Landmark size={18} />
                           </button>
                           <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={18} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vendor Provisioning</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add statutory trade creditor to procurement sink</p>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Vendor Name</label>
                    <input 
                      type="text" 
                      value={newVendor.name} 
                      onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      placeholder="e.g. AWS, FedEx, Microsoft..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cost Category</label>
                       <select 
                         value={newVendor.category}
                         onChange={(e) => setNewVendor({...newVendor, category: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                       >
                          <option>Infrastructure</option>
                          <option>Marketing</option>
                          <option>Inventory</option>
                          <option>Legal</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Trade Terms</label>
                       <select 
                         value={newVendor.payment_terms}
                         onChange={(e) => setNewVendor({...newVendor, payment_terms: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                       >
                          <option>Net 30</option>
                          <option>Net 15</option>
                          <option>Due on Receipt</option>
                       </select>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/20 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsProvisioning(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                 <button 
                  onClick={handleAddVendor}
                  disabled={isSaving}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Seal Vendor Node
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageVendorCenter;
