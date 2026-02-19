import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismadb";
import { getServerSession } from "next-auth"; // Para garantir que só o dono mude a live

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(); // Pega o usuário logado
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await req.json();
    const { isLive, streamId } = body;

    const updatedStream = await prisma.stream.update({
      where: {
        id: streamId,
      },
      data: {
        isLive: isLive,
      },
    });

    return NextResponse.json(updatedStream);
  } catch (error) {
    console.error("[STREAM_TOGGLE_ERROR]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}