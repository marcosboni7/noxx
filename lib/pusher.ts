import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Lado do Servidor (Para disparar mensagens)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  // Adicionamos um fallback para o build não quebrar se a variável estiver vazia
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2", 
  useTLS: true,
});

// Lado do Cliente (Para ouvir as mensagens)
// No Next.js 15, o PusherClient deve ser instanciado apenas no navegador
export const pusherClient = typeof window !== "undefined" 
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })
  : null;