
import React, { useState } from 'react';
import { 
  Code2, Database, Terminal, FileCode, Play, 
  RefreshCw, CheckCircle2, ChevronRight, Book,
  Braces, ShieldCheck, Box, Zap, ExternalLink
} from 'lucide-react';
import { SchemaBlueprint } from '../types';

const CANONICAL_SCHEMA: SchemaBlueprint[] = [
  {
    collection: 'financial_actuals',
    fields: [
      { name: 'id', type: 'String (UUID)', description: 'Primary unique key for the record.', required: true },
      { name: 'date', type: 'Timestamp', description: 'Transaction execution date.', required: true },
      { name: 'amount', type: 'Float64', description: 'Normalized local currency value.', required: true },
      { name: 'currency', type: 'Enum(ISO)', description: 'ISO 4217 Currency Code.', required: true },
      { name: 'category', type: 'Enum(GL)', description: 'Canonical GL Category (OPEX, COGS, etc).', required: true },
      { name: 'source_id', type: 'String', description: 'External reference ID from connector.', required: true },
    ]
  },
  {
    collection: 'budget_envelopes',
    fields: [
      { name: 'dept_id', type: 'String', description: 'Reference to the organizational unit.', required: true },
      { name: 'period', type: 'String(YYYY-MM)', description: 'Target allocation month.', required: true },
      { name: 'limit', type: 'Float64', description: 'Hard spending cap for the period.', required: true },
    ]
  }
];

const DevConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BLUEPRINT' | 'SANDBOX' | 'LOGS'>('BLUEPRINT');
  const [isSimulating, setIsSimulating] = useState(false);
  const [testPayload, setTestPayload] = useState(JSON.stringify({
    timestamp: new Date().toISOString(),
    raw_amount: "1,240.50",
    vendor: "AWS_INFRA_US_EAST",
    metadata: { env: "prod", cluster: "gl-01" }
  }, null, 2));

  const runPluginTest = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
            <Code2 className="text-blue-600" /> Developer Node
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Govern the financial data lifecycle and extend core ingestion hooks.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
           {[
             { id: 'BLUEPRINT', label: 'DB Schema', icon: <Database size={14} /> },
             { id: 'SANDBOX', label: 'Plugin SDK', icon: <Terminal size={14} /> },
             { id: 'LOGS', label: 'Telemetry', icon: <FileCode size={14} /> },
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
               {t.icon} {t.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-600" /> SDK Governance
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Auth Method', val: 'OAuth2 / PKCE' },
                   { label: 'Rate Limit', val: '10,000 r/m' },
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">{item.label}</span>
                      <span className="text-slate-900 dark:text-slate-100 font-black font-mono text-[10px] uppercase">{item.val}</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Emulator</span>
                    <span className="text-green-600 font-black text-[10px] flex items-center gap-1.5 uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div> ACTIVE
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-8 group hover:border-blue-500/30 transition-all">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">Resource Index</h3>
              <div className="space-y-4">
                 {[
                   { label: 'API Reference', icon: <ExternalLink size={14} /> },
                   { label: 'Download CLI', icon: <Box size={14} /> },
                   { label: 'Canonical Types', icon: <Braces size={14} /> },
                 ].map(link => (
                   <button key={link.label} className="w-full text-left text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white flex justify-between items-center transition-colors">
                     {link.label} {link.icon}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'BLUEPRINT' && (
            <div className="space-y-8 animate-in slide-in-from-right-6 duration-700">
               {CANONICAL_SCHEMA.map(schema => (
                 <div key={schema.collection} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl luxury-shadow">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                       <h3 className="font-mono text-blue-600 dark:text-blue-400 text-sm font-black flex items-center gap-3">
                         <Database size={20} /> collection: {schema.collection}
                       </h3>
                       <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest">Export Blueprint</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-500 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-8 py-5">Attribute</th>
                            <th className="px-8 py-5">Type System</th>
                            <th className="px-8 py-5">Validation Constraints</th>
                            <th className="px-8 py-5 text-center">Req.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {schema.fields.map(field => (
                            <tr key={field.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="px-8 py-5 font-black text-slate-900 dark:text-slate-200 font-mono tracking-tight">{field.name}</td>
                              <td className="px-8 py-5 text-blue-600 dark:text-blue-400 font-mono font-bold uppercase text-[10px]">{field.type}</td>
                              <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium italic">"{field.description}"</td>
                              <td className="px-8 py-5 text-center">
                                {field.required ? (
                                  <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'SANDBOX' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full min-h-[650px] animate-in zoom-in-95 duration-500">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col overflow-hidden luxury-shadow">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <h3 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-3 tracking-[0.2em]">
                        <Braces size={16} /> JSON Ingestion Mock
                     </h3>
                     <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"><RefreshCw size={16} /></button>
                  </div>
                  <textarea 
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-blue-300 font-mono text-xs p-10 focus:ring-0 border-none resize-none leading-loose shadow-inner"
                    spellCheck={false}
                  />
                  <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                     <button onClick={runPluginTest} disabled={isSimulating} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 active:scale-95">
                        <Play size={16} fill="currentColor" /> {isSimulating ? 'Processing Canonical Mapping...' : 'Execute Transformation'}
                     </button>
                  </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col overflow-hidden shadow-inner relative luxury-shadow">
                  <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                     <h3 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-3 tracking-[0.2em]">
                        <Terminal size={16} /> SDK Terminal Output
                     </h3>
                     <span className="text-[9px] font-black text-green-600 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/10 uppercase tracking-tighter shadow-sm">SUCCESS (2ms)</span>
                  </div>
                  
                  {isSimulating ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-blue-600 dark:text-blue-500">
                       <RefreshCw className="animate-spin" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Running Institutional Filters...</p>
                    </div>
                  ) : (
                    <div className="flex-1 p-10 font-mono text-xs text-slate-700 dark:text-green-400 space-y-6 overflow-y-auto">
                       <p className="text-slate-400 dark:text-slate-600 italic">// Canonical Object mapping result:</p>
                       <pre className="leading-loose bg-white/50 dark:bg-transparent p-6 rounded-2xl border border-slate-200 dark:border-none shadow-sm dark:shadow-none">
{`{
  "id": "gen_canonical_88291",
  "normalized_at": "2023-11-20T14:00",
  "f_amount": 1240.50,
  "currency_iso": "USD",
  "gl_category": "OPEX",
  "gl_sub_category": "Cloud Infrastructure",
  "origin_hook": "SDK_TEST_ENV",
  "security_seal": "SHA256_ACTIVE"
}`}
                       </pre>
                    </div>
                  )}
                  
                  <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex justify-between items-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version: v2.4.1 Production</p>
                     <button className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline tracking-tighter">Deploy Plugin Node</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-16 h-full flex flex-col items-center justify-center text-center space-y-8 luxury-shadow animate-in slide-in-from-bottom-8 duration-700">
               <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[40px] flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-inner">
                  <FileCode size={48} />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-300 uppercase tracking-tighter">No Active Telemetry</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 font-medium">Historical pipeline logs for Stripe and NetSuite nodes are archived in the Central Governance Center.</p>
               </div>
               <button className="px-8 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Archive Center Access</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevConsole;
