import { GLAccount, LedgerEntry, AuditLog, User } from '../types';
import { getPaymentAcceptanceSummary } from './integrations/paymentAdapter';
import { getPeachtreeDevBatches } from './integrations/peachtreeAdapter';
import { getWebhookStats } from './integrations/webhookService';

export interface CoreJournalLine {
  account_code: string;
  description: string;
  debit: number;
  credit: number;
}

export interface CoreJournal {
  id: string;
  date: string;
  memo: string;
  source: 'MANUAL' | 'Z_REPORT' | 'SETTLEMENT' | 'PEACHTREE_EXPORT';
  shop_node?: string;
  batch_id: string;
  created_at: string;
  created_by: string;
  lines: CoreJournalLine[];
  total_debit: number;
  total_credit: number;
  status: 'POSTED' | 'REJECTED';
}

export interface ZReportLock {
  id: string;
  report_id: string;
  shop_node?: string;
  totals: {
    grossSales: number;
    tax: number;
    cash: number;
    card: number;
    mobile: number;
    overShort: number;
  };
  locked_at: string;
  locked_by: string;
  immutable_hash: string;
}

export interface IntegrationExecution {
  id: string;
  type: 'PAYMENT_SETTLEMENT' | 'PEACHTREE_EXPORT' | 'WEBHOOK_REPLAY';
  status: 'SUCCESS' | 'FAILED';
  created_at: string;
  actor_id: string;
  detail: string;
  payload: Record<string, any>;
}

const KEYS = {
  coa: 'finops_core_accounts',
  journals: 'finops_core_journals',
  zlocks: 'finops_core_zlocks',
  executions: 'finops_core_executions',
  audit: 'finops_audit_logs',
  ledger: 'finops_sage_ledger_entries',
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const hash = (...parts: string[]) => btoa(parts.join('|')).replace(/=/g, '').slice(0, 24);

const defaultAccounts: GLAccount[] = [
  { code: '1000-00', name: 'Cash on Hand', type: 'ASSET' },
  { code: '1010-00', name: 'Operating Bank', type: 'ASSET' },
  { code: '1100-00', name: 'Card Receivable', type: 'ASSET' },
  { code: '1110-00', name: 'Mobile Money Receivable', type: 'ASSET' },
  { code: '1200-00', name: 'Inventory', type: 'ASSET' },
  { code: '2000-00', name: 'Sales Tax Payable', type: 'LIABILITY' },
  { code: '2100-00', name: 'Refund Liability', type: 'LIABILITY' },
  { code: '3000-00', name: 'Owner Equity', type: 'EQUITY' },
  { code: '4000-01', name: 'Retail Sales Revenue', type: 'REVENUE' },
  { code: '4010-00', name: 'Discounts Given', type: 'REVENUE' },
  { code: '5000-00', name: 'Cost of Goods Sold', type: 'EXPENSE' },
  { code: '6100-00', name: 'Over Short Expense', type: 'EXPENSE' },
  { code: '6200-00', name: 'Bank Charges', type: 'EXPENSE' },
];

export const ensureCoreEngineBootstrapped = () => {
  if (!localStorage.getItem(KEYS.coa)) write(KEYS.coa, defaultAccounts);
  if (!localStorage.getItem(KEYS.journals)) write(KEYS.journals, [] as CoreJournal[]);
  if (!localStorage.getItem(KEYS.zlocks)) write(KEYS.zlocks, [] as ZReportLock[]);
  if (!localStorage.getItem(KEYS.executions)) write(KEYS.executions, [] as IntegrationExecution[]);
  if (!localStorage.getItem(KEYS.audit)) write(KEYS.audit, [] as AuditLog[]);
  if (!localStorage.getItem(KEYS.ledger)) write(KEYS.ledger, [] as LedgerEntry[]);
};

export const getCoreAccounts = (): GLAccount[] => {
  ensureCoreEngineBootstrapped();
  return read<GLAccount[]>(KEYS.coa, defaultAccounts);
};

export const getCoreJournals = (): CoreJournal[] => read<CoreJournal[]>(KEYS.journals, []);
export const getZReportLocks = (): ZReportLock[] => read<ZReportLock[]>(KEYS.zlocks, []);
export const getIntegrationExecutions = (): IntegrationExecution[] => read<IntegrationExecution[]>(KEYS.executions, []);
export const getCoreAuditLogs = (): AuditLog[] => read<AuditLog[]>(KEYS.audit, []);

const appendAudit = (actorId: string, action: string, targetTable: string, targetId: string, payload: any) => {
  const current = getCoreAuditLogs();
  const log: AuditLog = {
    id: id('audit'),
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    payload,
    created_at: new Date().toISOString(),
    change_reason: payload?.reason,
  };
  write(KEYS.audit, [log, ...current]);
};

export const postBalancedJournal = ({
  actor,
  memo,
  date,
  source,
  shopNode,
  lines,
}: {
  actor: User;
  memo: string;
  date: string;
  source: CoreJournal['source'];
  shopNode?: string;
  lines: CoreJournalLine[];
}) => {
  ensureCoreEngineBootstrapped();
  const chart = getCoreAccounts();
  const totalDebit = Number(lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0).toFixed(2));
  const totalCredit = Number(lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0).toFixed(2));

  if (!lines.length) throw new Error('Journal requires at least one line.');
  if (Math.abs(totalDebit - totalCredit) > 0.001) throw new Error('Debit and credit must balance.');
  const invalid = lines.find((line) => !chart.some((account) => account.code === line.account_code));
  if (invalid) throw new Error(`Unknown account: ${invalid.account_code}`);
  const invalidLine = lines.find((line) => (line.debit > 0 && line.credit > 0) || (line.debit <= 0 && line.credit <= 0));
  if (invalidLine) throw new Error('Each line must contain either a debit or a credit amount.');

  const journalId = id('jrnl');
  const batchId = `BATCH-${new Date().toISOString().slice(0, 10)}-${journalId.slice(-4)}`;
  const createdAt = new Date().toISOString();
  const journal: CoreJournal = {
    id: journalId,
    batch_id: batchId,
    date,
    memo,
    source,
    shop_node: shopNode,
    created_at: createdAt,
    created_by: actor.id,
    lines,
    total_debit: totalDebit,
    total_credit: totalCredit,
    status: 'POSTED',
  };

  const journals = getCoreJournals();
  write(KEYS.journals, [journal, ...journals]);

  const ledgerRows = read<LedgerEntry[]>(KEYS.ledger, []);
  const newRows: LedgerEntry[] = lines.map((line) => ({
    id: id('led'),
    batch_id: batchId,
    date,
    account_code: line.account_code,
    description: line.description || memo,
    debit: Number(line.debit) || 0,
    credit: Number(line.credit) || 0,
    currency: 'ETB',
    shop_node: shopNode,
    created_at: createdAt,
  }));
  write(KEYS.ledger, [...newRows, ...ledgerRows]);
  appendAudit(actor.id, 'JOURNAL_POSTED', 'core_journals', journalId, { memo, totalDebit, totalCredit, source, shopNode });

  return journal;
};

export const lockZReport = ({
  reportId,
  actor,
  shopNode,
  totals,
}: {
  reportId: string;
  actor: User;
  shopNode?: string;
  totals: ZReportLock['totals'];
}) => {
  const existing = getZReportLocks();
  if (existing.some((item) => item.report_id === reportId)) {
    throw new Error('This Z report is already locked.');
  }
  const lock: ZReportLock = {
    id: id('zlock'),
    report_id: reportId,
    shop_node: shopNode,
    totals,
    locked_at: new Date().toISOString(),
    locked_by: actor.id,
    immutable_hash: hash(reportId, actor.id, JSON.stringify(totals), new Date().toISOString()),
  };
  write(KEYS.zlocks, [lock, ...existing]);
  appendAudit(actor.id, 'Z_REPORT_LOCKED', 'z_report_locks', lock.id, { reportId, shopNode, totals, reason: 'End-of-day close sealed.' });
  return lock;
};

export const executeSandboxIntegration = async ({
  type,
  actor,
  payload,
}: {
  type: IntegrationExecution['type'];
  actor: User;
  payload: Record<string, any>;
}) => {
  ensureCoreEngineBootstrapped();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const execution: IntegrationExecution = {
    id: id('exec'),
    type,
    status: 'SUCCESS',
    created_at: new Date().toISOString(),
    actor_id: actor.id,
    detail: '',
    payload,
  };

  if (type === 'PEACHTREE_EXPORT') {
    const journal = postBalancedJournal({
      actor,
      memo: `Peachtree export ${payload.batchId || 'sandbox batch'}`,
      date: payload.date || new Date().toISOString().slice(0, 10),
      source: 'PEACHTREE_EXPORT',
      shopNode: payload.shopNode,
      lines: [
        { account_code: '1000-00', description: 'Cash receipts', debit: Number(payload.cash || 0), credit: 0 },
        { account_code: '1100-00', description: 'Card receivable', debit: Number(payload.card || 0), credit: 0 },
        { account_code: '1110-00', description: 'Mobile receivable', debit: Number(payload.mobile || 0), credit: 0 },
        { account_code: '6100-00', description: 'Over short', debit: Math.max(Number(payload.overShort || 0), 0), credit: Math.max(Number(-(payload.overShort || 0)), 0) },
        { account_code: '4000-01', description: 'Sales revenue', debit: 0, credit: Number(payload.sales || 0) },
        { account_code: '2000-00', description: 'Sales tax', debit: 0, credit: Number(payload.tax || 0) },
      ].filter((line) => line.debit > 0 || line.credit > 0),
    });
    execution.detail = `Sandbox export posted as ${journal.batch_id}`;
  } else if (type === 'PAYMENT_SETTLEMENT') {
    execution.detail = `Sandbox settlement accepted at ${payload.gateway || 'mock acquirer'} with amount ${(payload.amount || 0).toLocaleString()}`;
    appendAudit(actor.id, 'PAYMENT_SETTLEMENT_EXECUTED', 'integration_executions', execution.id, payload);
  } else {
    execution.detail = `Webhook replay completed for ${payload.eventCount || 0} event(s)`;
    appendAudit(actor.id, 'WEBHOOK_REPLAY_EXECUTED', 'integration_executions', execution.id, payload);
  }

  const executions = getIntegrationExecutions();
  write(KEYS.executions, [execution, ...executions]);
  return execution;
};

export const getCoreEngineHealth = () => {
  ensureCoreEngineBootstrapped();
  const journals = getCoreJournals();
  const zLocks = getZReportLocks();
  const auditLogs = getCoreAuditLogs();
  const executions = getIntegrationExecutions();
  const payment = getPaymentAcceptanceSummary();
  const peachtree = getPeachtreeDevBatches();
  const webhooks = getWebhookStats();

  const balanced = journals.every((journal) => Math.abs(journal.total_debit - journal.total_credit) < 0.001);
  const lastLock = zLocks[0]?.locked_at || null;

  return {
    journalCount: journals.length,
    lockedZCount: zLocks.length,
    auditEventCount: auditLogs.length,
    executionCount: executions.length,
    balanced,
    lastLock,
    payment,
    peachtree,
    webhooks,
  };
};
