import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prismadb"; 

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Log de Auditoria para Debug
    console.log("[STREAMS_PATCH_REQUEST]:", {
      user: session?.user?.email,
      timestamp: new Date().toISOString()
    });

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado - Identidade não encontrada", { status: 401 });
    }

    // 2. Pegamos todos os possíveis campos do corpo da requisição (Adicionado category aqui)
    const body = await request.json();
    const { name, isLive, description, thumbnailUrl, category } = body;

    // 3. Busca o usuário pelo e-mail para pegar o ID interno
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`[STREAMS_PATCH_ERROR]: Usuário ${session.user.email} não existe no DB.`);
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    // 4. Upsert: Se a stream existe, atualiza. Se não, cria.
    const stream = await prisma.stream.upsert({
      where: { 
        userId: user.id 
      },
      update: {
        ...(name !== undefined && { name }),
        ...(isLive !== undefined && { isLive }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(category !== undefined && { category }), // Atualiza a categoria
      },
      create: {
        userId: user.id,
        name: name || `Stream de ${user.username}`,
        description: description || "",
        thumbnailUrl: thumbnailUrl || "",
        category: category || "", // Salva a categoria na criação
        isLive: isLive || false,
      }
    });

    console.log(`[STREAMS_PATCH_SUCCESS]: Node ${user.username} atualizado com categoria: ${category}`);

    return NextResponse.json(stream);

  } catch (error: any) {
    console.error("❌ ERRO NO PATCH /api/streams:");
    console.error("Mensagem:", error.message);
    
    return new NextResponse(`Erro Interno: ${error.message}`, { status: 500 });
  }
}