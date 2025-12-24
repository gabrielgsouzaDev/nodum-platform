'use client';

import {
    Search,
    Terminal,
    Bell,
    Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface HeaderProps {
    userName: string;
    className?: string;
}

export function Header({ userName, className }: HeaderProps) {
    return (
        <header className={cn(
            "h-24 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 transition-all",
            className
        )}>
            <div className="flex items-center gap-8">
                <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-in fade-in duration-500">
                    <Terminal size={14} className="text-[#B23611]" />
                    <span>Console_Session: {userName.toUpperCase()}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Search Bar */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-4 top-3.5 text-slate-600 group-focus-within:text-[#B23611] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Trace system ID, Tenant or UUID..."
                        className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl w-64 lg:w-96 text-sm focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none placeholder:text-slate-700"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#B23611] rounded-full"></span>
                    </button>
                    <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Settings size={20} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-black text-white uppercase tracking-tight">{userName}</span>
                        <span className="text-[9px] font-bold text-[#B23611] uppercase tracking-widest">Master</span>
                    </div>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white font-black uppercase shadow-inner hover:border-[#B23611]/50 transition-colors cursor-pointer">
                        {userName.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
}
