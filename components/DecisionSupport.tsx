
import React, { useState, useEffect } from 'react';
import { 
  Gavel, TrendingUp, TrendingDown, RefreshCcw, BookOpen, 
  ChevronRight, Calculator, PieChart, ShieldAlert, Target, Zap, User, Loader2, Sparkles
} from 'lucide-react';
import { StrategicRecommendation, PlaybookStep, ActionType } from '../types';
import { generateStrategicRecommendations, generateDecisionPlaybook, simulateIncentives } from '../services/geminiService';

const DecisionSupport: React.FC<{ records: any[] }> = ({ records }) => {
  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<StrategicRecommendation | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaybookLoading, setIsPlaybookLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'CEO' | 'DEPT' | 'MGMT'>('CEO');

  const [incentiveParams, setIncentiveParams] = useState({ bonusPool: 500000, target: 120 });
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const fetchRecommendations = async () => {
    if (records.length === 0) return;
    setIsGenerating(true);
    try {
      const data = await generateStrategicRecommendations({ records: records.slice(0, 20) });
      setRecommendations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchPlaybook = async (rec: StrategicRecommendation) => {
    setIsPlaybookLoading(true);
    setSelectedRec(rec);
    try {
      const data = await generateDecisionPlaybook(rec);
      setPlaybook(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlaybookLoading(false);
    }
  };

  const handleSimulate = async () => {
    const result = await simulateIncentives(incentiveParams);
    setSimulationResult(result);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [records]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'KILL': return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
      case 'SCALE': return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
      case 'FIX': return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <Gavel className="text-blue-600" /> Decision Control Room
          </h2>
          <p className="text-slate-500 text-sm font-medium">Neural strategy engine and implementation playbooks.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={isGenerating || records.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-30"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
          Refresh Engine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
              <User size={16} className="text-blue-500" /> Scorecards
            </h3>
            <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              {['CEO', 'MGMT', 'DEPT'].map(role => (
                <button 
                  key={role}
                  onClick={() => setActiveRole(role as any)}
                  className={`px-2.5 py-1 text-[9px] font-black rounded uppercase transition-all ${activeRole === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="p-8 space-y-6">
             <ScorecardItem label="Enterprise EBITDA" value={records.length > 0 ? "24.8%" : "--"} status="UP" />
             <ScorecardItem label="Cash Runway" value={records.length > 0 ? "18.2 Mo" : "--"} status="HOLD" />
             <ScorecardItem label="Utilization" value={records.length > 0 ? "92%" : "--"} status="DOWN" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:col-span-2 space-y-8 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
              <Calculator size={24} className="text-purple-600 dark:text-purple-400" />
              Incentive Simulation Node
            </h3>
            <button 
              onClick={handleSimulate}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
            >
              Run Logic
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Cap (USD)</label>
                <input 
                  type="range" min="100000" max="2000000" step="50000"
                  value={incentiveParams.bonusPool}
                  onChange={(e) => setIncentiveParams({...incentiveParams, bonusPool: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter">${incentiveParams.bonusPool.toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Target (%)</label>
                <input 
                  type="range" min="80" max="150" step="1"
                  value={incentiveParams.target}
                  onChange={(e) => setIncentiveParams({...incentiveParams, target: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tighter">{incentiveParams.target}%</div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-inner">
              {simulationResult ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Payout</span>
                    <span className="text-3xl font-black text-purple-600">${simulationResult.projectedPayout.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Profit Lift</span>
                    <span className="text-2xl font-bold text-green-600">+${simulationResult.netProfitImpact.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"><Zap size={32} /></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Simulation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-500" /> Active Recommendations
          </h3>
          
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] opacity-40">
                 <Target className="mx-auto mb-4" size={48} />
                 <p className="text-[10px] font-black uppercase tracking-widest">Registry Empty: Ingest artifacts to trigger strategy engine</p>
              </div>
            ) : isGenerating ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse" />
              ))
            ) : recommendations.map(rec => (
              <button 
                key={rec.id}
                onClick={() => fetchPlaybook(rec)}
                className={`w-full text-left p-8 rounded-3xl border transition-all flex items-start gap-6 group luxury-shadow ${
                  selectedRec?.id === rec.id ? 'bg-blue-600/5 border-blue-500 ring-2 ring-blue-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className={`mt-1 p-3 rounded-2xl border shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform ${getActionColor(rec.action)}`}>
                  {rec.action === 'SCALE' && <TrendingUp size={24} />}
                  {rec.action === 'KILL' && <TrendingDown size={24} />}
                  {rec.action === 'FIX' && <ShieldAlert size={24} />}
                  {rec.action === 'HOLD' && <RefreshCcw size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight mb-2">{rec.initiative}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-4">"{rec.rationale}"</p>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-blue-600 flex items-center gap-2">
                      <Target size={14} /> {rec.projectedImpact}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-700 mt-3 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col min-h-[500px] shadow-2xl luxury-shadow">
          <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
              <BookOpen size={24} className="text-blue-600" />
              Tactical Playbook
            </h3>
            {selectedRec && <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getActionColor(selectedRec.action)}`}>{selectedRec.action}</span>}
          </div>
          
          <div className="flex-1 p-10">
            {isPlaybookLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
                <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Drafting Workflow...</p>
              </div>
            ) : playbook.length > 0 ? (
              <div className="space-y-10">
                <div className="space-y-10 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                  {playbook.map((step) => (
                    <div key={step.step} className="flex gap-8 relative group">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-black text-blue-600 z-10 shrink-0 mt-0.5 shadow-sm group-hover:border-blue-500 transition-colors">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight uppercase">{step.action}</h5>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner: {step.owner} • {step.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3">
                  <Sparkles size={18} /> Seal Board Memorandum
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 text-slate-400 dark:text-slate-600">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[40px] flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner animate-float">
                  <BookOpen size={48} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-400 tracking-tighter">Strategic Sink</h4>
                  <p className="max-w-xs mx-auto text-sm mt-2 font-medium leading-relaxed text-slate-500">Select a suggestion to generate a detailed implementation trace.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScorecardItem: React.FC<{ label: string; value: string; status: 'UP' | 'DOWN' | 'HOLD' }> = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 transition-all shadow-sm">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter font-mono">{value}</p>
    </div>
    <div className={`p-2.5 rounded-xl shadow-sm ${
      status === 'UP' ? 'text-green-600 bg-green-500/10' : 
      status === 'DOWN' ? 'text-red-600 bg-red-500/10' : 
      'text-slate-500 bg-slate-100 dark:bg-slate-800'
    }`}>
      {status === 'UP' && <TrendingUp size={20} />}
      {status === 'DOWN' && <TrendingDown size={20} />}
      {status === 'HOLD' && <RefreshCcw size={20} />}
    </div>
  </div>
);

export default DecisionSupport;
