import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Recomenda-se usar o prisma instanciado em lib/prismadb 
// mas mantive a instância direta como no seu exemplo
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!prisma) {
      console.log("ERRO CRÍTICO: Prisma Client nem sequer instanciou.");
      return new NextResponse("Erro Interno", { status: 500 });
    }

    // 1. Buscamos as mensagens daquela stream específica
    const messages = await prisma.message.findMany({
      where: {
        stream: {
          user: {
            username: username
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // 2. O PULO DO GATO: Injetar o ROLE de cada autor para o selo STAFF aparecer no F5
    // Fazemos um loop nas mensagens e buscamos o cargo atual de cada username
    const messagesWithRoles = await Promise.all(
      messages.map(async (msg) => {
        const author = await prisma.user.findUnique({
          where: { username: msg.username },
          select: { role: true }
        });

        return {
          ...msg,
          role: author?.role || "USER" // Se for SUPREMO, o front vai renderizar o roxo
        };
      })
    );

    return NextResponse.json(messagesWithRoles);
  } catch (error) {
    console.log("[MESSAGES_GET_ERROR]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}