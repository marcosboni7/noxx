import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import db from "../../../../../lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> } // Tipagem como Promise para Next 15/16
) {
  try {
    const session = await getServerSession(authOptions);
    
    // AQUI ESTAVA O ERRO: No Next 16, você precisa dar await no params
    const resolvedParams = await params; 
    const username = resolvedParams.username;

    console.log("--- DEBUG FOLLOW POST ---");
    console.log("Username resolvido:", username);
    console.log("Sessão ativa:", session?.user?.email);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const self = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!self) return new NextResponse("Self not found", { status: 404 });

    const targetUser = await db.user.findUnique({
      where: { username } // Agora o username não será mais undefined!
    });

    if (!targetUser) return new NextResponse("Target not found", { status: 404 });

    if (self.id === targetUser.id) {
      return new NextResponse("Cannot follow yourself", { status: 400 });
    }

    const follow = await db.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: self.id,
          followingId: targetUser.id,
        },
      },
      update: {},
      create: {
        followerId: self.id,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json(follow);
  } catch (error: any) {
    console.error("--- CRASH NO SERVIDOR ---", error.message);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Repita o mesmo padrão de 'await params' no DELETE abaixo se for usar
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { username } = await params; // Unwrapping aqui também

    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const self = await db.user.findUnique({ where: { email: session.user.email } });
    const targetUser = await db.user.findUnique({ where: { username } });

    if (!self || !targetUser) return new NextResponse("Not found", { status: 404 });

    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId: self.id,
          followingId: targetUser.id,
        },
      },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) { return new NextResponse("Error", { status: 500 }); }
}