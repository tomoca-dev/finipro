import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BookCheck, Database, Lock, Play, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { User, ShopNode } from '../../types';
import { CoreJournalLine, ensureCoreEngineBootstrapped, executeSandboxIntegration, getCoreAccounts, getCoreEngineHealth, getCoreJournals, getCoreAuditLogs, getIntegrationExecutions, getZReportLocks, lockZReport, postBalancedJournal } from '../../services/sageCoreEngine';

interface SageCoreEngineProps {
  user: User;
  shops: ShopNode[];
}

const emptyLine = (): CoreJournalLine => ({ account_code: '1000-00', description: '', debit: 0, credit: 0 });

const SageCoreEngine: React.FC<SageCoreEngineProps> = ({ user, shops }) => {
  const [memo, setMemo] = useState('Daily store close');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shopNode, setShopNode] = useState<string>(shops[0]?.id || '');
  const [lines, setLines] = useState<CoreJournalLine[]>([
    { account_code: '1000-00', description: 'Cash received', debit: 1000, credit: 0 },
    { account_code: '4000-01', description: 'Sales revenue', debit: 0, credit: 1000 },
  ]);
  const [zReportId, setZReportId] = useState(`Z-${new Date().toISOString().slice(0, 10)}`);
  const [zTotals, setZTotals] = useState({ grossSales: 3250, tax: 487, cash: 1000, card: 2100, mobile: 150, overShort: -20 });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    ensureCoreEngineBootstrapped();
    if (!shopNode && shops[0]?.id) setShopNode(shops[0].id);
  }, [shops, shopNode]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const accounts = useMemo(() => getCoreAccounts(), [refreshKey]);
  const health = useMemo(() => getCoreEngineHealth(), [refreshKey]);
  const journals = useMemo(() => getCoreJournals().slice(0, 5), [refreshKey]);
  const auditLogs = useMemo(() => getCoreAuditLogs().slice(0, 6), [refreshKey]);
  const zLocks = useMemo(() => getZReportLocks().slice(0, 5), [refreshKey]);
  const executions = useMemo(() => getIntegrationExecutions().slice(0, 5), [refreshKey]);

  const totalDebit = Number(lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0).toFixed(2));
  const totalCredit = Number(lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0).toFixed(2));
  const imbalance = Number((totalDebit - totalCredit).toFixed(2));

  const handleLineChange = (index: number, field: keyof CoreJournalLine, value: string) => {
    setLines((prev) => prev.map((line, i) => i !== index ? line : {
      ...line,
      [field]: field === 'debit' || field === 'credit' ? Number(value) || 0 : value,
    }));
  };

  const runAction = async (label: string, fn: () => Promise<void> | void) => {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      await fn();
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Financial Core Engine</h2>
          <p className="text-sm text-slate-500 font-medium">Balanced ledger, append-only audit, local persistence, and sandbox execution for the Sage 50 side.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {(error || notice) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${error ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300' : 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300'}`}>
          {error || notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Balanced Journals', value: `${health.journalCount}`, sub: health.balanced ? 'All journals balanced' : 'Imbalance detected', icon: <BookCheck size={18} />, tone: 'text-indigo-600' },
          { label: 'Append-Only Events', value: `${health.auditEventCount}`, sub: 'Audit trail persisted', icon: <ShieldCheck size={18} />, tone: 'text-green-600' },
          { label: 'Locked Z Reports', value: `${health.lockedZCount}`, sub: health.lastLock ? `Last lock ${new Date(health.lastLock).toLocaleString()}` : 'No sealed closes yet', icon: <Lock size={18} />, tone: 'text-amber-600' },
          { label: 'Sandbox Executions', value: `${health.executionCount}`, sub: `${health.webhooks.successRate}% webhook success`, icon: <Activity size={18} />, tone: 'text-cyan-600' },
        ].map((card) => (
          <div key={card.label} className="rounded-[28px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className={`mb-3 ${card.tone}`}>{card.icon}</div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400">{card.label}</p>
            <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mt-2">{card.value}</p>
            <p className="text-xs text-slate-500 mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-7 space-y-8">
          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Ledger Engine</p>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Post a balanced journal</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${imbalance === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                {imbalance === 0 ? 'Balanced' : `Out by ${imbalance.toFixed(2)}`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <input value={memo} onChange={(e) => setMemo(e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Journal memo" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" />
              <select value={shopNode} onChange={(e) => setShopNode(e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
                <option value="">No shop</option>
                {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <select value={line.account_code} onChange={(e) => handleLineChange(index, 'account_code', e.target.value)} className="md:col-span-3 px-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm">
                    {accounts.map((account) => <option key={account.code} value={account.code}>{account.code} · {account.name}</option>)}
                  </select>
                  <input value={line.description} onChange={(e) => handleLineChange(index, 'description', e.target.value)} className="md:col-span-5 px-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Line description" />
                  <input type="number" value={line.debit} onChange={(e) => handleLineChange(index, 'debit', e.target.value)} className="md:col-span-2 px-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Debit" />
                  <input type="number" value={line.credit} onChange={(e) => handleLineChange(index, 'credit', e.target.value)} className="md:col-span-2 px-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Credit" />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={() => setLines((prev) => [...prev, emptyLine()])} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-widest">Add line</button>
              <button
                onClick={() => runAction('post-journal', () => {
                  const journal = postBalancedJournal({ actor: user, memo, date, source: 'MANUAL', shopNode, lines });
                  setNotice(`Journal ${journal.batch_id} posted successfully.`);
                })}
                disabled={busy !== null}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                {busy === 'post-journal' ? 'Posting…' : 'Post journal'}
              </button>
            </div>
          </section>

          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Z Report Locking</p>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Seal end-of-day closes</h3>
              </div>
              <Lock size={18} className="text-amber-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input value={zReportId} onChange={(e) => setZReportId(e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Z report id" />
              <input type="number" value={zTotals.grossSales} onChange={(e) => setZTotals({ ...zTotals, grossSales: Number(e.target.value) || 0 })} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Gross sales" />
              <input type="number" value={zTotals.tax} onChange={(e) => setZTotals({ ...zTotals, tax: Number(e.target.value) || 0 })} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder="Tax" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {(['cash','card','mobile','overShort'] as const).map((field) => (
                <input key={field} type="number" value={zTotals[field]} onChange={(e) => setZTotals({ ...zTotals, [field]: Number(e.target.value) || 0 })} className="px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm" placeholder={field} />
              ))}
            </div>
            <button
              onClick={() => runAction('lock-z', () => {
                const lock = lockZReport({ reportId: zReportId, actor: user, shopNode, totals: zTotals });
                setNotice(`Z report sealed with hash ${lock.immutable_hash}.`);
              })}
              disabled={busy !== null}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              {busy === 'lock-z' ? 'Locking…' : 'Lock Z report'}
            </button>
          </section>

          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Sandbox Integration Execution</p>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Run real workflow simulations</h3>
              </div>
              <Database size={18} className="text-cyan-600" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => runAction('settlement', async () => {
                const result = await executeSandboxIntegration({ type: 'PAYMENT_SETTLEMENT', actor: user, payload: { gateway: 'Sandbox Acquirer', amount: health.payment.approvedAmount } });
                setNotice(result.detail);
              })} disabled={busy !== null} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"><Wallet size={14} /> Settle payments</button>
              <button onClick={() => runAction('export', async () => {
                const latest = health.peachtree[0];
                const result = await executeSandboxIntegration({ type: 'PEACHTREE_EXPORT', actor: user, payload: { batchId: latest?.id || 'PT-SBX', sales: latest?.grossSales || 3250, tax: latest?.tax || 487, cash: 1000, card: 2100, mobile: 150, overShort: latest?.overShort || 0, shopNode, date } });
                setNotice(result.detail);
              })} disabled={busy !== null} className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"><Play size={14} /> Export to Peachtree</button>
              <button onClick={() => runAction('replay', async () => {
                const result = await executeSandboxIntegration({ type: 'WEBHOOK_REPLAY', actor: user, payload: { eventCount: health.webhooks.delivered + health.webhooks.queued + health.webhooks.failed } });
                setNotice(result.detail);
              })} disabled={busy !== null} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"><RefreshCw size={14} /> Replay webhooks</button>
            </div>
          </section>
        </div>

        <div className="xl:col-span-5 space-y-8">
          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">Latest journals</h3>
            <div className="space-y-3">
              {journals.length === 0 ? <p className="text-sm text-slate-500">No journals posted yet.</p> : journals.map((journal) => (
                <div key={journal.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{journal.source}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{journal.memo}</p>
                    </div>
                    <p className="text-xs font-mono text-slate-500">{journal.batch_id}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{journal.date} · Debit {journal.total_debit.toLocaleString()} · Credit {journal.total_credit.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">Recent audit events</h3>
            <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
              {auditLogs.length === 0 ? <p className="text-sm text-slate-500">No audit events yet.</p> : auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-green-600">{log.action}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.target_table} · {log.target_id}</p>
                  <p className="text-xs text-slate-500 mt-2">Actor {log.actor_id} · {new Date(log.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-4">Persistence checks</h3>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Z report locks</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{zLocks.length} sealed close(s)</p>
                </div>
                <Lock size={16} className="text-amber-600" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Executions stored</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{executions.length} recent sandbox run(s)</p>
                </div>
                <Database size={16} className="text-cyan-600" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Accounts available</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{accounts.length} chart-of-accounts records ready for validation</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SageCoreEngine;
