import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://nyzkthznjqffhmswhrqe.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('invalid'));
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'invalid-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Local storage utility retained only for non-critical UI drafts and graceful reads in legacy components.
 * Authentication never falls back to mock/demo mode.
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

export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

export const resolveLoginIdentifier = async (identifier: string): Promise<string> => {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return trimmed;

  // Admin-friendly shortcut requested for the locked-down login screen.
  if (trimmed === 'admin@2024') return 'btesfaye236@gmail.com';

  // If it looks like a normal email, use it directly.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return trimmed;

  // Otherwise resolve username/display login code through a security-definer RPC.
  try {
    const { data, error } = await supabase.rpc('resolve_login_identifier', {
      p_identifier: trimmed,
    });
    if (!error && data) return String(data).toLowerCase();
  } catch (err) {
    console.warn('Username lookup unavailable; falling back to direct identifier.', err);
  }

  return trimmed;
};

export const ensureDefaultOrganization = async (orgName = 'FinOpsPro'): Promise<string> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not authenticated');

  const { data: memberships, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id')
    .limit(1);

  if (membershipError) throw membershipError;
  if (memberships && memberships.length > 0 && memberships[0].organization_id) {
    return memberships[0].organization_id as string;
  }

  const { data: createdOrgId, error: createError } = await supabase.rpc('create_organization', {
    org_name: orgName,
  });

  if (createError) throw createError;
  if (!createdOrgId) throw new Error('Unable to create organization');
  return createdOrgId as string;
};

export const logAuditAction = async (
  actorId: string,
  action: string,
  targetTable: string,
  targetId: string,
  payload: any,
  organizationId?: string | null
) => {
  const log = {
    organization_id: organizationId ?? payload?.organization_id ?? null,
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    payload,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) {
      console.warn('Supabase audit log failed:', error.message);
      localDb.insert('audit_logs', [log]);
    }
  } else {
    console.warn('Supabase is not configured. Audit log saved locally only.');
    localDb.insert('audit_logs', [log]);
  }
};
