
import React, { useState, useMemo } from 'react';
import { 
  Store, Search, Plus, Filter, MoreVertical, 
  ChevronRight, MapPin, ShieldCheck, ArrowRight,
  Database, RefreshCw, X, Save, UserPlus, Zap
} from 'lucide-react';
import { ShopNode } from '../../types';
import { SageTab } from './SageModeShell';

interface SageShopRegistryProps {
  shops: ShopNode[];
  onAddShop: (shop: ShopNode) => void | Promise<void>;
  navigateTo: (tab: SageTab, shopId?: string) => void;
}

const SageShopRegistry: React.FC<SageShopRegistryProps> = ({ shops, onAddShop, navigateTo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'NORTH' | 'CENTRAL' | 'SOUTH'>('ALL');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newShop, setNewShop] = useState<Partial<ShopNode>>({ name: '', region: 'NORTH' });

  const filteredShops = useMemo(() => {
    return shops.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'ALL' || s.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [shops, searchTerm, regionFilter]);

  const handleProvision = async () => {
    if (!newShop.name) return;
    setIsSaving(true);
    setSaveError(null);

    const node: ShopNode = {
      id: `NODE-${Date.now().toString().slice(-6)}`,
      name: newShop.name.trim(),
      region: newShop.region as any,
      status: 'AWAITING_FEED',
      createdAt: new Date().toISOString().split('T')[0],
      documents: []
    };

    try {
      await onAddShop(node);
      setIsProvisioning(false);
      setNewShop({ name: '', region: 'NORTH' });
    } catch (error: any) {
      console.error('Unable to provision shop:', error);
      setSaveError(error?.message || 'Unable to save shop to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
            <Store className="text-indigo-600" /> Branch Registry
          </h2>
          <p className="text-sm text-slate-500 font-medium">Manage institutional shop nodes and statutory profiles</p>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <Plus size={16} /> Provision New Shop Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Node Count</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{shops.length}</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Regions</p>
            <p className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">04 Nodes</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statutory Health</p>
            <p className="text-3xl font-black text-green-600 font-mono tracking-tighter">100%</p>
         </div>
         <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Size</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">142 KB</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-10">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search branch name, node ID, or address..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20" 
               />
            </div>
            <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
               {['ALL', 'NORTH', 'CENTRAL', 'SOUTH'].map(r => (
                 <button
                   key={r}
                   onClick={() => setRegionFilter(r as any)}
                   className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                     regionFilter === r ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                   }`}
                 >
                   {r}
                 </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                     <th className="px-8 py-5 text-center">Node ID</th>
                     <th className="px-8 py-5">Institutional Name</th>
                     <th className="px-8 py-5">Region Cluster</th>
                     <th className="px-8 py-5">On-Hand Status</th>
                     <th className="px-8 py-5">Provision Date</th>
                     <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredShops.map(shop => (
                    <tr key={shop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                       <td className="px-8 py-6 text-center">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{shop.id}</span>
                       </td>
                       <td className="px-8 py-6">
                          <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{shop.name}</p>
                       </td>
                       <td className="px-8 py-6">
                          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                             <MapPin size={10} className="text-indigo-500" /> {shop.region}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest transition-all ${
                             shop.status === 'LOCKED' ? 'bg-red-500/10 text-red-600 border-red-200' : 
                             shop.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 border-green-200' :
                             'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                          }`}>{shop.status}</span>
                       </td>
                       <td className="px-8 py-6 text-slate-400 font-mono">{shop.createdAt}</td>
                       <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => navigateTo('SHOP_PROFILE', shop.id)}
                            className="flex items-center gap-2 ml-auto px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 group/btn"
                          >
                             View Profile <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {isProvisioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-900/40 animate-pulse">
                       <Store size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Shop Provisioning</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Construct institutional branch node</p>
                    </div>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700"><X size={24} /></button>
              </div>
              
              <div className="p-12 space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Functional Shop Name</label>
                    <input 
                      type="text" 
                      value={newShop.name}
                      onChange={(e) => setNewShop({...newShop, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white shadow-inner"
                      placeholder="e.g. branch_node_paris_airport"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Regional Cluster Assignment</label>
                    <div className="grid grid-cols-3 gap-4">
                       {['NORTH', 'CENTRAL', 'SOUTH'].map(r => (
                         <button
                           key={r}
                           onClick={() => setNewShop({...newShop, region: r as any})}
                           className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                             newShop.region === r 
                             ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                             : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                           }`}
                         >
                           {r}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {saveError && (
                <div className="mx-12 mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300 text-xs font-bold">
                  {saveError}
                </div>
              )}

              <div className="p-10 bg-slate-50 dark:bg-black/40 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button disabled={isSaving} onClick={() => setIsProvisioning(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-sm">Abort</button>
                 <button 
                  onClick={handleProvision}
                  disabled={isSaving}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-indigo-900/40"
                 >
                    <Save size={18} /> {isSaving ? 'Saving to Supabase...' : 'Seal Shop Node'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SageShopRegistry;
