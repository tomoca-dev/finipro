import { supabase, isSupabaseConfigured, localDb, ensureDefaultOrganization } from '../supabaseClient';

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

const DEVICES_TABLE = 'store_devices';
const EVENTS_TABLE = 'integration_runs';
const CONNECTORS_TABLE = 'connector_registry';

const toDbDeviceStatus = (status?: DeviceStatus) => status === 'OFFLINE' ? 'offline' : status === 'DEGRADED' || status === 'SYNCING' ? 'degraded' : 'online';
const fromDbDeviceStatus = (status?: string): DeviceStatus => status === 'offline' ? 'OFFLINE' : status === 'degraded' ? 'DEGRADED' : 'ONLINE';

export const getIntegrationDevices = async (): Promise<IntegrationDevice[]> => {
  if (isSupabaseConfigured()) {
    try {
      const orgId = await ensureDefaultOrganization();
      const { data, error } = await supabase.from(DEVICES_TABLE).select('*').eq('organization_id', orgId).order('device_name');
      if (!error && data && data.length > 0) return data.map(mapDeviceFromDb);
    } catch (err) { console.warn('Supabase integration device read failed:', err); }
  }
  const local = localDb.get(DEVICES_TABLE);
  if (local.length > 0) return local.map(mapDeviceFromDb);
  const seeds = getInitialDevices();
  localDb.insert(DEVICES_TABLE, seeds);
  return seeds;
};

export const getIntegrationEvents = async (): Promise<IntegrationEvent[]> => {
  if (isSupabaseConfigured()) {
    try {
      const orgId = await ensureDefaultOrganization();
      const { data, error } = await supabase.from(EVENTS_TABLE).select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(50);
      if (!error && data && data.length > 0) return data.map(mapEventFromDb);
    } catch (err) { console.warn('Supabase integration event read failed:', err); }
  }
  const local = localDb.get(EVENTS_TABLE);
  if (local.length > 0) return local.map(mapEventFromDb);
  const seeds = getInitialEvents();
  localDb.insert(EVENTS_TABLE, seeds);
  return seeds;
};

export const getIntegrationConnectors = async (): Promise<IntegrationConnector[]> => {
  if (isSupabaseConfigured()) {
    try {
      const orgId = await ensureDefaultOrganization();
      const { data, error } = await supabase.from(CONNECTORS_TABLE).select('*').eq('organization_id', orgId);
      if (!error && data && data.length > 0) return data.map(mapConnectorFromDb);
    } catch (err) { console.warn('Supabase connector read failed:', err); }
  }
  const local = localDb.get(CONNECTORS_TABLE);
  if (local.length > 0) return local.map(mapConnectorFromDb);
  const seeds = getInitialConnectors();
  localDb.insert(CONNECTORS_TABLE, seeds);
  return seeds;
};

export const emitIntegrationEvent = async (event: Omit<IntegrationEvent, 'id' | 'createdAt'>) => {
  if (isSupabaseConfigured()) {
    try {
      const orgId = await ensureDefaultOrganization();
      await supabase.from(EVENTS_TABLE).insert([{ organization_id: orgId, integration_name: event.source, event_name: event.type, payload: { ...event.payload, store: event.store, severity: event.severity }, status: event.status === 'FAILED' ? 'failed' : event.status === 'DELIVERED' ? 'success' : 'pending' }]);
      return;
    } catch (err) { console.warn('Supabase integration event insert failed:', err); }
  }
  localDb.insert(EVENTS_TABLE, [{ ...event, created_at: new Date().toISOString() }]);
};

export const upsertIntegrationDevice = async (device: Partial<IntegrationDevice> & { name: string }) => {
  if (isSupabaseConfigured()) {
    try {
      const orgId = await ensureDefaultOrganization();
      await supabase.from(DEVICES_TABLE).upsert([{ organization_id: orgId, device_name: device.name, device_type: device.type || 'REGISTER', status: toDbDeviceStatus(device.status), last_heartbeat_at: device.lastHeartbeat || new Date().toISOString(), metadata: { store: device.store, ipAddress: device.ipAddress, uptimePct: device.uptimePct, provider: device.provider } }]);
      return;
    } catch (err) { console.warn('Supabase integration device upsert failed:', err); }
  }
  const existing = localDb.get(DEVICES_TABLE);
  const idx = existing.findIndex((d: any) => d.name === device.name || d.device_name === device.name);
  if (idx >= 0) localDb.update(DEVICES_TABLE, existing[idx].id, device); else localDb.insert(DEVICES_TABLE, [device]);
};

const mapDeviceFromDb = (db: any): IntegrationDevice => ({ id: db.id, name: db.device_name || db.name, type: (db.device_type || db.type || 'REGISTER') as IntegrationDevice['type'], store: db.metadata?.store || db.store || 'Default Store', ipAddress: db.metadata?.ipAddress || db.ip_address || db.ipAddress || '0.0.0.0', status: fromDbDeviceStatus(db.status), lastHeartbeat: db.last_heartbeat_at || db.last_heartbeat || db.lastHeartbeat || db.created_at || new Date().toISOString(), uptimePct: Number(db.metadata?.uptimePct || db.uptime_pct || db.uptimePct || 99), provider: db.metadata?.provider || db.provider || 'Integration Hub' });
const mapEventFromDb = (db: any): IntegrationEvent => ({ id: db.id, type: db.event_name || db.type, store: db.payload?.store || db.store || 'Default Store', source: db.integration_name || db.source || 'Integration Hub', createdAt: db.created_at || db.createdAt, severity: db.payload?.severity || db.severity || (db.status === 'failed' ? 'CRITICAL' : 'SUCCESS'), status: db.status === 'failed' ? 'FAILED' : db.status === 'success' ? 'DELIVERED' : 'QUEUED', payload: db.payload || {} });
const mapConnectorFromDb = (db: any): IntegrationConnector => ({ id: db.id || db.connector_key, name: db.connector_name || db.name, mode: db.config?.mode === 'sandbox' ? 'SANDBOX' : 'LIVE_READY', status: db.status === 'ACTIVE' ? 'CONNECTED' : db.status === 'PENDING' ? 'NEEDS_AUTH' : 'SIMULATED', latencyMs: Number(db.config?.latencyMs || db.latencyMs || 30), lastSync: db.last_sync_at || db.lastSync || db.updated_at || new Date().toISOString() });

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
