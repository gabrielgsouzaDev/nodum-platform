'use client';

import {
    Globe,
    Layers,
    Building2,
    Database,
    Monitor,
    LogOut,
    Cpu,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onLogout: () => void;
}

const navigation = [
    { id: 'overview', name: 'Overview', icon: Globe },
    { id: 'systems', name: 'Verticais (Systems)', icon: Layers },
    { id: 'tenants', name: 'Escolas (Tenants)', icon: Building2 },
    { id: 'billing', name: 'Ledger Global', icon: Database },
    { id: 'health', name: 'Health Monitor', icon: Monitor },
];

export function Sidebar({ activeTab, onTabChange, isOpen, setIsOpen, onLogout }: SidebarProps) {
    return (
        <aside
            className={cn(
                "bg-[#111114] border-r border-white/5 transition-all duration-300 flex flex-col z-50 fixed inset-y-0 left-0",
                isOpen ? "w-72" : "w-20"
            )}
        >
            {/* Logo Section */}
            <div className="flex items-center gap-4 h-24 px-6 border-b border-white/5 relative">
                <div
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0"
                >
                    N
                </div>
                {isOpen && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-black text-white tracking-widest uppercase text-lg">
                            Nodum<span className="text-[#B23611]">.</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Control Plane</span>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-9 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black shadow-lg border border-white/10 hover:scale-110 transition-transform md:flex hidden"
                >
                    {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto overflow-x-hidden">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-[#B23611] text-white shadow-[0_0_30px_rgba(178,54,17,0.2)]"
                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                            {isOpen && (
                                <span className="font-bold text-sm tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-1">
                                    {item.name}
                                </span>
                            )}
                            {!isOpen && isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 mt-auto border-t border-white/5 space-y-2">
                <button
                    onClick={onLogout}
                    className={cn(
                        "w-full flex items-center gap-4 p-3.5 rounded-2xl text-slate-500 hover:text-[#B23611] hover:bg-[#B23611]/5 transition-all group",
                        !isOpen && "justify-center"
                    )}
                >
                    <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                    {isOpen && <span className="font-bold text-sm tracking-tight uppercase">Sair do Perímetro</span>}
                </button>

                {isOpen && (
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-4 animate-in slide-in-from-bottom-2">
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
    );
}
