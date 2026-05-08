import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Building2, CheckCircle2, Cloud, Cpu, DatabaseZap, FileSpreadsheet, Landmark, Package, PlugZap, RefreshCw, Send, ShieldCheck, Sparkles, Truck, Users, Wrench } from 'lucide-react';
import {
  ApiAccepterEvent,
  ENTERPRISE_SYSTEMS,
  EnterpriseSystemKey,
  EnterpriseSystemRecord,
  listApiAccepterEvents,
  listEnterpriseSystemEvents,
  simulateAcceptedApiEvent,
  updateEnterpriseSystemEvent,
  upsertEnterpriseSystemEvent,
} from '../services/enterpriseSystemsService';

const iconMap: Record<string, React.ReactNode> = {
  advanced_banking: <Landmark size={20} />,
  advanced_inventory: <Package size={20} />,
  sales_orders: <Truck size={20} />,
  purchasing_procurement: <Building2 size={20} />,
  enterprise_payroll: <Users size={20} />,
  project_job_costing: <FileSpreadsheet size={20} />,
  advanced_reporting: <DatabaseZap size={20} />,
  enterprise_forecasting: <Activity size={20} />,
  production_integrations: <PlugZap size={20} />,
  cloud_infrastructure: <Cloud size={20} />,
  real_ai_engine: <Sparkles size={20} />,
  utilities_maintenance: <Wrench size={20} />,
};

const statusClasses: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  PLANNED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  FAILED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

interface EnterpriseExpansionCenterProps {
  embedded?: boolean;
}

const EnterpriseExpansionCenter: React.FC<EnterpriseExpansionCenterProps> = ({ embedded = false }) => {
  const [records, setRecords] = useState<EnterpriseSystemRecord[]>([]);
  const [apiEvents, setApiEvents] = useState<ApiAccepterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState('external-pos');
  const [apiEventType, setApiEventType] = useState('sale.created');
  const [apiPayload, setApiPayload] = useState('{"receipt":"R-1001","amount":1250,"currency":"ETB"}');

  const latestBySystem = useMemo(() => {
    const map = new Map<string, EnterpriseSystemRecord>();
    records.forEach((record) => {
      if (!map.has(record.system_key)) map.set(record.system_key, record);
    });
    return map;
  }, [records]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ records: systemRecords }, { events }] = await Promise.all([
        listEnterpriseSystemEvents(),
        listApiAccepterEvents(),
      ]);
      setRecords(systemRecords);
      setApiEvents(events);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to load Enterprise Expansion Center. Run the enterprise expansion SQL first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleActivate = async (key: EnterpriseSystemKey) => {
    setSavingKey(key);
    setError(null);
    try {
      await upsertEnterpriseSystemEvent({
        systemKey: key,
        status: 'ACTIVE',
        payload: { activatedAt: new Date().toISOString() },
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to activate system.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleStatus = async (record: EnterpriseSystemRecord, status: EnterpriseSystemRecord['status']) => {
    setSavingKey(record.system_key);
    setError(null);
    try {
      await updateEnterpriseSystemEvent(record.id, { status });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to update system status.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleApiSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      let parsedPayload: Record<string, any> = {};
      try {
        parsedPayload = JSON.parse(apiPayload);
      } catch {
        throw new Error('API payload must be valid JSON.');
      }
      await simulateAcceptedApiEvent({
        sourceSystem: apiSource,
        eventType: apiEventType,
        payload: parsedPayload,
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Unable to simulate accepted API event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? 'p-8' : 'space-y-8'}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <DatabaseZap size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Enterprise Expansion Center</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">12 ERP systems + API accepter for external platforms</p>
            </div>
          </div>
          <p className="max-w-4xl text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            This layer adds advanced banking, inventory, sales orders, purchasing, payroll, job costing, reporting, forecasting,
            production integrations, cloud infrastructure, AI operations, and enterprise utilities on top of Modern + Sage mode.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-60">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ENTERPRISE_SYSTEMS.map((system) => {
          const record = latestBySystem.get(system.key);
          const status = record?.status || 'PLANNED';
          return (
            <div key={system.key} className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-blue-600 dark:text-blue-300">
                    {iconMap[system.key] || <Cpu size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{system.name}</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{system.mode} mode</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusClasses[status] || statusClasses.PLANNED}`}>{status}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium min-h-[64px]">{record?.summary || system.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {system.tables.slice(0, 3).map((table) => (
                  <span key={table} className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 uppercase tracking-widest">{table}</span>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                {!record ? (
                  <button onClick={() => handleActivate(system.key)} disabled={savingKey === system.key} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
                    {savingKey === system.key ? 'Saving...' : 'Activate'}
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleStatus(record, 'IN_PROGRESS')} className="flex-1 px-3 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">Edit</button>
                    <button onClick={() => handleStatus(record, 'ACTIVE')} className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Complete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white"><PlugZap size={20} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">API Accepter</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accept events from other systems</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source system</span>
                <input value={apiSource} onChange={(e) => setApiSource(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-bold" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Event type</span>
                <input value={apiEventType} onChange={(e) => setApiEventType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-sm font-bold" />
              </label>
            </div>
            <label className="space-y-2 block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">JSON payload</span>
              <textarea value={apiPayload} onChange={(e) => setApiPayload(e.target.value)} rows={5} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs font-mono" />
            </label>
            <button onClick={handleApiSimulate} disabled={loading} className="w-full px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
              <Send size={15} /> Simulate Accepted Event
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white"><ShieldCheck size={20} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Accepted API Events</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest external-system intake records</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar">
            {apiEvents.length === 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs text-slate-500 font-bold">No accepted API events yet.</div>
            )}
            {apiEvents.map((event) => (
              <div key={event.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{event.event_type}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> {event.status}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{event.source_system} · {new Date(event.created_at).toLocaleString()}</p>
                <pre className="text-[10px] bg-white dark:bg-black/30 rounded-xl p-3 overflow-x-auto text-slate-600 dark:text-slate-300">{JSON.stringify(event.payload, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseExpansionCenter;
