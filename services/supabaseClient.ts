
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Local storage fallback for when Supabase is not configured.
 */
export const localDb = {
  get: (key: string) => JSON.parse(localStorage.getItem(`finops_${key}`) || '[]'),
  insert: (key: string, data: any[]) => {
    const existing = JSON.parse(localStorage.getItem(`finops_${key}`) || '[]');
    const newData = data.map(d => ({ ...d, id: d.id || Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }));
    localStorage.setItem(`finops_${key}`, JSON.stringify([...newData, ...existing]));
    return { data: newData, error: null };
  },
  update: (key: string, id: string, updates: any) => {
    const existing = JSON.parse(localStorage.getItem(`finops_${key}`) || '[]');
    const updated = existing.map((item: any) => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(`finops_${key}`, JSON.stringify(updated));
    return { error: null };
  },
  delete: (key: string, id: string) => {
    const existing = JSON.parse(localStorage.getItem(`finops_${key}`) || '[]');
    const filtered = existing.filter((item: any) => item.id !== id);
    localStorage.setItem(`finops_${key}`, JSON.stringify(filtered));
    return { error: null };
  }
};

export const logAuditAction = async (
  actorId: string, 
  action: string, 
  targetTable: string, 
  targetId: string, 
  payload: any
) => {
  const log = {
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    payload,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('audit_logs').insert([log]);
    } catch (e) {
      console.warn('Supabase log failed, falling back to local');
      localDb.insert('audit_logs', [log]);
    }
  } else {
    localDb.insert('audit_logs', [log]);
  }
};
