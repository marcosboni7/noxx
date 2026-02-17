"use client";

import { 
  Target, ShieldAlert, Loader2, Send, Trophy, 
  Users, Zap, Radio, MessageSquare, Heart, Crown,
  Star, LayoutGrid, Sword, Car, Gamepad2, Coffee,
  Instagram, Twitter, Youtube, Github, Share2
} from "lucide-react";
import { useState, useEffect, useRef, use } from "react"; 
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { pusherClient } from "../../../lib/pusher"; 

interface UserPageProps {
  params: Promise<{ username: string; }>;
}

const CATEGORY_MAP: Record<string, { name: string, icon: any, color: string }> = {
  fortnite: { name: "Fortnite", icon: Sword, color: "text-blue-400" },
  gta: { name: "GTA V", icon: Car, color: "text-green-400" },
  freefire: { name: "Free Fire", icon: Gamepad2, color: "text-orange-400" },
  irl: { name: "Conversa", icon: Coffee, color: "text-purple-400" },
};

const getLevelStyle = (level: number, role?: string) => {
  const isStaff = role === "STAFF" || role === "ADMIN" || role === "SUPREMO";
  if (isStaff) {
    return { 
      label: role, color: "text-amber-400", 
      border: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]", 
      bg: "bg-amber-500/20", animate: "animate-pulse"
    };
  }
  if (level >= 50) return { label: "LENDA", color: "text-amber-400", border: "border-amber-400/50", bg: "bg-amber-400/10" };
  if (level >= 20) return { label: "VETERANO", color: "text-purple-400", border: "border-purple-400/50", bg: "bg-purple-400/10" };
  if (level >= 10) return { label: "ELITE", color: "text-indigo-400", border: "border-indigo-400/50", bg: "bg-indigo-400/10" };
  return { label: "RECRUTA", color: "text-zinc-500", border: "border-zinc-800", bg: "bg-zinc-800/30" };
};

export default function StreamPage({ params }: UserPageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { data: session, status } = useSession();
  
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [activePoll, setActivePoll] = useState<{ question: string } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [betResult, setBetResult] = useState<{ winner: string, question: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOwner = session?.user?.name === username || (session?.user as any)?.username === username;

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      try {
        const t = new Date().getTime();
        const [streamRes, msgRes] = await Promise.all([
          axios.get(`/api/user/${username}?t=${t}`),
          axios.get(`/api/messages/${username}?t=${t}`)
        ]);
        setStream(streamRes.data);
        setMessages(msgRes.data);
        if (status === "authenticated") {
          const followRes = await axios.get(`/api/user/${username}/following?t=${t}`);
          setIsFollowing(followRes.data.isFollowing);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [username, session, status]);

  useEffect(() => {
    if (!stream?.stream?.id) return;
    const channel = pusherClient.subscribe(stream.stream.id);
    channel.bind("chat:message", (newMessage: any) => setMessages((prev) => [...prev, newMessage]));
    channel.bind("node:staff_alert", (data: { message: string }) => {
      setIsGlitching(true); setAlertText(data.message);
      setTimeout(() => { setIsGlitching(false); setAlertText(null); }, 6000);
    });
    channel.bind("node:chat_clear", () => setMessages([]));
    channel.bind("node:bet_start", (data: { question: string }) => {
      setActivePoll({ question: data.question }); setHasVoted(false); setBetResult(null);
    });
    channel.bind("node:bet_result", (data: any) => {
      setActivePoll(null); setBetResult(data);
      setTimeout(() => setBetResult(null), 8000);
    });
    return () => { pusherClient.unsubscribe(stream.stream.id); };
  }, [stream?.stream?.id]);

  useEffect(() => { 
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || !session || !stream?.stream?.id) return;
    try {
      setIsSending(true);
      await axios.post("/api/messages", { content: inputText, streamId: stream.stream.id });
      setInputText("");
    } catch (error) { toast.error("Erro ao enviar."); } finally { setIsSending(false); }
  };

  const onFollowToggle = async () => {
    if (status !== "authenticated" || isOwner) return;
    try {
      setFollowLoading(true);
      if (isFollowing) { await axios.delete(`/api/user/${username}/follow`); setIsFollowing(false); }
      else { await axios.post(`/api/user/${username}/follow`); setIsFollowing(true); }
    } catch (error) { toast.error("Erro no follow."); } finally { setFollowLoading(false); }
  };

  const categoryInfo = stream?.stream?.category ? CATEGORY_MAP[stream.stream.category] : null;

  if (loading) return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 text-white font-black italic uppercase">
      <Loader2 className="text-indigo-500 animate-spin" size={40} />
      <span>Sincronizando Nó...</span>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#09090b] overflow-hidden text-zinc-300">
      
      {/* OVERLAYS: STAFF ALERT & BET RESULT */}
      {alertText && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/40 backdrop-blur-xl animate-in fade-in">
          <div className="max-w-2xl w-full bg-indigo-600 p-12 rounded-[3rem] text-center border border-white/20 shadow-2xl">
            <ShieldAlert size={80} className="text-white mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{alertText}</h1>
          </div>
        </div>
      )}

      {betResult && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-10">
          <div className={`flex items-center gap-4 px-10 py-5 rounded-full border-2 shadow-2xl ${betResult.winner === 'YES' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
            <Star className="text-white animate-spin" size={24} />
            <h1 className="text-2xl font-black text-white uppercase italic">GANHOU: {betResult.winner === 'YES' ? 'SIM' : 'NÃO'}</h1>
          </div>
        </div>
      )}

      {/* LADO ESQUERDO: CONTEÚDO */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 gap-6 overflow-y-auto custom-scrollbar">
        
        {/* PLAYER WRAPPER */}
        <div className={`relative aspect-video bg-black rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-500 ${isGlitching ? "scale-[1.01] border-indigo-500 blur-[1px]" : ""}`}>
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
             {stream?.stream?.isLive ? (
               <div className="flex flex-col items-center gap-4">
                 <Radio size={48} className="text-red-500 animate-pulse" />
                 <span className="text-xs font-black uppercase text-red-500 tracking-[0.3em]">Live Online</span>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-4 opacity-20">
                 <Target size={48} />
                 <span className="text-xs font-black uppercase tracking-widest">Offline</span>
               </div>
             )}
          </div>
        </div>

        {/* INFO CARD COM ALINHAMENTO BONITO */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 backdrop-blur-sm">
          <div className="flex flex-col xl:flex-row justify-between gap-8">
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/10">
                  <img src={stream?.image || "/avatar.png"} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                    {stream?.stream?.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 font-bold text-sm tracking-widest">@{username}</span>
                    <div className="flex items-center gap-1.5 bg-zinc-800/50 px-3 py-1 rounded-full text-[10px] font-black text-zinc-400">
                      <Users size={12} /> {stream?._count?.followers || 0} SEGUIDORES
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryInfo && (
                  <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-xl">
                    <categoryInfo.icon size={14} className={categoryInfo.color} />
                    <span className="text-[11px] font-black text-white uppercase italic">{categoryInfo.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-zinc-800/50 border border-white/5 px-4 py-1.5 rounded-xl">
                  <LayoutGrid size={14} className="text-zinc-500" />
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-tighter italic">Comunidade</span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl border-l-2 border-zinc-800 pl-4">
                {stream?.stream?.description || "Streamer focado em gameplay de alto nível e interação com o chat. Seja bem-vindo ao nó!"}
              </p>

              {/* REDES SOCIAIS ALINHADAS */}
              <div className="flex gap-2 pt-2">
                {[
                  { Icon: Instagram, color: "hover:bg-pink-600" },
                  { Icon: Twitter, color: "hover:bg-sky-500" },
                  { Icon: Youtube, color: "hover:bg-red-600" },
                  { Icon: Github, color: "hover:bg-white hover:text-black" }
                ].map((social, idx) => (
                  <a key={idx} href="#" className={`w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-500 transition-all ${social.color} hover:text-white hover:-translate-y-1`}>
                    <social.Icon size={18} />
                  </a>
                ))}
                <button className="ml-2 px-4 flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-white/5 text-xs font-bold text-zinc-500 hover:text-white transition-all">
                  <Share2 size={14} /> Partilhar
                </button>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO LADO DIREITO */}
            <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-64">
               <button disabled={followLoading || isOwner} onClick={onFollowToggle} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${isFollowing ? "bg-zinc-800 border border-zinc-700 text-zinc-500" : "bg-white text-black hover:bg-indigo-500 hover:text-white shadow-white/5"}`}>
                 {isFollowing ? "Seguindo" : <><Heart size={16} fill="currentColor"/> Seguir Canal</>}
               </button>
               <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                 <Zap size={16} fill="currentColor" /> Tornar-se Sub
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: CHAT */}
      <div className="w-full lg:w-[420px] bg-zinc-950 border-l border-zinc-800 flex flex-col h-[600px] lg:h-full relative shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Live_Chat</span>
           </div>
           <MessageSquare size={16} className="text-zinc-600" />
        </div>

        {activePoll && (
          <div className="p-4 bg-indigo-600/10 border-b border-indigo-500/30">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-indigo-500/50 shadow-lg">
              <h2 className="text-[10px] font-black uppercase text-indigo-400 mb-1 flex items-center gap-2"><Trophy size={12}/> Aposta Ativa</h2>
              <p className="text-xs font-bold text-white uppercase mb-3">{activePoll.question}</p>
              {!hasVoted ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => {setHasVoted(true); toast.success("Voto Sim");}} className="bg-green-600 hover:bg-green-500 py-2 rounded-lg font-black text-white text-[10px] uppercase transition-all">Sim</button>
                  <button onClick={() => {setHasVoted(true); toast.success("Voto Não");}} className="bg-red-600 hover:bg-red-500 py-2 rounded-lg font-black text-white text-[10px] uppercase transition-all">Não</button>
                </div>
              ) : (
                <div className="py-2 bg-zinc-800/50 text-center rounded-lg text-[9px] font-black text-zinc-500 uppercase italic">Voto Computado no Banco</div>
              )}
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {messages.map((msg: any) => {
            const isStaff = ["STAFF", "ADMIN", "SUPREMO"].includes(msg.role);
            const style = getLevelStyle(msg.level || 1, msg.role);
            const isStreamer = msg.username === username;
            return (
              <div key={msg.id} className="flex flex-col gap-1 animate-in slide-in-from-bottom-1 duration-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-all ${style.bg} ${style.color} ${style.border} ${style.animate || ""}`}>
                    {isStaff ? msg.role : `LVL ${msg.level || 1}`}
                  </span>
                  {isStaff && <Crown size={12} className="text-amber-400" />}
                  <span className={`font-black uppercase tracking-tighter ${isStaff ? 'text-amber-400 text-sm' : isStreamer ? 'text-red-400 text-[11px]' : `${style.color} text-[11px]`}`}>
                    {msg.username}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed break-words ${isStaff ? "text-white font-medium" : "text-zinc-400"}`}>
                  {msg.content}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              value={inputText} onChange={(e) => setInputText(e.target.value)} 
              placeholder={status === "authenticated" ? "Enviar mensagem..." : "Faça login para interagir"} 
              disabled={status !== "authenticated"}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            />
            <button type="submit" disabled={isSending || !inputText.trim()} className="absolute right-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20">
              {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}