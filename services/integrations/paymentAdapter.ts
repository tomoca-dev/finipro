import { isSupabaseConfigured, supabase, localDb } from '../supabaseClient';

export interface PaymentAcceptanceSummary {
  approvedAmount: number;
  declinedAmount: number;
  queuedSettlements: number;
  acceptanceRate: number;
  sandboxMode: boolean;
}

export const getPaymentAcceptanceSummary = async (): Promise<PaymentAcceptanceSummary> => {
  // In a real production app, we would query the transactions table
  // For now, we fetch from a summary table or use the persistent localDb
  const SUMMARY_TABLE = 'payment_summaries';
  
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from(SUMMARY_TABLE).select('*').single();
    if (data) return data;
  }

  const local = localDb.get(SUMMARY_TABLE);
  if (local.length > 0) return local[0];

  const seed = {
    approvedAmount: 18450,
    declinedAmount: 920,
    queuedSettlements: 14,
    acceptanceRate: 95.3,
    sandboxMode: false,
  };
  
  localDb.insert(SUMMARY_TABLE, [seed]);
  return seed;
};
