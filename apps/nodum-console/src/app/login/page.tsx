'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Lock, User, Terminal, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha na autenticação');
            }

            if (data.user.role !== 'GLOBAL_ADMIN') {
                throw new Error('Acesso restrito a Administradores Globais.');
            }

            login(data.access_token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 selection:bg-[#B23611]/30">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-6">N</div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Nodum<span className="text-[#B23611]">.</span></h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Control Plane Authentication</p>
                </div>

                <div className="bg-[#111114] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B23611]/5 blur-[60px] opacity-50"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Master Email</label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none"
                                    placeholder="name@nodum.io"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Cryptographic Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 text-slate-600" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:ring-2 focus:ring-[#B23611] focus:bg-white/10 transition-all outline-none"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-white hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <Terminal size={18} /> Access Console
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Sovereign Infrastructure v3.8.27
                </div>
            </div>
        </div>
    );
}
