"use client";

import { useState } from "react";
import { ShieldCheck, Lock, User, Mail, ArrowRight, X, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para capturar os inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      // LÓGICA DE LOGIN (NextAuth)
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        alert("ACESSO_NEGADO: Credenciais inválidas.");
      } else {
        onClose();
        router.refresh();
      }
    } else {
      // LÓGICA DE REGISTRO
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("IDENTIDADE_CADASTRADA: Realize o login agora.");
          setIsLogin(true);
        } else {
          alert("ERRO_DE_PROTOCOLO: Falha ao criar usuário.");
        }
      } catch (error) {
        alert("ERRO_CRÍTICO: Sem conexão com o servidor.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-zinc-900/90 border border-green-500/30 p-8 relative shadow-[0_0_100px_rgba(34,197,94,0.1)]">
        
        {/* BOTÃO FECHAR */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-green-500 transition-colors group"
        >
          <span className="text-[8px] mr-2 opacity-0 group-hover:opacity-100 transition-opacity font-mono">CLOSE_TERMINAL</span>
          <X size={20} />
        </button>

        {/* DECORAÇÕES DE CANTO */}
        <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-2 border-l-2 border-green-500 shadow-[0_0_10px_#22c55e]" />
        <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-2 border-r-2 border-green-500 shadow-[0_0_10px_#22c55e]" />

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-green-500/50 mb-4 bg-green-500/5">
            <ShieldCheck size={28} className="text-green-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            {isLogin ? "System_Access" : "New_Identity"}
          </h2>
        </div>

        {/* FORMULÁRIO */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* USERNAME (Apenas no Registro) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase font-bold ml-1 tracking-widest">Agent_Alias</label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 text-zinc-600 group-focus-within:text-green-500" size={16} />
                <input 
                  required
                  type="text" 
                  placeholder="ID_OPERATOR" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-black/50 border border-green-500/20 p-2.5 pl-10 text-xs text-white outline-none focus:border-green-500 transition-all font-mono" 
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 uppercase font-bold ml-1 tracking-widest">Secure_Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 text-zinc-600 group-focus-within:text-green-500" size={16} />
              <input 
                required
                type="email" 
                placeholder="mail@void.network" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/50 border border-green-500/20 p-2.5 pl-10 text-xs text-white outline-none focus:border-green-500 transition-all font-mono" 
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 uppercase font-bold ml-1 tracking-widest">Access_Key</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 text-zinc-600 group-focus-within:text-green-500" size={16} />
              <input 
                required
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/50 border border-green-500/20 p-2.5 pl-10 text-xs text-white outline-none focus:border-green-500 transition-all font-mono" 
              />
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button 
            disabled={isLoading}
            className="w-full bg-green-500 text-black py-4 font-black uppercase text-[11px] hover:bg-white transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_0_20px_rgba(34,197,94,0.4)] group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {isLogin ? "Authorize_Session" : "Establish_Link"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center border-t border-green-500/10 pt-4 flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[9px] text-zinc-500 hover:text-green-500 uppercase font-bold transition-colors tracking-widest"
          >
            {isLogin ? "> Request_New_Identity" : "> Return_to_Terminal"}
          </button>
          
          <button 
            onClick={onClose}
            className="text-[8px] text-red-900 hover:text-red-500 uppercase font-bold transition-colors tracking-[0.3em] italic"
          >
            // ABORT_AND_GUEST_ACCESS
          </button>
        </div>
      </div>
    </div>
  );
};