

import React, { useEffect, useState, useMemo } from 'react';
import { NAVIGATION } from '../constants';
import { supabase } from '../services/supabaseClient';
import { CURRENCY_SYMBOLS } from '../services/dataEngine';
import { 
  Menu, X, Bell, User as UserIcon, 
  ChevronDown, Sparkles, MessageSquare, 
  DollarSign, Globe, LogOut, Briefcase, 
  AlertCircle, CheckCircle, Info, Sun, Moon, 
  ToggleLeft, ToggleRight, Database, Slack, Mail,
  ShieldAlert, Settings, Trash2, Coins, GraduationCap
} from 'lucide-react';
// Fix: Removed unused Department import
import { User, CurrencyCode, Notification, SystemMode } from '../types';
import BrandLogo from './BrandLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  user: User;
  onUserChange: (user: User) => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  isTrainingMode: boolean;
  onToggleTraining: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  systemMode: SystemMode;
  onToggleSystemMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, onTabChange, user, isDemoMode, onToggleDemo,
  onLogout, theme, onToggleTheme,
  systemMode, onToggleSystemMode,
  currency, onCurrencyChange,
  isTrainingMode, onToggleTraining
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Suspicious Anomaly', message: 'OpEx spike detected in regional node #4.', type: 'ALERT', timestamp: new Date().toISOString(), read: false, channel: 'SLACK' },
    { id: '2', title: 'Batch Post Success', message: 'Payroll ledger sealed and cryptographically verified.', type: 'SUCCESS', timestamp: new Date().toISOString(), read: true },
  ]);

  const filteredNav = useMemo(() => {
    return NAVIGATION.filter(item => {
      if (user.role === 'CEO' || user.role === 'FINANCE') return true;
      if (user.role === 'STAFF') return ['dashboard'].includes(item.id);
      return ['dashboard', 'budget-builder', 'reports', 'analytics', 'insights', 'exports', 'pos-control', 'integrations'].includes(item.id);
    });
  }, [user.role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-all duration-700 ${
      theme === 'dark' ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-slate-50'
    } ${isTrainingMode ? 'border-4 border-amber-500/30' : ''}`}>
      
      {systemMode === 'MODERN' && (
        <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/[0.05] transition-all duration-500 flex flex-col z-40 ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
          <div className="p-6">
            {isSidebarOpen ? (
              <BrandLogo compact className="justify-start" />
            ) : (
              <div className="flex justify-center"><BrandLogo compact showWordmark={false} /></div>
            )}
            {isTrainingMode && isSidebarOpen && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300">
                <GraduationCap size={12} /> Training mode
              </div>
            )}
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                  activeTab === item.id 
                  ? (isTrainingMode ? 'bg-amber-600 text-white shadow-xl shadow-amber-500/20' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20')
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 dark:hover:text-white'
                }`}
              >
                {item.icon}
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-200 dark:border-white/[0.05]">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-all">
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 border-b border-slate-200 dark:border-white/[0.05] bg-white/50 dark:bg-slate-950/20 backdrop-blur-2xl flex items-center justify-between px-10 z-30 transition-colors ${isTrainingMode ? 'bg-amber-500/5' : ''}`}>
          <div className="flex items-center gap-6">
            <div className="hidden xl:block"><BrandLogo compact className="opacity-90" /></div>
            <h2 className={`text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic ${isTrainingMode ? 'text-amber-600 dark:text-amber-400' : ''}`}>
              {isTrainingMode ? 'TRAINING: ' : ''}{systemMode === 'MODERN' ? NAVIGATION.find(n => n.id === activeTab)?.label : 'SAGE STATUTORY HUB'}
            </h2>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className={`text-[9px] font-black uppercase tracking-widest ${systemMode === 'MODERN' ? 'text-blue-500' : 'text-slate-400'}`}>Modern</span>
              <button onClick={onToggleSystemMode} className="text-slate-400 hover:text-blue-500 transition-colors">
                  {systemMode === 'MODERN' ? <ToggleLeft size={24} /> : <ToggleRight className="text-indigo-500" size={24} />}
              </button>
              <span className={`text-[9px] font-black uppercase tracking-widest ${systemMode === 'SAGE' ? 'text-indigo-500' : 'text-slate-400'}`}>Sage 50</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className={`text-[9px] font-black uppercase tracking-widest ${!isTrainingMode ? 'text-blue-500' : 'text-slate-400'}`}>Production</span>
              <button onClick={onToggleTraining} className="text-slate-400 hover:text-amber-500 transition-colors">
                  {!isTrainingMode ? <ToggleLeft size={24} /> : <ToggleRight className="text-amber-500" size={24} />}
              </button>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isTrainingMode ? 'text-amber-500' : 'text-slate-400'}`}>Training</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isTrainingMode && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl shadow-lg animate-pulse">
                <GraduationCap size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sandbox Active</span>
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <Coins size={14} />
              </div>
              <select 
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-200 appearance-none shadow-sm cursor-pointer min-w-[120px]"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                  <option key={code} value={code}>{code} ({symbol})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={12} />
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">{unreadCount}</div>}
              </button>
              {isNotifyOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 glass-card animate-in fade-in slide-in-from-top-4">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-500">Institutional Alerts</h4>
                     <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                     {notifications.map(n => (
                       <div key={n.id} className={`p-4 rounded-2xl mb-1 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'ALERT' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                          }`}>
                             {n.channel === 'SLACK' ? <Slack size={20} /> : <AlertCircle size={20} />}
                          </div>
                          <div className="flex-1">
                             <p className="text-xs font-black text-slate-900 dark:text-white mb-1">{n.title}</p>
                             <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">"{n.message}"</p>
                             <p className="text-[8px] text-slate-400 mt-2 uppercase font-black">{new Date(n.timestamp).toLocaleTimeString()}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onToggleTheme}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 rounded-xl group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white border shadow-lg transition-all ${isTrainingMode ? 'bg-amber-600 border-amber-500 shadow-amber-900/20' : 'bg-blue-600 border-blue-500 shadow-blue-900/20'}`}>
                  {user.name.charAt(0)}
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-3 z-50 glass-card animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                     <p className="text-xs font-black text-slate-900 dark:text-white">{user.name}</p>
                     <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
                  </div>
                  <button onClick={onLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-400/10 transition-colors flex items-center gap-2 uppercase tracking-widest">
                    <LogOut size={14} /> Security Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${systemMode === 'SAGE' ? 'p-0' : 'p-10'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
