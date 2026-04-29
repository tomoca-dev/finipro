
import { FinancialRecord, TransactionType, Asset, CurrencyCode, FinancialActual } from "../types";

// Base currency is USD (1.0)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.94,
  GBP: 0.79,
  ETB: 124.5, // Ethiopian Birr
  CNY: 7.23
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ETB: 'Br',
  CNY: '¥'
};

/**
 * Converts records to the target currency based on their original currency.
 */
export const convertRecords = (records: FinancialRecord[], targetCurrency: CurrencyCode): FinancialRecord[] => {
  const targetRate = EXCHANGE_RATES[targetCurrency];
  
  return records.map(record => {
    const sourceRate = EXCHANGE_RATES[record.currency || 'USD'];
    const amountInUSD = record.amount / sourceRate;
    const convertedAmount = amountInUSD * targetRate;
    
    return {
      ...record,
      amount: convertedAmount,
      currency: targetCurrency
    };
  });
};

/**
 * Normalizes raw data into FinancialActual DDL format.
 */
export const normalizeToActuals = (rawData: any[], mapping: any, currency: string = 'USD'): Partial<FinancialActual>[] => {
  return rawData.map((row) => {
    const rawVal = row[mapping.amount];
    const amountStr = String(rawVal || '0').replace(/[^0-9.-]+/g, "");
    const amount = parseFloat(amountStr);
    
    const category = String(row[mapping.category] || '').toUpperCase();
    const description = String(row[mapping.description] || '').toUpperCase();
    
    let revenue = 0;
    let cogs = 0;
    let op_ex = 0;

    // Classification Logic for financial_actuals columns
    if (category.includes('REVENUE') || category.includes('SALES') || description.includes('INCOME')) {
      revenue = amount;
    } else if (category.includes('COGS') || description.includes('INVENTORY') || description.includes('SERVER')) {
      cogs = amount;
    } else {
      op_ex = amount;
    }

    const date = new Date(row[mapping.date] || Date.now());
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return {
      date: date.toISOString().split('T')[0],
      period,
      revenue,
      cogs,
      op_ex,
      currency,
      metadata: { original_row: row }
    };
  });
};

/**
 * Legacy normalization for FinancialRecord local state
 */
export const normalizeData = (rawData: any[], mapping: any): FinancialRecord[] => {
  return rawData.map((row, index) => {
    const rawVal = row[mapping.amount];
    const amountStr = String(rawVal || '0').replace(/[^0-9.-]+/g, "");
    const amount = parseFloat(amountStr);
    
    let type = TransactionType.OPEX;
    const category = String(row[mapping.category] || '').toUpperCase();
    const subCategory = String(row[mapping.description] || '').toUpperCase();

    if (category.includes('SALARY') || subCategory.includes('PAYROLL')) type = TransactionType.PAYROLL;
    else if (category.includes('REVENUE') || category.includes('SALES')) type = TransactionType.REVENUE;
    else if (category.includes('ASSET') || category.includes('EQUIPMENT')) type = TransactionType.CAPEX;

    return {
      id: `rec_${Date.now()}_${index}`,
      date: String(row[mapping.date] || new Date().toISOString()),
      normalizedDate: new Date(row[mapping.date]).toISOString().split('T')[0],
      amount,
      category: row[mapping.category] || 'Uncategorized',
      subCategory: row[mapping.description] || 'General Transaction',
      department: row[mapping.department] || 'Institutional Overhead',
      type,
      source: 'AI-Augmented Ingestion',
      currency: 'USD'
    };
  });
};

export const getAggregates = (records: FinancialRecord[], period: 'month' | 'week') => {
  const grouped: Record<string, { revenue: number; expense: number; budget: number }> = {};
  
  records.forEach(r => {
    const key = period === 'month' ? r.normalizedDate.substring(0, 7) : r.normalizedDate;
    if (!grouped[key]) grouped[key] = { revenue: 0, expense: 0, budget: 0 };
    
    if (r.type === TransactionType.REVENUE) {
      grouped[key].revenue += r.amount;
    } else if (r.type === TransactionType.BUDGET) {
      grouped[key].budget += r.amount;
    } else {
      grouped[key].expense += r.amount;
    }
  });

  return Object.entries(grouped).map(([date, vals]) => ({
    date,
    ...vals,
    profit: vals.revenue - vals.expense
  })).sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateHealthIndex = (records: FinancialRecord[]) => {
  const rev = records.filter(r => r.type === TransactionType.REVENUE).reduce((s, r) => s + r.amount, 0);
  const exp = records.filter(r => r.type !== TransactionType.REVENUE && r.type !== TransactionType.BUDGET).reduce((s, r) => s + r.amount, 0);
  if (rev === 0) return 50; 
  const margin = (rev - exp) / rev;
  const score = Math.min(100, Math.max(0, (margin * 100) + 50));
  return Math.round(score);
};

export const getRankedDrivers = (records: FinancialRecord[]) => {
  const catMap: Record<string, number> = {};
  records.filter(r => r.type === TransactionType.REVENUE).forEach(r => {
    catMap[r.subCategory] = (catMap[r.subCategory] || 0) + r.amount;
  });
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, trend: 'up' as const }));
};

export const getRankedKillers = (records: FinancialRecord[]) => {
  const catMap: Record<string, number> = {};
  records.filter(r => r.type === TransactionType.OPEX || r.type === TransactionType.COGS).forEach(r => {
    catMap[r.subCategory] = (catMap[r.subCategory] || 0) + r.amount;
  });
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, trend: 'up' as const }));
};

export const calculateDepreciation = (assets: Asset[]) => {
  return assets.reduce((sum, asset) => {
    const annualDep = (asset.cost - asset.salvageValue) / asset.usefulLife;
    return sum + (annualDep / 12);
  }, 0);
};
