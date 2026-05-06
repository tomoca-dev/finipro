
import React, { useState } from 'react';
import { 
  BookOpen, Users, Calculator, PieChart, Database, 
  ArrowRight, Settings, FileText, 
  Layers, Search, ShoppingBag, 
  Truck, Landmark, History, ShieldCheck, ClipboardCheck,
  Download, Lock, Save, Activity, RefreshCw,
  Monitor, Globe, Zap, MessageSquare, Cpu, ShieldAlert, Sparkles, GraduationCap,
  Store, Package
} from 'lucide-react';
import SageGLCenter from './SageGLCenter';
import SageReports from './SageReports';
import SageAuditTrail from './SageAuditTrail';
import SageBatchManager from './SageBatchManager';
import SageCustomerCenter from './SageCustomerCenter';
import SageVendorCenter from './SageVendorCenter';
import SageInventoryCenter from './SageInventoryCenter';
import SagePayrollCenter from './SagePayrollCenter';
import SageBankingCenter from './SageBankingCenter';
import SageSystemConfig from './SageSystemConfig';
import SageConnectorCenter from './SageConnectorCenter';
import SageInsightsChat from './SageInsightsChat';
import SageConsolidationCenter from './SageConsolidationCenter';
import SageAutomationMarket from './SageAutomationMarket';
import SagePredictiveHub from './SagePredictiveHub';
import SageSecurityVault from './SageSecurityVault';
import SageShopRegistry from './SageShopRegistry';
import SageShopProfile from './SageShopProfile';
import SageCoreEngine from './SageCoreEngine';
import { User, FinancialRecord, SystemMode, CurrencyCode, ShopNode, AppTheme } from '../../types';
import { CURRENCY_SYMBOLS } from '../../services/dataEngine';

export type SageTab = 'CUSTOMERS' | 'VENDORS' | 'INVENTORY' | 'PAYROLL' | 'BANKING' | 'GL' | 'REPORTS' | 'AUDIT' | 'BATCHES' | 'CONFIG' | 'CONNECTORS' | 'INSIGHTS' | 'CONSOLIDATION' | 'AUTOMATION' | 'PREDICTIVE' | 'SECURITY' | 'CORE_ENGINE' | 'MAINTAIN_ACCOUNTS' | 'BACKUP' | 'SHOPS' | 'SHOP_PROFILE';

interface SageModeShellProps {
  user: User;
  onIngest: (records: FinancialRecord[]) => void;
  systemMode: SystemMode;
  onToggleSystemMode: () => void;
  theme: AppTheme;
  onToggleTheme: (theme?: AppTheme) => void;
  currency: CurrencyCode;
  isTrainingMode: boolean;
}

const SageModeShell: React.FC<SageModeShellProps> = ({ 
  user, onIngest, systemMode, onToggleSystemMode, theme, onToggleTheme,
  currency, isTrainingMode
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SageTab>('SHOPS'); 
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  
  // INITIAL DATA RESET: Shops initialized to empty array
  const [shops, setShops] = useState<ShopNode[]>([]);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const navigateTo = (tab: SageTab, shopId?: string) => {
    if (shopId) setSelectedShopId(shopId);
    setActiveSubTab(tab);
  };

  const handleUpdateShop = (updatedShop: ShopNode) => {
    setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
  };

  const handleAddShop = (newShop: ShopNode) => {
    setShops(prev => [newShop, ...prev]);
  };

  const navigationGroups = [
    {
      group: 'Enterprise Control',
      icon: <Lock size={14} />,
      items: [
        { id: 'SHOPS', label: 'Shop Registry', icon: <Store size={16} /> },
        { id: 'CONSOLIDATION', label: 'Consolidation Hub', icon: <Globe size={16} /> },
        { id: 'SECURITY', label: 'Security & SSO', icon: <ShieldAlert size={16} /> },
        { id: 'AUTOMATION', label: 'Workflow Market', icon: <Cpu size={16} /> },
      ]
    },
    {
      group: 'Daily Tasks',
      icon: <Activity size={14} />,
      items: [
        { id: 'BATCHES', label: 'Verification Queue', icon: <ClipboardCheck size={16} /> },
        { id: 'GL', label: 'General Ledger', icon: <Layers size={16} /> },
        { id: 'CORE_ENGINE', label: 'Financial Core', icon: <BookOpen size={16} /> },
        { id: 'CUSTOMERS', label: 'Customers & A/R', icon: <Users size={16} /> },
        { id: 'VENDORS', label: 'Vendors & A/P', icon: <Truck size={16} /> },
        { id: 'INVENTORY', label: 'Inventory & Stock', icon: <ShoppingBag size={16} /> },
        { id: 'PAYROLL', label: 'Payroll Center', icon: <Users size={16} /> },
        { id: 'BANKING', label: 'Reconcile Bank', icon: <Landmark size={16} /> },
      ]
    },
    {
      group: 'Intelligence',
      icon: <Sparkles size={14} />,
      items: [
        { id: 'PREDICTIVE', label: 'Forecasting Node', icon: <Zap size={16} /> },
        { id: 'INSIGHTS', label: 'AI Forensic Chat', icon: <MessageSquare size={16} /> },
        { id: 'REPORTS', label: 'Financial Reports', icon: <PieChart size={16} /> },
      ]
    },
    {
      group: 'System',
      icon: <Settings size={14} />,
      items: [
        { id: 'CONNECTORS', label: 'SDK & Sync Nodes', icon: <Database size={16} /> },
        { id: 'CONFIG', label: 'Policy Matrix', icon: <Lock size={16} /> },
        { id: 'AUDIT', label: 'Audit Trail', icon: <History size={16} /> },
      ]
    }
  ];

  return (
    <div className={`h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-white dark:bg-slate-950 ${isTrainingMode ? 'border-amber-500/20 border-l-4' : ''}`}>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-slate-100 dark:bg-slate-950 border-r-2 border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-black/40">
             <button 
               onClick={onToggleSystemMode}
               className="w-full group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all shadow-sm"
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform text-white ${isTrainingMode ? 'bg-amber-600' : 'bg-blue-600'}`}>
                      {isTrainingMode ? <GraduationCap size={18} /> : <Monitor size={18} />}
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Architecture</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Return to Modern</p>
                   </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
             </button>
          </div>

          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 flex justify-between items-center">
             <div>
                <h3 className={`text-[10px] font-black uppercase tracking-widest ${isTrainingMode ? 'text-amber-600' : 'text-indigo-500'}`}>
                  {isTrainingMode ? 'TRAINING HUB' : 'Institutional Hub'}
                </h3>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Sage 50 Enterprise</p>
             </div>
             {isTrainingMode ? <GraduationCap size={20} className="text-amber-500" /> : <ShieldCheck size={20} className="text-indigo-500 opacity-50" />}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                  {group.icon} {group.group}
                </h4>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id as SageTab)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all group border ${
                        activeSubTab === item.id 
                        ? (isTrainingMode ? 'bg-amber-50 dark:bg-amber-900/10 shadow-md border-amber-300 dark:border-amber-700/50' : 'bg-white dark:bg-slate-800 shadow-md border-slate-300 dark:border-slate-700')
                        : 'hover:bg-white/50 dark:hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      <div className={`${activeSubTab === item.id ? (isTrainingMode ? 'text-amber-600' : 'text-indigo-600') : 'text-slate-400 group-hover:text-indigo-500'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-tight ${activeSubTab === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-white dark:bg-[#0b0f1a] overflow-y-auto custom-scrollbar">
          {activeSubTab === 'GL' && <SageGLCenter user={user} onPost={onIngest} navigateTo={navigateTo} currency={currency} shops={shops} />}
          {activeSubTab === 'CORE_ENGINE' && <SageCoreEngine user={user} shops={shops} />}
          {activeSubTab === 'REPORTS' && <SageReports />}
          {activeSubTab === 'AUDIT' && <SageAuditTrail />}
          {activeSubTab === 'BATCHES' && <SageBatchManager user={user} currency={currency} navigateTo={navigateTo} shops={shops} />}
          {activeSubTab === 'CUSTOMERS' && <SageCustomerCenter navigateTo={navigateTo} />}
          {activeSubTab === 'VENDORS' && <SageVendorCenter navigateTo={navigateTo} />}
          {activeSubTab === 'INVENTORY' && <SageInventoryCenter navigateTo={navigateTo} />}
          {activeSubTab === 'PAYROLL' && <SagePayrollCenter />}
          {activeSubTab === 'BANKING' && <SageBankingCenter navigateTo={navigateTo} />}
          {activeSubTab === 'CONFIG' && <SageSystemConfig user={user} currency={currency} />}
          {activeSubTab === 'CONNECTORS' && <SageConnectorCenter navigateTo={navigateTo} />}
          {activeSubTab === 'INSIGHTS' && <SageInsightsChat />}
          {activeSubTab === 'CONSOLIDATION' && <SageConsolidationCenter />}
          {activeSubTab === 'AUTOMATION' && <SageAutomationMarket />}
          {activeSubTab === 'PREDICTIVE' && <SagePredictiveHub theme={theme} />}
          {activeSubTab === 'SECURITY' && <SageSecurityVault />}
          {activeSubTab === 'SHOPS' && <SageShopRegistry shops={shops} onAddShop={handleAddShop} navigateTo={navigateTo} />}
          {activeSubTab === 'SHOP_PROFILE' && selectedShopId && (
            <SageShopProfile 
              shop={shops.find(s => s.id === selectedShopId)!} 
              onUpdateShop={handleUpdateShop} 
              onBack={() => setActiveSubTab('SHOPS')} 
            />
          )}
        </main>
      </div>
      
      <footer className={`h-10 border-t-2 px-4 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 transition-colors ${isTrainingMode ? 'bg-amber-100 dark:bg-amber-950 border-amber-500/20' : 'bg-[#f0f0f0] dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded ${isTrainingMode ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
               Entity: {isTrainingMode ? 'SANDBOX_NODE_01' : 'Global North Node'}
            </span>
            <span className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded ${isTrainingMode ? 'bg-amber-400' : 'bg-green-500'}`}></div>
               Mode: {isTrainingMode ? 'TRAINING (EXPERIMENTAL)' : 'PRODUCTION'}
            </span>
            <span className={`flex items-center gap-2 font-mono ${isTrainingMode ? 'text-amber-600' : 'text-indigo-600'}`}>
               Display: {currency} ({currencySymbol})
            </span>
         </div>
         <div className="flex items-center gap-6">
            <span className={`${isTrainingMode ? 'text-amber-600' : 'text-indigo-600'} font-black tracking-widest`}>
              {isTrainingMode ? 'MOCK_AUDIT: BYPASSED' : 'AUDIT_WORM: VALID'}
            </span>
            <span className={`${isTrainingMode ? 'text-amber-600' : 'text-indigo-600'} font-black tracking-widest underline cursor-help`}>
              {isTrainingMode ? 'TRIAL_SESSION: ACTIVE' : 'SOX-404: ALIGNED'}
            </span>
         </div>
      </footer>
    </div>
  );
};

export default SageModeShell;
