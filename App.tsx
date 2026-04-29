
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
import SageModeShell from './components/SageMode/SageModeShell';
import { FinancialRecord, TransactionType, User, CurrencyCode, UserRole, SystemMode } from './types';
import { DEMO_RECORDS } from './constants';
import { convertRecords } from './services/dataEngine';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTrainingMode, setIsTrainingMode] = useState(() => {
    return localStorage.getItem('finops-training-mode') === 'true';
  });
  const [systemMode, setSystemMode] = useState<SystemMode>('MODERN');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('finops-theme') as 'dark' | 'light') || 'dark';
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
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
    if (mockUser) return mockUser;
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      role: (session.user.user_metadata?.role as any) || 'FINANCE',
      status: 'ACTIVE'
    };
  }, [session, mockUser]);

  const rawRecords = isTrainingMode ? trainingRecords : (isDemoMode ? DEMO_RECORDS : realRecords);
  const records = useMemo(() => convertRecords(rawRecords, targetCurrency), [rawRecords, targetCurrency]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMockUser(null);
    setIsDemoMode(false);
    setIsTrainingMode(false);
    setActiveTab('dashboard');
  };

  const handleDemoLogin = (role: UserRole, name: string) => {
    setMockUser({ id: `demo_${role.toLowerCase()}`, name, email: `${role.toLowerCase()}@finops.demo`, role, status: 'ACTIVE' });
    setActiveTab('dashboard');
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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

  if (!user) return <Auth onDemoLogin={handleDemoLogin} />;

  if (systemMode === 'SAGE') {
    return (
      <Layout 
        activeTab={activeTab} onTabChange={setActiveTab} user={user}
        onUserChange={() => {}} isDemoMode={isDemoMode} onToggleDemo={() => setIsDemoMode(!isDemoMode)}
        isTrainingMode={isTrainingMode} onToggleTraining={toggleTrainingMode}
        currency={targetCurrency} onCurrencyChange={setTargetCurrency} onLogout={handleLogout}
        theme={theme} onToggleTheme={toggleTheme}
        systemMode={systemMode} onToggleSystemMode={toggleSystemMode}
      >
        <SageModeShell 
          user={user} 
          onIngest={handleIngest} 
          systemMode={systemMode}
          onToggleSystemMode={toggleSystemMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          currency={targetCurrency}
          isTrainingMode={isTrainingMode}
        />
      </Layout>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} onTabChange={setActiveTab} user={user}
      onUserChange={() => {}} isDemoMode={isDemoMode} onToggleDemo={() => setIsDemoMode(!isDemoMode)}
      isTrainingMode={isTrainingMode} onToggleTraining={toggleTrainingMode}
      currency={targetCurrency} onCurrencyChange={setTargetCurrency} onLogout={handleLogout}
      theme={theme} onToggleTheme={toggleTheme}
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
    </Layout>
  );
};

export default App;
