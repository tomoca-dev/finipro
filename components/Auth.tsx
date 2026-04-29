
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  ShieldCheck, LogIn, Mail, Lock, Loader2, Sparkles, 
  UserCircle, TrendingUp, SearchCode, Settings, Users 
} from 'lucide-react';
import { UserRole } from '../types';
import BrandLogo from './BrandLogo';

interface AuthProps {
  onDemoLogin: (role: UserRole, name: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'FINANCE' // Safer default role for new signups
          }
        }
      });
      if (error) {
        setError(error.message);
      } else if (data.user && data.session === null) {
        setMessage('Check your email for the confirmation link!');
      }
    }
    setLoading(false);
  };

  const demoRoles = [
    { 
      role: 'CEO' as UserRole, 
      name: 'Alex Chen', 
      icon: <TrendingUp size={20} />, 
      color: 'from-blue-500 to-indigo-600',
      desc: 'Full visibility. Strategy & Governance.'
    },
    { 
      role: 'FINANCE' as UserRole, 
      name: 'Sarah Miller', 
      icon: <SearchCode size={20} />, 
      color: 'from-emerald-500 to-teal-600',
      desc: 'Ledger Audit. Compliance & Ingestion.'
    },
    { 
      role: 'ADMIN' as UserRole, 
      name: 'Jordan Rex', 
      icon: <Settings size={20} />, 
      color: 'from-purple-500 to-pink-600',
      desc: 'RBAC Control. Model Versioning.'
    },
    { 
      role: 'DEPT_HEAD' as UserRole, 
      name: 'Marcus V.', 
      icon: <Users size={20} />, 
      color: 'from-amber-500 to-orange-600',
      desc: 'Budgeting. Unit Economics.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/5 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left: Branding & Value Prop */}
        <div className="hidden lg:block space-y-8">
          <BrandLogo className="items-center" />
          
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Institutional Intelligence <br />
              <span className="text-slate-400 dark:text-slate-500">for Modern Leadership.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-md">
Secure, AI-augmented financial control room for POS operations, store closing, reconciliation, and cleaner Peachtree handoff.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.03] shadow-sm">
              <p className="text-2xl font-black text-slate-900 dark:text-white">256-bit</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">AES Encryption</p>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.03] shadow-sm">
              <p className="text-2xl font-black text-slate-900 dark:text-white">99.9%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Audit Accuracy</p>
            </div>
          </div>
        </div>

        {/* Right: Login & Simulation */}
        <div className="space-y-6">
          <div className="glass-card rounded-[40px] p-10 border border-slate-200 dark:border-white/[0.05] luxury-shadow">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <UserCircle size={24} className="text-blue-500" /> {mode === 'login' ? 'Authorized Access' : 'Create Account'}
            </h3>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <UserCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium dark:text-white" 
                      placeholder="Full Name"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium dark:text-white" 
                    placeholder="Institutional Email"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium dark:text-white" 
                    placeholder="Security Key"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>{mode === 'login' ? 'Authorize Session' : 'Initialize Account'}</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors"
              >
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>

            <div className="mt-10 mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Simulation Center</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {demoRoles.map(demo => (
                <button
                  key={demo.role}
                  onClick={() => onDemoLogin(demo.role, demo.name)}
                  className="group relative p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-white/20 transition-all text-left overflow-hidden shadow-sm"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`}></div>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center text-white mb-3 shadow-lg transition-transform group-hover:scale-110`}>
                    {demo.icon}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{demo.role.replace('_', ' ')}</h4>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 leading-tight">{demo.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-tighter flex items-center gap-2">
                <Sparkles size={12} className="text-blue-500" /> AES-256 Multi-Zone Security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
