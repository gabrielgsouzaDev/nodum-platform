'use client';

import {
    Layers,
    Plus,
    MoreVertical,
    Settings2,
    Activity,
    Zap,
    ExternalLink,
    ShieldCheck,
    Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from 'react';
import { CreateSystemModal } from './CreateSystemModal';

interface SystemsTabProps {
    systems: any[];
    isFetching: boolean;
    onNewSystem: () => void;
    onEnterSystem: (id: string) => void;
}

export function SystemsTab({ systems, isFetching, onNewSystem, onEnterSystem }: SystemsTabProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSystems = useMemo(() => {
        return systems.filter(sys =>
            sys.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sys.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [systems, searchQuery]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CreateSystemModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={onNewSystem}
            />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Verticais de Negócio</h1>
                    <p className="text-slate-500 mt-2 font-medium">Arquiteturas independentes rodando sobre o Kernel Nodum.</p>
                </div>

                <Button
                    variant="nodum"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest"
                >
                    <Plus size={18} className="mr-2" /> Launch New Vertical
                </Button>
            </div>

            {/* Control Bar */}
            <div className="bg-[#111114] p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-3.5 text-slate-600" size={18} />
                    <Input
                        placeholder="Search verticals by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 !h-14 bg-white/5 border border-white/5 rounded-2xl w-full text-sm focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Systems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isFetching ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-[#111114] h-80 rounded-[3.5rem] border border-white/5 animate-pulse" />
                )) : filteredSystems.map((sys: any) => (
                    <Card key={sys.id} className="p-10 rounded-[3.5rem] hover:border-[#B23611]/50 transition-all group relative overflow-hidden flex flex-col h-full bg-[#111114]">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-150">
                            <Layers size={200} className="text-[#B23611]" />
                        </div>

                        <div className="flex justify-between items-start mb-10 relative">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl group-hover:text-[#B23611] transition-colors">
                                {sys.name.charAt(0)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={sys.status === 'ACTIVE' ? 'success' : 'nodum'}>
                                    {sys.status}
                                </Badge>
                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 relative flex-1">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{sys.name}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                                {sys.description || 'Infraestrutura dedicada operando em regime de alta disponibilidade (Industrial Grade).'}
                            </p>

                            <div className="flex items-center gap-6 pt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2 text-emerald-400/80"><ShieldCheck size={14} /> Security Ok</span>
                                <span className="flex items-center gap-2"><Zap size={14} /> Latency: 42ms</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10 relative">
                            <Button
                                variant="outline"
                                className="h-14 border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                            >
                                <Settings2 size={16} className="mr-2" /> Global Config
                            </Button>
                            <Button
                                variant="nodum"
                                onClick={() => onEnterSystem(sys.id)}
                                className="h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            >
                                <ExternalLink size={16} className="mr-2" /> Access Core
                            </Button>
                        </div>
                    </Card>
                ))}

                {!isFetching && systems.length === 0 && (
                    <Card className="p-10 rounded-[3.5rem] border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center text-center py-32">
                        <Plus className="w-16 h-16 text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-slate-500 uppercase italic">Add your first system vertical</h3>
                        <Button variant="nodum" className="mt-8 px-10 h-12 rounded-xl" onClick={() => setIsCreateModalOpen(true)}>Get Started</Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
