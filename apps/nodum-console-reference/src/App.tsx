/**
 * App Component
 * 
 * NODUM Platform - Sistema multi-tenant para gestão de escolas
 * Arquitetura responsiva com navegação por abas
 */

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SystemsView } from '@/components/systems/SystemsView';
import { SchoolsView } from '@/components/schools/SchoolsView';
import { PlansView } from '@/components/plans/PlansView';
import { UsersView } from '@/components/users/UsersView';
import { FinanceView } from '@/components/finance/FinanceView';
import { EmptyState } from '@/components/EmptyState';
import { Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'systems':
        return <SystemsView />;
      case 'schools':
        return <SchoolsView />;
      case 'plans':
        return <PlansView />;
      case 'users':
        return <UsersView />;
      case 'finance':
        return <FinanceView />;
      case 'settings':
        return (
          <EmptyState
            icon={Settings}
            title="Platform Settings"
            description="Platform configuration and settings panel coming soon."
          />
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - oculta em mobile, visível em desktop */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Header */}
      <div className="lg:ml-64">
        <Header />
      </div>
      
      {/* Main Content - responsivo */}
      <main className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
