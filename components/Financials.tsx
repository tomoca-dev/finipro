
import React, { useState } from 'react';
import { FinancialRecord, TransactionType, Asset, CurrencyCode } from '../types';
import { ChevronDown, Download, Filter, Box, TrendingDown, Hammer, Percent, AlertCircle } from 'lucide-react';
import { calculateDepreciation, CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../services/dataEngine';

const Financials: React.FC<{ records: FinancialRecord[], mode: 'pandl' | 'budget' }> = ({ records, mode }) => {
  const [view, setView] = useState<'PANDL' | 'BALANCE'>('PANDL');

  const currentCurrency = (records[0]?.currency as CurrencyCode) || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currentCurrency] || '$';
  const rate = EXCHANGE_RATES[currentCurrency] || 1;

  const getSubtotals = (type: TransactionType) => {
    return records
      .filter(r => r.type === type)
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const revenue = getSubtotals(TransactionType.REVENUE);
  const cogs = getSubtotals(TransactionType.COGS);
  const grossProfit = revenue - cogs;
  const opex = getSubtotals(TransactionType.OPEX);
  const payroll = getSubtotals(TransactionType.PAYROLL);
  const capex = getSubtotals(TransactionType.CAPEX);
  
  // Advanced Financial Provisions
  const vatProvision = revenue * 0.12; // Estimated VAT
  const corporateTax = (revenue - cogs - opex - payroll) * 0.21; // Mock 21% Tax
  
  const mockAssets: Asset[] = [
    { id: 'a1', name: 'Server Cluster Q1', cost: 150000 * rate, purchaseDate: '2023-01-10', usefulLife: 3, salvageValue: 10000 * rate, category: 'IT' },
    { id: 'a2', name: 'Ops Vehicle', cost: 45000 * rate, purchaseDate: '2023-03-15', usefulLife: 5, salvageValue: 5000 * rate, category: 'Vehicles' },
    { id: 'a3', name: 'Office Equipment', cost: 22000 * rate, purchaseDate: '2023-06-20', usefulLife: 7, salvageValue: 1000 * rate, category: 'Machinery' }
  ];

  const monthlyDep = calculateDepreciation(mockAssets);
  const ebitda = grossProfit - opex - payroll;
  const ebit = ebitda - monthlyDep;

  // Mock comparison benchmarks scaled by current rate
  const benchmarkRevenue = 1150000 * rate;
  const benchmarkCogs = 140000 * rate;
  const benchmarkOpex = 650000 * rate;
  const benchmarkEbitda = 360000 * rate;

  if (mode === 'pandl') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit shadow-sm">
           <button onClick={() => setView('PANDL')} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${view === 'PANDL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}>Income Statement</button>
           <button onClick={() => setView('BALANCE')} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${view === 'BALANCE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}>Assets & Provisions</button>
        </div>

        {view === 'PANDL' ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Management P&L ({currentCurrency})</h3>
                <p className="text-sm text-slate-500 font-medium">Consolidated management view (Normalized Canonical Data)</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-slate-700 dark:text-white shadow-sm">
                   Template: Board Pack
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white rounded-xl shadow-lg shadow-blue-900/40 transition-all">
                  <Download size={16} /> Export Board Report
                </button>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Accounting Line Item</th>
                    <th className="px-8 py-5 text-right">Actuals ({currentCurrency})</th>
                    <th className="px-8 py-5 text-right">Budget ({currentCurrency})</th>
                    <th className="px-8 py-5 text-right">Var %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  <tr className="bg-blue-600/5 group hover:bg-blue-600/10 transition-colors">
                    <td className="px-8 py-5 font-bold text-blue-600 dark:text-blue-400">Total Revenue</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-blue-100">{currencySymbol}{revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500 font-mono">{currencySymbol}{benchmarkRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-8 py-5 text-right text-green-600 dark:text-green-400 font-bold">
                      {((revenue/benchmarkRevenue - 1)*100).toFixed(1)}%
                    </td>
                  </tr>
                  
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-red-600 dark:text-red-400">Total COGS (Incl. Inventory)</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-red-200">({currencySymbol}{cogs.toLocaleString()})</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500 font-mono">{currencySymbol}{benchmarkCogs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-8 py-5 text-right text-red-600 dark:text-red-400 font-bold">
                       {((cogs/benchmarkCogs - 1)*100).toFixed(1)}%
                    </td>
                  </tr>

                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800">
                    <td className="px-8 py-5 font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Gross Profit</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white text-lg">{currencySymbol}{grossProfit.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right text-slate-500 dark:text-slate-400 font-mono">{currencySymbol}{(benchmarkRevenue - benchmarkCogs).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-8 py-5 text-right text-green-600 dark:text-green-400 font-bold">{((grossProfit/(benchmarkRevenue - benchmarkCogs) - 1)*100).toFixed(1)}%</td>
                  </tr>

                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-slate-700 dark:text-slate-300">
                    <td className="px-8 py-5 font-bold">Total OpEx & Payroll</td>
                    <td className="px-8 py-5 text-right font-black">({currencySymbol}{(opex + payroll).toLocaleString()})</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500 font-mono">{currencySymbol}{benchmarkOpex.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-8 py-5 text-right text-green-600 dark:text-green-400 font-bold">
                       {(((opex+payroll)/benchmarkOpex - 1)*100).toFixed(1)}%
                    </td>
                  </tr>

                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                       VAT Provision (Estimated) <Percent size={12} />
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-800 dark:text-orange-200">({currencySymbol}{vatProvision.toLocaleString()})</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500">-</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500">-</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                       Corporate Tax Accrual (21%) <Percent size={12} />
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-800 dark:text-orange-200">({currencySymbol}{corporateTax.toLocaleString()})</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500">-</td>
                    <td className="px-8 py-5 text-right text-slate-400 dark:text-slate-500">-</td>
                  </tr>

                  <tr className="bg-indigo-600/10 border-t-2 border-indigo-500/30">
                    <td className="px-8 py-6 font-black uppercase text-xs tracking-widest text-indigo-600 dark:text-indigo-400">Adjusted EBITDA (Pre-Depreciation)</td>
                    <td className="px-8 py-6 text-right font-black text-indigo-600 dark:text-indigo-400 text-xl">{currencySymbol}{ebitda.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right text-indigo-400/50 dark:text-indigo-300/50 font-mono">{currencySymbol}{benchmarkEbitda.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-8 py-6 text-right text-green-600 dark:text-green-400 font-bold">
                       {((ebitda/benchmarkEbitda - 1)*100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
               <div className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                  <AlertCircle size={24} className="text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                    <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-1 tracking-tight">Financial Note (Conversion Active)</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      All figures normalized to <strong>{currentCurrency}</strong>. Benchmark/Budget columns are scaled using the current institutional mid-market exchange rate (1 USD = {rate} {currentCurrency}).
                    </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-8 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                    <Hammer size={24} className="text-blue-500" /> Fixed Assets & CapEx ({currentCurrency})
                  </h3>
                  <button className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">+ Add Asset</button>
                </div>
                
                <div className="space-y-4">
                  {mockAssets.map(asset => (
                    <div key={asset.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-blue-500 transition-all shadow-sm">
                       <div>
                         <p className="font-bold text-slate-900 dark:text-slate-100">{asset.name}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                           {asset.category} • {asset.usefulLife} Year Life • Pur: {asset.purchaseDate}
                         </p>
                       </div>
                       <div className="text-right">
                         <p className="font-black text-slate-900 dark:text-slate-200">{currencySymbol}{asset.cost.toLocaleString()}</p>
                         <p className="text-[10px] text-red-600 dark:text-red-400 uppercase font-black mt-1">-{currencySymbol}{((asset.cost - asset.salvageValue) / asset.usefulLife / 12).toFixed(0)}/mo DEPR.</p>
                       </div>
                    </div>
                  ))}
                  <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                     <div>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total CapEx Deployed</span>
                       <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{currencySymbol}{capex.toLocaleString()}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Monthly Depr.</span>
                        <span className="text-xl font-black text-red-600 dark:text-red-400/80">({currencySymbol}{(monthlyDep).toLocaleString()})</span>
                     </div>
                  </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-8 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                    <Box size={24} className="text-orange-500" /> Inventory & Wastage ({currentCurrency})
                  </h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Feed</span>
                </div>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Ending Stock Val.</p>
                         <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{currencySymbol}{(42800 * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Turnover Ratio</p>
                         <p className="text-3xl font-black text-green-600">12.4x</p>
                      </div>
                   </div>
                   
                   <div className="p-6 bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <TrendingDown size={48} className="text-red-500" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                         <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-500">
                            <TrendingDown size={24} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">Inventory Wastage / Shrinkage</p>
                            <p className="text-xs text-slate-600 dark:text-slate-500 leading-relaxed max-w-xs">
                              Leakage detected in Logistics hub #4. Predictive alert suggest 3.2% stock loss this month.
                            </p>
                         </div>
                         <div className="flex-1 text-right">
                            <span className="text-2xl font-black text-red-600 dark:text-red-400">{currencySymbol}{(3240 * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span className="block text-[10px] font-black text-red-400/50 uppercase tracking-tighter">7.4% Increase WoW</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
           <Filter size={20} className="text-blue-500" /> Variance Breakdown ({currentCurrency})
        </h3>
        <div className="space-y-8">
          {[
            { label: 'Marketing Spend', actual: 45000 * rate, budget: 50000 * rate, trend: 'good' },
            { label: 'Cloud Infrastructure', actual: 120000 * rate, budget: 100000 * rate, trend: 'bad' },
            { label: 'Travel & Events', actual: 12000 * rate, budget: 15000 * rate, trend: 'good' },
            { label: 'Salaries & Benefits', actual: 450000 * rate, budget: 440000 * rate, trend: 'bad' },
          ].map((item) => {
            const pct = (item.actual / item.budget) * 100;
            return (
              <div key={item.label} className="group">
                <div className="flex justify-between mb-2 items-end">
                  <div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Act: {currencySymbol}{item.actual.toLocaleString()} • Bud: {currencySymbol}{item.budget.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded tracking-tighter uppercase ${item.trend === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {item.trend === 'good' ? '-' : '+'}{Math.abs(100 - pct).toFixed(1)}% {item.trend === 'good' ? 'Under' : 'Over'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${item.trend === 'good' ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
        <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
           <AlertCircle size={20} className="text-orange-500" /> Financial Risks & Controls
        </h3>
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
           "FX Volatility in {currentCurrency}/USD is currently being addressed. Budget benchmarks have been re-calibrated at a mid-market rate of {rate}."
        </div>
        <div className="space-y-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Revenue Forecast (Q4)</span>
            <span className="text-2xl font-black text-green-600 dark:text-green-400">{currencySymbol}{(1280000 * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Projected Burn Rate</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400/80">{currencySymbol}{(210000 * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;
