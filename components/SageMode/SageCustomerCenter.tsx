
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, 
  DollarSign, X, Save, UserPlus,
  AlertCircle, MoreVertical, Zap, Loader2, Trash2,
  RefreshCw, ChevronRight, ShieldCheck, History,
  TrendingUp, TrendingDown, Landmark
} from 'lucide-react';
import { SageTab } from './SageModeShell';
import { supabase, logAuditAction, isSupabaseConfigured, localDb } from '../../services/supabaseClient';

interface Customer {
  id: string;
  name: string;
  contact: string;
  balance: number;
  credit_limit: number;
  status: 'Active' | 'Hold' | 'Inactive';
  last_activity: string;
}

interface SageCustomerCenterProps {
  navigateTo: (tab: SageTab) => void;
}

const SageCustomerCenter: React.FC<SageCustomerCenterProps> = ({ navigateTo }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ 
    name: '', 
    contact: '', 
    credit_limit: 50000 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    let data: any[] = [];
    if (isSupabaseConfigured()) {
      const { data: res } = await supabase.from('customers').select('*').order('name');
      data = res || [];
    } else {
      data = localDb.get('customers');
    }
    setCustomers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    setIsSaving(true);
    const customer = {
      name: newCustomer.name,
      contact: newCustomer.contact || 'Main Liaison',
      balance: 0,
      credit_limit: newCustomer.credit_limit || 50000,
      status: 'Active',
      last_activity: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('customers').insert([customer]).select();
      if (data) {
        logAuditAction('system', 'PROVISION_CUSTOMER', 'customers', data[0].id, customer);
        setCustomers([data[0], ...customers]);
      }
    } else {
      const { data } = localDb.insert('customers', [customer]);
      setCustomers([...data, ...customers]);
    }
    
    setIsProvisioning(false);
    setNewCustomer({ name: '', contact: '', credit_limit: 50000 });
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Void statutory customer record? This node will be archived.")) return;
    if (isSupabaseConfigured()) {
      await supabase.from('customers').delete().eq('id', id);
    } else {
      localDb.delete('customers', id);
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
    logAuditAction('system', 'VOID_CUSTOMER', 'customers', id, {});
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalReceivables = customers.reduce((s, c) => s + c.balance, 0);
  const highRiskNodes = customers.filter(c => c.balance > c.credit_limit).length;

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Customer & A/R Registry</h2>
          <p className="text-sm text-slate-500 font-medium tracking-tight uppercase">Statutory Trade Debtors (1200-00 Sub-Ledger)</p>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <UserPlus size={16} /> Provision New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-indigo-500/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Accounts Receivable</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">Br {totalReceivables.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-red-500/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Credit Exceptions</p>
          <div className="flex items-center gap-3">
             <AlertCircle size={20} className={highRiskNodes > 0 ? "text-red-500 animate-pulse" : "text-slate-200"} />
             <p className={`text-3xl font-black font-mono tracking-tighter ${highRiskNodes > 0 ? 'text-red-600' : 'text-slate-400'}`}>{highRiskNodes} OVER LIMIT</p>
          </div>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow group transition-all hover:border-indigo-500/30 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Registry Nodes</p>
           <p className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">{customers.length}</p>
        </div>
        <div className="p-8 bg-slate-950 text-white rounded-[32px] luxury-shadow flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap size={64} className="text-indigo-400" /></div>
           <button 
             onClick={() => navigateTo('PREDICTIVE')}
             className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 relative z-10"
           >
              Run Aging Simulation
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search trade debtor registry..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm focus:border-indigo-500 transition-all" 
               />
            </div>
            <div className="flex gap-3">
               <button onClick={fetchCustomers} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
               </button>
               <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                     <th className="px-8 py-5">Statutory Identity</th>
                     <th className="px-8 py-5">Main Liaison</th>
                     <th className="px-8 py-5 text-right">A/R Balance (Br)</th>
                     <th className="px-8 py-5 text-right">Credit Limit</th>
                     <th className="px-8 py-5">Risk Status</th>
                     <th className="px-8 py-5 text-right">Actions</th>
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
                        <td colSpan={6} className="p-32 text-center">
                           <Users size={64} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
                           <h4 className="text-xl font-black text-slate-300 uppercase italic">Trade Debtor Pool Empty</h4>
                        </td>
                     </tr>
                  ) : filtered.map(c => {
                     const isOverLimit = c.balance > c.credit_limit;
                     return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                           <td className="px-8 py-6">
                              <div>
                                 <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{c.name}</p>
                                 <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">SPEC: {c.id.slice(0,12)}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-slate-500 font-bold uppercase text-[10px]">{c.contact}</td>
                           <td className={`px-8 py-6 text-right font-mono font-black ${isOverLimit ? 'text-red-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                              Br {c.balance.toLocaleString()}
                           </td>
                           <td className="px-8 py-6 text-right font-mono text-slate-400 font-bold">Br {c.credit_limit.toLocaleString()}</td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest flex items-center gap-2 w-fit ${
                                 isOverLimit ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/30' : 
                                 c.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'
                              }`}>
                                 <Zap size={10} /> {isOverLimit ? 'CREDIT HOLD' : c.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button 
                                    onClick={() => navigateTo('AUDIT')}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-slate-200"
                                    title="Audit Node"
                                 >
                                    <History size={18} />
                                 </button>
                                 <button onClick={() => handleDelete(c.id)} className="p-2.5 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                 <button className="p-2.5 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><MoreVertical size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Entity Provisioning</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construct trade debtor sub-ledger node</p>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-white dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Company Name</label>
                    <input 
                      type="text" 
                      value={newCustomer.name} 
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                      placeholder="Trading Node Name..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Main Contact</label>
                       <input 
                         type="text"
                         value={newCustomer.contact}
                         onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                         placeholder="Authorized Liaison"
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Credit Ceiling (Br)</label>
                       <input 
                         type="number"
                         value={newCustomer.credit_limit}
                         onChange={(e) => setNewCustomer({...newCustomer, credit_limit: parseInt(e.target.value)})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner text-indigo-600"
                       />
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/40 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsProvisioning(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-sm">Discard</button>
                 <button 
                  onClick={handleAddCustomer}
                  disabled={isSaving}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Seal Registry Node
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageCustomerCenter;
