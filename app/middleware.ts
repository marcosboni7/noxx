import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    // Se o usuário não estiver logado, ele será jogado para cá
    signIn: "/", 
  },
});

// Aqui você define quais rotas devem ser protegidas
export const config = { 
  matcher: [
    "/:username/dashboard/:path*", // Protege o dashboard de qualquer usuário
    "/settings/:path*",           // Protege a página de configurações
    "/api/user/:path*"            // Protege APIs sensíveis de usuário
  ] 
};