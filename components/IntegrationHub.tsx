import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  BadgeCheck,
  Cable,
  DatabaseZap,
  Landmark,
  Network,
  PlugZap,
  Radar,
  ReceiptText,
  Router,
  ShieldEllipsis,
  Siren,
  Store,
  Webhook,
  Wifi,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../services/dataEngine';
import { getIntegrationConnectors, getIntegrationDevices, getIntegrationEvents, IntegrationConnector, IntegrationDevice, IntegrationEvent } from '../services/integrations/integrationGateway';
import { getMerakiStyleHealth } from '../services/integrations/merakiAdapter';
import { getPaymentAcceptanceSummary, PaymentAcceptanceSummary } from '../services/integrations/paymentAdapter';
import { getPeachtreeDevBatches, PeachtreeExportBatch } from '../services/integrations/peachtreeAdapter';
import { getWebhookCatalog, getWebhookStats } from '../services/integrations/webhookService';
import BrandLogo from './BrandLogo';

interface IntegrationHubProps {
  currency: CurrencyCode;
}

type HubView = 'overview' | 'devices' | 'events' | 'peachtree';

const formatMoney = (value: number, currency: CurrencyCode) => `${CURRENCY_SYMBOLS[currency]}${value.toLocaleString()}`;

const statusClasses: Record<string, string> = {
  ONLINE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CONNECTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SIMULATED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SYNCING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEGRADED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OFFLINE: 'bg-red-500/10 text-red-400 border-red-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  QUEUED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  READY: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  POSTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  NEEDS_AUTH: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
  WARN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INFO: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const Card: React.FC<{ title: string; value: string; hint: string; icon: React.ReactNode }> = ({ title, value, hint, icon }) => (
  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/10">
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200">{icon}</div>
    </div>
    <div className="text-2xl font-black tracking-tight text-white">{value}</div>
    <p className="mt-1 text-xs text-slate-400">{hint}</p>
  </div>
);

const IntegrationHub: React.FC<IntegrationHubProps> = ({ currency }) => {
  const [view, setView] = useState<HubView>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [devices, setDevices] = useState<IntegrationDevice[]>([]);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [health, setHealth] = useState<any>({ fleetHealth: 0, online: 0, degraded: 0, offline: 0 });
  const [payment, setPayment] = useState<PaymentAcceptanceSummary | null>(null);
  const [peachtreeBatches, setPeachtreeBatches] = useState<PeachtreeExportBatch[]>([]);
  const [webhookStats, setWebhookStats] = useState<any>({ successRate: 0, delivered: 0, failed: 0 });
  
  const webhookCatalog = useMemo(() => getWebhookCatalog(), []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [connData, devData, evtData, healthData, payData, peachData, statsData] = await Promise.all([
          getIntegrationConnectors(),
          getIntegrationDevices(),
          getIntegrationEvents(),
          getMerakiStyleHealth(),
          getPaymentAcceptanceSummary(),
          getPeachtreeDevBatches(),
          getWebhookStats()
        ]);

        setConnectors(connData);
        setDevices(devData);
        setEvents(evtData);
        setHealth(healthData);
        setPayment(payData);
        setPeachtreeBatches(peachData);
        setWebhookStats(statsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-4">
              <BrandLogo compact className="opacity-90" />
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">Enterprise integration hub</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Meraki-style ops visibility for POS, devices, payments, and Peachtree export.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              This layer provides centralized monitoring for store devices, event webhooks, payment acceptance, and the Peachtree bridge. Monitor fleet health and integration flows in real-time.
            </p>
          </div>
          <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-black uppercase tracking-[0.2em] text-slate-400">Modern mode</div>
              <div className="mt-2">See devices, queues, exceptions, and connector health.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-black uppercase tracking-[0.2em] text-slate-400">Sage mode</div>
              <div className="mt-2">Post journals, reconcile batches, and finalize accounting.</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-black uppercase tracking-[0.2em] text-slate-400">Current state</div>
              <div className="mt-2">Production persistence active with live database hooks.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card title="Fleet health" value={`${health.fleetHealth}%`} hint={`${health.online} online • ${health.degraded} degraded • ${health.offline} offline`} icon={<Radar size={18} />} />
        <Card title="Connectors" value={`${connectors.length}`} hint="POS, payments, Peachtree, webhooks" icon={<PlugZap size={18} />} />
        <Card title="Approved volume" value={formatMoney(payment?.approvedAmount || 0, currency)} hint={`${payment?.acceptanceRate || 0}% acceptance rate`} icon={<BadgeCheck size={18} />} />
        <Card title="Webhook success" value={`${webhookStats.successRate}%`} hint={`${webhookStats.delivered} delivered • ${webhookStats.failed} failed`} icon={<Webhook size={18} />} />
        <Card title="Peachtree batches" value={`${peachtreeBatches.length}`} hint="Ready, posted, and failed journal exports" icon={<Landmark size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          ['overview', 'Overview', <DatabaseZap size={16} />],
          ['devices', 'Devices', <Router size={16} />],
          ['events', 'Events', <Activity size={16} />],
          ['peachtree', 'Peachtree bridge', <ReceiptText size={16} />],
        ].map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setView(id as HubView)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${view === id ? 'border-sky-500/40 bg-sky-500/10 text-sky-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Connector matrix</h2>
                <p className="text-sm text-slate-400">Production connector health and synchronization status.</p>
              </div>
              <Cable className="text-sky-300" size={20} />
            </div>
            <div className="space-y-3">
              {connectors.map((connector) => (
                <div key={connector.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-black text-white">{connector.name}</div>
                    <div className="mt-1 text-xs text-slate-400">Last sync {new Date(connector.lastSync).toLocaleTimeString()} • {connector.latencyMs}ms latency</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-slate-700">{connector.mode}</span>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[connector.status]}`}>{connector.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Webhook catalog</h2>
                <p className="text-sm text-slate-400">Event types ready for store-to-control-room workflows.</p>
              </div>
              <ArrowRightLeft className="text-emerald-300" size={20} />
            </div>
            <div className="grid gap-3">
              {webhookCatalog.map((name) => (
                <div key={name} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'devices' && (
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Store device monitor</h2>
              <p className="text-sm text-slate-400">Meraki-style visibility for terminals, printers, and network edges.</p>
            </div>
            <Network className="text-sky-300" size={20} />
          </div>
          <div className="grid gap-4">
            {devices.map((device) => (
              <div key={device.id} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr] md:items-center">
                <div>
                  <div className="flex items-center gap-2 text-white">
                    {device.type === 'ROUTER' ? <Wifi size={16} /> : device.type === 'REGISTER' ? <Store size={16} /> : <Router size={16} />}
                    <span className="text-sm font-black">{device.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{device.store} • {device.type} • {device.ipAddress}</div>
                </div>
                <div className="text-xs text-slate-400">Provider: <span className="font-semibold text-slate-200">{device.provider}</span></div>
                <div className="text-xs text-slate-400">Uptime: <span className="font-semibold text-slate-200">{device.uptimePct}%</span></div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[device.status]}`}>{device.status}</span>
                  <span className="text-[10px] text-slate-500">{new Date(device.lastHeartbeat).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'events' && (
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Event bus monitor</h2>
              <p className="text-sm text-slate-400">Live development payloads flowing from POS to control room.</p>
            </div>
            <Siren className="text-amber-300" size={20} />
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <ShieldEllipsis size={16} className="text-sky-300" />
                      {event.type}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{event.store} • {event.source} • {new Date(event.createdAt).toLocaleTimeString()}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(event.payload).map(([key, value]) => (
                        <span key={key} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-semibold text-slate-300">{key}: {String(value)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[event.severity]}`}>{event.severity}</span>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[event.status]}`}>{event.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'peachtree' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Peachtree production bridge</h2>
                <p className="text-sm text-slate-400">Journal batches synchronized from Z-close to accounting.</p>
              </div>
              <Landmark className="text-emerald-300" size={20} />
            </div>
            <div className="space-y-3">
              {peachtreeBatches.map((batch) => (
                <div key={batch.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-sm font-black text-white">{batch.id}</div>
                      <div className="mt-1 text-xs text-slate-400">Gross {formatMoney(batch.grossSales, currency)} • Tax {formatMoney(batch.tax, currency)} • Over/short {formatMoney(batch.overShort, currency)}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {batch.journalPreview.map((line) => (
                          <span key={line} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[10px] font-semibold text-slate-300">{line}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusClasses[batch.status]}`}>{batch.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">What this adds</h2>
                <p className="text-sm text-slate-400">A safe path from development to production integrations.</p>
              </div>
              <DatabaseZap className="text-sky-300" size={20} />
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              {[
                'Live device heartbeat and outage visibility for store operations.',
                'Real-time payment acceptance summaries and settlement tracking.',
                'Production event catalog for sale, refund, shift-close, and journal export events.',
                'Peachtree posting queue with ready, posted, and failed states.',
                'Clear separation between Modern monitoring and Sage accounting finalization.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <BadgeCheck size={16} className="mt-0.5 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;
