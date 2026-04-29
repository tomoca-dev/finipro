
import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, RefreshCw, Loader2, 
  ArrowRight, Store, Calendar, Tag, Database, 
  ChevronRight, Box, ShoppingCart
} from 'lucide-react';
import { localDb, isSupabaseConfigured, supabase } from '../../services/supabaseClient';

const SageMasterItems: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllItems = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('sage_batch_items').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setItems(data);
        } else {
          setItems(localDb.get('sage_batch_items'));
        }
      } catch (e) {
        setItems(localDb.get('sage_batch_items'));
      }
    } else {
      setItems(localDb.get('sage_batch_items'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const filtered = items.filter(i => 
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
            <Package className="text-indigo-600" /> Master Item Registry
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">Unified repository of all ingested line-level data.</p>
        </div>
        <button 
          onClick={fetchAllItems}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-8 luxury-shadow flex items-center gap-6">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by description or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
         </div>
         <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Filter size={14} /> Filter Logic
         </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                     <th className="px-8 py-5">Item Descriptor</th>
                     <th className="px-8 py-5">GL Category</th>
                     <th className="px-8 py-5 text-center">Qty</th>
                     <th className="px-8 py-5 text-right">Value (Br)</th>
                     <th className="px-8 py-5">Ingress Date</th>
                     <th className="px-8 py-5">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-32 text-center"><Loader2 size={40} className="animate-spin mx-auto text-indigo-600" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-32 text-center text-slate-400 italic uppercase font-black">No items discovered in registry.</td></tr>
                  ) : filtered.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{item.description}</p>
                          <p className="text-[8px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">REF: {item.batch_id.slice(0,8)}</p>
                       </td>
                       <td className="px-8 py-6">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded text-[9px] font-black border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest">{item.category}</span>
                       </td>
                       <td className="px-8 py-6 text-center font-black text-slate-900 dark:text-white">{item.qty}</td>
                       <td className="px-8 py-6 text-right font-mono font-black text-slate-900 dark:text-white">Br {item.amount?.toLocaleString()}</td>
                       <td className="px-8 py-6 text-slate-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                             <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase">INDEXED</span>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="p-10 bg-slate-950 text-indigo-100 rounded-[48px] border-2 border-indigo-500/20 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Box size={160} /></div>
         <div className="flex items-center gap-10 relative z-10">
            <div className="p-6 bg-indigo-600 text-white rounded-[32px] shadow-xl shadow-indigo-900/40 border border-indigo-400/20 group-hover:rotate-6 transition-transform">
               <ShoppingCart size={48} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase tracking-tighter italic">Unified Ingress Storage</h4>
               <p className="text-sm font-medium opacity-70 max-w-2xl leading-relaxed mt-1 italic">
                  "This registry aggregates all atomic line items from across the entire shop node network. It serves as the primary source of truth for the institutional P&L and inventory sub-ledgers."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SageMasterItems;
