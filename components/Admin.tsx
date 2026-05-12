import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
  Zap,
  Cpu,
  Server,
} from 'lucide-react';
import { ensureDefaultOrganization, supabase } from '../services/supabaseClient';
import { SystemJob } from '../types';

type AppRole = 'admin' | 'ceo' | 'accountant' | 'finance_admin' | 'manager' | 'cashier' | 'auditor' | 'operations' | 'viewer' | 'owner';

type MemberRow = {
  organization_id: string;
  role: AppRole;
  profiles?: {
    id: string;
    email: string | null;
    full_name: string | null;
    username: string | null;
    disabled: boolean | null;
    is_platform_admin: boolean | null;
  } | null;
};

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  ceo: 'CEO',
  accountant: 'Accountant',
  finance_admin: 'Finance Admin',
  manager: 'Manager',
  cashier: 'Cashier',
  auditor: 'Auditor',
  operations: 'Operations',
  viewer: 'Viewer',
  owner: 'Owner',
};

const roleOptions: AppRole[] = ['owner', 'ceo', 'accountant', 'finance_admin', 'manager', 'cashier', 'auditor', 'operations', 'viewer'];

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'HEALTH'>('USERS');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'accountant' as AppRole,
  });

  const [jobs] = useState<SystemJob[]>([
    { id: 'job-421', type: 'INGESTION', status: 'RUNNING', throughput: 142, errorRate: 0.1, startedAt: new Date().toISOString() },
    { id: 'job-420', type: 'SYNC', status: 'COMPLETED', throughput: 880, errorRate: 0, startedAt: new Date(Date.now() - 3600000).toISOString() },
  ]);

  const [showAllOrgs, setShowAllOrgs] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  const loadMembers = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const orgId = await ensureDefaultOrganization('FinOpsPro');
      setOrganizationId(orgId);

      const { data: userProfile } = await supabase.from('profiles').select('is_platform_admin').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
      setIsPlatformAdmin(!!userProfile?.is_platform_admin);

      let data: any[] | null = null;
      let fetchError: any = null;

      if (showAllOrgs) {
        // Fetch all profiles and their primary organization role if any
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            username,
            disabled,
            is_platform_admin,
            organization_members (
              role,
              organization_id
            )
          `)
          .order('created_at', { ascending: false });
        
        data = profiles;
        fetchError = error;

        if (!fetchError) {
          setMembers((profiles || []).map((p: any) => ({
            organization_id: p.organization_members?.[0]?.organization_id || 'PLATFORM',
            role: p.is_platform_admin ? 'admin' : (p.organization_members?.[0]?.role || 'viewer'),
            profiles: p
          })));
        }
      } else {
        const { data: members, error } = await supabase
          .from('organization_members')
          .select(`
            organization_id,
            role,
            profiles:user_id (
              id,
              email,
              full_name,
              username,
              disabled,
              is_platform_admin
            )
          `)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });
        
        data = members;
        fetchError = error;

        if (!fetchError) {
          setMembers(members as unknown as MemberRow[]);
        }
      }

      if (fetchError) throw fetchError;
    } catch (err: any) {
      setError(err?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [showAllOrgs]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          organization_id: organizationId,
          email: newUserInfo.email.trim().toLowerCase(),
          password: newUserInfo.password,
          full_name: newUserInfo.fullName.trim(),
          username: newUserInfo.username.trim().toLowerCase(),
          role: newUserInfo.role,
        },
      });

      // If there's an error object, try to see if it has a message in the data
      if (error || data?.ok === false) {
        const message = data?.error || error?.message || 'An unexpected error occurred.';
        throw new Error(message);
      }

      setNotice(`${newUserInfo.fullName || newUserInfo.email} created as ${roleLabels[newUserInfo.role]}.`);
      setIsCreating(false);
      setNewUserInfo({ fullName: '', email: '', username: '', password: '', role: 'accountant' });
      await loadMembers();
    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err?.message || 'Unable to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (profileId: string, orgId: string, role: AppRole) => {
    const targetOrgId = (!orgId || orgId === 'PLATFORM') ? organizationId : orgId;
    if (!targetOrgId) return;
    
    setError(null);
    setNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        method: 'PATCH',
        body: {
          target_user_id: profileId,
          organization_id: targetOrgId,
          role: role,
        },
      });
      if (error || data?.ok === false) throw new Error(data?.error || error?.message || 'Role update failed');
      setNotice('Role updated.');
      await loadMembers();
    } catch (err: any) {
      setError(err?.message || 'Unable to update role.');
    }
  };

  const handlePlatformAdminToggle = async (profileId: string, currentStatus: boolean) => {
    setError(null);
    setNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        method: 'PATCH',
        body: {
          target_user_id: profileId,
          is_platform_admin: !currentStatus,
        },
      });
      if (error || data?.ok === false) throw new Error(data?.error || error?.message || 'Platform admin update failed');
      setNotice(!currentStatus ? 'User promoted to Platform Admin.' : 'User removed from Platform Admins.');
      await loadMembers();
    } catch (err: any) {
      setError(err?.message || 'Unable to update platform admin status.');
    }
  };

  const handleDisableUser = async (profileId: string, currentStatus: boolean) => {
    setError(null);
    setNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        method: 'PATCH',
        body: {
          target_user_id: profileId,
          disabled: !currentStatus,
        },
      });
      if (error || data?.ok === false) throw new Error(data?.error || error?.message || 'Status update failed');
      setNotice(currentStatus ? 'User enabled.' : 'User disabled.');
      await loadMembers();
    } catch (err: any) {
      setError(err?.message || 'Unable to update user status.');
    }
  };

  const handleDeleteUser = async (profileId: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
    setError(null);
    setNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        method: 'DELETE',
        body: { target_user_id: profileId },
      });
      if (error || data?.ok === false) throw new Error(data?.error || error?.message || 'Deletion failed');
      setNotice('User deleted.');
      await loadMembers();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete user.');
    }
  };

  const userRows = useMemo(() => members.filter(m => m.profiles), [members]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm w-fit">
          {[
            { id: 'USERS', label: 'Admin Users', icon: <Users size={14} /> },
            { id: 'HEALTH', label: 'System Health', icon: <Activity size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'USERS' && (
          <div className="flex flex-wrap gap-3">
            {isPlatformAdmin && (
              <button
                onClick={() => setShowAllOrgs(!showAllOrgs)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showAllOrgs ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600'}`}
              >
                <Eye size={16} /> {showAllOrgs ? 'All Organizations' : 'Current Organization'}
              </button>
            )}
            <button
              onClick={loadMembers}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <UserPlus size={16} /> Create User
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-3">
          <CheckCircle size={18} /> {notice}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-lg luxury-shadow relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create Admin-Controlled User</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">No public signup. Admin creates every account.</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserInfo.fullName}
                  onChange={e => setNewUserInfo({ ...newUserInfo, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                  placeholder="Example: Sara Accountant"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUserInfo.email}
                    onChange={e => setNewUserInfo({ ...newUserInfo, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUserInfo.username}
                    onChange={e => setNewUserInfo({ ...newUserInfo, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                    placeholder="name@2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newUserInfo.password}
                    onChange={e => setNewUserInfo({ ...newUserInfo, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                  <select
                    value={newUserInfo.role}
                    onChange={e => setNewUserInfo({ ...newUserInfo, role: e.target.value as AppRole })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white appearance-none"
                  >
                    {roleOptions.map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />} Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'HEALTH' && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HealthStat label="Avg Ingestion Throughput" value="1.2k rec/s" trend="UP" icon={<Zap />} />
            <HealthStat label="API Latency" value="142ms" trend="NEUTRAL" icon={<Cpu />} />
            <HealthStat label="Sync Reliability" value="99.98%" trend="UP" icon={<Server />} />
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl luxury-shadow">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{showAllOrgs ? 'Global Platform Users' : 'Organization Members'}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {showAllOrgs 
                  ? 'All users across the platform. Use with caution.' 
                  : 'Users linked to this organization with specific roles.'}
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> {isPlatformAdmin ? 'Platform Admin Access' : 'Organization Admin Access'}
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center text-slate-500 font-bold gap-3">
              <Loader2 size={18} className="animate-spin" /> Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[1000px]">
                <thead className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                  <tr>
                    <th className="px-8 py-5">Identity</th>
                    <th className="px-8 py-5">Username</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {userRows.map(row => {
                    const profile = row.profiles!;
                    const name = profile.full_name || profile.email || 'User';
                    return (
                      <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{name.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{profile.email}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs font-mono font-bold text-slate-500">{profile.username || '—'}</td>
                        <td className="px-8 py-6">
                          <select
                            value={row.role}
                            disabled={showAllOrgs && !isPlatformAdmin && row.role !== 'admin'}
                            onChange={e => handleRoleChange(profile.id, row.organization_id, e.target.value as AppRole)}
                            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/10 outline-none"
                          >
                            {(['admin', ...roleOptions] as AppRole[]).map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}
                          </select>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {profile.disabled ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${profile.disabled ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                              {profile.disabled ? 'Disabled' : profile.is_platform_admin ? 'Platform Admin' : 'Active'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPlatformAdmin && (
                              <button
                                onClick={() => handlePlatformAdminToggle(profile.id, !!profile.is_platform_admin)}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.is_platform_admin ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
                              >
                                <Zap size={13} /> {profile.is_platform_admin ? 'Revoke Platform' : 'Make Platform'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDisableUser(profile.id, !!profile.disabled)}
                              disabled={Boolean(profile.is_platform_admin && !isPlatformAdmin)}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.disabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'} disabled:opacity-30`}
                            >
                              <ShieldCheck size={13} /> {profile.disabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(profile.id)}
                              disabled={Boolean(profile.is_platform_admin)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {userRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-bold">No users found in this view.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HealthStat: React.FC<{ label: string; value: string; trend: 'UP' | 'DOWN' | 'NEUTRAL'; icon: React.ReactNode }> = ({ label, value, trend, icon }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 luxury-shadow group hover:border-blue-500/50 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${trend === 'UP' ? 'bg-green-500/10 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{trend}</span>
    </div>
    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 font-mono">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

export default Admin;
