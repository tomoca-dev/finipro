import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Plus, Search, ShieldCheck, Landmark, ChevronRight, 
  UserPlus, FileText, DollarSign, Activity, Play, CheckCircle2,
  RefreshCw, Download, Banknote, SmartphoneNfc, Loader2, Info, Lock, Unlock, Gavel, Calculator, Scale, Heart, FileWarning, History, Trash2,
  Shield, Filter, MoreVertical, Edit3, Check, X, Save, ArrowRight,
  TrendingUp, FileSignature, Zap, Bot, Database
} from 'lucide-react';
import { Employee } from '../../types';
import { logAuditAction } from '../../services/supabaseClient';

const DEFAULT_EMPLOYEE_TEMPLATE = (id: string, name: string, unit: string): Employee => ({
  id,
  fullName: name || 'New Personnel Node',
  nationalId: 'ID-' + Math.floor(Math.random() * 10000),
  employmentType: 'Full-time',
  department: unit || 'General Operations',
  jobTitle: 'Associate',
  startDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  compensation: {
    salaryType: 'Monthly',
    baseSalary: 4500,
    hourlyRate: 20,
    overtimeMultiplier: 1.5,
    allowances: { transport: 200, housing: 500, meal: 100, other: 0 },
    bonusEligible: true
  },
  deductions: {
    taxBracketId: 'STATUTORY_V4',
    pension: { employeePct: 7, employerPct: 11 },
    socialSecurity: 120,
    insurance: 80,
    loanBalance: 0,
    loanMonthlyInstallment: 0,
    garnishments: 0,
    customDeductions: []
  },
  bankDetails: {
    accountName: name || 'New Personnel Node',
    accountNumber: '****' + Math.floor(Math.random() * 9000 + 1000),
    bankName: 'CBE',
    paymentMethod: 'Bank'
  }
});

const SagePayrollCenter: React.FC = () => {
  const [view, setView] = useState<'MASTER' | 'RUN_PAYROLL' | 'DEDUCTIONS_ENGINE' | 'DIRECT_DEPOSIT'>('MASTER');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [currentEditingEmployee, setCurrentEditingEmployee] = useState<Employee | null>(null);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  
  // Tax Engine State
  const [activeEngineTab, setActiveEngineTab] = useState<'TAX_BRACKETS' | 'PENSION' | 'STATUTORY'>('TAX_BRACKETS');
  const [taxConfig, setTaxConfig] = useState({
    incomeTaxRate: 15,
    employeePensionPct: 7,
    employerPensionPct: 11,
    socialSecurityRate: 2,
    healthInsuranceFlat: 150
  });

  // Payroll Run State
  const [isCalculating, setIsCalculating] = useState(false);
  const [runSummary, setRunSummary] = useState<any>(null);
  const [isSealingRun, setIsSealingRun] = useState(false);
  const [isRunComplete, setIsRunComplete] = useState(false);

  const filteredEmployees = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    const name = newName || 'Employee ' + (employees.length + 1);
    const unit = newUnit || 'General Operations';
    const newEmp = DEFAULT_EMPLOYEE_TEMPLATE(`EMP-00${employees.length + 1}`, name, unit);
    setEmployees([...employees, newEmp]);
    setIsProvisioning(false);
    setNewName('');
    setNewUnit('');
  };

  const handleUpdateEmployee = () => {
    if (!currentEditingEmployee) return;
    setEmployees(prev => prev.map(e => e.id === currentEditingEmployee.id ? currentEditingEmployee : e));
    setIsEditingDetails(false);
    setCurrentEditingEmployee(null);
  };

  // The Process Cycle Calculation Logic
  const handleRunPayrollCycle = () => {
    if (employees.length === 0) return;
    setIsCalculating(true);
    
    // Simulate complex statutory calculation
    setTimeout(() => {
      let totalGross = 0;
      let totalNet = 0;
      let totalTax = 0;
      let totalPension = 0;

      employees.forEach(emp => {
        const base = emp.compensation.baseSalary || 0;
        // Fix: Casting Object.values to number[] to ensure TS knows the operands for '+' in reduce are numbers.
        const allowances = (Object.values(emp.compensation.allowances) as number[]).reduce((a, b) => a + b, 0);
        const gross = base + allowances;
        
        const incomeTax = gross * (taxConfig.incomeTaxRate / 100);
        const pension = base * (taxConfig.employeePensionPct / 100);
        const deductions = incomeTax + pension + taxConfig.healthInsuranceFlat;
        const net = gross - deductions;

        totalGross += gross;
        totalNet += net;
        totalTax += incomeTax;
        totalPension += (pension + (base * (taxConfig.employerPensionPct / 100)));
      });

      setRunSummary({
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        headcount: employees.length,
        totalGross,
        totalNet,
        totalTax,
        totalPension,
        status: 'CALCULATED'
      });
      setIsCalculating(false);
    }, 1500);
  };

  const handleSealPayrollRun = () => {
    setIsSealingRun(true);
    setTimeout(() => {
      logAuditAction('system', 'PAYROLL_PERIOD_SEALED', 'payroll_runs', 'PR-' + Date.now(), runSummary);
      setIsSealingRun(false);
      setIsRunComplete(true);
    }, 2000);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Institutional Payroll Node</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-2 flex items-center gap-2">
            <Users size={14} className="text-indigo-600" /> Statutory Registry: {employees.length} Personnel Units
          </p>
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-inner">
           {[
             { id: 'MASTER', label: 'Master File', icon: <Users size={12} /> },
             { id: 'RUN_PAYROLL', label: 'Process Cycle', icon: <Play size={12} /> },
             { id: 'DEDUCTIONS_ENGINE', label: 'Tax Engine', icon: <Calculator size={12} /> },
             { id: 'DIRECT_DEPOSIT', label: 'Direct Deposit', icon: <Landmark size={12} /> }
           ].map(btn => (
             <button 
               key={btn.id}
               onClick={() => setView(btn.id as any)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === btn.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
               {btn.icon} {btn.label}
             </button>
           ))}
        </div>
      </div>

      {view === 'MASTER' && (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          {employees.length === 0 && !isProvisioning ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-32 text-center luxury-shadow">
               <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 dark:text-slate-800 animate-float border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                  <UserPlus size={48} />
               </div>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Personnel Registry Empty</h3>
               <p className="text-slate-500 max-w-sm mx-auto font-medium mb-12">Initialize your institutional workforce by provisioning the first personnel node.</p>
               <button onClick={() => setIsProvisioning(true)} className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                 <UserPlus size={20} /> Provision First Node
               </button>
            </div>
          ) : isProvisioning ? (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-12 luxury-shadow animate-in zoom-in-95">
               <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8 text-center">Personnel Node Provisioning</h4>
               <div className="space-y-8">
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Full Name</label>
                     <input 
                       type="text" 
                       value={newName}
                       onChange={(e) => setNewName(e.target.value)}
                       placeholder="e.g. Jean-Luc Picard"
                       className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Institutional Unit (Manual Add)</label>
                     <input 
                       type="text" 
                       value={newUnit}
                       onChange={(e) => setNewUnit(e.target.value)}
                       placeholder="e.g. Finance Hub, Engineering Node 4"
                       className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                     />
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setIsProvisioning(false)} className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Abort</button>
                     <button onClick={handleAddEmployee} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 transition-all">Seal Node</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm">
                 <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search statutory personnel registry..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                 </div>
                 <button onClick={() => setIsProvisioning(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/30">+ Provision Node</button>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                       <tr>
                          <th className="px-8 py-5">Personnel Detail</th>
                          <th className="px-8 py-5">Institutional Unit</th>
                          <th className="px-8 py-5">Base Compensation</th>
                          <th className="px-8 py-5">Registry Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                       {filteredEmployees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                             <td className="px-8 py-6 flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                                   {emp.fullName.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{emp.fullName}</p>
                                   <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">{emp.jobTitle}</p>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black uppercase text-slate-500 border border-slate-200 dark:border-slate-700">{emp.department}</span>
                             </td>
                             <td className="px-8 py-6 font-mono font-black text-slate-900 dark:text-slate-200">
                                Br {emp.compensation.baseSalary?.toLocaleString()}/mo
                             </td>
                             <td className="px-8 py-6">
                                <span className="flex items-center gap-2 text-[9px] font-black text-green-600 uppercase">
                                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> {emp.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => { setCurrentEditingEmployee({ ...emp }); setIsEditingDetails(true); }}
                                     className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                   <button onClick={() => setEmployees(prev => prev.filter(x => x.id !== emp.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personnel Node Editor Modal */}
      {isEditingDetails && currentEditingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[48px] shadow-2xl luxury-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 text-white rounded-[24px] shadow-xl shadow-indigo-900/30">
                     <Edit3 size={28} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Personnel Node Editor</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spec: {currentEditingEmployee.id}</p>
                  </div>
               </div>
               <button onClick={() => setIsEditingDetails(false)} className="p-4 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-all active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700"><X size={24} /></button>
            </div>
            
            <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Full Name</label>
                     <input 
                       type="text" 
                       value={currentEditingEmployee.fullName}
                       onChange={(e) => setCurrentEditingEmployee({...currentEditingEmployee, fullName: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Functional Job Title</label>
                     <input 
                       type="text" 
                       value={currentEditingEmployee.jobTitle}
                       onChange={(e) => setCurrentEditingEmployee({...currentEditingEmployee, jobTitle: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Institutional Unit</label>
                     <input 
                       type="text" 
                       value={currentEditingEmployee.department}
                       onChange={(e) => setCurrentEditingEmployee({...currentEditingEmployee, department: e.target.value})}
                       className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Base Monthly Salary (Br)</label>
                     <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Br</span>
                        <input 
                           type="number" 
                           value={currentEditingEmployee.compensation.baseSalary}
                           onChange={(e) => setCurrentEditingEmployee({
                             ...currentEditingEmployee, 
                             compensation: { ...currentEditingEmployee.compensation, baseSalary: parseInt(e.target.value) || 0 }
                           })}
                           className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-5 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-white"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-50 dark:bg-black/40 border-t-2 border-slate-100 dark:border-slate-800 flex gap-6">
               <button onClick={() => setIsEditingDetails(false)} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Discard</button>
               <button onClick={handleUpdateEmployee} className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 shadow-indigo-900/40">
                  <Save size={20} /> Commit Mutation
               </button>
            </div>
          </div>
        </div>
      )}

      {view === 'RUN_PAYROLL' && (
        <div className="space-y-10 animate-in fade-in">
           {isRunComplete ? (
             <div className="bg-white dark:bg-slate-900 border-2 border-green-500/20 rounded-[48px] p-24 text-center luxury-shadow animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-900/30">
                   <Check size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-4">Period Cycle Sealed</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium mb-10">Payroll batch PR-{Date.now().toString().slice(-4)} has been calculated and sealed. The ledger has been updated.</p>
                <button onClick={() => setIsRunComplete(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Audit Last Run</button>
             </div>
           ) : isCalculating ? (
             <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-24 text-center luxury-shadow">
                <div className="relative w-32 h-32 mx-auto mb-10">
                   <RefreshCw size={80} className="text-indigo-600 animate-spin opacity-20 absolute inset-0 m-auto" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Calculator size={40} className="text-indigo-600" />
                   </div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Computing Statutory Cycle...</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Mapping {employees.length} personnel nodes against current tax engine v4.2 rules.</p>
             </div>
           ) : runSummary ? (
             <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden luxury-shadow animate-in slide-in-from-bottom-6">
                <div className="p-10 bg-slate-50 dark:bg-slate-950/50 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Cycle Summary: {runSummary.period}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Node Audit: {runSummary.headcount} Calculated</p>
                   </div>
                   <button onClick={() => setRunSummary(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={20} /></button>
                </div>
                <div className="p-12 grid grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <SummaryRow label="Gross Remuneration" value={runSummary.totalGross} color="text-slate-900 dark:text-white" />
                      <SummaryRow label="Net Institutional Payout" value={runSummary.totalNet} color="text-green-600" />
                   </div>
                   <div className="space-y-6">
                      <SummaryRow label="Statutory Tax Liability" value={runSummary.totalTax} color="text-red-600" />
                      <SummaryRow label="Total Pension Match" value={runSummary.totalPension} color="text-red-600" />
                   </div>
                </div>
                <div className="p-10 bg-slate-50 dark:bg-black/40 border-t-2 border-slate-100 dark:border-slate-800 flex gap-6">
                   <button onClick={() => setRunSummary(null)} className="flex-1 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 text-slate-500 rounded-[24px] font-black uppercase text-[10px] tracking-widest">Re-Calculate</button>
                   <button 
                    onClick={handleSealPayrollRun}
                    disabled={isSealingRun}
                    className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 shadow-indigo-900/40"
                   >
                      {isSealingRun ? <Loader2 size={20} className="animate-spin" /> : <FileSignature size={20} />}
                      Seal & Post Payroll Run
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-96 flex flex-col items-center justify-center space-y-6 text-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] luxury-shadow">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl text-slate-300 dark:text-slate-800 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                   <Play size={48} />
                </div>
                <div>
                   <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Process Cycle Ready</h4>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">{employees.length} personnel nodes detected. Institutional Close Sequence can be initialized.</p>
                </div>
                {employees.length > 0 ? (
                  <button onClick={handleRunPayrollCycle} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Initialize Cycle Run</button>
                ) : (
                  <button disabled className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Awaiting Registry Nodes</button>
                )}
             </div>
           )}
        </div>
      )}

      {view === 'DEDUCTIONS_ENGINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in zoom-in-95 duration-500">
           <aside className="lg:col-span-3 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Engine Heuristics</h3>
              {[
                { id: 'TAX_BRACKETS', label: 'Tax Architecture', icon: <Scale size={14} /> },
                { id: 'PENSION', label: 'Pension Models', icon: <Heart size={14} /> },
                { id: 'STATUTORY', label: 'Social Safety Nets', icon: <Shield size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveEngineTab(tab.id as any)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all group flex items-center gap-4 ${
                    activeEngineTab === tab.id 
                    ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-xl' 
                    : 'bg-slate-50/50 dark:bg-slate-950 border-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                   <div className={`${activeEngineTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>{tab.icon}</div>
                   <span className={`text-xs font-black uppercase tracking-widest ${activeEngineTab === tab.id ? 'text-indigo-900 dark:text-white' : ''}`}>{tab.label}</span>
                </button>
              ))}
           </aside>
           <div className="lg:col-span-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] p-12 luxury-shadow">
              {activeEngineTab === 'TAX_BRACKETS' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Regional Tax Architecture</h4>
                    <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 space-y-8">
                       <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Logic Node</p>
                             <p className="text-lg font-black text-slate-900 dark:text-white">Federal Income Tax Heuristic</p>
                          </div>
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-[8px] font-black uppercase border border-green-500/20">Active Matrix</span>
                       </div>
                       <div className="grid grid-cols-2 gap-10">
                          <div>
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block px-1">Flat Income Tax Rate (%)</label>
                             <div className="relative">
                                <input 
                                  type="number" 
                                  value={taxConfig.incomeTaxRate}
                                  onChange={(e) => setTaxConfig({...taxConfig, incomeTaxRate: parseFloat(e.target.value) || 0})}
                                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xl font-black text-indigo-600 focus:border-indigo-500 outline-none" 
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                             </div>
                          </div>
                          <div className="flex flex-col justify-center">
                             <p className="text-xs text-slate-500 font-medium italic leading-relaxed">"This rate is applied to the combined Gross Base + Allowances for every personnel node."</p>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
              {activeEngineTab === 'PENSION' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Pension Matching Models</h4>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block px-1">Employee Contribution (%)</label>
                          <input 
                             type="number" 
                             value={taxConfig.employeePensionPct}
                             onChange={(e) => setTaxConfig({...taxConfig, employeePensionPct: parseFloat(e.target.value) || 0})}
                             className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xl font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-sm" 
                          />
                       </div>
                       <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block px-1">Employer Match (%)</label>
                          <input 
                             type="number" 
                             value={taxConfig.employerPensionPct}
                             onChange={(e) => setTaxConfig({...taxConfig, employerPensionPct: parseFloat(e.target.value) || 0})}
                             className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xl font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-sm" 
                          />
                       </div>
                    </div>
                 </div>
              )}
              {activeEngineTab === 'STATUTORY' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Social Safety Net Policy</h4>
                    <div className="p-8 bg-slate-900 text-white rounded-[40px] relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700"><Shield size={120} /></div>
                       <div className="relative z-10 space-y-10">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><SmartphoneNfc size={24} className="text-indigo-400" /></div>
                                <h5 className="font-black uppercase tracking-tight text-lg">Mobile Health Contribution</h5>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Fixed Node Cost:</span>
                                <input 
                                  type="number" 
                                  value={taxConfig.healthInsuranceFlat}
                                  onChange={(e) => setTaxConfig({...taxConfig, healthInsuranceFlat: parseFloat(e.target.value) || 0})}
                                  className="w-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-black text-green-400 text-right focus:border-indigo-500 outline-none" 
                                />
                             </div>
                          </div>
                          <p className="text-sm font-medium italic opacity-70 border-l-4 border-indigo-500 pl-6 leading-relaxed">
                             "This fixed statutory deduction is extracted from all Personnel Nodes regardless of employment classification."
                          </p>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      )}

      {view === 'DIRECT_DEPOSIT' && (
        <div className="h-96 flex flex-col items-center justify-center space-y-10 text-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] luxury-shadow animate-in fade-in">
           <div className="w-28 h-28 bg-indigo-600/10 text-indigo-600 rounded-[32px] flex items-center justify-center border-2 border-indigo-500/20 shadow-inner group">
              <Landmark size={48} className="group-hover:rotate-12 transition-transform" />
           </div>
           <div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Bank Egress Node</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 font-medium">Ready to generate institutional disbursement files for linked bank nodes.</p>
           </div>
           <button 
            onClick={() => alert("Bank Handshake Generated: CBE_BATCH_PAY_091.HED Exported.")}
            className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.25em] text-[10px] shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3"
           >
              <Download size={20} /> Generate Institutional Disbursement
           </button>
        </div>
      )}
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4">
    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-2xl font-black font-mono tracking-tighter ${color}`}>Br {value.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
  </div>
);

export default SagePayrollCenter;
