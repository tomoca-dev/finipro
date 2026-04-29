
export type SystemMode = 'MODERN' | 'SAGE';

export interface GLAccount {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
}

export interface LedgerEntry {
  id: string;
  batch_id: string;
  date: string;
  account_code: string;
  description: string;
  debit: number;
  credit: number;
  currency: string;
  shop_node?: string;
  created_at: string;
}

export interface ShopDocument {
  id: string;
  name: string;
  category: 'LEASE' | 'TAX' | 'LICENSE' | 'POS_REPORT' | 'OTHER';
  uploadedAt: string;
  fileSize: string;
  status: 'VERIFIED' | 'PENDING' | 'ARCHIVED';
}

export interface ShopNode {
  id: string;
  name: string;
  region: 'NORTH' | 'CENTRAL' | 'SOUTH' | 'INTERNATIONAL';
  status: 'ACTIVE' | 'LOCKED' | 'AWAITING_FEED';
  createdAt: string;
  documents: ShopDocument[];
}

export interface Company {
  id: string;
  name: string;
  region: string;
  currency: string;
  isConsolidated: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface SageBatch {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  status: 'PENDING' | 'POSTED' | 'REJECTED' | 'REVERSED' | 'REMOTE_POSTING';
  source: string;
  rowCount: number;
  totalAmount: number;
  trustScore: number;
  postingMethod: 'CASH_RECEIPT' | 'CUSTOMER_INVOICE' | 'BATCH_DEPOSIT';
  taxTotal?: number;
  inventoryImpactCount?: number;
  isAutoApproved?: boolean;
  approvalRequiredBy?: UserRole;
  reversalRef?: string;
  rationale?: string;
  reconVariance?: number;
  backupSeal?: string;
  paymentBreakdown?: {
    cash?: number;
    bank?: number;
    mobile?: number;
    card?: number;
    overShort?: number;
    bankAccountCode?: string;
  };
}

export interface SageRow {
  id: string;
  date: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
  tax?: number;
  qty?: number;
  sku?: string;
  confidence: number;
  rationale: string;
  itemAnalysis?: string;
  isDuplicate?: boolean;
  isOutlier?: boolean;
  suggestions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export enum TransactionType {
  REVENUE = 'REVENUE',
  COGS = 'COGS',
  OPEX = 'OPEX',
  PAYROLL = 'PAYROLL',
  TAX = 'TAX',
  BUDGET = 'BUDGET',
  CAPEX = 'CAPEX'
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ETB' | 'CNY';
export type UserRole = 'CEO' | 'FINANCE' | 'DEPT_HEAD' | 'MANAGER' | 'STAFF' | 'ADMIN';
export type BudgetStatus = 'draft' | 'submitted' | 'approved' | 'locked' | 'DRAFT' | 'APPROVED';
export type GovernanceStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'RESOLVED';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string; 
  role: UserRole;
  department?: string;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
}

export interface FinancialRecord {
  id: string;
  date: string;
  normalizedDate: string;
  amount: number;
  category: string;
  subCategory: string;
  department: string;
  type: TransactionType;
  source: string;
  currency: string;
  confidence?: number;
  rationale?: string;
}

export interface SystemJob {
  id: string;
  type: 'INGESTION' | 'SYNC' | 'RECON';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  throughput: number;
  errorRate: number;
  startedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ALERT' | 'INFO' | 'ERROR';
  timestamp: string;
  read: boolean;
  channel?: 'APP' | 'SLACK' | 'EMAIL';
}

export interface Employee {
  id: string;
  fullName: string;
  photoUrl?: string;
  nationalId: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Casual';
  department: string;
  jobTitle: string;
  supervisor?: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  compensation: CompensationSetup;
  deductions: DeductionProfile;
  bankDetails: BankDetails;
}

export interface CompensationSetup {
  salaryType: 'Monthly' | 'Hourly' | 'Commission-based';
  baseSalary?: number;
  hourlyRate?: number;
  overtimeMultiplier: number;
  allowances: {
    transport: number;
    housing: number;
    meal: number;
    other: number;
  };
  commissionStructure?: string;
  commissionPct?: number;
  bonusEligible: boolean;
}

export interface CustomDeduction {
  id: string;
  label: string;
  amount: number;
  type: 'RECURRING' | 'ONE_TIME';
}

export interface DeductionProfile {
  taxBracketId: string;
  pension: {
    employeePct: number;
    employerPct: number;
  };
  socialSecurity: number;
  insurance: number;
  loanBalance: number;
  loanMonthlyInstallment: number;
  garnishments: number;
  customDeductions: CustomDeduction[];
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  paymentMethod: 'Bank' | 'Cash' | 'Mobile' | 'Split';
}

export interface FinancialActual { date: string; period: string; revenue: number; cogs: number; op_ex: number; currency: string; metadata?: any; }
export interface DepartmentBudget { department: string; envelope: number; allocated: number; status: BudgetStatus; efficiencyScore: number; }
export interface Negotiation { id: string; budget_id: string; department: string; input_snapshot: any; ai_output: any; created_by: string; created_at: string; accepted_flag: boolean; }
export type ActionType = 'SCALE' | 'KILL' | 'FIX' | 'HOLD';
export interface StrategicRecommendation { id: string; initiative: string; action: ActionType; rationale: string; projectedImpact: string; confidence: number; }
export interface PlaybookStep { step: number; action: string; owner: string; timeline: string; }
export interface AuditLog { id: string; actor_id: string; action: string; target_table: string; target_id: string; payload: any; created_at: string; change_reason?: string; }
export interface AccessRequest { id: string; resource: string; reason: string; status: GovernanceStatus; approver_id?: string; created_at: string; }
export interface RiskFlag { id: string; type: string; description: string; severity: RiskSeverity; status: 'OPEN' | 'INVESTIGATED' | 'DISMISSED'; entity?: string; detected_at?: string; }
export interface Report { id: string; name: string; type: string; owner_id: string; file_path: string; metadata?: any; created_at: string; }
export interface SecureShareLink { id: string; report_id: string; token: string; expires_at: string; role_required: UserRole; url: string; created_at: string; }
export interface CompletenessCheck { id: string; area: string; status: string; description: string; }
export interface ForensicAlert { id: string; type: string; severity: string; description: string; }
export interface Connector { id: string; name: string; provider: string; type: string; status: string; lastSync?: string; health: number; }
export interface SchemaBlueprint { collection: string; fields: { name: string; type: string; description: string; required: boolean; }[]; }
export interface ValidationIssue { row?: number; field: string; message: string; severity: string; rationale?: string; }
export interface UnitEconRecord { id: string; name: string; revenue: number; cogs: number; opex: number; units: number; cac: number; }
export interface BudgetLineItem { id: string; category: string; subCategory: string; amount: number; roiTarget: number; department: string; status: string; }
export interface Asset { id: string; name: string; cost: number; purchaseDate: string; usefulLife: number; salvageValue: number; category: string; }
export interface KPIStats { label: string; value: number; prevValue: number; unit: 'currency' | 'percent'; trend: 'up' | 'down'; }
export interface CEOTarget { fiscal_year: number; revenue_target: number; ebitda_target_pct: number; runway_months: number; effective_from: string; }

export interface ExportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface SecurityPolicy {
  samlEnabled: boolean;
  mfaRequired: boolean;
  wormAuditActive: boolean;
  dataResidency: string;
  retentionYears: number;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  successRate: number;
}

export interface ROIMetric {
  label: string;
  value: number;
  target: number;
}
