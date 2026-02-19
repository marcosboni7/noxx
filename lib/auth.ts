import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "./prismadb"; // Se o arquivo prismadb.ts estiver na MESMA pasta lib

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Usuário não encontrado");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.username,
          level: user.level,
          xp: user.xp,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.level = (user as any).level;
        token.xp = (user as any).xp;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: { signIn: "/" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};