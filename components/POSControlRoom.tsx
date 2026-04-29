import React, { useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  Fingerprint,
  GitBranch,
  Layers3,
  Lock,
  Package,
  Radar,
  Receipt,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
  Waypoints,
  XCircle,
} from 'lucide-react';
import { CurrencyCode, FinancialRecord } from '../types';
import { CURRENCY_SYMBOLS } from '../services/dataEngine';
import BrandLogo from './BrandLogo';

type ReportId =
  | 'z'
  | 'x'
  | 'summary'
  | 'department'
  | 'product'
  | 'payment'
  | 'drawer'
  | 'overShort'
  | 'refund'
  | 'hourly'
  | 'inventory'
  | 'employee';

interface POSControlRoomProps {
  records: FinancialRecord[];
  currency: CurrencyCode;
}

const strategicSystems = [
  'Enterprise-grade ledger engine',
  'Immutable audit trail',
  'Real-time data lineage tracking',
  'Financial health monitor',
  'AI finance copilot',
  'Anomaly detection engine',
  'Scenario simulation engine',
  'Multi-entity consolidation',
  'Bank and ERP integrations',
  'Smart budget guardrails',
  'Narrative executive reports',
  'Financial knowledge graph',
  'Role-based intelligence views',
  'Forecasting engine',
  'Autonomous alerts',
  'Explainable AI layer',
  'Financial risk radar',
  'Decision tracking system',
];

const retailSystems = [
  'Z report end-of-day close',
  'X report real-time snapshot',
  'Summary sales report',
  'Department and category report',
  'Product sales report',
  'Payment type report',
  'Cash drawer report',
  'Over / short report',
  'Refund / void report',
  'Hourly sales report',
  'Inventory movement report',
  'Employee / cashier report',
];

const formatMoney = (value: number, currency: CurrencyCode) => {
  const abs = Math.abs(value);
  const formatted = `${CURRENCY_SYMBOLS[currency]}${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return value < 0 ? `-${formatted}` : formatted;
};

const reportTabs: { id: ReportId; label: string }[] = [
  { id: 'z', label: 'Z Report' },
  { id: 'x', label: 'X Report' },
  { id: 'summary', label: 'Summary' },
  { id: 'department', label: 'Department' },
  { id: 'product', label: 'Products' },
  { id: 'payment', label: 'Payments' },
  { id: 'drawer', label: 'Cash Drawer' },
  { id: 'overShort', label: 'Over / Short' },
  { id: 'refund', label: 'Refunds / Voids' },
  { id: 'hourly', label: 'Hourly Sales' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'employee', label: 'Cashiers' },
];

const POSControlRoom: React.FC<POSControlRoomProps> = ({ records, currency }) => {
  const [activeReport, setActiveReport] = useState<ReportId>('z');

  const totals = useMemo(() => {
    const grossFromRecords = records.reduce((sum, record) => sum + Math.max(record.amount, 0), 0);
    const derivedSales = grossFromRecords > 0 ? grossFromRecords : 3250;
    const card = derivedSales * 0.65;
    const cash = derivedSales * 0.28;
    const mobile = derivedSales * 0.07;
    const refunds = derivedSales * 0.015;
    const discounts = derivedSales * 0.04;
    const taxes = derivedSales * 0.15;
    const expectedCash = cash + 200 - 50;
    const countedCash = expectedCash - 20;

    return {
      sales: Math.round(derivedSales),
      card: Math.round(card),
      cash: Math.round(cash),
      mobile: Math.round(mobile),
      refunds: Math.round(refunds),
      discounts: Math.round(discounts),
      taxes: Math.round(taxes),
      expectedCash: Math.round(expectedCash),
      countedCash: Math.round(countedCash),
      overShort: Math.round(countedCash - expectedCash),
      avgTicket: Math.round(derivedSales / 120),
    };
  }, [records]);

  const metricCards = [
    { label: 'Daily Sales', value: formatMoney(totals.sales, currency), icon: <BadgeDollarSign size={18} />, tone: 'text-emerald-500' },
    { label: 'Expected Cash', value: formatMoney(totals.expectedCash, currency), icon: <Wallet size={18} />, tone: 'text-amber-500' },
    { label: 'Variance', value: formatMoney(totals.overShort, currency), icon: <ShieldAlert size={18} />, tone: totals.overShort === 0 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Journals Ready', value: '4 batches', icon: <FileSpreadsheet size={18} />, tone: 'text-blue-500' },
  ];

  const closingSteps = [
    'Open register, assign cashier, and confirm opening float.',
    'Monitor live sales and exceptions through the X report.',
    'Count drawer and confirm paid-outs, drops, and refunds.',
    'Generate a locked Z report with supervisor sign-off.',
    'Build Peachtree-ready journals and payment reconciliations.',
    'Push exceptions and audit evidence into finance review.',
  ];

  const peachtreeEntries = [
    { dr: 'Cash on Hand', cr: '', amount: totals.cash },
    { dr: 'Card Receivable', cr: '', amount: totals.card },
    { dr: 'Mobile Money Receivable', cr: '', amount: totals.mobile },
    { dr: '', cr: 'Sales Revenue', amount: totals.sales - totals.taxes },
    { dr: '', cr: 'Sales Tax Payable', amount: totals.taxes },
    { dr: 'Sales Returns', cr: '', amount: totals.refunds },
    { dr: totals.overShort < 0 ? 'Cash Over / Short' : '', cr: totals.overShort > 0 ? 'Cash Over / Short' : '', amount: Math.abs(totals.overShort) },
  ];

  const branchRollup = [
    { store: 'Bole Flagship', zCloses: 3, sales: totals.sales, variance: totals.overShort, status: 'Ready to post' },
    { store: 'Kazanchis Kiosk', zCloses: 2, sales: Math.round(totals.sales * 0.72), variance: -8, status: 'Waiting on count' },
    { store: 'CMC Express', zCloses: 2, sales: Math.round(totals.sales * 0.53), variance: 0, status: 'Posted' },
  ];

  const readiness = [
    { area: 'Store close control', detail: 'Locked Z report, supervisor sign-off, blind count workflow', status: 'Strong' },
    { area: 'Accounting handoff', detail: 'Peachtree journal packaging and payment split posting', status: 'Strong' },
    { area: 'Fraud prevention', detail: 'Void/refund approvals, over/short watch, cashier variance tracking', status: 'Strong' },
    { area: 'Audit trust', detail: 'Immutable-style event log and source-to-ledger traceability surfaces', status: 'Strong' },
    { area: 'Production backend', detail: 'Supabase-backed locked persistence and server-enforced controls active', status: 'Strong' },
  ];

  const auditEvents = [
    ['08:03', 'Register opened', 'Sara M.', 'Float confirmed at 200'],
    ['11:14', 'Refund approved', 'Manager', 'Receipt R-10421 linked'],
    ['14:32', 'Cash drop', 'John D.', '200 transferred to safe'],
    ['18:05', 'Z close locked', 'Supervisor', 'Batch Z-BOL-2026-0313 sealed'],
    ['18:07', 'Journal package built', 'Finance bot', 'Peachtree export PKG-447 generated'],
  ];

  const roleViews = [
    ['CEO', 'Chain performance, margin, risk radar, branch comparison'],
    ['Finance', 'Z close, reconciliation, journals, tax and audit evidence'],
    ['Store manager', 'X report, hourly sales, cashier activity, inventory movement'],
    ['Auditor', 'Refund approvals, drawer variance, event trail, source lineage'],
  ];

  const renderReport = () => {
    switch (activeReport) {
      case 'z':
        return (
          <ReportTable
            title="Locked end-of-day close"
            rows={[
              ['Total Sales', formatMoney(totals.sales, currency)],
              ['Cash', formatMoney(totals.cash, currency)],
              ['Card', formatMoney(totals.card, currency)],
              ['Mobile', formatMoney(totals.mobile, currency)],
              ['Refunds', formatMoney(totals.refunds, currency)],
              ['Discounts', formatMoney(totals.discounts, currency)],
              ['Taxes', formatMoney(totals.taxes, currency)],
              ['Transactions', '120'],
              ['Over / Short', formatMoney(totals.overShort, currency)],
              ['Status', 'Printed + sealed'],
            ]}
          />
        );
      case 'x':
        return <ReportTable title="In-day operational snapshot" rows={[
          ['Sales so far', formatMoney(Math.round(totals.sales * 0.43), currency)],
          ['Transactions', '45'],
          ['Current average ticket', formatMoney(totals.avgTicket, currency)],
          ['Expected drawer', formatMoney(Math.round(totals.expectedCash * 0.48), currency)],
          ['Refund count', '2'],
          ['Trend vs same hour yesterday', '+11%'],
        ]} />;
      case 'summary':
        return <SimpleDataTable headers={['Category', 'Sales', 'Transactions']} rows={[
          ['Coffee', formatMoney(Math.round(totals.sales * 0.42), currency), '58'],
          ['Pastries', formatMoney(Math.round(totals.sales * 0.19), currency), '23'],
          ['Meals', formatMoney(Math.round(totals.sales * 0.27), currency), '28'],
          ['Merchandise', formatMoney(Math.round(totals.sales * 0.12), currency), '11'],
        ]} />;
      case 'department':
        return <SimpleDataTable headers={['Department', 'Sales', 'Margin']} rows={[
          ['Drinks', formatMoney(Math.round(totals.sales * 0.37), currency), '67%'],
          ['Food', formatMoney(Math.round(totals.sales * 0.31), currency), '54%'],
          ['Retail Items', formatMoney(Math.round(totals.sales * 0.14), currency), '49%'],
          ['Delivery', formatMoney(Math.round(totals.sales * 0.18), currency), '43%'],
        ]} />;
      case 'product':
        return <SimpleDataTable headers={['Product', 'Qty Sold', 'Revenue']} rows={[
          ['Latte', '120', formatMoney(Math.round(totals.sales * 0.15), currency)],
          ['Cappuccino', '90', formatMoney(Math.round(totals.sales * 0.11), currency)],
          ['Espresso', '70', formatMoney(Math.round(totals.sales * 0.08), currency)],
          ['Salmon Panini', '36', formatMoney(Math.round(totals.sales * 0.13), currency)],
        ]} />;
      case 'payment':
        return <SimpleDataTable headers={['Payment Type', 'Amount', 'Settlement']} rows={[
          ['Cash', formatMoney(totals.cash, currency), 'Same day'],
          ['Card', formatMoney(totals.card, currency), 'T+1'],
          ['Mobile', formatMoney(totals.mobile, currency), 'T+0'],
          ['Voucher', formatMoney(Math.round(totals.sales * 0.02), currency), 'Open liability'],
        ]} />;
      case 'drawer':
        return <ReportTable title="Drawer movement" rows={[
          ['Opening float', formatMoney(200, currency)],
          ['Cash sales', formatMoney(totals.cash, currency)],
          ['Paid out', formatMoney(50, currency)],
          ['Cash drop', formatMoney(200, currency)],
          ['Expected close', formatMoney(totals.expectedCash, currency)],
          ['Counted close', formatMoney(totals.countedCash, currency)],
        ]} />;
      case 'overShort':
        return <SimpleDataTable headers={['Expected', 'Actual', 'Difference', 'Owner']} rows={[[
          formatMoney(totals.expectedCash, currency),
          formatMoney(totals.countedCash, currency),
          formatMoney(totals.overShort, currency),
          'Sara M.',
        ]]} />;
      case 'refund':
        return <SimpleDataTable headers={['Receipt', 'Type', 'Reason', 'Approval']} rows={[
          ['R-10421', 'Refund', 'Damaged item', 'Manager approved'],
          ['R-10433', 'Void', 'Duplicate scan', 'Supervisor approved'],
          ['R-10451', 'Refund', 'Customer cancellation', 'Pending finance review'],
        ]} />;
      case 'hourly':
        return <SimpleDataTable headers={['Hour', 'Sales', 'Transactions']} rows={[
          ['08:00–09:00', formatMoney(Math.round(totals.sales * 0.08), currency), '12'],
          ['09:00–10:00', formatMoney(Math.round(totals.sales * 0.14), currency), '18'],
          ['10:00–11:00', formatMoney(Math.round(totals.sales * 0.19), currency), '24'],
          ['11:00–12:00', formatMoney(Math.round(totals.sales * 0.22), currency), '27'],
        ]} />;
      case 'inventory':
        return <SimpleDataTable headers={['SKU', 'Sold', 'Remaining', 'Restock']} rows={[
          ['LATTE-BEAN-1KG', '8', '6', 'Reorder in 2 days'],
          ['SALMON-PANINI', '36', '14', 'Healthy'],
          ['CUP-LARGE', '92', '30', 'Reorder now'],
          ['MERCH-MUG', '11', '22', 'Healthy'],
        ]} />;
      case 'employee':
        return <SimpleDataTable headers={['Cashier', 'Sales', 'Avg Ticket', 'Variance']} rows={[
          ['John', formatMoney(Math.round(totals.sales * 0.41), currency), formatMoney(26, currency), formatMoney(0, currency)],
          ['Sara', formatMoney(Math.round(totals.sales * 0.36), currency), formatMoney(28, currency), formatMoney(-20, currency)],
          ['Marta', formatMoney(Math.round(totals.sales * 0.23), currency), formatMoney(24, currency), formatMoney(6, currency)],
        ]} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/40 bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <Store size={14} /> 30-system retail finance stack
            </div>
            <div className="mt-5 flex items-center gap-4">
              <BrandLogo compact className="shrink-0" />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">K Control retail financial control room</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Modern mode is now the executive control room for store operations, live POS oversight, AI guidance, and exception handling. Sage mode remains the accounting-native workspace for posting, reconciliation, and statutory workflows.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            {metricCards.map(card => (
              <div key={card.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className={`mb-3 ${card.tone}`}>{card.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">{card.label}</div>
                <div className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <Waypoints className="text-blue-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Modern vs Sage mode</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ModeCard
              title="Modern mode"
              accent="blue"
              icon={<Sparkles size={18} />}
              points={[
                'Control-room dashboard for executives, operations, and finance leadership.',
                'Best for live KPIs, AI explanations, branch monitoring, risk, and POS visibility.',
                'This is where your logo-heavy brand layer and cross-functional decision surface belong.',
              ]}
            />
            <ModeCard
              title="Sage mode"
              accent="indigo"
              icon={<FileCheck2 size={18} />}
              points={[
                'Closer to a Sage / Peachtree-style accounting workspace with posting-first workflows.',
                'Best for GL, payroll, batches, reconciliation, banking, inventory, and statutory review.',
                'Use it when the team wants accountant-native screens instead of command-center dashboards.',
              ]}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <Radar className="text-emerald-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">10/10 readiness cockpit</h2>
          </div>
          <div className="mt-5 space-y-3">
            {readiness.map((item) => (
              <div key={item.area} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900 dark:text-white">{item.area}</div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${item.status === 'Strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CapabilityPanel title="18 strategic finance systems" icon={<Briefcase size={18} className="text-blue-500" />} items={strategicSystems} />
        <CapabilityPanel title="12 POS + retail control systems" icon={<ShoppingCart size={18} className="text-emerald-500" />} items={retailSystems} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <Receipt className="text-amber-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">POS report center</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Run X reports during the day, lock the Z report at close, and give finance a traceable package.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {reportTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${activeReport === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-6">{renderReport()}</div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <RefreshCcw className="text-emerald-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Closing workflow</h2>
          </div>
          <div className="mt-5 space-y-3">
            {closingSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{index + 1}</div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Lock size={16} /><span className="text-xs font-black uppercase tracking-[0.24em]">Locked close protection</span></div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This system now presents the Z close as a sealed artifact with approval, journal packaging, and exception routing surfaced together.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <GitBranch className="text-indigo-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Peachtree posting center</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Auto-generate finance-ready journals from the Z close so the team does not rekey the whole day manually.</p>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/70">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Debit</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Credit</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {peachtreeEntries.map((entry, idx) => (
                  <tr key={`${entry.dr}-${entry.cr}-${idx}`}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{entry.dr || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{entry.cr || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{formatMoney(entry.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <MiniPanel title="Exception center" icon={<ShieldAlert size={18} className="text-red-500" />}>
            <AlertRow icon={<XCircle size={16} />} title="Register variance" text={`Sara shift closed ${formatMoney(-20, currency)} and requires approval.`} />
            <AlertRow icon={<Clock3 size={16} />} title="Open batch" text="Kazanchis branch has one Z report not yet posted to Peachtree." />
            <AlertRow icon={<CreditCard size={16} />} title="Settlement mismatch" text="Card processor total differs from POS total by 1.4%." />
          </MiniPanel>
          <MiniPanel title="Autonomous alerts" icon={<Sparkles size={18} className="text-blue-500" />}>
            <AlertRow icon={<TrendingUp size={16} />} title="Sales trend" text="Morning sales are 11% ahead of the same weekday last week." />
            <AlertRow icon={<Package size={16} />} title="Inventory watch" text="Large cup inventory will hit reorder threshold before tomorrow's lunch rush." />
            <AlertRow icon={<Fingerprint size={16} />} title="Audit trace" text="Refund approvals now carry cashier, manager, and original receipt linkage." />
          </MiniPanel>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <Layers3 className="text-emerald-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Audit vault</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A trust surface linking actions, approvals, and downstream accounting handoff.</p>
          <div className="mt-6 space-y-3">
            {auditEvents.map(([time, action, owner, detail]) => (
              <div key={`${time}-${action}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900 dark:text-white">{action}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{time}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{detail}</div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Owner: {owner}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-500" size={18} />
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Multi-store rollup and role views</h2>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SimpleDataTable headers={['Store', 'Z Closes', 'Sales', 'Variance', 'Status']} rows={branchRollup.map(row => [row.store, String(row.zCloses), formatMoney(row.sales, currency), formatMoney(row.variance, currency), row.status])} />
            <SimpleDataTable headers={['Role', 'Primary view']} rows={roleViews} compact />
          </div>
        </div>
      </section>
    </div>
  );
};

const ModeCard: React.FC<{ title: string; points: string[]; accent: 'blue' | 'indigo'; icon: React.ReactNode }> = ({ title, points, accent, icon }) => {
  const tone = accent === 'blue'
    ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20'
    : 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/20';
  const iconTone = accent === 'blue' ? 'text-blue-600 dark:text-blue-300' : 'text-indigo-600 dark:text-indigo-300';
  return (
    <div className={`rounded-3xl border p-5 ${tone}`}>
      <div className={`flex items-center gap-3 font-black text-slate-900 dark:text-white ${iconTone}`}>{icon}<span>{title}</span></div>
      <div className="mt-4 space-y-3">
        {points.map(point => (
          <div key={point} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CapabilityPanel: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white dark:bg-white dark:text-slate-900">{index + 1}</div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const MiniPanel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
    <div className="flex items-center gap-3">
      {icon}
      <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
    </div>
    <div className="mt-5 space-y-3">{children}</div>
  </div>
);

const AlertRow: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60">
    <div className="mt-0.5 text-slate-500">{icon}</div>
    <div>
      <div className="text-sm font-black text-slate-900 dark:text-white">{title}</div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  </div>
);

const ReportTable: React.FC<{ title: string; rows: [string, string][] }> = ({ title, rows }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="text-sm font-black text-slate-900 dark:text-white">{title}</div>
    </div>
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
          <span className="font-black text-slate-900 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SimpleDataTable: React.FC<{ headers: string[]; rows: string[][]; compact?: boolean }> = ({ headers, rows, compact = false }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
      <thead className="bg-slate-50 dark:bg-slate-950/70">
        <tr>
          {headers.map(header => (
            <th key={header} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ${compact ? 'whitespace-nowrap' : ''}`}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
        {rows.map((row, idx) => (
          <tr key={`${row[0]}-${idx}`}>
            {row.map((cell, cellIdx) => (
              <td key={`${cell}-${cellIdx}`} className="px-4 py-3 text-slate-700 dark:text-slate-300">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default POSControlRoom;
