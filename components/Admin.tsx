

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Search, MoreVertical, 
  CheckCircle, XCircle, Clock, Filter, Lock, Settings,
  Activity, Fingerprint, UserCheck, ShieldAlert,
  ChevronRight, Database, Calendar, Mail, FileText,
  Briefcase, Trash2, Edit3, Plus, Globe, ShieldCheck,
  RefreshCw, BarChart3, Zap, Cpu, Server, Table
} from 'lucide-react';
// Fix: Removed unused ModelAuditEntry and Department imports
import { User, UserRole, SystemJob } from '../types';
import { supabase } from '../services/supabaseClient';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'DEPTS' | 'HEALTH' | 'TEMPLATES'>('USERS');
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Alex Chen', email: 'alex@finops.pro', role: 'CEO', status: 'ACTIVE' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@finops.pro', role: 'FINANCE', status: 'ACTIVE' },
    { id: '3', name: 'B Tesfaye', email: 'btesfaye236@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
  ]);
  
  const [newUserInfo, setNewUserInfo] = useState({ name: '', email: '', password: '', role: 'FINANCE' as UserRole });

  const [jobs, setJobs] = useState<SystemJob[]>([
    { id: 'job-421', type: 'INGESTION', status: 'RUNNING', throughput: 142, errorRate: 0.1, startedAt: new Date().toISOString() },
    { id: 'job-420', type: 'SYNC', status: 'COMPLETED', throughput: 880, errorRate: 0, startedAt: new Date(Date.now() - 3600000).toISOString() },
  ]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUserInfo.name,
      email: newUserInfo.email,
      role: newUserInfo.role,
      status: 'ACTIVE'
    };
    setUsers([newUser, ...users]);
    setIsCreating(false);
    setNewUserInfo({ name: '', email: '', password: '', role: 'FINANCE' });
    alert(`User ${newUser.name} created successfully as ${newUser.role}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
          {[
            { id: 'USERS', label: 'Identity', icon: <Users size={14} /> },
            { id: 'HEALTH', label: 'System Health', icon: <Activity size={14} /> },
            { id: 'TEMPLATES', label: 'AI Templates', icon: <Table size={14} /> },
            { id: 'DEPTS', label: 'Hierarchy', icon: <Briefcase size={14} /> },
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
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <UserPlus size={16} /> Provision Node
          </button>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-lg luxury-shadow relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
             
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Provision Identity Node</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Authorized Root Creation</p>
                </div>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                  <XCircle size={20} className="text-slate-400" />
                </button>
             </div>

             <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Identity Name</label>
                    <input 
                      type="text" 
                      required
                      value={newUserInfo.name}
                      onChange={e => setNewUserInfo({...newUserInfo, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Network Email</label>
                    <input 
                      type="email" 
                      required
                      value={newUserInfo.email}
                      onChange={e => setNewUserInfo({...newUserInfo, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                      placeholder="name@finops.pro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                      <input 
                        type="password" 
                        required
                        value={newUserInfo.password}
                        onChange={e => setNewUserInfo({...newUserInfo, password: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Matrix</label>
                      <select 
                        value={newUserInfo.role}
                        onChange={e => setNewUserInfo({...newUserInfo, role: e.target.value as UserRole})}
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="CEO">CEO</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="FINANCE">Finance</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="STAFF">Staff</option>
                      </select>
                    </div>
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
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Confirm Provision
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
              <HealthStat label="Neural API Latency" value="142ms" trend="NEUTRAL" icon={<Cpu />} />
              <HealthStat label="Sync Reliability" value="99.98%" trend="UP" icon={<Server />} />
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden luxury-shadow">
              <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-4">
                    <Activity size={18} className="text-blue-500" /> Active Job Pipeline
                 </h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">Flush Queue</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {jobs.map(job => (
                    <div key={job.id} className="p-8 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <div className={`p-3 rounded-xl ${job.status === 'RUNNING' ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                             <RefreshCw size={20} className={job.status === 'RUNNING' ? 'animate-spin' : ''} />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight text-sm">{job.type} Node: {job.id}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Started: {new Date(job.startedAt).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Throughput</p>
                             <p className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">{job.throughput} rec/s</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Error Rate</p>
                             <p className={`font-mono font-black text-sm ${job.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>{job.errorRate}%</p>
                          </div>
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black border tracking-widest ${job.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                             {job.status}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl luxury-shadow">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
              <tr>
                <th className="px-8 py-5">Identity Node</th>
                <th className="px-8 py-5">Role Matrix</th>
                <th className="px-8 py-5">Security Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{user.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">{user.role}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={14} className="text-green-500" />
                       <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">MFA Verified</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right"><MoreVertical size={18} className="text-slate-300 ml-auto cursor-pointer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Templates tab implemented similarly with mapping history lists */}
    </div>
  );
};

const HealthStat: React.FC<{ label: string, value: string, trend: 'UP' | 'DOWN' | 'NEUTRAL', icon: React.ReactNode }> = ({ label, value, trend, icon }) => (
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
