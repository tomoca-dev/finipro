# Supabase Connection Review

This project has been aligned to the Modern + Sage Supabase SQL schema provided in the conversation.

## Fixed / aligned in code

- Auth remains Supabase-only. No demo auth fallback was reintroduced.
- Added shared helpers in `services/supabaseClient.ts`:
  - `ensureDefaultOrganization()`
  - `getCurrentUserId()`
- Modern CEO Dashboard now reads/writes `ceo_targets` using the schema columns:
  - `target_name`, `target_category`, `target_value`, `current_value`, `unit`, `period_start`, `period_end`, `organization_id`
- Budget Builder now uses the supplied SQL tables:
  - `budgets`
  - `budget_line_items`
  - `departments`
  - `ai_insights` for AI budget negotiation history instead of missing `negotiations`
- Export Center now uses:
  - `reports`
  - `export_jobs` for secure link records instead of missing `share_links`
- Governance now uses:
  - `audit_logs`
  - `compliance_findings` for access-review items instead of missing `access_requests`
- Integration Hub service now uses:
  - `store_devices`
  - `integration_runs`
  - `connector_registry`
- Payment acceptance summary now derives from `pos_transactions` instead of a missing `payment_summaries` table.
- Sage Shop Registry remains connected to `sage_shops`.

## Still UI/demo-driven by design

Some components remain analytical/demo views over uploaded/in-memory records rather than full CRUD database modules. This is acceptable for the current app shape, but these modules can be deepened later:

- Hiring ROI
- Investment Evaluator
- ESG & Impact
- Strategic Decisions
- Strategic Sandbox
- AI Insights Engine
- P&L Analytics

Their backing tables exist in the Modern Supplemental SQL, but the current UI does not yet require full database CRUD to render.

## Build note

The sandbox dependency installation timed out while attempting a fresh build. The changes are targeted TypeScript/React edits and do not require schema changes beyond the SQL already provided.
