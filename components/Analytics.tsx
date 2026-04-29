
import React, { useState } from 'react';
import { UnitEconRecord } from '../types';
import { Filter, ChevronDown, ShoppingBag, Store, Map, MoreHorizontal } from 'lucide-react';

const MOCK_UNIT_ECON: UnitEconRecord[] = [
  { id: '1', name: 'Enterprise Plan', revenue: 50000, cogs: 8000, opex: 12000, units: 120, cac: 4500 },
  { id: '2', name: 'Standard Plan', revenue: 32000, cogs: 4000, opex: 8000, units: 450, cac: 2100 },
  { id: '3', name: 'Basic Tier', revenue: 15000, cogs: 2000, opex: 5000, units: 1200, cac: 900 },
  { id: '4', name: 'Professional Svc', revenue: 8500, cogs: 6000, opex: 1000, units: 12, cac: 0 },
];

const Analytics: React.FC = () => {
  const [lens, setLens] = useState<'SKU' | 'Store' | 'Region'>('SKU');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setLens('SKU')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${lens === 'SKU' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <ShoppingBag size={16} /> SKU/Plan
          </button>
          <button 
            onClick={() => setLens('Store')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${lens === 'Store' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Store size={16} /> Store
          </button>
          <button 
            onClick={() => setLens('Region')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${lens === 'Region' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Map size={16} /> Region
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
            <Filter size={16} /> Period: Q4-2023
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_UNIT_ECON.map((item) => {
          const ltv = item.revenue / item.units;
          const profitPerUnit = (item.revenue - item.cogs - item.opex) / item.units;
          const margin = ((item.revenue - item.cogs) / item.revenue) * 100;
          
          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all luxury-shadow group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"><MoreHorizontal size={18} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Unit Contribution</p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">${profitPerUnit.toFixed(2)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">LTV/ARPU</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">${ltv.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">GM %</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{margin.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                    <span>Payback Efficiency</span>
                    <span className="text-green-600 dark:text-green-400">High</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 luxury-shadow">
        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Unit Econ Deep-Dive Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Descriptor</th>
                <th className="px-6 py-4">Total Rev</th>
                <th className="px-6 py-4">Total COGS</th>
                <th className="px-6 py-4">Contribution</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {MOCK_UNIT_ECON.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">${item.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-600 dark:text-red-400">${item.cogs.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">${(item.revenue - item.cogs).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.units}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">OPTIMIZED</span>
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

export default Analytics;
