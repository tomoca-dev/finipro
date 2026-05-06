
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- DEMO AUTH MOCK ---
// If Supabase isn't configured in the environment, we mock the auth so the demo login works without throwing fetch errors.
if (!isSupabaseConfigured()) {
  const mockUser = {
    id: 'demo-admin-id',
    app_metadata: {},
    user_metadata: { full_name: 'Demo Admin', role: 'FINANCE' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'admin@tomoca.com'
  };
  
  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  supabase.auth.getSession = async () => {
    const isMockLoggedin = localStorage.getItem('finops_mock_logged_in') === 'true';
    return { data: { session: isMockLoggedin ? mockSession : null }, error: null } as any;
  };

  supabase.auth.onAuthStateChange = (callback) => {
    return { data: { subscription: { id: 'mock', unsubscribe: () => {} } } } as any;
  };

  supabase.auth.signInWithPassword = async (credentials: any) => {
    const { email, password } = credentials;
    if (email === 'admin@tomoca.com' && password === 'password123') {
      localStorage.setItem('finops_mock_logged_in', 'true');
      setTimeout(() => window.location.reload(), 500); // Reload to trigger app state update
      return { data: { user: mockUser, session: mockSession }, error: null } as any;
    }
    return { data: { user: null, session: null }, error: { name: 'AuthError', message: 'Invalid demo credentials. Use admin@tomoca.com / password123', status: 400 } } as any;
  };

  supabase.auth.signOut = async () => {
    localStorage.removeItem('finops_mock_logged_in');
    setTimeout(() => window.location.reload(), 100);
    return { error: null };
  };
}
// ----------------------

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
