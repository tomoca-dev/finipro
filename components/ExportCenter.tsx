
import React, { useState, useEffect } from 'react';
import { 
  Share2, FileText, Download, Clock, Shield, Zap, CheckCircle, 
  ChevronRight, Layout, Calendar, Copy, ExternalLink, Mail, Trash2, 
  ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';
import { generateExecutiveSummary } from '../services/geminiService';
import { ExportTemplate, Report, SecureShareLink, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

const TEMPLATES: ExportTemplate[] = [
  { id: '1', name: 'Standard Board Pack', type: 'PPTX', description: 'Monthly performance deck for the leadership board.' },
  { id: '2', name: 'Auditor Spreadsheet', type: 'XLSX', description: 'Raw canonical data with full audit trail for compliance.' },
  { id: '3', name: 'Executive One-Pager', type: 'PDF', description: 'AI-generated high-impact summary of current health.' },
  { id: '4', name: 'Strategic Deep-Dive', type: 'PPTX', description: 'Playbook-based analysis for initiative prioritization.' },
];

const ExportCenter: React.FC<{ records: any[] }> = ({ records }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [shareLinks, setShareLinks] = useState<SecureShareLink[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingData(true);
    const [reportsRes, linksRes] = await Promise.all([
      supabase.from('reports').select('*').order('created_at', { ascending: false }),
      supabase.from('share_links').select('*').order('created_at', { ascending: false })
    ]);
    
    if (reportsRes.data) setReports(reportsRes.data);
    if (linksRes.data) setShareLinks(linksRes.data);
    setIsLoadingData(false);
  };

  const generatePack = async () => {
    if (!activeTemplate) return;
    setIsGenerating(true);
    try {
      const template = TEMPLATES.find(t => t.id === activeTemplate);
      const result = await generateExecutiveSummary({ count: records.length, health: 78 });
      setSummary(result);
      
      const newReport: Partial<Report> = {
        name: template?.name || 'New Report',
        type: template?.type || 'PDF',
        owner_id: 'current-user',
        file_path: `/reports/${Date.now()}.${template?.type.toLowerCase()}`,
        metadata: { ai_summary: result.substring(0, 100) }
      };
      
      const { data } = await supabase.from('reports').insert([newReport]).select();
      if (data) setReports(prev => [data[0], ...prev]);
      
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const createSecureLink = async (reportId: string, role: UserRole = 'DEPT_HEAD') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const token = Math.random().toString(36).substr(2, 12);
    const newLink: Partial<SecureShareLink> = {
      report_id: reportId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      role_required: role,
      url: `https://finops.pro/secure/${token}`
    };

    const { data } = await supabase.from('share_links').insert([newLink]).select();
    if (data) setShareLinks(prev => [data[0], ...prev]);
  };

  const deleteReport = async (id: string) => {
    await supabase.from('reports').delete().eq('id', id);
    setReports(prev => prev.filter(r => r.id !== id));
    setShareLinks(prev => prev.filter(l => l.report_id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Layout size={14} className="text-blue-600" /> Export Schematics
          </h3>
          <div className="space-y-4">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`w-full text-left p-6 rounded-3xl border transition-all group luxury-shadow ${
                  activeTemplate === t.id ? 'bg-blue-600/5 border-blue-600 ring-1 ring-blue-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black tracking-widest border uppercase ${
                    t.type === 'PPTX' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                    t.type === 'PDF' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                    'bg-green-500/10 text-green-600 border-green-500/20'
                  }`}>
                    {t.type}
                  </span>
                  <ChevronRight size={16} className={`text-slate-300 group-hover:text-blue-600 transition-colors ${activeTemplate === t.id ? 'text-blue-600' : ''}`} />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-base mb-1 tracking-tight">{t.name}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{t.description}"</p>
              </button>
            ))}
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Clock size={14} /> Global Range Filter
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <Calendar size={14} className="text-blue-500" /> 2023-10-01
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <Calendar size={14} className="text-blue-500" /> 2023-11-20
              </div>
            </div>
            <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all border border-slate-200 dark:border-slate-700">Apply Temporal Range</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 relative overflow-hidden flex flex-col min-h-[500px] shadow-2xl luxury-shadow">
            <div className="absolute top-0 right-0 p-10 opacity-5 text-slate-900 dark:text-white pointer-events-none">
              <FileText size={160} />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Pack Generator</h3>
                <p className="text-slate-500 font-medium text-sm">Synthesize presentation-grade materials from canonical actuals.</p>
              </div>
              <button onClick={generatePack} disabled={isGenerating || !activeTemplate} className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-900/30">
                <Zap size={18} className={isGenerating ? 'animate-pulse' : ''} />
                {isGenerating ? 'Synthesizing...' : 'Generate Node'}
              </button>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-[32px] border border-slate-200 dark:border-slate-800 p-10 relative shadow-inner">
              {summary ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/10">
                      Institutional Summary Preview
                    </span>
                    <div className="flex gap-3">
                       <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"><Copy size={16} /></button>
                       <button className="p-2.5 bg-white dark:bg-slate-800 rounded-xl hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"><Download size={16} /></button>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none prose-sm whitespace-pre-line text-slate-700 dark:text-slate-300 leading-loose font-medium italic border-l-4 border-blue-500 pl-8">
                    "{summary}"
                  </div>
                  <div className="pt-10 flex gap-6">
                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-lg">
                      <FileText size={18} /> Download Local PDF
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-600/20 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                      <Layout size={18} /> Sync to Board Slides
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 text-slate-400 dark:text-slate-600">
                  <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[40px] flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-xl animate-float">
                    {isGenerating ? <Loader2 size={48} className="text-blue-500 animate-spin" /> : <Layout size={48} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 dark:text-slate-400 tracking-tight uppercase">Ready for Synthesis</h4>
                    <p className="text-slate-500 font-medium text-sm mt-2 max-w-xs mx-auto">Select an institutional template to generate a high-fidelity board pack using current canonical records.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-2xl luxury-shadow">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
                <ShieldCheck size={18} className="text-green-600" /> Active Registry Tokens
              </h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isLoadingData ? 'Syncing...' : `${reports.length} Sealed Packs`}
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingData ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-8 animate-pulse flex justify-between bg-white dark:bg-slate-900">
                    <div className="flex gap-6">
                       <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                       <div className="space-y-3">
                          <div className="w-40 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                          <div className="w-64 h-3 bg-slate-50 dark:bg-slate-800 rounded"></div>
                       </div>
                    </div>
                  </div>
                ))
              ) : reports.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-medium italic">No Board Packs discovered in local vault.</div>
              ) : (
                reports.map(report => {
                  const link = shareLinks.find(l => l.report_id === report.id);
                  return (
                    <div key={report.id} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl border shadow-sm ${
                          report.type === 'PDF' ? 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20' : 
                          report.type === 'PPTX' ? 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-500/20' : 
                          'bg-green-500/10 text-green-600 border-green-200 dark:border-green-500/20'
                        }`}>
                          <FileText size={28} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">{report.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold">{report.file_path}</p>
                          <p className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {link ? (
                          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                            <ShieldCheck size={14} className="text-green-600" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Authorized Link Active</span>
                            <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ExternalLink size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => createSecureLink(report.id)} className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:border-blue-500 transition-all rounded-xl shadow-sm">
                            + Initialize Auth Link
                          </button>
                        )}
                        <button onClick={() => deleteReport(report.id)} className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-300 hover:text-red-600 hover:border-red-500/20 transition-all rounded-xl opacity-0 group-hover:opacity-100 shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {reports.length > 0 && (
              <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                <div className="p-5 bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-3xl flex items-center gap-6">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><AlertCircle size={20} /></div>
                   <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-widest">
                     Authorized tokens expire automatically after 168 hours. Regional node access policies apply.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
