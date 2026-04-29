import { supabase, isSupabaseConfigured, localDb } from '../supabaseClient';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'SYNCING';
export type EventSeverity = 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';

export interface IntegrationDevice {
  id: string;
  name: string;
  type: 'REGISTER' | 'PAYMENT_TERMINAL' | 'PRINTER' | 'ROUTER' | 'SCANNER';
  store: string;
  ipAddress: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  uptimePct: number;
  provider: string;
}

export interface IntegrationEvent {
  id: string;
  type: string;
  store: string;
  source: string;
  createdAt: string;
  severity: EventSeverity;
  status: 'QUEUED' | 'DELIVERED' | 'FAILED';
  payload: Record<string, string | number | boolean>;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  mode: 'DEV' | 'SANDBOX' | 'LIVE_READY';
  status: 'CONNECTED' | 'NEEDS_AUTH' | 'SIMULATED';
  latencyMs: number;
  lastSync: string;
}

const DEVICES_TABLE = 'integration_devices';
const EVENTS_TABLE = 'integration_events';
const CONNECTORS_TABLE = 'integration_connectors';

export const getIntegrationDevices = async (): Promise<IntegrationDevice[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from(DEVICES_TABLE).select('*').order('name');
    if (!error && data) return data.map(mapDeviceFromDb);
  }
  
  const local = localDb.get(DEVICES_TABLE);
  if (local.length > 0) return local.map(mapDeviceFromDb);

  // Seed initial data if empty
  const seeds = getInitialDevices();
  localDb.insert(DEVICES_TABLE, seeds);
  return seeds;
};

export const getIntegrationEvents = async (): Promise<IntegrationEvent[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from(EVENTS_TABLE).select('*').order('created_at', { ascending: false });
    if (!error && data) return data.map(mapEventFromDb);
  }
  
  const local = localDb.get(EVENTS_TABLE);
  if (local.length > 0) return local.map(mapEventFromDb);

  const seeds = getInitialEvents();
  localDb.insert(EVENTS_TABLE, seeds);
  return seeds;
};

export const getIntegrationConnectors = async (): Promise<IntegrationConnector[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from(CONNECTORS_TABLE).select('*');
    if (!error && data) return data;
  }
  
  const local = localDb.get(CONNECTORS_TABLE);
  if (local.length > 0) return local;

  const seeds = getInitialConnectors();
  localDb.insert(CONNECTORS_TABLE, seeds);
  return seeds;
};

export const emitIntegrationEvent = async (event: Omit<IntegrationEvent, 'id' | 'createdAt'>) => {
  const newEvent = {
    ...event,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await supabase.from(EVENTS_TABLE).insert([newEvent]);
  } else {
    localDb.insert(EVENTS_TABLE, [newEvent]);
  }
};

export const upsertIntegrationDevice = async (device: Partial<IntegrationDevice> & { name: string }) => {
  if (isSupabaseConfigured()) {
    await supabase.from(DEVICES_TABLE).upsert([device]);
  } else {
    const existing = localDb.get(DEVICES_TABLE);
    const idx = existing.findIndex((d: any) => d.name === device.name);
    if (idx >= 0) {
      localDb.update(DEVICES_TABLE, existing[idx].id, device);
    } else {
      localDb.insert(DEVICES_TABLE, [device]);
    }
  }
};

// Mappers to handle snake_case to camelCase if needed, or just standard mapping
const mapDeviceFromDb = (db: any): IntegrationDevice => ({
  id: db.id,
  name: db.name,
  type: db.type,
  store: db.store,
  ipAddress: db.ip_address || db.ipAddress,
  status: db.status,
  lastHeartbeat: db.last_heartbeat || db.lastHeartbeat,
  uptimePct: db.uptime_pct || db.uptimePct,
  provider: db.provider
});

const mapEventFromDb = (db: any): IntegrationEvent => ({
  id: db.id,
  type: db.type,
  store: db.store,
  source: db.source,
  createdAt: db.created_at || db.createdAt,
  severity: db.severity,
  status: db.status,
  payload: db.payload
});

// Initial Seeding Logic
const getInitialDevices = (): IntegrationDevice[] => [
  { id: 'dev-reg-01', name: 'Front Register 01', type: 'REGISTER', store: 'Bole Flagship', ipAddress: '10.11.4.21', status: 'ONLINE', lastHeartbeat: new Date().toISOString(), uptimePct: 99.8, provider: 'POS Core' },
  { id: 'dev-pay-01', name: 'Card Terminal A', type: 'PAYMENT_TERMINAL', store: 'Bole Flagship', ipAddress: '10.11.4.44', status: 'ONLINE', lastHeartbeat: new Date().toISOString(), uptimePct: 98.7, provider: 'Acquirer Sandbox' },
  { id: 'dev-router-03', name: 'Store Gateway', type: 'ROUTER', store: 'Kazanchis', ipAddress: '10.12.9.1', status: 'ONLINE', lastHeartbeat: new Date().toISOString(), uptimePct: 99.9, provider: 'Meraki-style Ops Layer' },
];

const getInitialConnectors = (): IntegrationConnector[] => [
  { id: 'conn-meraki', name: 'Store Device Monitor', mode: 'LIVE_READY', status: 'CONNECTED', latencyMs: 42, lastSync: new Date().toISOString() },
  { id: 'conn-pos', name: 'POS Transaction Adapter', mode: 'LIVE_READY', status: 'CONNECTED', latencyMs: 31, lastSync: new Date().toISOString() },
  { id: 'conn-webhook', name: 'Webhook Event Bus', mode: 'LIVE_READY', status: 'CONNECTED', latencyMs: 15, lastSync: new Date().toISOString() },
];

const getInitialEvents = (): IntegrationEvent[] => [
  { id: 'evt-001', type: 'sale.created', store: 'Bole Flagship', source: 'Front Register 01', createdAt: new Date().toISOString(), severity: 'SUCCESS', status: 'DELIVERED', payload: { amount: 1240, paymentType: 'CARD', receipt: 'BO-10045' } }
];
