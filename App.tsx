
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import DataIngestion from './components/DataIngestion';
import Financials from './components/Financials';
import Analytics from './components/Analytics';
import BudgetBuilder from './components/BudgetBuilder';
import InsightsEngine from './components/InsightsEngine';
import Sandbox from './components/Sandbox';
import DecisionSupport from './components/DecisionSupport';
import Governance from './components/Governance';
import ExportCenter from './components/ExportCenter';
import Admin from './components/Admin';
import ComplianceWorkspace from './components/ComplianceWorkspace';
import Marketplace from './components/Marketplace';
import DevConsole from './components/DevConsole';
import ImpactDashboard from './components/ImpactDashboard';
import HiringForecaster from './components/HiringForecaster';
import InvestmentEvaluator from './components/InvestmentEvaluator';
import POSControlRoom from './components/POSControlRoom';
import IntegrationHub from './components/IntegrationHub';
import EnterpriseExpansionCenter from './components/EnterpriseExpansionCenter';
import SageModeShell from './components/SageMode/SageModeShell';
import { FinancialRecord, TransactionType, User, CurrencyCode, UserRole, SystemMode, AppTheme } from './types';
import { DEMO_RECORDS } from './constants';
import { convertRecords } from './services/dataEngine';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTrainingMode, setIsTrainingMode] = useState(() => {
    return localStorage.getItem('finops-training-mode') === 'true';
  });
  const [systemMode, setSystemMode] = useState<SystemMode>('MODERN');
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('finops-theme') as AppTheme) || 'midnight';
  });
  const [targetCurrency, setTargetCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('finops-currency') as CurrencyCode) || 'ETB';
  });
  
  // MODERN MODE DATA RESET: Start with zero records
  const [realRecords, setRealRecords] = useState<FinancialRecord[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<FinancialRecord[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('theme-midnight', 'theme-obsidian', 'theme-forest', 'theme-amber', 'theme-amethyst', 'theme-crimson', 'dark');
    
    if (theme !== 'light') {
      document.body.classList.add(`theme-${theme}`);
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('finops-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('finops-currency', targetCurrency);
  }, [targetCurrency]);

  useEffect(() => {
    localStorage.setItem('finops-training-mode', String(isTrainingMode));
  }, [isTrainingMode]);

  const user = useMemo<User | null>(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      role: (session.user.user_metadata?.role as any) || 'FINANCE',
      status: 'ACTIVE'
    };
  }, [session]);

  const rawRecords = isTrainingMode ? trainingRecords : realRecords;
  const records = useMemo(() => convertRecords(rawRecords, targetCurrency), [rawRecords, targetCurrency]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsTrainingMode(false);
    setActiveTab('dashboard');
  };


  const toggleSystemMode = () => setSystemMode(prev => prev === 'MODERN' ? 'SAGE' : 'MODERN');
  const toggleTrainingMode = () => setIsTrainingMode(prev => !prev);

  const handleIngest = (recs: FinancialRecord[]) => {
    if (isTrainingMode) {
      setTrainingRecords(prev => [...recs, ...prev]);
    } else {
      setRealRecords(prev => [...recs, ...prev]);
    }
    // Automatically switch to dashboard to see results
    setActiveTab('dashboard');
  };

  if (!user) return <Auth />;

  if (systemMode === 'SAGE') {
    return (
      <Layout 
        activeTab={activeTab} onTabChange={setActiveTab} user={user}
        onUserChange={() => {}}
        isTrainingMode={isTrainingMode} onToggleTraining={toggleTrainingMode}
        currency={targetCurrency} onCurrencyChange={setTargetCurrency} onLogout={handleLogout}
        theme={theme} onToggleTheme={(t) => setTheme(t || 'light')}
        systemMode={systemMode} onToggleSystemMode={toggleSystemMode}
      >
        <SageModeShell 
          user={user} 
          onIngest={handleIngest} 
          systemMode={systemMode}
          onToggleSystemMode={toggleSystemMode}
          theme={theme}
          onToggleTheme={(t) => setTheme(t || 'light')}
          currency={targetCurrency}
          isTrainingMode={isTrainingMode}
        />
      </Layout>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} onTabChange={setActiveTab} user={user}
      onUserChange={() => {}}
      isTrainingMode={isTrainingMode} onToggleTraining={toggleTrainingMode}
      currency={targetCurrency} onCurrencyChange={setTargetCurrency} onLogout={handleLogout}
      theme={theme} onToggleTheme={(t) => setTheme(t || 'light')}
      systemMode={systemMode} onToggleSystemMode={toggleSystemMode}
    >
      {activeTab === 'dashboard' && <Dashboard records={records} theme={theme} />}
      {activeTab === 'impact' && <ImpactDashboard records={records} />}
      {activeTab === 'hiring' && <HiringForecaster currency={targetCurrency} theme={theme} />}
      {activeTab === 'investments' && <InvestmentEvaluator />}
      {activeTab === 'marketplace' && <Marketplace />}
      {activeTab === 'dev-console' && <DevConsole />}
      {activeTab === 'governance' && <Governance records={records} />}
      {activeTab === 'audit' && <ComplianceWorkspace records={records} />}
      {activeTab === 'decisions' && <DecisionSupport records={records} />}
      {activeTab === 'insights' && <InsightsEngine />}
      {activeTab === 'sandbox' && <Sandbox theme={theme} />}
      {activeTab === 'ingestion' && <DataIngestion onIngest={handleIngest} />}
      {activeTab === 'reports' && <Financials records={records} mode="pandl" />}
      {activeTab === 'budget-builder' && <BudgetBuilder />}
      {activeTab === 'exports' && <ExportCenter records={records} />}
      {activeTab === 'admin' && <Admin />}
      {activeTab === 'pos-control' && <POSControlRoom records={records} currency={targetCurrency} />}
      {activeTab === 'integrations' && <IntegrationHub currency={targetCurrency} />}
      {activeTab === 'enterprise-expansion' && <EnterpriseExpansionCenter />}
    </Layout>
  );
};

export default App;
