'use client';

import {
  useState,
  useEffect,
  Fragment
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiFetch } from '@/lib/api';
import {
  Globe,
  Layers,
  Building2,
  TrendingUp,
  ShieldAlert,
  Activity,
  Plus,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  Search,
  Terminal,
  Zap,
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  Monitor,
  LogOut,
  Loader2
} from 'lucide-react';

/**
 * NODUM CONSOLE v1.1 - MASTER CONTROL PLANE
 * Papel: Interface de Soberania Global para Gabriel (SaaS Owner).
 */

export default function App() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // States para dados reais
  const [metrics, setMetrics] = useState<any>(null);
  const [systems, setSystems] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Redirecionamento se não logado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Cores de Soberania (Nodum Brand)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--nodum-primary', '#B23611');
    root.style.setProperty('--nodum-bg', '#0A0A0B');
    root.style.setProperty('--nodum-card', '#111114');
  }, []);

  // Fetch de dados iniciais
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsFetching(true);
        try {
          const [metricsData, systemsData, schoolsData] = await Promise.all([
            apiFetch('/global-admin/metrics'),
            apiFetch('/platform/systems'),
            apiFetch('/tenancy/schools')
          ]);
          setMetrics(metricsData);
          setSystems(systemsData);
          setSchools(schoolsData);
        } catch (error) {
          console.error("Erro ao carregar dados do console:", error);
        } finally {
          setIsFetching(false);
        }
      };
      void fetchData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#B23611]" size={48} />
      </div>
    );
  }

  const GLOBAL_METRICS = [
    { label: 'Revenue (MTD)', value: `R$ ${metrics?.processedVolume?.toLocaleString() || '0'}`, trend: '+14%', icon: <TrendingUp className="text-emerald-500" /> },
    { label: 'Active Tenants', value: metrics?.activeTenants?.toString() || '0', trend: 'Global', icon: <Building2 className="text-blue-500" /> },
    { label: 'Security Score', value: '10/10', trend: 'HMAC Ok', icon: <ShieldAlert className="text-orange-500" /> },
    { label: 'Platform Status', value: metrics?.platformStatus || 'OFFLINE', trend: 'Stable', icon: <Zap className="text-yellow-500" /> },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-[#B23611]/30">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#111114] border-r border-white/5 transition-all duration-300 flex flex-col p-6 z-50`}>
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">N</div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2">
              <span className="font-black text-white tracking-widest uppercase text-lg">Nodum<span className="text-[#B23611]">.</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Control Plane</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <SideBtn icon={<Globe size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} expanded={isSidebarOpen} />
          <SideBtn icon={<Layers size={20} />} label="Verticais (Systems)" active={activeTab === 'systems'} onClick={() => setActiveTab('systems')} expanded={isSidebarOpen} />
          <SideBtn icon={<Building2 size={20} />} label="Escolas (Tenants)" active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} expanded={isSidebarOpen} />
          <SideBtn icon={<Database size={20} />} label="Ledger Global" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} expanded={isSidebarOpen} />
          <SideBtn icon={<Monitor size={20} />} label="Health Monitor" active={activeTab === 'health'} onClick={() => setActiveTab('health')} expanded={isSidebarOpen} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <SideBtn icon={<LogOut size={20} />} label="Sair do Perímetro" active={false} onClick={logout} expanded={isSidebarOpen} />
          {isSidebarOpen && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-3">
                <Cpu size={12} /> Kernel Engine
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white font-bold tracking-tight">v3.8.27-LTS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
              <Terminal size={14} className="text-[#B23611]" />
              <span>Console_Session: {user?.name?.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-3.5 text-slate-600" size={18} />
              <input
                type="text"
                placeholder="Trace system ID, Tenant or UUID..."
                className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl w-96 text-sm focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none"
              />
            </div>
            <div className="w-12 h-12 bg-[#B23611]/10 border border-[#B23611]/20 rounded-2xl flex items-center justify-center text-[#B23611] font-black uppercase">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <section className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'overview' && (
            <>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-xs font-black text-[#B23611] uppercase tracking-[0.3em] mb-2">Plataforma Soberana</h2>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Nodum Ecosystem Control</h1>
                </div>
                <button className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black px-8 py-4 rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)] uppercase text-xs tracking-widest">
                  <Plus size={18} /> New System Affiliate
                </button>
              </div>

              {/* Stats de Operação */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {isFetching ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#111114] h-40 rounded-[2rem] border border-white/5 animate-pulse"></div>
                )) : GLOBAL_METRICS.map((stat, i) => (
                  <div key={i} className="bg-[#111114] p-8 rounded-[2rem] border border-white/5 hover:border-[#B23611]/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B23611]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                      <span className="px-3 py-1 bg-white/5 text-[10px] font-black rounded-full text-slate-500 uppercase tracking-widest border border-white/5">{stat.trend}</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Verticais */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <Layers size={22} className="text-[#B23611]" /> Active Verticals
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {isFetching ? Array(2).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#111114] h-64 rounded-[3rem] border border-white/5 animate-pulse"></div>
                  )) : systems.map((sys: any) => (
                    <div key={sys.id} className="bg-[#111114] p-10 rounded-[3rem] border border-white/5 group hover:border-[#B23611]/50 transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Zap size={120} className="text-[#B23611]" />
                      </div>
                      <div className="flex justify-between items-start mb-10 relative">
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{sys.name}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Database size={12} /> ID: NS-{sys.slug?.toUpperCase()}
                          </p>
                        </div>
                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border ${sys.status === 'ACTIVE' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-[#B23611]/50 text-[#B23611] bg-[#B23611]/5'}`}>
                          {sys.status}
                        </div>
                      </div>
                      <div className="flex gap-4 relative">
                        <button className="flex-1 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:brightness-90 transition-all active:scale-95 shadow-xl shadow-white/5">
                          Enter Management Console
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-8">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-12">Instituições (Tenants)</h1>
              <div className="grid grid-cols-1 gap-4">
                {isFetching ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#111114] h-24 rounded-2xl border border-white/5 animate-pulse"></div>
                )) : schools.map((school: any) => (
                  <div key={school.id} className="flex items-center justify-between p-6 bg-[#111114] border border-white/5 rounded-2xl hover:border-[#B23611]/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-white uppercase">{school.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-white uppercase text-lg">{school.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Slug: {school.slug} | Status: {school.status}</p>
                      </div>
                    </div>
                    <button className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-[#B23611] hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const SideBtn = ({ icon, label, active, onClick, expanded }: { icon: any, label: string, active: boolean, onClick: () => void, expanded: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${active
      ? 'bg-[#B23611] text-white shadow-[0_0_30px_rgba(178,54,17,0.2)]'
      : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
  >
    <div className={`${active ? 'text-white' : 'group-hover:scale-110 transition-transform'}`}>{icon}</div>
    {expanded && <span className="font-bold text-sm tracking-tight">{label}</span>}
  </button>
);
