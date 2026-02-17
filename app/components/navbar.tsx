"use client";

import { 
  Search, 
  Bell, 
  Zap, 
  User, 
  Settings, 
  LayoutDashboard, 
  LogOut,
  Loader2,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Identidade e Progresso
  const username = 
    (session?.user as any)?.username || 
    session?.user?.name || 
    session?.user?.email?.split('@')[0] || 
    "Guest"; 

  const level = (session?.user as any)?.level || 1;
  const xp = (session?.user as any)?.xp || 0;
  const xpNeeded = level * 100;
  const progressPercent = Math.min((xp / xpNeeded) * 100, 100);

  const dashboardPath = `/${username}/dashboard`;

  return (
    <nav className="fixed top-0 w-full h-20 bg-[#09090b]/90 backdrop-blur-md flex items-center px-6 justify-between z-[100] border-b border-zinc-800/50">
      
      {/* LOGO AUMENTADA E SEM EFEITOS DE LUZ */}
      <Link href="/" className="group cursor-pointer">
        <div className="relative w-24 h-24 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
          <img 
            src="/logo.png" 
            alt="Logo"
            className="w-full h-full object-contain relative z-10"
          />
        </div>
      </Link>

      {/* BARRA DE BUSCA CENTRALIZADA */}
      <div className="hidden md:flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 focus-within:border-zinc-700 focus-within:bg-zinc-900 transition-all">
        <Search size={18} className="text-zinc-500 mr-2" />
        <input 
          className="bg-transparent text-sm w-[250px] lg:w-[400px] outline-none text-zinc-200 placeholder:text-zinc-600 font-medium" 
          placeholder="Buscar criadores ou transmissões..." 
        />
      </div>

      {/* AÇÕES E PERFIL */}
      <div className="flex items-center gap-x-4">
        
        <div className="relative cursor-pointer p-2.5 hover:bg-zinc-900 rounded-full transition text-zinc-400 hover:text-white border border-transparent hover:border-zinc-800">
          <Bell size={22} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#09090b]" />
        </div>

        <Link href={dashboardPath} className="hidden sm:block">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full transition-all scale-95 hover:scale-100 active:scale-95 shadow-lg shadow-orange-500/20">
            <Zap size={18} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest">Ao Vivo</span>
          </div>
        </Link>

        <div className="h-8 w-[1px] bg-zinc-800 mx-1 hidden sm:block" />

        {/* MENU DO USUÁRIO */}
        <div className="relative group">
          <div className="flex items-center gap-x-3 cursor-pointer p-1.5 pl-4 rounded-full hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800">
            
            <div className="flex flex-col items-end hidden lg:flex">
              {isLoading ? (
                <Loader2 size={12} className="animate-spin text-zinc-500" />
              ) : (
                <>
                  <span className="text-[12px] text-zinc-100 font-bold leading-none capitalize">
                    {username}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                       Lvl {level}
                     </span>
                     {session && (
                        <div className="w-16 h-[4px] bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-700 shadow-[0_0_8px_rgba(249,115,22,0.8)]" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                     )}
                  </div>
                </>
              )}
            </div>
            
            <div className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-orange-500 transition-all overflow-hidden bg-zinc-800 shadow-inner">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <User size={20} />
                </div>
              )}
            </div>
            <ChevronDown size={16} className="text-zinc-500 group-hover:text-white transition-transform group-hover:rotate-180 mr-1" />
          </div>

          <div className="absolute right-0 top-full pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-2 flex flex-col">
              
              {session && (
                <div className="px-5 py-4 border-b border-zinc-800/50 mb-2 bg-zinc-900/20">
                   <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase mb-2.5">
                     <span>Exp. Atual</span>
                     <span className="text-orange-400">{xp} / {xpNeeded} XP</span>
                   </div>
                   <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
                   </div>
                </div>
              )}

              <Link href={dashboardPath} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition">
                <LayoutDashboard size={18} />
                Painel do Criador
              </Link>

              <Link href="/settings" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition">
                <Settings size={18} />
                Configurações
              </Link>

              <div className="h-[1px] bg-zinc-800/50 my-1 mx-3" />

              {session ? (
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
                >
                  <LogOut size={18} />
                  Encerrar Sessão
                </button>
              ) : (
                <Link href="/api/auth/signin" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white hover:bg-orange-600 transition">
                  <User size={18} />
                  Entrar na Plataforma
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};