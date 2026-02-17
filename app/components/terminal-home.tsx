"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const TerminalHome = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([
    "SISTEMA_VOID v0.9.2 inicializado...",
    "Digite 'help' para ver os protocolos disponíveis."
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const cmd = input.toLowerCase().trim();
      
      if (cmd === "clear") {
        setHistory([]);
        setInput("");
        return;
      }

      let response = `> Executando: ${cmd}... comando não reconhecido.`;

      if (cmd === "help") response = "Comandos: help, status, list, matrix, access_dash, clear";
      if (cmd === "status") response = "UPLINK: Estável | NODES: 1.204 | ENCRYPTION: AES-256";
      if (cmd === "list") response = "Varrendo rede... 8 nodos ativos encontrados no setor 7.";
      
      if (cmd === "matrix") {
        setHistory(prev => [...prev, `> ${input}`, "> [SYS]: Alterando percepção da realidade...", "> [SYS]: Matrix_Protocol v1.0 ativo."]);
        setInput("");
        window.dispatchEvent(new Event("activate-matrix"));
        return;
      }

      if (cmd === "access_dash") {
        setHistory(prev => [...prev, `> ${input}`, "> [AUTH]: Verificando credenciais...", "> [OK]: Acesso concedido."]);
        setInput("");
        setTimeout(() => { router.push("/dashboard"); }, 1500);
        return;
      }

      setHistory((prev) => [...prev, `> ${input}`, response]);
      setInput("");
    }
  };

  return (
    <div className="bg-black border border-green-500/20 font-mono overflow-hidden shadow-2xl">
      <div className="bg-green-500/10 px-4 py-1 flex items-center justify-between border-b border-green-500/10">
        <div className="flex items-center gap-2">
          <TerminalIcon size={12} className="text-green-500" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-green-500">System_Console</span>
        </div>
      </div>
      <div ref={scrollRef} className="p-4 h-40 overflow-y-auto text-[11px] space-y-1 scrollbar-hide bg-[#020202]">
        {history.map((line, i) => (
          <p key={i} className={line.startsWith(">") ? "text-white" : "text-green-500/60"}>
            {line}
          </p>
        ))}
      </div>
      <div className="flex items-center px-4 py-2 bg-black border-t border-green-500/5">
        <span className="text-green-500 mr-2">$</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-transparent border-none outline-none text-white text-[11px] w-full"
          placeholder="Aguardando input..."
        />
      </div>
    </div>
  );
};