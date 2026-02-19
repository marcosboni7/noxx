"use client";

import { 
  useState, useEffect 
} from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Loader2, 
  Heart, 
  TrendingUp,
  Gamepad2,
  LayoutGrid,
  Sword,
  Car,
  Coffee
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

// --- TIPAGEM ---
interface LiveNode {
  id: string;
  name: string;
  viewers: number;
  isLive: boolean;
  category?: string;
  user: {
    username: string;
    image: string | null;
  };
}

// Interface que resolve o erro "Property isCollapsed does not exist"
interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
}

// --- CATEGORIAS ---
const SIDEBAR_CATEGORIES = [
  { id: "fortnite", name: "Fortnite", icon: Sword, color: "text-blue-400" },
  { id: "gta", name: "GTA V", icon: Car, color: "text-green-400" },
  { id: "freefire", name: "Free Fire", icon: Gamepad2, color: "text-orange-500" },
  { id: "irl", name: "Conversa", icon: Coffee, color: "text-orange-300" },
];

export const Sidebar = ({ isCollapsed, onCollapse }: SidebarProps) => {
  const { data: session } = useSession();
  const [liveNodes, setLiveNodes] = useState<LiveNode[]>([]);
  const [followedNodes, setFollowedNodes] = useState<LiveNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const pathname = usePathname();

  const fetchData = async () => {
    try {
      const activeRes = await axios.get("/api/streams/active");
      setLiveNodes(activeRes.data);

      if (session) {
        const followedRes = await axios.get("/api/sidebar/followed");
        setFollowedNodes(followedRes.data);
      }
    } catch (error) {
      console.error("FETCH_SIDEBAR_ERROR", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); 
    return () => clearInterval(interval);
  }, [session]);

  return (
    <>
      {/* BOTÃO MOBILE */}
      <button 
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="lg:hidden fixed bottom-6 right-6 z-[60] bg-orange-600 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-90 transition-transform"
      >
        <Radio size={24} className={liveNodes.length > 0 ? "animate-pulse" : ""} />
      </button>

      {/* SIDEBAR CORE */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-[#09090b] border-r border-zinc-800/50 transition-all duration-300 z-50
          ${isCollapsed ? "w-[80px]" : "w-[260px]"}
          ${isOpenMobile ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/30">
          {(!isCollapsed || isOpenMobile) && (
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Menu_Principal</span>
          )}
          <button 
            onClick={onCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-orange-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className="p-3 space-y-8 overflow-y-auto h-[calc(100%-80px)] custom-scrollbar">
          
          {/* SEÇÃO 1: CANAIS ONLINE */}
          <div className="space-y-4">
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex items-center justify-between px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-2"><TrendingUp size={12} className="text-orange-500" /> Em Destaque</span>
                <span className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded text-red-500 font-bold">
                   {liveNodes.length} <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                </span>
              </div>
            )}
            
            <div className="space-y-1">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-zinc-800" size={20} /></div>
              ) : (
                liveNodes.map((node) => (
                  <SidebarItem 
                    key={node.id} 
                    node={node} 
                    isCollapsed={isCollapsed} 
                    isOpenMobile={isOpenMobile} 
                    isActive={pathname === `/${node.user.username}`}
                    setIsOpenMobile={setIsOpenMobile}
                    isLive={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* SEÇÃO 2: CATEGORIAS */}
          <div className="space-y-4 pt-4 border-t border-zinc-900/50">
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex items-center gap-2 px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <LayoutGrid size={12} className="text-zinc-400" /> <span>Explorar</span>
              </div>
            )}
            
            <div className="space-y-1">
              {SIDEBAR_CATEGORIES.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/?category=${cat.id}`}
                  onClick={() => setIsOpenMobile(false)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-zinc-900/50
                    ${isCollapsed && !isOpenMobile ? "justify-center" : ""}
                  `}
                >
                  <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-orange-500/50 transition-colors ${cat.color}`}>
                    <cat.icon size={18} />
                  </div>
                  {(!isCollapsed || isOpenMobile) && (
                    <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-tighter transition-colors">
                      {cat.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* SEÇÃO 3: SEGUINDO */}
          {session && (
            <div className="space-y-4 pt-4 border-t border-zinc-900/50">
              {(!isCollapsed || isOpenMobile) && (
                <div className="flex items-center gap-2 px-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  <Heart size={12} className="text-orange-500" /> <span>Seguindo</span>
                </div>
              )}
              
              <div className="space-y-1">
                {followedNodes.length === 0 ? (
                  (!isCollapsed || isOpenMobile) && <p className="text-[9px] text-zinc-700 px-3 uppercase font-bold italic">Nenhum nó seguido.</p>
                ) : (
                  followedNodes.map((node) => (
                    <SidebarItem 
                      key={node.id} 
                      node={node} 
                      isCollapsed={isCollapsed} 
                      isOpenMobile={isOpenMobile} 
                      isActive={pathname === `/${node.user?.username}`}
                      setIsOpenMobile={setIsOpenMobile}
                      isLive={node.isLive}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DE STATUS */}
        {(!isCollapsed || isOpenMobile) && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="p-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Status do Sistema</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
               </div>
               <div className="flex gap-0.5 items-end h-4">
                  {[30, 60, 40, 80, 50, 70, 30].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-t-[1px] ${i === 3 ? 'bg-orange-600' : 'bg-zinc-800'}`} style={{ height: `${h}%` }} />
                  ))}
               </div>
            </div>
          </div>
        )}
      </aside>

      {/* OVERLAY MOBILE */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-all animate-in fade-in"
        />
      )}
    </>
  );
};

// --- COMPONENTE DE ITEM ---
interface SidebarItemProps {
  node: LiveNode;
  isCollapsed: boolean;
  isOpenMobile: boolean;
  isActive: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isLive: boolean;
}

const SidebarItem = ({ node, isCollapsed, isOpenMobile, isActive, setIsOpenMobile, isLive }: SidebarItemProps) => {
  const username = node.user?.username || "Unknown";
  const image = node.user?.image;
  const category = node.category || "Sem Categoria";

  return (
    <Link 
      href={`/${username}`}
      onClick={() => setIsOpenMobile(false)}
      className={`
        flex items-center gap-3 p-2.5 rounded-xl transition-all relative group
        ${isActive ? "bg-orange-500/10" : "hover:bg-zinc-900"}
        ${isCollapsed && !isOpenMobile ? "justify-center" : ""}
      `}
    >
      <div className="relative flex-shrink-0">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all
          ${isLive ? "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "border-zinc-800"}
          ${!isLive && "grayscale opacity-40"}
          group-hover:scale-105
        `}>
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-tighter">
              {username.substring(0, 2)}
            </div>
          )}
        </div>
        {isLive && (
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border-[3px] border-[#0c0c0e] rounded-full animate-pulse" />
        )}
      </div>

      {(!isCollapsed || isOpenMobile) && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className={`text-[11px] font-black truncate uppercase italic tracking-tight ${isActive ? "text-orange-400" : "text-zinc-200"}`}>
              {username}
            </p>
            {isLive && (
              <span className="flex items-center gap-1 text-[8px] font-black text-zinc-500">
                {node.viewers || 0} V
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {isLive && <Gamepad2 size={10} className="text-orange-500 flex-shrink-0" />}
            <p className="text-[9px] text-zinc-600 truncate font-bold uppercase tracking-widest">
              {isLive ? category : "Offline"}
            </p>
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,1)]" />
      )}
    </Link>
  );
};