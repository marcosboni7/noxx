"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { AuthModal } from "./components/auth-modal";

// Criamos um sub-componente para gerenciar o modal baseado na sessão real
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [showAuth, setShowAuth] = useState(true);

  // Consideramos logado se o status for "authenticated"
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <>
      {/* Mostra o modal apenas se não estiver logado, não estiver carregando e showAuth for true */}
      {showAuth && !isLoggedIn && !isLoading && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}

      <div className={(showAuth && !isLoggedIn && !isLoading) ? "blur-md pointer-events-none select-none" : "transition-all duration-500"}>
        {children}
      </div>
    </>
  );
};

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <LayoutContent>{children}</LayoutContent>
    </SessionProvider>
  );
};