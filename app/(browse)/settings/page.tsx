"use client";

import { useState } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Camera, 
  Save, 
  RefreshCw, 
  ChevronRight,
  Fingerprint,
  Mail,
  ShieldCheck,
  X,
  CreditCard,
  History
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configurações atualizadas com sucesso!");
    }, 1500);
  };

  const navItems = [
    { name: "Profile", icon: <User size={16} /> },
    { name: "Security", icon: <Shield size={16} /> },
    { name: "Payments", icon: <CreditCard size={16} /> }, // Adicionado para futura integração
    { name: "Notifications", icon: <Bell size={16} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 pt-24 min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-orange-500/30">
      
      {/* HEADER DINÂMICO */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">
          <Fingerprint size={14} /> Sistema de Identidade
        </div>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Configurações de Conta</h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium">Gerencie sua presença, segurança e preferências de conexão.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* NAVEGAÇÃO LATERAL (MENU) */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`
                  flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-black uppercase italic tracking-widest transition-all whitespace-nowrap
                  ${activeTab === item.name 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                    : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50"}
                `}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* SEÇÃO DE AVATAR */}
          <section className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                <User size={60} className="text-zinc-800" />
                {/* Overlay de Upload */}
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                  <Camera size={20} className="text-white" />
                  <span className="text-[10px] font-black text-white uppercase">Alterar</span>
                </button>
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-orange-600 rounded-full border-4 border-[#09090b] flex items-center justify-center shadow-lg">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-1">Foto de Perfil</h3>
              <p className="text-xs text-zinc-500 mb-5 font-medium">Recomendado: 400x400px. Formatos: JPG, PNG ou GIF.</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Upload Novo</button>
                <button className="px-5 py-2.5 text-zinc-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">Remover</button>
              </div>
            </div>
          </section>

          {/* FORMULÁRIO DE IDENTIDADE */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <h2 className="text-sm font-black text-white uppercase italic tracking-widest">Informações Básicas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
                <div className="relative group">
                  <User className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Ex: Agent_Void"
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-orange-500 transition-all font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-mail de Contato</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-orange-500 transition-colors" size={16} />
                  <input 
                    type="email" 
                    placeholder="voider@exemplo.com"
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white outline-none focus:border-orange-500 transition-all font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bio / Descrição do Canal</label>
                <textarea 
                  rows={4}
                  placeholder="Conte sua história para o mundo..."
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500 transition-all resize-none font-medium placeholder:text-zinc-800"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO DE SEGURANÇA */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <h2 className="text-sm font-black text-white uppercase italic tracking-widest">Privacidade & Segurança</h2>
            </div>
            
            <div className="bg-zinc-900/10 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
              {/* Opção 1 */}
              <div className="p-7 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div>
                  <h4 className="text-sm font-black text-zinc-200 uppercase italic tracking-tight">Autenticação em Duas Etapas (2FA)</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Adicione uma camada extra de proteção à sua conta.</p>
                </div>
                <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-pointer group transition-colors hover:bg-zinc-700">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full transition-all group-hover:bg-white" />
                </div>
              </div>

              {/* Opção 2 */}
              <div className="p-7 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div>
                  <h4 className="text-sm font-black text-zinc-200 uppercase italic tracking-tight">Gerenciamento de Sessões</h4>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">Veja onde sua conta Void está conectada no momento.</p>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition">
                   Verificar <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER DE AÇÕES */}
          <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
              <History size={14} /> Sincronizado: Hoje às 14:32
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all">
                Descartar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 md:flex-none bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} /> 
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}