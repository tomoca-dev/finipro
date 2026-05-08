-- =====================================================
-- FINOPS PRO: 12 ERP SYSTEMS + API ACCEPTER SQL
-- Run AFTER Modern Core + Modern Supplemental + Sage Core + Sage Supplemental SQL.
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- ENUMS
-- =====================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'enterprise_system_status') then
    create type public.enterprise_system_status as enum ('PLANNED', 'ACTIVE', 'IN_PROGRESS', 'PAUSED', 'FAILED');
  end if;

  if not exists (select 1 from pg_type where typname = 'enterprise_system_mode') then
    create type public.enterprise_system_mode as enum ('MODERN', 'SAGE', 'BOTH');
  end if;

  if not exists (select 1 from pg_type where typname = 'api_accepter_status') then
    create type public.api_accepter_status as enum ('received', 'validated', 'processed', 'failed');
  end if;
end $$;

-- =====================================================
-- 12 ERP SYSTEMS REGISTRY / EVENT STORE
-- =====================================================
create table if not exists public.enterprise_system_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  system_key text not null,
  system_name text not null,
  mode public.enterprise_system_mode not null default 'BOTH',
  status public.enterprise_system_status not null default 'ACTIVE',
  priority public.modern_priority not null default 'HIGH',
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_enterprise_system_events_updated_at
before update on public.enterprise_system_events
for each row execute procedure public.set_updated_at();

create index if not exists idx_enterprise_system_events_org
on public.enterprise_system_events(organization_id, created_at desc);

create index if not exists idx_enterprise_system_events_key
on public.enterprise_system_events(organization_id, system_key, created_at desc);

-- =====================================================
-- API ACCEPTER: ROUTES / EVENTS
-- =====================================================
create table if not exists public.api_accepter_routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  route_key text not null,
  source_system text not null,
  accepted_events text[] not null default array[]::text[],
  enabled boolean not null default true,
  shared_secret_ref text,
  validation_schema jsonb not null default '{}'::jsonb,
  target_table text,
  transform_rules jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, route_key)
);

create trigger trg_api_accepter_routes_updated_at
before update on public.api_accepter_routes
for each row execute procedure public.set_updated_at();

create table if not exists public.api_accepter_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  route_id uuid references public.api_accepter_routes(id) on delete set null,
  source_system text not null,
  event_type text not null,
  status public.api_accepter_status not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  response jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_api_accepter_events_org
on public.api_accepter_events(organization_id, created_at desc);

create index if not exists idx_api_accepter_events_source
on public.api_accepter_events(source_system, event_type, created_at desc);

-- =====================================================
-- OPTIONAL DOMAIN TABLES FOR THE 12 SYSTEMS
-- =====================================================
create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null,
  status text not null default 'DRAFT',
  order_date date not null default current_date,
  expected_ship_date date,
  subtotal numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, order_number)
);

create trigger trg_sales_orders_updated_at before update on public.sales_orders for each row execute procedure public.set_updated_at();

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  po_number text not null,
  status text not null default 'DRAFT',
  order_date date not null default current_date,
  expected_receipt_date date,
  subtotal numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, po_number)
);

create trigger trg_purchase_orders_updated_at before update on public.purchase_orders for each row execute procedure public.set_updated_at();

create table if not exists public.project_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_code text not null,
  job_name text not null,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'ACTIVE',
  budget numeric(14,2) not null default 0,
  actual_cost numeric(14,2) not null default 0,
  revenue numeric(14,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, job_code)
);

create trigger trg_project_jobs_updated_at before update on public.project_jobs for each row execute procedure public.set_updated_at();

create table if not exists public.maintenance_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_type text not null,
  status text not null default 'PENDING',
  started_at timestamptz,
  finished_at timestamptz,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =====================================================
-- RLS
-- =====================================================
alter table public.enterprise_system_events enable row level security;
alter table public.api_accepter_routes enable row level security;
alter table public.api_accepter_events enable row level security;
alter table public.sales_orders enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.project_jobs enable row level security;
alter table public.maintenance_jobs enable row level security;

create policy enterprise_system_events_member_all on public.enterprise_system_events
for all to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy api_accepter_routes_admin_all on public.api_accepter_routes
for all to authenticated
using (public.has_org_role(organization_id, array['owner','finance_admin','manager']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','finance_admin','manager']::public.app_role[]));

create policy api_accepter_events_member_all on public.api_accepter_events
for all to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy sales_orders_member_all on public.sales_orders
for all to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy purchase_orders_member_all on public.purchase_orders
for all to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy project_jobs_member_all on public.project_jobs
for all to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy maintenance_jobs_admin_all on public.maintenance_jobs
for all to authenticated
using (public.has_org_role(organization_id, array['owner','finance_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['owner','finance_admin']::public.app_role[]));

-- =====================================================
-- SEED FUNCTION
-- =====================================================
create or replace function public.seed_enterprise_expansion_defaults(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.enterprise_system_events (organization_id, system_key, system_name, mode, status, priority, summary, payload)
  values
    (p_org_id, 'advanced_banking', 'Advanced Banking Engine', 'SAGE', 'ACTIVE', 'HIGH', 'Bank feeds, statement import, ACH/wire workflow, auto reconciliation, check-printing readiness.', '{"tables":["bank_transactions","integration_runs"]}'::jsonb),
    (p_org_id, 'advanced_inventory', 'Advanced Inventory Engine', 'BOTH', 'ACTIVE', 'HIGH', 'Serialized stock, barcodes, kits/assemblies, warehouse transfers, physical counts, FIFO/LIFO-ready payloads.', '{"tables":["products","inventory_movements"]}'::jsonb),
    (p_org_id, 'sales_orders', 'Sales Order Lifecycle', 'MODERN', 'ACTIVE', 'HIGH', 'Quotes, sales orders, backorders, shipment states, partial fulfillment, commission data.', '{"tables":["sales_orders"]}'::jsonb),
    (p_org_id, 'purchasing_procurement', 'Purchasing & Procurement', 'SAGE', 'ACTIVE', 'HIGH', 'Purchase orders, receiving, approvals, vendor procurement rules, procurement analytics.', '{"tables":["purchase_orders","vendors"]}'::jsonb),
    (p_org_id, 'enterprise_payroll', 'Enterprise Payroll', 'SAGE', 'ACTIVE', 'HIGH', 'Tax-ready payroll payloads, benefits, direct-deposit prep, compliance review and approval runs.', '{"tables":["sage_payroll_runs","sage_payroll_items"]}'::jsonb),
    (p_org_id, 'project_job_costing', 'Project / Job Costing', 'SAGE', 'ACTIVE', 'HIGH', 'Projects, phases, tasks, WIP tracking, labor allocation, profitability views.', '{"tables":["project_jobs","ledger_entries"]}'::jsonb),
    (p_org_id, 'advanced_reporting', 'Advanced Reporting Engine', 'BOTH', 'ACTIVE', 'HIGH', 'Report templates, drill-down reports, scheduled exports, financial statement packages.', '{"tables":["reports","report_runs","export_jobs"]}'::jsonb),
    (p_org_id, 'enterprise_forecasting', 'Enterprise Forecasting', 'BOTH', 'ACTIVE', 'HIGH', 'Rolling forecasts, scenario versions, approval flow, multi-year planning.', '{"tables":["sage_forecasts","sandbox_scenarios"]}'::jsonb),
    (p_org_id, 'production_integrations', 'Production Integration Layer', 'BOTH', 'ACTIVE', 'CRITICAL', 'OAuth-ready connectors, retries, webhook intake, event queue and external ERP adapters.', '{"tables":["connector_registry","api_accepter_events"]}'::jsonb),
    (p_org_id, 'cloud_infrastructure', 'Enterprise Cloud Infrastructure', 'BOTH', 'ACTIVE', 'HIGH', 'Offline-sync metadata, worker queues, backup events, file storage references, maintenance jobs.', '{"tables":["maintenance_jobs","dev_console_logs"]}'::jsonb),
    (p_org_id, 'real_ai_engine', 'Real AI Engine', 'BOTH', 'ACTIVE', 'HIGH', 'Anomaly detection events, RAG/embedding-ready references, recommendations and model outputs.', '{"tables":["ai_insights","sage_ai_messages"]}'::jsonb),
    (p_org_id, 'utilities_maintenance', 'Enterprise Utilities & Maintenance', 'BOTH', 'ACTIVE', 'HIGH', 'Backup, restore, integrity checks, migration tracking, repair tools and cron readiness.', '{"tables":["maintenance_jobs","audit_logs"]}'::jsonb);

  insert into public.api_accepter_routes (organization_id, route_key, source_system, accepted_events, target_table, transform_rules)
  values
    (p_org_id, 'external_pos', 'External POS', array['sale.created','refund.created','shift.closed'], 'api_accepter_events', '{"mode":"sandbox"}'::jsonb),
    (p_org_id, 'bank_feed', 'Bank Feed', array['statement.imported','transaction.created'], 'bank_transactions', '{"mode":"sandbox"}'::jsonb),
    (p_org_id, 'inventory_gateway', 'Inventory Gateway', array['stock.adjusted','stock.received'], 'inventory_movements', '{"mode":"sandbox"}'::jsonb)
  on conflict (organization_id, route_key) do nothing;
end;
$$;
