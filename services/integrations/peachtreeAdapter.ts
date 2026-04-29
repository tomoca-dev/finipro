import { supabase, isSupabaseConfigured, localDb } from '../supabaseClient';

export interface PeachtreeExportBatch {
  id: string;
  status: 'READY' | 'POSTED' | 'FAILED';
  grossSales: number;
  tax: number;
  overShort: number;
  exportedAt: string;
  journalPreview: string[];
}

const PEACHTREE_TABLE = 'peachtree_batches';

export const getPeachtreeDevBatches = async (): Promise<PeachtreeExportBatch[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from(PEACHTREE_TABLE).select('*').order('exported_at', { ascending: false });
    if (!error && data) return data.map(mapBatchFromDb);
  }
  
  const local = localDb.get(PEACHTREE_TABLE);
  if (local.length > 0) return local.map(mapBatchFromDb);

  const seeds = getInitialBatches();
  localDb.insert(PEACHTREE_TABLE, seeds);
  return seeds;
};

const mapBatchFromDb = (db: any): PeachtreeExportBatch => ({
  id: db.id,
  status: db.status,
  grossSales: db.gross_sales || db.grossSales,
  tax: db.tax,
  overShort: db.over_short || db.overShort,
  exportedAt: db.exported_at || db.exportedAt,
  journalPreview: db.journal_preview || db.journalPreview
});

const getInitialBatches = (): PeachtreeExportBatch[] => [
  { id: 'PT-4011', status: 'POSTED', grossSales: 3250, tax: 487, overShort: -20, exportedAt: new Date().toISOString(), journalPreview: ['Dr Cash', 'Dr Card Receivable', 'Cr Sales Revenue', 'Cr Sales Tax Payable'] },
];
