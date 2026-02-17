import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prismadb";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" }
      },
      async authorize(credentials) {
        console.log("\n--- [SISTEMA DE SEGURANÇA: INICIANDO VERIFICAÇÃO] ---");
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Usuário não encontrado ou senha não configurada");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Senha incorreta");
        }

        console.log("[DEBUG] Login autorizado para:", user.username, "| Cargo:", user.role);

        // RETORNAMOS O ROLE AQUI PARA O JWT PEGAR
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.username,
          level: user.level,
          xp: user.xp,
          role: user.role, // <-- ADICIONADO
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // No login inicial, o objeto 'user' existe
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.level = (user as any).level;
        token.xp = (user as any).xp;
        token.role = (user as any).role; // <-- INJETANDO ROLE NO TOKEN
      }

      // Opcional: Busca no banco para garantir que o role está atualizado 
      // mesmo sem o usuário precisar relogar
      if (!token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string }
        });
        token.role = dbUser?.role || "USER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).level = token.level;
        (session.user as any).xp = token.xp;
        (session.user as any).role = token.role; // <-- PASSANDO ROLE PARA A SESSÃO CLIENT-SIDE
        session.user.name = token.username as string;
      }
      return session;
    }
  },
  pages: { 
    signIn: "/" 
  },
  debug: process.env.NODE_ENV === "development",
  session: { 
    strategy: "jwt" 
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };