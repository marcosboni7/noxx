"use client";

import { 
  Activity, Eye, EyeOff, Copy, BarChart3, Monitor, 
  Check, ChevronRight, ShieldAlert, Loader2, Power, Radio,
  FileText, ImageIcon, Settings2, Signal, Sword, Car, Gamepad2, Coffee, LayoutGrid,
  Instagram, Twitter, Youtube, Github, Link as LinkIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";

// --- CATEGORIAS SINCRONIZADAS ---
const CATEGORIES = [
  { id: "fortnite", name: "Fortnite", icon: Sword, color: "text-blue-400" },
  { id: "gta", name: "GTA V", icon: Car, color: "text-green-400" },
  { id: "freefire", name: "Free Fire", icon: Gamepad2, color: "text-orange-400" },
  { id: "irl", name: "Conversa", icon: Coffee, color: "text-purple-400" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const username = params?.username as string;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState(""); 
  
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [isLive, setIsLive] = useState(false);
  const [streamId, setStreamId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadStreamData = async () => {
      if (!username) return;
      try {
        setInitialLoading(true);
        const response = await axios.get(`/api/user/${username}?t=${new Date().getTime()}`);
        const data = response.data;
        const streamData = data.stream || data;
        
        if (streamData) {
          setTitle(streamData.name || "");
          setDescription(streamData.description || "");
          setThumbnailUrl(streamData.thumbnailUrl || "");
          setCategory(streamData.category || ""); 
          setIsLive(streamData.isLive);
          setStreamId(streamData.id);
        }

        setInstagramUrl(data.instagramUrl || "");
        setTwitterUrl(data.twitterUrl || "");
        setYoutubeUrl(data.youtubeUrl || "");
        setGithubUrl(data.githubUrl || "");

      } catch (error) {
        console.error("ERRO_AO_CARREGAR", error);
        toast.error("Erro ao sincronizar dados do canal.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (status === "authenticated") {
      loadStreamData();
    } else if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [username, status, router]);

  const isOwner = session?.user?.name?.toLowerCase() === username?.toLowerCase() || 
                  (session?.user as any)?.username?.toLowerCase() === username?.toLowerCase();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const onUpdateSettings = async (forcedStatus?: boolean) => {
    if (forcedStatus === true && !category) {
      toast.error("Escolha uma categoria antes de iniciar!");
      return;
    }

    try {
      setIsUpdating(true);
      const newStatus = typeof forcedStatus === "boolean" ? forcedStatus : isLive;
      
      const response = await axios.patch("/api/streams", {
        name: title,
        description: description,
        thumbnailUrl: thumbnailUrl,
        category: category, 
        isLive: newStatus,
        instagramUrl,
        twitterUrl,
        youtubeUrl,
        githubUrl
      });

      setIsLive(response.data.isLive);
      setTitle(response.data.name);
      setDescription(response.data.description);
      setThumbnailUrl(response.data.thumbnailUrl);
      setCategory(response.data.category);
      
      toast.success(typeof forcedStatus === "boolean" 
        ? (newStatus ? "Transmissão Iniciada!" : "Transmissão Encerrada.") 
        : "Configurações salvas!"
      );
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      toast.error("Erro ao atualizar sinal.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || initialLoading) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
      <Loader2 className="text-orange-500 animate-spin" size={40} />
      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Estúdio...</span>
    </div>
  );

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-[3rem] border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter">Acesso Negado</h2>
          <p className="text-zinc-500 text-sm">Este nó de transmissão não pertence à sua credencial.</p>
          <button onClick={() => router.push("/")} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition">Voltar para Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 p-4 md:p-8 pt-24 max-w-[1400px] mx-auto space-y-10 font-sans selection:bg-orange-500/30">
      
      {/* HEADER PROFESSIONAL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 mb-3 uppercase tracking-[0.2em]">
            <Settings2 size={14} /> Estúdio de Criação <ChevronRight size={12} /> <span className="text-orange-500">{username}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Painel de Controle</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/30 border border-white/5 p-3 pr-8 rounded-[2rem] backdrop-blur-md">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLive ? "bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "bg-zinc-800 text-zinc-500"}`}>
            <Signal size={24} className={isLive ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-tight">Status do Nó</p>
            <p className={`text-sm font-black italic uppercase ${isLive ? "text-red-500" : "text-zinc-500"}`}>
              {isLive ? "Transmissão Ativa" : "Sinal Offline"}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: CONFIGS */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-10 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <Monitor size={20} className="text-orange-500" />
              <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Metadados da Stream</h2>
            </div>

            <div className="grid gap-8">
              {/* SELEÇÃO DE CATEGORIA */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <LayoutGrid size={14} /> Categoria do Conteúdo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`
                        flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all duration-300
                        ${category === cat.id 
                          ? "bg-orange-600/10 border-orange-500 text-white shadow-lg shadow-orange-500/5" 
                          : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400"}
                      `}
                    >
                      <cat.icon size={24} className={category === cat.id ? "text-orange-500" : "text-zinc-700"} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Título da Transmissão</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500 transition-all placeholder:text-zinc-800 italic font-medium"
                  placeholder="Ex: RUMO AO TOP 1 GLOBAL"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileText size={14} /> Bio do Perfil & Descrição
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500 transition-all h-32 resize-none placeholder:text-zinc-800 font-medium"
                  placeholder="Escreva algo épico sobre seu canal..."
                />
              </div>

              {/* SEÇÃO DE REDES SOCIAIS */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} /> Redes Sociais & Conexões
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <Instagram size={16} className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-pink-500 transition-colors" />
                    <input 
                      value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="Instagram URL"
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white outline-none focus:border-pink-500/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Twitter size={16} className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-sky-500 transition-colors" />
                    <input 
                      value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="Twitter URL"
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white outline-none focus:border-sky-400/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Youtube size={16} className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-red-500 transition-colors" />
                    <input 
                      value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="YouTube URL"
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white outline-none focus:border-red-500/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Github size={16} className="absolute left-4 top-4 text-zinc-700 group-focus-within:text-white transition-colors" />
                    <input 
                      value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Github ou Discord URL"
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ImageIcon size={14} /> URL da Imagem de Capa
                </label>
                <input 
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500 transition-all font-mono text-xs"
                  placeholder="https://sua-imagem.com/capa.jpg"
                />
              </div>

              {/* KEYS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Servidor RTMP</label>
                  <div className="flex gap-2">
                    <input readOnly value="rtmp://void.tv/live" className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-zinc-500 font-mono" />
                    <button onClick={() => copyToClipboard("rtmp://void.tv/live")} className="p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl transition text-zinc-400">
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-orange-500/50 uppercase tracking-widest">Chave Secreta</label>
                  <div className="flex gap-2 relative">
                    <input type={showKey ? "text" : "password"} readOnly value={`sk_${streamId}_live`} className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-orange-500 font-mono" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-14 top-3 text-zinc-600 hover:text-white transition">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => copyToClipboard(`sk_${streamId}_live`)} className="p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl transition text-zinc-400">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isUpdating}
              onClick={() => onUpdateSettings()}
              className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs italic tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={20} /> : updateSuccess ? "Sincronizado com Sucesso!" : "Atualizar Configurações"}
            </button>
          </section>

          {/* TELEMETRIA */}
          <section className="bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-3"><BarChart3 size={18} className="text-orange-500" /> Fluxo de Dados (Telemetria)</div>
                <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400">BITRATE: {isLive ? "4500 KBPS" : "0 KBPS"}</div>
              </div>
              <div className="h-24 w-full flex items-end gap-1.5 px-2">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} 
                    style={{ height: `${isLive ? Math.floor(Math.random() * 80) + 20 : 10}%` }} 
                    className={`flex-1 rounded-full transition-all duration-700 ${isLive ? 'bg-orange-500/40' : 'bg-zinc-800/20'}`} 
                  />
                ))}
              </div>
          </section>
        </div>

        {/* COLUNA DIREITA: CONTROLES DE SINAL */}
        <div className="space-y-6">
          <section className={`rounded-[2.5rem] p-10 space-y-8 border transition-all duration-700 backdrop-blur-md ${isLive ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'bg-zinc-900/20 border-white/5'}`}>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
              <Radio size={18} className={isLive ? "text-red-500 animate-pulse" : "text-zinc-700"} />
              Sinal de Saída
            </h3>
            
            <button
              onClick={() => onUpdateSettings(!isLive)}
              disabled={isUpdating}
              className={`w-full py-7 rounded-[2.2rem] text-xs font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95
                ${isLive 
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20" 
                  : "bg-orange-600 text-white hover:bg-orange-500 shadow-orange-600/20"
                }
              `}
            >
              <Power size={20} />
              {isUpdating ? "Processando..." : isLive ? "Cortar Transmissão" : "Entrar Ao Vivo"}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 text-center">
                  <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Espectadores</p>
                  <p className="text-2xl font-black text-white italic">{isLive ? "1" : "0"}</p>
               </div>
               <div className="bg-zinc-950/40 p-5 rounded-3xl border border-white/5 text-center">
                  <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Uptime</p>
                  <p className="text-2xl font-black text-white italic">{isLive ? "00:12" : "--:--"}</p>
               </div>
            </div>
          </section>

          {/* SECURITY ALERT */}
          <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 space-y-4">
            <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
               <ShieldAlert size={16} /> Protocolo de Segurança
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">
              Sua <span className="text-zinc-300 font-bold">Chave de Transmissão</span> é o seu acesso direto ao servidor. Nunca a revele em live ou para terceiros.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}