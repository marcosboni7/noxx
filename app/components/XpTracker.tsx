"use client";

import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const XpTracker = () => {
  useEffect(() => {
    // Ganha XP a cada 60 segundos
    const interval = setInterval(async () => {
      try {
        const response = await axios.post("/api/user/xp");
        
        if (response.data.leveledUp) {
          toast.success(`LEVEL UP: Protocolo nível ${response.data.level} estabelecido!`, {
            icon: '🆙',
            style: { background: '#000', color: '#10b981', border: '1px solid #10b981' }
          });
        }
      } catch (error) {
        console.log("XP_SYNC_SKIP: Utilizador não autenticado ou erro.");
      }
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  return null; // Componente invisível
};