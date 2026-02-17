"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Tv, Activity, ArrowUpRight, PlayCircle, Gamepad2, Search } from "lucide-react";
import axios from "axios";

import { SkeletonCard } from "../components/skeleton-card";

interface Stream {
  id: string;
  name: string;
  isLive: boolean;
  viewers: number;
  category: string;
  user: {
    username: string;
    image: string | null;
  };
}

const CATEGORIES = [
  { id: "all", name: "TUDO", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80" },
  { id: "fortnite", name: "FORTNITE", image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&q=80" },
  { id: "gta", name: "GTA V", image: "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=400&q=80" },
  { id: "freefire", name: "FREE FIRE", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80" },
  { id: "irl", name: "CONVERSA", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80" },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchData = async () => {
    try {
      const t = new Date().getTime();
      const response = await axios.get(`/api/streams/active?t=${t}`);
      setStreams(response.data);
    } catch (error) {
      console.error("DATA_FETCH_ERROR", error);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredStreams = selectedCategory === "all" 
    ? streams 
    : streams.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-orange-500/30">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex justify-between items-end border-b border-zinc-800/50">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">DISCOVER</h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Navegue pelas transmissões do Nó</p>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-bold text-zinc-400">
          <div className="flex flex-col items-end">
            <span className="text-orange-500">{streams.length} NODES ATIVOS</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> NETWORK_UP</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* HERO SECTION - TEMA LARANJA */}
        <section className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 transition-all hover:border-orange-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
          <div className="relative aspect-[21/9] lg:aspect-[25/8] overflow-hidden">
             {/* Efeito Glow Laranja ao fundo do Hero */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#431407,transparent)] opacity-70" />
             <div className="absolute inset-0 z-20 p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase mb-4 w-fit">
                  <Activity size={12} className="animate-pulse" /> Trending Now
                </div>
                <h2 className="text-5xl md:text-6xl font-black max-w-2xl leading-[0.9] mb-6 italic uppercase tracking-tighter">
                  Sintonize na <br/> Próxima Geração
                </h2>
                <button className="flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-black text-xs hover:bg-orange-500 hover:scale-105 transition-all w-fit uppercase shadow-lg shadow-orange-900/20">
                  <PlayCircle size={18} /> Entrar na Frequência
                </button>
             </div>
          </div>
        </section>

        {/* --- SEÇÃO DE CATEGORIAS --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Categorias Populares</h3>
            <div className="h-[1px] flex-1 bg-zinc-800/50" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all ${
                  selectedCategory === cat.id ? "border-orange-500 scale-95" : "border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <img src={cat.image} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? "text-orange-500" : "text-zinc-400"}`}>
                    {cat.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* GRID DE CANAIS */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold flex items-center gap-3 italic uppercase">
              {selectedCategory === "all" ? "Live Channels" : `Categoria: ${selectedCategory}`}
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] not-italic">{filteredStreams.length}</span>
            </h3>
            
            {/* Search Bar Laranja */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                placeholder="PROCURAR CANAL..." 
                className="bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:border-orange-500 outline-none w-full md:w-64 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredStreams.length > 0 ? (
              filteredStreams.map((stream) => (
                <Link key={stream.id} href={`/${stream.user.username}`} className="group block space-y-4">
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all group-hover:border-orange-500">
                    <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-colors z-10" />
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-lg">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> Live
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black">
                         <ArrowUpRight size={24} />
                      </div>
                    </div>
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 size={48} className="text-zinc-800 group-hover:text-orange-900/20 transition-colors" />
                    </div>
                  </div>

                  <div className="flex gap-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 overflow-hidden group-hover:border-orange-500 transition-colors">
                      {stream.user.image ? (
                        <img src={stream.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {stream.user.username.substring(0,2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white group-hover:text-orange-500 transition-colors truncate uppercase italic">
                        {stream.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tight">@{stream.user.username}</p>
                      {stream.category && (
                        <span className="text-[9px] text-orange-500 font-bold uppercase mt-1 block">{stream.category}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 rounded-[3rem] border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
                <Tv className="text-zinc-800 mb-4" size={48} />
                <h4 className="text-zinc-500 font-black uppercase tracking-widest text-xs">Sem transmissões nesta categoria</h4>
                <button onClick={() => setSelectedCategory("all")} className="mt-4 text-orange-500 text-[10px] font-black uppercase underline">Ver tudo</button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-900 flex justify-between items-center text-zinc-600">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">Node_Protocol_v2</span>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-orange-500 transition-colors">Twitter</a>
          <a href="#" className="hover:text-orange-500 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}