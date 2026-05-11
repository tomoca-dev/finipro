import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  ShieldCheck, LogIn, Mail, Lock, Loader2, Sparkles, 
  UserCircle, Activity, Globe, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mode] = useState<'login'>('login');
  const [email, setEmail] = useState('btesfaye236@gmail.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#050505] overflow-hidden font-sans">
      
      {/* Left Canvas - Dynamic Brand & Value Prop */}
      <div className="hidden lg:flex lg:w-[65%] relative flex-col justify-between p-16 xl:p-24 overflow-hidden">
        {/* Dynamic mesh background */}
        <div className="absolute inset-0 bg-[#050505] z-0">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.1),transparent_70%)]"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(99,102,241,0.1),transparent_70%)]"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(231,138,34,0.05),transparent_80%)]"></div>
           {/* Moving grid lines */}
           <div className="absolute inset-0 opacity-20" style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
             backgroundSize: '60px 60px',
             maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)'
           }}></div>
        </div>


        <div className="relative z-10 mt-4">
          <BrandLogo className="scale-[2.5] origin-left mb-20 ml-6" />
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md mb-12 mt-8">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">Enterprise Financial Core Engine</span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <h1 className="text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-10">
            Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Absolute Control</span> Over Your Operations.
          </h1>
          <p className="text-slate-400 text-xl font-medium leading-relaxed mb-16 max-w-2xl">
            A unified intelligence room combining zero-trust ledger compliance, automated Z-report sealing, and deep Peachtree integration capability.
          </p>

          <div className="grid grid-cols-2 gap-10">
            {[
              { icon: <ShieldCheck size={24}/>, label: 'Immutable Audit Trail' },
              { icon: <Activity size={24}/>, label: 'Real-time Pos Sync' },
              { icon: <Globe size={24}/>, label: 'Multi-node Retail' },
              { icon: <Zap size={24}/>, label: 'Instant Reconciliation' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-lg backdrop-blur-md">
                  {item.icon}
                </div>
                <span className="text-base font-bold text-slate-300 tracking-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 border-t border-white/10 pt-8 mt-12">
          <div className="flex -space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white font-bold text-xs">AC</div>
            <div className="w-12 h-12 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-white font-bold text-xs">JD</div>
            <div className="w-12 h-12 rounded-full bg-emerald-600 border-2 border-slate-900 flex items-center justify-center text-white font-bold text-xs">+9</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-yellow-400 mb-1">
              {[1,2,3,4,5].map(i => <Sparkles key={i} size={12} className="fill-current" />)}
            </div>
            <p className="text-xs font-medium text-slate-400">Trusted by tier-1 enterprise teams globally.</p>
          </div>
        </div>
      </div>

      {/* Right Canvas - The Vault Login */}
      <div className="w-full lg:w-[35%] flex items-center justify-center p-8 relative">
        {/* Unified dark background */}
        <div className="absolute inset-0 bg-[#050505] -z-10"></div>

        
        <div className="w-full max-w-md">
          {/* Mobile logo fallback */}
          <div className="lg:hidden flex justify-center mb-10">
             <BrandLogo />
          </div>

          <div className="glass-card bg-white dark:bg-slate-900/60 rounded-[40px] p-10 border border-slate-200 dark:border-white/10 luxury-shadow relative overflow-hidden backdrop-blur-2xl">
            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 transform rotate-3">
                 <Lock size={28} className="text-white -rotate-3" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Institutional Login
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-2">
                Authenticate to access the control room
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">

              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm" 
                    placeholder="name@institution.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-bold text-white shadow-sm" 
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-[11px] font-bold text-center flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> {error}
                </div>
              )}

              {message && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-[11px] font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} /> {message}
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Authorize Session'}
                  {!loading && <ChevronRight size={16} />}
                </button>
              </div>
            </form>



          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
