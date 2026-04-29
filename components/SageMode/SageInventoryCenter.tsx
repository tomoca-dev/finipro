
import React, { useState } from 'react';
import { 
  ShoppingBag, Box, Package, Plus, Search, 
  AlertTriangle, Database, ArrowRight, Activity, 
  Filter, Cpu, MoreVertical, X, Save, Trash2, Edit3,
  RefreshCw
} from 'lucide-react';
import { SageTab } from './SageModeShell';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  qty: number;
  value: number;
  reorderPoint: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL';
}

interface SageInventoryCenterProps {
  navigateTo: (tab: SageTab) => void;
}

const SageInventoryCenter: React.FC<SageInventoryCenterProps> = ({ navigateTo }) => {
  // DATA RESET: Initial stock is empty
  const [stock, setStock] = useState<InventoryItem[]>([]);

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ sku: '', name: '', qty: 0, value: 0, reorderPoint: 0 });

  const handleAddItem = () => {
    if (!newItem.sku || !newItem.name) return;
    const item: InventoryItem = {
      id: Date.now().toString(),
      sku: newItem.sku,
      name: newItem.name,
      qty: newItem.qty || 0,
      value: newItem.value || 0,
      reorderPoint: newItem.reorderPoint || 0,
      status: (newItem.qty || 0) <= (newItem.reorderPoint || 0) ? 'CRITICAL' : 'OPTIMAL'
    };
    setStock([item, ...stock]);
    setIsProvisioning(false);
    setNewItem({ sku: '', name: '', qty: 0, value: 0, reorderPoint: 0 });
  };

  const handleReplenish = (id: string) => {
    setStock(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: item.qty + 50, status: 'OPTIMAL' };
      }
      return item;
    }));
    alert("Replenishment Request Dispatched to Procurement Node.");
  };

  const totalValue = stock.reduce((s, i) => s + i.value, 0);

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Inventory & Services</h2>
          <p className="text-sm text-slate-500 font-medium">Global Stock Records and Assembly Ingestion</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsProvisioning(true)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all hover:bg-indigo-500 active:scale-95"
          >
            <Plus size={16} /> Provision New Item Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Asset Value</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Unique SKU Nodes</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{stock.length}</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow flex flex-col justify-center border-l-orange-500 border-l-4">
           <div className="flex items-center gap-3 text-orange-600">
              <AlertTriangle size={24} className={stock.some(s => s.status !== 'OPTIMAL') ? "animate-pulse" : ""} />
              <span className="text-3xl font-black font-mono">{stock.filter(s => s.status !== 'OPTIMAL').length} ALERTS</span>
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Critical Shortage Detected</p>
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] luxury-shadow flex flex-col justify-center">
           <button 
             onClick={() => navigateTo('AUTOMATION')}
             className="w-full py-4 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white border border-indigo-100 dark:border-slate-700 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-3 group"
           >
              <Cpu size={18} /> Provision Auto-Replenishment
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
         <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search SKU / Item Registry..." className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none shadow-sm" />
            </div>
            <div className="flex gap-3">
               <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 shadow-sm"><Filter size={18} /></button>
            </div>
         </div>
         <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-8 py-5">SKU SPEC</th>
                  <th className="px-8 py-5">Institutional Name</th>
                  <th className="px-8 py-5 text-center">On Hand Node</th>
                  <th className="px-8 py-5 text-right">Accounting Value</th>
                  <th className="px-8 py-5">Stock Health</th>
                  <th className="px-8 py-5 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
               {stock.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="py-32 text-center text-slate-400 italic uppercase font-black tracking-widest">Zero inventory items discovered in registry</td>
                 </tr>
               ) : stock.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                     <td className="px-8 py-6 font-mono font-black text-indigo-600 dark:text-indigo-400">{item.sku}</td>
                     <td className="px-8 py-6">
                        <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{item.name}</p>
                     </td>
                     <td className="px-8 py-6 text-center font-mono font-black text-slate-900 dark:text-white">{item.qty} Units</td>
                     <td className="px-8 py-6 text-right font-mono font-black text-slate-900 dark:text-white">${item.value.toLocaleString()}</td>
                     <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest ${
                           item.status === 'OPTIMAL' ? 'bg-green-500/10 text-green-600 border-green-200' : 
                           item.status === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border-red-200 animate-pulse' :
                           'bg-amber-500/10 text-amber-600 border-amber-200'
                        }`}>{item.status}</span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                           {item.status !== 'OPTIMAL' && (
                              <button 
                                onClick={() => handleReplenish(item.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                title="Replenish"
                              >
                                 <RefreshCw size={16} />
                              </button>
                           )}
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={16} /></button>
                           <button onClick={() => setStock(prev => prev.filter(x => x.id !== item.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
      
      {isProvisioning && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">SKU Provisioning</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add statutory stock item to registry</p>
                 </div>
                 <button onClick={() => setIsProvisioning(false)} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SKU CODE</label>
                       <input 
                         type="text" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                         placeholder="SRV-001"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DESCRIPTOR</label>
                       <input 
                         type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                         placeholder="Description..."
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial QTY</label>
                       <input 
                         type="number" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: parseInt(e.target.value) || 0})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Book Value ($)</label>
                       <input 
                         type="number" value={newItem.value} onChange={e => setNewItem({...newItem, value: parseInt(e.target.value) || 0})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reorder Pt.</label>
                       <input 
                         type="number" value={newItem.reorderPoint} onChange={e => setNewItem({...newItem, reorderPoint: parseInt(e.target.value) || 0})}
                         className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold dark:text-white"
                       />
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-black/20 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsProvisioning(false)} className="flex-1 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                 <button onClick={handleAddItem} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Seal Item Node</button>
              </div>
           </div>
         </div>
      )}

      <div className="p-10 bg-slate-950 text-indigo-100 rounded-[48px] border-2 border-indigo-500/20 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Box size={160} /></div>
         <div className="flex items-center gap-10 relative z-10">
            <div className="p-6 bg-indigo-600 text-white rounded-[32px] shadow-xl shadow-indigo-900/40 border border-indigo-400/20 group-hover:rotate-6 transition-transform">
               <Package size={48} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase tracking-tighter italic">Assembly Ingestion Engine</h4>
               <p className="text-sm font-medium opacity-70 max-w-2xl leading-relaxed mt-1 italic">
                  "Inventory nodes support complex **BOM (Bill of Materials)** expansion. Ingesting an assembly node automatically triggers proportional consumption of child component nodes in the master registry."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SageInventoryCenter;
