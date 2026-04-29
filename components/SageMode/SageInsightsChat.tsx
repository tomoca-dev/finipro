
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Sparkles, Terminal, Cpu, 
  History, ShieldCheck, Zap, Info, Loader2, Bot, User as UserIcon,
  ChevronDown, Search, ArrowRight, ExternalLink, Activity,
  Database, Fingerprint, Network, Table, Box
} from 'lucide-react';
import { querySageLedgerAI } from '../../services/geminiService';
import { ChatMessage, LedgerEntry } from '../../types';
import { supabase, isSupabaseConfigured, localDb } from '../../services/supabaseClient';

const SageInsightsChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Institutional Forensic Engine initialized. I have indexed the latest Sage 50 ledger state. Ask me to explain variances, detect anomalies, or audit specific accounts.', timestamp: new Date().toISOString() }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    "Decomposing statutory ledger hierarchy...",
    "Indexing historical variance patterns...",
    "Cross-referencing legal entity eliminations...",
    "Finalizing neural diagnostic..."
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    let interval: any;
    if (isThinking) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % steps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsThinking(true);

    try {
      // 1. Fetch real ledger context
      let ledgerData: LedgerEntry[] = [];
      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('sage_ledger_entries').select('*');
        ledgerData = data || [];
      } else {
        ledgerData = localDb.get('sage_ledger_entries');
      }

      // 2. Build summary for AI
      const totalRev = ledgerData.filter(e => e.account_code.startsWith('4')).reduce((s, e) => s + (e.credit - e.debit), 0);
      const totalCogs = ledgerData.filter(e => e.account_code.startsWith('5')).reduce((s, e) => s + (e.debit - e.credit), 0);
      const topEntries = ledgerData.slice(0, 10).map(e => `${e.date}: ${e.description} (${e.debit || e.credit})`).join('; ');
      
      const ledgerSummary = `Live Ledger Context: Total Revenue Br ${totalRev.toLocaleString()}, Total COGS Br ${totalCogs.toLocaleString()}. Entry Count: ${ledgerData.length}. Latest Entries: ${topEntries}`;
      
      // 3. Query Gemini
      const response = await querySageLedgerAI(query, ledgerSummary);
      
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response || 'Forensic engine could not compute a diagnostic for this node. Please re-spec query.', 
        timestamp: new Date().toISOString() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = { role: 'model', text: 'CONNECTION FAULT: Neural link to Sage 50 cold storage was interrupted. Verify regional residency node.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#080b14] animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 p-8 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-900/30">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
              Forensic Auditor <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[10px] not-italic shadow-sm tracking-widest font-black uppercase">Live Context</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={10} className="text-amber-500" /> Connected to Institutional Ledger (SHA-256)
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-indigo-600" /> Session: ACTIVE_FORENSICS
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 p-8 space-y-10 hidden xl:block overflow-y-auto custom-scrollbar">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Analytic Presets</h3>
              <div className="space-y-3">
                {[
                  "Explain the latest Revenue entries.",
                  "Are there any duplicate receipts in the ledger?",
                  "Analyze COGS variance vs last month.",
                  "Identify the highest value expense nodes."
                ].map(prompt => (
                  <button 
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:text-indigo-600 transition-all text-[11px] font-medium leading-relaxed group shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Indexing</h3>
              <div className="space-y-4">
                 <SourceItem icon={<Table size={12} />} label="Live Ledger Store" status="CONNECTED" />
                 <SourceItem icon={<Database size={12} />} label="Shop Node History" status="SYNCED" />
                 <SourceItem icon={<Fingerprint size={12} />} label="Audit SHA Registry" status="VERIFIED" />
              </div>
           </div>

           <div className="p-6 bg-slate-900 text-indigo-100 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Network size={80} /></div>
              <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-widest">Inference Core</h4>
              <p className="text-sm font-black mb-1">Gemini 3 Pro</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest italic">Reasoning: Enabled</p>
           </div>
        </aside>

        <div className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-black/20">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110 ${
                  m.role === 'model' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                }`}>
                  {m.role === 'model' ? <Bot size={28} /> : <UserIcon size={28} />}
                </div>
                <div className={`flex-1 p-10 rounded-[40px] luxury-shadow border relative overflow-hidden ${
                  m.role === 'model' 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                  : 'bg-slate-900 text-white border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">
                      {m.role === 'model' ? 'Forensic Insight' : 'Personnel Unit'}
                    </span>
                    <span className="text-[9px] font-mono opacity-20">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className={`text-lg leading-loose font-medium ${m.role === 'model' ? 'text-slate-700 dark:text-slate-200' : 'text-slate-100'}`}>
                    {m.text}
                  </div>
                  {m.role === 'model' && (
                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex gap-6">
                       <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase hover:underline group">
                          <Search size={14} className="group-hover:scale-110 transition-transform" /> Detailed Audit
                       </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex gap-8 max-w-5xl mx-auto animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Bot size={28} className="text-indigo-500 animate-bounce" />
                </div>
                <div className="flex-1 p-10 rounded-[40px] bg-white/40 dark:bg-slate-900/40 border border-dashed border-indigo-500/30 flex flex-col gap-6">
                   <div className="flex items-center gap-3">
                      <Loader2 size={16} className="animate-spin text-indigo-500" />
                      <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{steps[thinkingStep]}</span>
                   </div>
                   <div className="space-y-3">
                      <div className="h-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full w-full"></div>
                      <div className="h-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full w-5/6"></div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-gradient-to-t from-slate-50 dark:from-[#080b14] to-transparent z-10">
            <div className="max-w-5xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[32px] opacity-10 group-focus-within:opacity-40 blur-lg transition duration-700"></div>
              <div className="relative flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] p-2.5 pr-6 luxury-shadow">
                <div className="p-5 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                   <Terminal size={28} />
                </div>
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for a forensic explanation of the current ledger..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium text-xl placeholder:text-slate-400 dark:placeholder:text-slate-700 py-6"
                />
                <button 
                  onClick={handleSend}
                  disabled={!query.trim() || isThinking}
                  className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/40 transition-all active:scale-95"
                >
                   {isThinking ? <Loader2 size={28} className="animate-spin" /> : <ArrowRight size={28} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SourceItem: React.FC<{ icon: React.ReactNode, label: string, status: string }> = ({ icon, label, status }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm group hover:border-indigo-500/30 transition-all">
     <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">{icon}</div>
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{label}</span>
     </div>
     <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"></div>
        <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">{status}</span>
     </div>
  </div>
);

export default SageInsightsChat;
