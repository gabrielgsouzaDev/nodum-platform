import { LayoutDashboard, Network, Building2, CreditCard, Users, Settings, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'systems', name: 'Systems', icon: Network },
  { id: 'schools', name: 'Schools', icon: Building2 },
  { id: 'plans', name: 'Plans', icon: CreditCard },
  { id: 'finance', name: 'Finance', icon: DollarSign },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-primary text-primary-foreground h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">NODUM</h1>
        <p className="text-xs text-white/60 mt-1 font-mono">Platform Control</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                activeTab === item.id
                  ? 'bg-accent text-accent-foreground shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40">
          <p className="font-mono">v3.8.13</p>
          <p className="mt-1">KERNEL MASTER</p>
        </div>
      </div>
    </div>
  );
}
