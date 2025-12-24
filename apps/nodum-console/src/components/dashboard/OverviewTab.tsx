'use client';

import {
    TrendingUp,
    Building2,
    ShieldAlert,
    Zap,
    Plus,
    Layers,
    Database,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OverviewTabProps {
    metrics: any;
    systems: any[];
    isFetching: boolean;
    onRefresh: () => void;
    onNewSystem: () => void;
    onEnterSystem: (id: string) => void;
}

export function OverviewTab({ metrics, systems, isFetching, onRefresh, onNewSystem, onEnterSystem }: OverviewTabProps) {
    const GLOBAL_METRICS = [
        { label: 'Revenue (MTD)', value: `R$ ${metrics?.processedVolume?.toLocaleString() || '0'}`, trend: '+14%', icon: <TrendingUp className="text-emerald-500" /> },
        { label: 'Active Tenants', value: metrics?.activeTenants?.toString() || '0', trend: 'Global', icon: <Building2 className="text-blue-500" /> },
        { label: 'Security Score', value: '10/10', trend: 'HMAC Ok', icon: <ShieldAlert className="text-orange-500" /> },
        { label: 'Platform Status', value: metrics?.platformStatus || 'OFFLINE', trend: 'Stable', icon: <Zap className="text-yellow-500" /> },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h2 className="text-xs font-black text-[#B23611] uppercase tracking-[0.3em] mb-2">Plataforma Soberana</h2>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase">Nodum Ecosystem Control</h1>
                    <p className="text-slate-500 mt-2 font-medium">Controle central de todas as verticais e instâncias do ecossistema.</p>
                </div>
                <Button
                    variant="nodum"
                    onClick={onNewSystem}
                    className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest self-start md:self-auto"
                >
                    <Plus size={18} className="mr-2" /> New System Affiliate
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isFetching ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#111114] h-44 rounded-[2.5rem] border border-white/5 animate-pulse" />
                )) : GLOBAL_METRICS.map((stat, i) => (
                    <Card key={i} className="group hover:border-[#B23611]/30 transition-all cursor-default relative overflow-hidden p-8 rounded-[2.5rem]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B23611]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                            <Badge variant="nodum">{stat.trend}</Badge>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Active Verticals Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Layers size={24} className="text-[#B23611]" /> Active Verticals
                    </h3>
                    <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest">
                        View All <ArrowRight size={14} className="ml-2" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {isFetching ? Array(2).fill(0).map((_, i) => (
                        <div key={i} className="bg-[#111114] h-72 rounded-[3.5rem] border border-white/5 animate-pulse" />
                    )) : systems.map((sys: any) => (
                        <Card key={sys.id} className="p-10 rounded-[3.5rem] hover:border-[#B23611]/50 transition-all group cursor-pointer relative overflow-hidden bg-gradient-to-br from-[#111114] to-[#0A0A0B]">
                            <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-125">
                                <Zap size={140} className="text-[#B23611]" />
                            </div>
                            <div className="flex justify-between items-start mb-12 relative">
                                <div>
                                    <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-tight">{sys.name}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            NS-{sys.slug?.toUpperCase()}
                                        </p>
                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                            {sys.schoolsCount || 0} Institutions
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={sys.status === 'ACTIVE' ? 'success' : 'nodum'}>
                                    {sys.status}
                                </Badge>
                            </div>
                            <div className="flex gap-4 relative mt-auto">
                                <Button
                                    onClick={() => onEnterSystem(sys.id)}
                                    className="w-full h-16 bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-white/5"
                                >
                                    Enter Management Console
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
