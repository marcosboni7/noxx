import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../../../lib/prismadb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Se não houver sessão, retornamos uma lista vazia para não quebrar a Sidebar
    if (!session?.user?.email) {
      return NextResponse.json([]);
    }

    // Procura o utilizador atual e inclui quem ele segue + status da stream
    const currentUser = await prisma.user.findUnique({
      where: { 
        email: session.user.email 
      },
      include: {
        following: {
          include: {
            following: {
              include: {
                stream: {
                  select: {
                    isLive: true,
                  }
                }
              }
            }
          },
          // Ordena: quem está em Live aparece primeiro
          orderBy: {
            following: {
              stream: {
                isLive: 'desc'
              }
            }
          }
        }
      }
    });

    // Formata os dados para o frontend (simplifica a estrutura do Prisma)
    const followedNodes = currentUser?.following.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      image: follow.following.image,
      isLive: follow.following.stream?.isLive || false,
    })) || [];

    return NextResponse.json(followedNodes);
  } catch (error) {
    console.error("[SIDEBAR_GET_ERROR]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}