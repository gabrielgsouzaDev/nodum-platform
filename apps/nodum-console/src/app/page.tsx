'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { SystemsTab } from '@/components/dashboard/SystemsTab';
import { TenantsTab } from '@/components/dashboard/TenantsTab';
import { useDashboard } from '@/hooks/use-dashboard';
import { Loader2, AlertCircle, Globe, Layers, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * NODUM CONSOLE v2.0 - SOBERANO CONTROL PLANE
 * Modular Architecture & Fullstack Optimized
 */

export default function ConsoleDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Custom Hook for optimized data management
  const { metrics, systems, schools, plans, isFetching, error, refresh } = useDashboard(user);

  // Redirection if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Handle Loading State
  if (loading || (!user && !error)) {
    return (
      <div className="h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl border border-white/10 flex items-center justify-center font-black text-2xl text-black shadow-2xl animate-bounce">N</div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#B23611]" size={32} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Kernel Syncing...</span>
        </div>
      </div>
    );
  }

  // Handle Error State
  if (error && !loading) {
    return (
      <div className="h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="bg-[#111114] border border-red-500/20 p-12 rounded-[3.5rem] max-w-lg text-center shadow-2xl">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Kernel Panic</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-bold italic">{error}</p>
          <Button variant="nodum" onClick={refresh} className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            metrics={metrics}
            systems={systems}
            isFetching={isFetching}
            onRefresh={refresh}
            onNewSystem={() => setActiveTab('systems')}
            onEnterSystem={(id) => console.log('Entering system:', id)}
          />
        );
      case 'systems':
        return (
          <SystemsTab
            systems={systems}
            isFetching={isFetching}
            onNewSystem={refresh}
            onEnterSystem={(id) => console.log('Entering system:', id)}
          />
        );
      case 'tenants':
        return (
          <TenantsTab
            schools={schools}
            plans={plans}
            systems={systems}
            isFetching={isFetching}
            onRefresh={refresh}
            onEnterSchool={(id) => console.log('Entering school:', id)}
          />
        );
      case 'billing':
      case 'health':
        return (
          <div className="h-[60vh] flex flex-col items-center justify-center select-none opacity-50 grayscale transition-all hover:grayscale-0">
            <div className="w-24 h-24 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Under Development</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 px-12 text-center">These modules are currently being migrated to the industrial control plane.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-[#B23611]/30">
      {/* Dynamic Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={logout}
      />

      {/* Main Orchestrator */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "md:ml-72" : "md:ml-20"
      )}>
        {/* Persistent Header */}
        <Header userName={user?.name || "System Admin"} />

        {/* Modular Views */}
        <main className="flex-1 p-6 md:p-12 pb-24 lg:pb-12 max-w-[1600px] mx-auto w-full">
          {renderContent()}
        </main>

        {/* Mobile Navigation Guard (Simulated) */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#111114]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-4 z-50">
          <button onClick={() => setActiveTab('overview')} className={cn("p-2 rounded-xl transition-all", activeTab === 'overview' ? "text-white bg-[#B23611]" : "text-slate-500")}>
            <Globe size={20} />
          </button>
          <button onClick={() => setActiveTab('systems')} className={cn("p-2 rounded-xl transition-all", activeTab === 'systems' ? "text-white bg-[#B23611]" : "text-slate-500")}>
            <Layers size={20} />
          </button>
          <button onClick={() => setActiveTab('tenants')} className={cn("p-2 rounded-xl transition-all", activeTab === 'tenants' ? "text-white bg-[#B23611]" : "text-slate-500")}>
            <Building2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
