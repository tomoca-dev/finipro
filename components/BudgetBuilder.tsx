
import React, { useState, useEffect, useRef } from 'react';
import { supabase, logAuditAction, ensureDefaultOrganization } from '../services/supabaseClient';
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
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [budgetId, setBudgetId] = useState<string | null>(null);

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = await ensureDefaultOrganization();
      setOrganizationId(orgId);
      const [budRes, itemRes, insightRes, deptRes] = await Promise.all([
        supabase.from('budgets').select('*').eq('organization_id', orgId),
        supabase.from('budget_line_items').select('*').eq('organization_id', orgId),
        supabase.from('ai_insights').select('*').eq('organization_id', orgId).eq('insight_type', 'BUDGET_NEGOTIATION').order('created_at', { ascending: false }),
        supabase.from('departments').select('id,name,code').eq('organization_id', orgId)
      ]);
      if (budRes.data) {
        const mapped = budRes.data.map((b: any) => ({
          id: b.id,
          department: b.budget_name || b.metadata?.department || 'General',
          envelope: Number(b.total_budget || 0),
          allocated: Number(b.total_actual || 0),
          status: b.status || 'DRAFT',
          efficiencyScore: Number(b.metadata?.efficiencyScore || 85),
        }));
        setBudgets(mapped as any);
        setBudgetId(budRes.data[0]?.id ?? null);
      }
      if (itemRes.data) {
        setLineItems(itemRes.data.map((item: any) => ({
          id: item.id,
          category: item.category || 'OPEX',
          subCategory: item.description || 'Budget Line',
          amount: Number(item.planned_amount ?? item.actual_amount ?? 0),
          roiTarget: Number(item.metadata?.roiTarget ?? 1),
          department: item.metadata?.department || selectedDept,
          status: item.metadata?.status || 'DRAFT',
        })) as any);
      }
      if (insightRes.data) {
        setNegotiationHistory(insightRes.data.map((row: any) => ({
          id: row.id,
          budget_id: row.source_id || row.id,
          department: row.evidence?.department || 'General',
          input_snapshot: row.evidence?.input_snapshot || {},
          ai_output: row.evidence?.ai_output || { summary: row.summary },
          created_by: row.created_by || 'AI',
          created_at: row.created_at,
          accepted_flag: row.status === 'APPROVED',
        })) as any);
      }
      if (deptRes.data && deptRes.data.length > 0) {
        const names = deptRes.data.map((d: any) => d.name);
        setAvailableDepts(Array.from(new Set([...MOCK_DEPARTMENTS, ...names])));
      }
    } catch (err) {
      console.warn('Budget data load failed:', err);
    } finally {
      setIsLoading(false);
    }
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
    const updates: any = {};
    if (field === 'subCategory') updates.description = value;
    else if (field === 'amount') updates.planned_amount = Number(value);
    else if (field === 'category') updates.category = value;
    else updates.metadata = { [field]: value };
    await supabase.from('budget_line_items').update(updates).eq('id', id);
  };

  const handleAddLine = async () => {
    const orgId = organizationId || await ensureDefaultOrganization();
    let activeBudgetId = budgetId;
    if (!activeBudgetId) {
      const { data: createdBudget, error: budgetError } = await supabase.from('budgets').insert([{
        organization_id: orgId,
        budget_name: selectedDept,
        fiscal_year: new Date().getFullYear(),
        total_budget: 150000,
        total_actual: 0,
        status: 'DRAFT',
        metadata: { department: selectedDept, efficiencyScore: 85 },
      }]).select('*').single();
      if (budgetError) throw budgetError;
      activeBudgetId = createdBudget.id;
      setBudgetId(activeBudgetId);
    }
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      category: 'OPEX',
      subCategory: 'New Expenditure',
      amount: 0,
      roiTarget: 1.0,
      department: selectedDept,
      status: 'DRAFT'
    };
    const { data, error } = await supabase.from('budget_line_items').insert([{
      organization_id: orgId,
      budget_id: activeBudgetId,
      category: newItem.category,
      description: newItem.subCategory,
      planned_amount: newItem.amount,
      actual_amount: 0,
      metadata: { department: selectedDept, roiTarget: newItem.roiTarget, status: newItem.status },
    }]).select('*').single();
    if (error) throw error;
    setLineItems([...lineItems, { ...newItem, id: data.id }]);
    logAuditAction('current-user', 'ADD_LINE_ITEM', 'budget_line_items', data.id, newItem, orgId);
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
    const orgId = organizationId || await ensureDefaultOrganization();
    const { data } = await supabase.from('ai_insights').insert([{
      organization_id: orgId,
      insight_type: 'BUDGET_NEGOTIATION',
      title: `Budget negotiation - ${selectedDept}`,
      summary: result?.summary || result?.rationale || 'AI budget negotiation generated.',
      severity: 'MEDIUM',
      confidence: result?.confidence || 75,
      status: 'ACTIVE',
      source_table: 'budgets',
      source_id: currentBudget.department,
      recommendation: result?.recommendation || result?.rationale || null,
      evidence: { department: selectedDept, input_snapshot: newNeg.input_snapshot, ai_output: result },
      created_by: 'AI'
    }]).select();
    if (data) setNegotiationHistory([{ ...(newNeg as Negotiation), id: data[0].id, created_at: data[0].created_at }, ...negotiationHistory]);
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
