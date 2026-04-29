
import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Lock, UserCheck, Key, Globe, 
  Database, ToggleLeft, ToggleRight, FileCheck, RefreshCw,
  Fingerprint, ShieldX, Terminal, Loader2
} from 'lucide-react';

const SageSecurityVault: React.FC = () => {
  const [policies, setPolicies] = useState({
    saml: true,
    mfa: true,
    worm: true,
    ipLock: false,
    auditSign: true
  });

  const [isSealing, setIsSealing] = useState(false);
  const [isUpdatingPolicy, setIsUpdatingPolicy] = useState(false);

  const togglePolicy = (key: keyof typeof policies) => {
    setIsUpdatingPolicy(true);
    setTimeout(() => {
      setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
      setIsUpdatingPolicy(false);
    }, 600);
  };

  const handleAuditSeal = () => {
    setIsSealing(true);
    setTimeout(() => {
      setIsSealing(false);
      alert("Ledger State SHA-256 Seal: 0x88219B...C42 Validated and Persisted.");
    }, 1800);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Security & Governance Vault</h2>
          <p className="text-sm text-slate-500 font-medium">Enterprise SSO & WORM Immutable Compliance Store</p>
        </div>
        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-center gap-4 shadow-sm">
           <ShieldCheck size={24} className="text-green-600" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Registry Integrity</span>
              <span className="text-[9px] font-mono text-green-500 opacity-60">SHA-256 Verified 0xAF91</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10 relative">
            {isUpdatingPolicy && (
               <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-[40px]">
                  <Loader2 size={32} className="text-indigo-600 animate-spin" />
               </div>
            )}
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Key size={24} /></div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Directory Sync & SAML</h3>
               </div>
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><RefreshCw size={18} /></button>
            </div>
            
            <div className="space-y-8">
               <SecurityToggle 
                 label="SAML 2.0 Auth Node" 
                 description="Route institutional access through Azure AD / Okta." 
                 active={policies.saml} 
                 onToggle={() => togglePolicy('saml')}
               />
               <SecurityToggle 
                 label="Adaptive MFA Enforcement" 
                 description="Mandatory FIDO2 / TOTP for high-value ledger operations." 
                 active={policies.mfa} 
                 onToggle={() => togglePolicy('mfa')}
               />
               <SecurityToggle 
                 label="Network Ingress IP Lock" 
                 description="Restrict access to authorized VPC CIDR blocks." 
                 active={policies.ipLock} 
                 onToggle={() => togglePolicy('ipLock')}
               />
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[40px] p-10 luxury-shadow space-y-10">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><FileCheck size={24} /></div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Immutable Compliance</h3>
               </div>
               <button 
                 onClick={handleAuditSeal}
                 disabled={isSealing}
                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
               >
                  {isSealing ? <Loader2 size={12} className="animate-spin" /> : <Fingerprint size={12} />}
                  Seal Ledger
               </button>
            </div>
            
            <div className="space-y-8">
               <SecurityToggle 
                 label="WORM Enforcement (W-O-R-M)" 
                 description="Immutable registry logic. Historical entries cannot be altered." 
                 active={policies.worm} 
                 onToggle={() => togglePolicy('worm')}
               />
               
               <div className="p-10 bg-slate-900 text-indigo-100 rounded-[32px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000"><ShieldAlert size={100} /></div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Statutory Retention Node</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-80 mb-8 italic">
                     "Ledger state is cryptographically signed and mirrored to regional nodes for a 7-year retention window."
                  </p>
                  <div className="flex justify-between items-center pt-8 border-t border-white/10">
                     <div className="flex items-center gap-4">
                        <Database size={20} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Node: EU-WEST-1 (Active)</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SecurityToggle: React.FC<{ label: string, description: string, active: boolean, onToggle: () => void }> = ({ label, description, active, onToggle }) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group">
     <div className="max-w-xs">
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{label}</h4>
        <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">"{description}"</p>
     </div>
     <button onClick={onToggle} className="text-indigo-600 transition-all active:scale-90">
        {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-slate-400" />}
     </button>
  </div>
);

export default SageSecurityVault;
