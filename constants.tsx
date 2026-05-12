
import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Wallet,
  BrainCircuit,
  TestTube2,
  Gavel,
  ShieldAlert,
  Share2,
  Settings,
  SearchCode,
  Box,
  Puzzle,
  Code2,
  Leaf,
  Users,
  Briefcase,
  Store,
  PlugZap,
  DatabaseZap
} from 'lucide-react';
import { TransactionType, FinancialRecord } from './types';

export const NAVIGATION = [
  { id: 'dashboard', label: 'CEO Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ceo', 'finance', 'dept_head', 'manager', 'staff'] },
  { id: 'hiring', label: 'Hiring ROI', icon: <Users size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'investments', label: 'Investment Evaluator', icon: <Briefcase size={20} />, roles: ['ceo', 'finance'] },
  { id: 'impact', label: 'ESG & Impact', icon: <Leaf size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'marketplace', label: 'Connectors', icon: <Puzzle size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'dev-console', label: 'Dev Console', icon: <Code2 size={20} />, roles: ['ceo', 'finance'] },
  { id: 'governance', label: 'Forensics & Risk', icon: <ShieldAlert size={20} />, roles: ['ceo', 'finance'] },
  { id: 'audit', label: 'Audit & Compliance', icon: <SearchCode size={20} />, roles: ['ceo', 'finance'] },
  { id: 'decisions', label: 'Strategic Decisions', icon: <Gavel size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'insights', label: 'AI Insights Engine', icon: <BrainCircuit size={20} />, roles: ['ceo', 'finance', 'dept_head', 'manager'] },
  { id: 'sandbox', label: 'Strategic Sandbox', icon: <TestTube2 size={20} />, roles: ['ceo', 'finance'] },
  { id: 'exports', label: 'Export Center', icon: <Share2 size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'ingestion', label: 'Data Ingestion', icon: <Upload size={20} />, roles: ['ceo', 'finance'] },
  { id: 'pos-control', label: 'POS Control Room', icon: <Store size={20} />, roles: ['ceo', 'finance', 'manager'] },
  { id: 'integrations', label: 'Integration Hub', icon: <PlugZap size={20} />, roles: ['ceo', 'finance', 'manager'] },
  { id: 'enterprise-expansion', label: 'ERP Expansion', icon: <DatabaseZap size={20} />, roles: ['ceo', 'finance', 'manager'] },
  { id: 'reports', label: 'P&L Reports', icon: <FileText size={20} />, roles: ['ceo', 'finance', 'dept_head', 'manager'] },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, roles: ['ceo', 'finance', 'dept_head', 'manager'] },
  { id: 'budget-builder', label: 'Budget Builder', icon: <Wallet size={20} />, roles: ['ceo', 'finance', 'dept_head'] },
  { id: 'admin', label: 'RBAC & Admin', icon: <Settings size={20} />, roles: ['ceo', 'finance'] },
];

export const MOCK_DEPARTMENTS = [
  'Sales', 'Engineering', 'Marketing', 'Product', 'Operations', 'Finance', 'Legal'
];

export const CANONICAL_CATEGORIES = {
  REVENUE: ['Subscription', 'Services', 'Licensing', 'E-commerce'],
  COGS: ['Server Costs', 'Support Tools', 'Merchant Fees', 'Inventory Cost'],
  OPEX: ['Rent', 'Software Subscriptions', 'Travel', 'Marketing Spend'],
  PAYROLL: ['Salaries', 'Bonuses', 'Benefits', 'Contractors'],
  CAPEX: ['Machinery', 'IT Hardware', 'Vehicles']
};

export const DEMO_RECORDS: FinancialRecord[] = Array.from({ length: 80 }).flatMap((_, i) => {
  const month = 11 - Math.floor(i / 7);
  const date = `2023-${String(month).padStart(2, '0')}-15`;
  return [
    {
      id: `demo-rev-${i}`,
      date,
      normalizedDate: date,
      amount: 120000 + Math.random() * 20000,
      category: 'Subscription',
      subCategory: 'Enterprise License',
      department: 'Sales',
      type: TransactionType.REVENUE,
      source: 'Salesforce Demo',
      currency: 'USD'
    },
    {
      id: `demo-exp-${i}`,
      date,
      normalizedDate: date,
      amount: 45000 + Math.random() * 5000,
      category: 'Infrastructure',
      subCategory: 'Cloud Hosting (AWS)',
      department: 'Engineering',
      type: TransactionType.OPEX,
      source: 'AWS Demo',
      currency: 'USD'
    }
  ];
});
