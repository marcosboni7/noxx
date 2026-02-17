import { NextResponse } from "next/server";
import db from "../../../../lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await db.user.findUnique({
      where: { username },
      include: {
        stream: true, 
        _count: {
          select: {
            followers: true, // Retorna o total de seguidores
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}