'use client';

import {
    Building2,
    Search,
    ChevronRight,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';
import { CreateSchoolModal } from './CreateSchoolModal';
import { Input } from '@/components/ui/input';

interface TenantsTabProps {
    schools: any[];
    plans: any[];
    systems: any[];
    isFetching: boolean;
    onRefresh: () => void;
    onEnterSchool: (id: string) => void;
}

export function TenantsTab({ schools, plans, systems, isFetching, onRefresh, onEnterSchool }: TenantsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');

    const filteredSchools = useMemo(() => {
        return schools.filter(school => {
            const matchesSearch =
                school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                school.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                school.system?.name?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || school.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [schools, searchQuery, statusFilter]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={onRefresh}
                systems={systems}
                plans={plans}
            />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Instituições (Tenants)</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestão global de todas as escolas e unidades integradas ao kernel.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="nodum"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-[#B23611]/20"
                    >
                        Provision New Tenant
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-[#111114] p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-3.5 text-slate-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search institutions by name, slug or system..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 h-14 bg-white/5 border border-white/5 rounded-2xl w-full text-sm focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none text-white"
                    />
                </div>
                <div className="flex items-center gap-4 px-4 h-full border-l border-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:flex">
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> {filteredSchools.length} Result(s)</span>
                </div>
            </div>

            {/* Tenants list */}
            <div className="grid grid-cols-1 gap-4">
                {isFetching ? Array(5).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#111114] h-24 rounded-3xl border border-white/5 animate-pulse" />
                )) : filteredSchools.length > 0 ? filteredSchools.map((school) => (
                    <Card key={school.id} className="p-6 transition-all hover:bg-white/5 hover:border-[#B23611]/30 group cursor-pointer flex items-center justify-between rounded-3xl">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-white uppercase group-hover:bg-[#B23611]/10 group-hover:text-[#B23611] transition-colors shadow-inner">
                                {school.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase text-xl tracking-tight group-hover:text-[#B23611] transition-colors">{school.name}</h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white/20 rounded-full" /> Slug: {school.slug}</span>
                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white/20 rounded-full" /> System: {school.system?.name || 'N/A'}</span>
                                    <span className="flex items-center gap-2 text-emerald-500/80"><CheckCircle2 size={12} /> {school.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-4">
                                <span className="text-xs font-black text-white uppercase tracking-tight">R$ 0.00</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Revenue MTD</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-12 h-12 rounded-2xl border border-white/5 group-hover:bg-[#B23611] group-hover:text-white transition-all shadow-xl"
                                onClick={() => onEnterSchool(school.id)}
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </Card>
                )) : (
                    <div className="py-20 text-center bg-[#111114] rounded-3xl border border-dashed border-white/10">
                        <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-400">Nenhuma instituição encontrada</h3>
                        <p className="text-sm text-slate-600 mt-2">Expanda sua infraestrutura adicionando novas verticais.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
