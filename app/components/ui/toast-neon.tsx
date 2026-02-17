"use client";
import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

export const ToastNeon = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] bg-black border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] p-4 font-mono animate-in slide-in-from-right">
      <div className="flex items-center gap-3">
        <Terminal size={16} className="text-green-500 animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[10px] text-green-500/50 font-bold uppercase tracking-tighter">[SYSTEM_ALERT]</span>
          <span className="text-xs text-white">{message}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] bg-green-500 animate-shrink-width" />
    </div>
  );
};