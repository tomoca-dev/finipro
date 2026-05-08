import { ensureDefaultOrganization, supabase } from './supabaseClient';

export type EnterpriseSystemKey =
  | 'advanced_banking'
  | 'advanced_inventory'
  | 'sales_orders'
  | 'purchasing_procurement'
  | 'enterprise_payroll'
  | 'project_job_costing'
  | 'advanced_reporting'
  | 'enterprise_forecasting'
  | 'production_integrations'
  | 'cloud_infrastructure'
  | 'real_ai_engine'
  | 'utilities_maintenance';

export type EnterpriseSystemRecord = {
  id: string;
  organization_id: string;
  system_key: EnterpriseSystemKey | string;
  system_name: string;
  mode: 'MODERN' | 'SAGE' | 'BOTH';
  status: 'PLANNED' | 'ACTIVE' | 'IN_PROGRESS' | 'PAUSED' | 'FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string | null;
  payload: Record<string, any>;
  created_at: string;
  updated_at?: string;
};

export type ApiAccepterEvent = {
  id: string;
  organization_id: string;
  source_system: string;
  event_type: string;
  status: 'received' | 'validated' | 'processed' | 'failed';
  payload: Record<string, any>;
  response?: Record<string, any> | null;
  error_message?: string | null;
  created_at: string;
};

export const ENTERPRISE_SYSTEMS: Array<{
  key: EnterpriseSystemKey;
  name: string;
  mode: 'MODERN' | 'SAGE' | 'BOTH';
  summary: string;
  tables: string[];
}> = [
  { key: 'advanced_banking', name: 'Advanced Banking Engine', mode: 'SAGE', summary: 'Bank feeds, statement import, ACH/wire workflow, auto reconciliation, check-printing readiness.', tables: ['bank_transactions', 'api_accepter_events', 'integration_runs'] },
  { key: 'advanced_inventory', name: 'Advanced Inventory Engine', mode: 'BOTH', summary: 'Serialized stock, barcodes, kits/assemblies, warehouse transfers, physical counts, FIFO/LIFO-ready payloads.', tables: ['products', 'inventory_movements', 'enterprise_system_events'] },
  { key: 'sales_orders', name: 'Sales Order Lifecycle', mode: 'MODERN', summary: 'Quotes, sales orders, backorders, shipment states, partial fulfillment, commission data.', tables: ['enterprise_system_events', 'pos_transactions'] },
  { key: 'purchasing_procurement', name: 'Purchasing & Procurement', mode: 'SAGE', summary: 'Purchase orders, receiving, approvals, vendor procurement rules, procurement analytics.', tables: ['vendors', 'enterprise_system_events'] },
  { key: 'enterprise_payroll', name: 'Enterprise Payroll', mode: 'SAGE', summary: 'Tax-ready payroll payloads, benefits, direct-deposit prep, compliance review and approval runs.', tables: ['sage_employees', 'sage_payroll_runs', 'sage_payroll_items'] },
  { key: 'project_job_costing', name: 'Project / Job Costing', mode: 'SAGE', summary: 'Projects, phases, tasks, WIP tracking, labor allocation, profitability views.', tables: ['enterprise_system_events', 'journal_entries', 'ledger_entries'] },
  { key: 'advanced_reporting', name: 'Advanced Reporting Engine', mode: 'BOTH', summary: 'Report templates, drill-down reports, scheduled exports, financial statement packages.', tables: ['reports', 'report_runs', 'export_jobs'] },
  { key: 'enterprise_forecasting', name: 'Enterprise Forecasting', mode: 'BOTH', summary: 'Rolling forecasts, scenario versions, approval flow, multi-year planning.', tables: ['sage_forecasts', 'sage_forecast_lines', 'sandbox_scenarios'] },
  { key: 'production_integrations', name: 'Production Integration Layer', mode: 'BOTH', summary: 'OAuth-ready connectors, retries, webhook intake, event queue and external ERP adapters.', tables: ['connector_registry', 'connector_events', 'api_accepter_events'] },
  { key: 'cloud_infrastructure', name: 'Enterprise Cloud Infrastructure', mode: 'BOTH', summary: 'Offline-sync metadata, worker queues, backup events, file storage references, maintenance jobs.', tables: ['enterprise_system_events', 'dev_console_logs'] },
  { key: 'real_ai_engine', name: 'Real AI Engine', mode: 'BOTH', summary: 'Anomaly detection events, RAG/embedding-ready references, recommendations and model outputs.', tables: ['ai_insights', 'sage_ai_threads', 'sage_ai_messages'] },
  { key: 'utilities_maintenance', name: 'Enterprise Utilities & Maintenance', mode: 'BOTH', summary: 'Backup, restore, integrity checks, migration tracking, repair tools and cron readiness.', tables: ['enterprise_system_events', 'audit_logs'] },
];

export async function listEnterpriseSystemEvents() {
  const organizationId = await ensureDefaultOrganization();
  const { data, error } = await supabase
    .from('enterprise_system_events')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { organizationId, records: (data || []) as EnterpriseSystemRecord[] };
}

export async function upsertEnterpriseSystemEvent(input: {
  systemKey: EnterpriseSystemKey;
  status?: EnterpriseSystemRecord['status'];
  priority?: EnterpriseSystemRecord['priority'];
  summary?: string;
  payload?: Record<string, any>;
}) {
  const organizationId = await ensureDefaultOrganization();
  const system = ENTERPRISE_SYSTEMS.find((item) => item.key === input.systemKey);
  if (!system) throw new Error(`Unknown enterprise system: ${input.systemKey}`);

  const { data, error } = await supabase
    .from('enterprise_system_events')
    .insert({
      organization_id: organizationId,
      system_key: system.key,
      system_name: system.name,
      mode: system.mode,
      status: input.status || 'ACTIVE',
      priority: input.priority || 'HIGH',
      summary: input.summary || system.summary,
      payload: {
        tables: system.tables,
        source: 'enterprise_expansion_center',
        ...(input.payload || {}),
      },
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as EnterpriseSystemRecord;
}

export async function updateEnterpriseSystemEvent(id: string, updates: Partial<Pick<EnterpriseSystemRecord, 'status' | 'priority' | 'summary' | 'payload'>>) {
  const { data, error } = await supabase
    .from('enterprise_system_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as EnterpriseSystemRecord;
}

export async function listApiAccepterEvents() {
  const organizationId = await ensureDefaultOrganization();
  const { data, error } = await supabase
    .from('api_accepter_events')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) throw error;
  return { organizationId, events: (data || []) as ApiAccepterEvent[] };
}

export async function simulateAcceptedApiEvent(input: {
  sourceSystem: string;
  eventType: string;
  payload: Record<string, any>;
}) {
  const organizationId = await ensureDefaultOrganization();
  const { data, error } = await supabase
    .from('api_accepter_events')
    .insert({
      organization_id: organizationId,
      source_system: input.sourceSystem,
      event_type: input.eventType,
      status: 'received',
      payload: input.payload,
      response: {
        accepted: true,
        mode: 'sandbox',
        route: 'api-accepter',
      },
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase.from('integration_runs').insert({
    organization_id: organizationId,
    integration_name: input.sourceSystem,
    event_name: input.eventType,
    status: 'success',
    payload: input.payload,
    response: { accepted_event_id: data.id },
  });

  return data as ApiAccepterEvent;
}
