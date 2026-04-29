
import React, { useState, useEffect, useRef } from 'react';
import { supabase, logAuditAction } from '../services/supabaseClient';
import { 
  Plus, Trash2, Send, CheckCircle, Zap, ChevronRight, Lock, 
  Unlock, TrendingUp, MessageSquareQuote, Loader2, History,
  RefreshCw, Check, X, FolderPlus, Save
} from 'lucide-react';
import { BudgetLineItem, DepartmentBudget, BudgetStatus, Negotiation } from '../types';
import { MOCK_DEPARTMENTS } from '../constants';
import { negotiateBudgetAI } from '../services/geminiService';

const BudgetBuilder: React.FC = () => {
  const [availableDepts, setAvailableDepts] = useState<string[]>(MOCK_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState(MOCK_DEPARTMENTS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [negotiationHistory, setNegotiationHistory] = useState<Negotiation[]>([]);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [activeNegotiation, setActiveNegotiation] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const [budRes, itemRes, negRes, deptRes] = await Promise.all([
      supabase.from('budgets').select('*'),
      supabase.from('budget_line_items').select('*'),
      supabase.from('negotiations').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('name')
    ]);
    
    if (budRes.data) setBudgets(budRes.data);
    if (itemRes.data) setLineItems(itemRes.data);
    if (negRes.data) setNegotiationHistory(negRes.data);
    
    if (deptRes.data && deptRes.data.length > 0) {
      const names = deptRes.data.map((d: any) => d.name);
      setAvailableDepts(Array.from(new Set([...MOCK_DEPARTMENTS, ...names])));
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentBudget = budgets.find(b => b.department === selectedDept) || {
    department: selectedDept,
    envelope: 150000,
    allocated: 0,
    status: 'DRAFT' as BudgetStatus,
    efficiencyScore: 85
  };

  const deptItems = lineItems.filter(li => li.department === selectedDept);
  const totalAllocated = deptItems.reduce((sum, item) => sum + item.amount, 0);

  const handleUpdateLine = async (id: string, field: keyof BudgetLineItem, value: any) => {
    const updatedItems = lineItems.map(item => item.id === id ? { ...item, [field]: value } : item);
    setLineItems(updatedItems);
    await supabase.from('budget_line_items').update({ [field]: value }).eq('id', id);
  };

  const handleAddLine = async () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'OPEX',
      subCategory: 'New Expenditure',
      amount: 0,
      roiTarget: 1.0,
      department: selectedDept,
      status: 'DRAFT'
    };
    
    setLineItems([...lineItems, newItem]);
    await supabase.from('budget_line_items').insert([newItem]);
    logAuditAction('current-user', 'ADD_LINE_ITEM', 'budget_line_items', newItem.id, newItem);
  };

  const handleNegotiate = async () => {
    if (totalAllocated === 0) {
      alert("Provide allocation data before initializing the AI Negotiator.");
      return;
    }
    setIsNegotiating(true);
    const result = await negotiateBudgetAI(selectedDept, totalAllocated, 2.5);
    setActiveNegotiation(result);
    setIsNegotiating(false);

    const newNeg: Partial<Negotiation> = {
      budget_id: currentBudget.department,
      department: selectedDept,
      input_snapshot: { allocated: totalAllocated, envelope: currentBudget.envelope },
      ai_output: result,
      created_by: 'current-user',
      accepted_flag: false
    };
    const { data } = await supabase.from('negotiations').insert([newNeg]).select();
    if (data) setNegotiationHistory([data[0], ...negotiationHistory]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 flex flex-col gap-2">
          {/* Dept List Sidebar... (same as before) */}
          <div className="flex justify-between items-center px-4 mb-2">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Units</h3>
             <button onClick={() => setIsAddingDept(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-500 transition-colors">
                <Plus size={16} />
             </button>
          </div>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {availableDepts.map(d => (
              <button
                key={d}
                onClick={() => { setSelectedDept(d); setShowHistory(false); }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedDept === d && !showHistory
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                }`}
              >
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight mb-0.5 opacity-60">Dept Unit</p>
                  <p className="font-bold text-sm">{d}</p>
                </div>
                <ChevronRight size={14} className={selectedDept === d && !showHistory ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-2xl font-black flex items-center gap-4 text-slate-900 dark:text-white">
                {selectedDept} Budgeting
                <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-500 text-black shadow-md">DRAFT</span>
              </h3>
              <div className="flex gap-3">
                <button onClick={handleNegotiate} disabled={isNegotiating} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/40 transition-all">
                  {isNegotiating ? <RefreshCw size={16} className="animate-spin" /> : <MessageSquareQuote size={16} />}
                  AI Negotiator
                </button>
              </div>
            </div>

            {activeNegotiation && (
              <div className="mb-8 p-6 bg-indigo-500/5 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl animate-in zoom-in-95">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                       <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md"><Zap size={20} /></div>
                       <div>
                          <h4 className="font-bold text-indigo-900 dark:text-indigo-100">AI Strategy Node Response</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-300">Counter-Offer available for review.</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-indigo-500 uppercase">Target Balance</p>
                       <p className="text-xl font-black text-indigo-900 dark:text-white">${activeNegotiation.counterOffer.toLocaleString()}</p>
                    </div>
                 </div>
                 <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-6">"{activeNegotiation.rationale}"</p>
                 <div className="flex gap-2 justify-end">
                    <button onClick={() => setActiveNegotiation(null)} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">Dismiss</button>
                    <button onClick={() => { handleUpdateLine(deptItems[0]?.id, 'amount', activeNegotiation.counterOffer); setActiveNegotiation(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 shadow-md">Apply Recommendation</button>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Master Envelope</p>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">${currentBudget.envelope.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Planned Allocation</p>
                <p className={`text-3xl font-black ${totalAllocated > currentBudget.envelope ? 'text-red-600' : 'text-green-600'}`}>
                  ${totalAllocated.toLocaleString()}
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Efficiency Index</p>
                <p className="text-3xl font-black text-indigo-600">88.4</p>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Accounting Line Item</th>
                    <th className="px-8 py-5 text-right">Target Amount</th>
                    <th className="px-8 py-5 text-center">ROI Focus</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {deptItems.map(item => (
                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <input 
                          type="text" value={item.subCategory} 
                          onChange={(e) => handleUpdateLine(item.id, 'subCategory', e.target.value)} 
                          className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-200 w-full p-0 font-bold" 
                        />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                           <span className="text-slate-400 font-mono">$</span>
                           <input 
                            type="number" value={item.amount} 
                            onChange={(e) => handleUpdateLine(item.id, 'amount', parseFloat(e.target.value) || 0)} 
                            className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-black text-right p-0 w-24" 
                          />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <input type="number" step="0.1" value={item.roiTarget} onChange={(e) => handleUpdateLine(item.id, 'roiTarget', parseFloat(e.target.value) || 1)} className="bg-transparent border-none focus:ring-0 text-blue-600 font-black w-12 p-0 text-center" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={async () => { await supabase.from('budget_line_items').delete().eq('id', item.id); fetchData(); }} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleAddLine} className="w-full py-6 border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                <Plus size={14} /> Initialize New Expenditure Line
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetBuilder;
